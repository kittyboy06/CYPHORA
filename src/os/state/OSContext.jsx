import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { osReducer, INITIAL_OS_STATE, OS_ACTIONS } from './osStore.js';
import { vfs } from '../vfs/vfsEngine.js';
import { eventBus } from '../events/eventBus.js';
import { APP_REGISTRY } from '../apps/registry.js';

const OSContext = createContext(null);
const SESSION_STORAGE_KEY = 'cyphora_os_session';

export const ROUND2_APP_IDS = [
  'round2',
  'image-navigation',
  'vision-target',
  'prompt-studio',
  'image-evaluator',
  'mission-prologue'
];

export const ROUND3_APP_IDS = [
  'round3',
  'jungle-code',
  'temple-trials'
];

export const isRound2ActiveHelper = (windows = [], initialAppId = null) => {
  // 1. Initial app parameter indicates Round 2
  if (initialAppId && ROUND2_APP_IDS.includes(initialAppId)) {
    return true;
  }

  // 2. Open windows contain any Round 2 application
  if (Array.isArray(windows) && windows.some(w => ROUND2_APP_IDS.includes(w.appId))) {
    return true;
  }

  // 3. Browser environment checks (URL or Session Storage)
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const roundParam = params.get('round');
      const stageParam = params.get('stage');
      const appParam = params.get('app');

      if (roundParam === '2' || stageParam === 'round2' || appParam === 'round2' || (appParam && ROUND2_APP_IDS.includes(appParam))) {
        return true;
      }

      if (sessionStorage.getItem('cyphora_active_round') === '2') {
        return true;
      }
    } catch (e) { }
  }

  return false;
};

export const isRound3ActiveHelper = (windows = [], initialAppId = null) => {
  // 1. Initial app parameter indicates Round 3
  if (initialAppId && ROUND3_APP_IDS.includes(initialAppId)) {
    return true;
  }

  // 2. Open windows contain any Round 3 application
  if (Array.isArray(windows) && windows.some(w => ROUND3_APP_IDS.includes(w.appId))) {
    return true;
  }

  // 3. Browser environment checks (URL or Session Storage)
  if (typeof window !== 'undefined') {
    try {
      const params = new URLSearchParams(window.location.search);
      const roundParam = params.get('round');
      const stageParam = params.get('stage');
      const appParam = params.get('app');

      if (roundParam === '3' || stageParam === 'round3' || appParam === 'round3' || (appParam && ROUND3_APP_IDS.includes(appParam))) {
        return true;
      }

      if (sessionStorage.getItem('cyphora_active_round') === '3') {
        return true;
      }
    } catch (e) { }
  }

  return false;
};

export function OSProvider({
  children,
  teamData,
  onReturnToHub,
  round1State,
  setRound1State,
  liveExplorers = [],
  isWsConnected = false,
  fetchLeaderboard = () => { },
  initialAppId = null
}) {
  const [state, dispatch] = useReducer(osReducer, INITIAL_OS_STATE, (init) => {
    try {
      // Remove any lingering legacy localStorage session key so old sessions don't persist across restarts
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }

      if (typeof sessionStorage !== 'undefined') {
        const saved = sessionStorage.getItem(SESSION_STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          return {
            ...init,
            ...parsed,
            isStartMenuOpen: false,
            showExitBanner: false,
          };
        }
      }
    } catch (e) {
      console.warn('[OSProvider] Failed to restore session', e);
    }
    return init;
  });

  // Persist session state to sessionStorage on state changes (persists on F5 in same tab, clears on tab/browser close)
  useEffect(() => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        const sessionToSave = {
          windows: state.windows,
          activeWindowId: state.activeWindowId,
          nextZIndex: state.nextZIndex,
          isMuted: state.isMuted
        };
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
      }
    } catch (e) {
      console.error('[OSProvider] Failed to save session', e);
    }
  }, [state.windows, state.activeWindowId, state.nextZIndex, state.isMuted]);

  const unlockCooldownRef = useRef(0);
  const hasEnteredFullscreenRef = useRef(false);
  const initialAppIdRef = useRef(initialAppId);
  const windowsRef = useRef(state.windows);
  windowsRef.current = state.windows;

  useEffect(() => {
    initialAppIdRef.current = initialAppId;
    if (initialAppId && ROUND2_APP_IDS.includes(initialAppId)) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_active_round', '2');
          sessionStorage.removeItem('cyphora_os_locked');
        }
      } catch (e) { }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });
    } else if (initialAppId && ROUND3_APP_IDS.includes(initialAppId)) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_active_round', '3');
        }
      } catch (e) { }
    }
  }, [initialAppId]);

  const isRound2Active = () => {
    return isRound2ActiveHelper(windowsRef.current, initialAppIdRef.current);
  };

  const isRound3Active = () => {
    return isRound3ActiveHelper(windowsRef.current, initialAppIdRef.current);
  };

  const isProtectedRoundActive = () => {
    // Only Round 2 is exempt from blue screen (user needs to upload device image from local machine)
    return isRound2Active();
  };

  const triggerLock = (reason = 'FULLSCREEN_EXIT') => {
    // If Round 2 is active, do not lock
    if (isProtectedRoundActive()) {
      return;
    }

    // If within post-unlock immunity grace period (3.5s), ignore trigger
    if (Date.now() < unlockCooldownRef.current) {
      return;
    }

    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('cyphora_os_locked', reason);
      }
    } catch (e) { }
    dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: true, reason } });
  };

  const unlockGate = () => {
    // 1. Clear stored lock in session
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('cyphora_os_locked');
      }
    } catch (e) { }

    // 2. Set generous 3.5-second immunity cooldown to prevent immediate re-locking while window focus settles
    unlockCooldownRef.current = Date.now() + 3500;

    // 3. Mark as having entered fullscreen so subsequent exits lock the workstation
    hasEnteredFullscreenRef.current = true;

    // 4. Immediately dismiss the Blue Screen gate
    dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });

    // 5. Synchronously request fullscreen on the user submit gesture (never re-lock on catch)
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn('[OS] Fullscreen restore rejected or pending:', err);
        });
      }
    } catch (err) {
      console.warn('[OS] Fullscreen request error:', err);
    }

    // 6. Notify active child iframes (such as Round 3) to clear any local lock/anti-cheat screens
    try {
      window.postMessage({ type: 'CYPHORA_GATE_UNLOCKED' }, '*');
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        try {
          iframe.contentWindow?.postMessage({ type: 'CYPHORA_GATE_UNLOCKED' }, '*');
        } catch (e) { }
      });
    } catch (e) { }
  };

  // Track security triggers: Fullscreen exit, Screenshots, Tab Switch, DevTools Inspector, Page Reload
  useEffect(() => {
    // 1. Initial lock state recovery from sessionStorage
    let initialLock = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        initialLock = sessionStorage.getItem('cyphora_os_locked');
      }
    } catch (e) { }

    if (isProtectedRoundActive()) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.removeItem('cyphora_os_locked');
        }
      } catch (e) { }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });
    } else if (initialLock) {
      triggerLock(initialLock);
    } else {
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });
      if (typeof document !== 'undefined' && document.fullscreenElement) {
        hasEnteredFullscreenRef.current = true;
        dispatch({ type: OS_ACTIONS.SET_FULLSCREEN, payload: true });
      }
    }

    // 2. Fullscreen monitor
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      dispatch({ type: OS_ACTIONS.SET_FULLSCREEN, payload: isFull });
      if (isFull) {
        hasEnteredFullscreenRef.current = true;
      } else {
        if (isProtectedRoundActive()) return;
        // Only trigger lock if the user was previously in fullscreen and explicitly exited
        if (hasEnteredFullscreenRef.current && Date.now() >= unlockCooldownRef.current) {
          triggerLock('FULLSCREEN_EXIT');
        }
      }
    };

    // 3. Tab switch / visibility monitor
    const handleVisibilityChange = () => {
      if (isProtectedRoundActive()) return;
      if (Date.now() < unlockCooldownRef.current) return;
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerLock('TAB_SWITCH');
      }
    };

    // 4. Window blur monitor (switching to other apps or desktop)
    const handleWindowBlur = () => {
      if (isProtectedRoundActive()) return;
      if (Date.now() < unlockCooldownRef.current) return;
      // Brief debounce to prevent false triggers during OS transitions or browser dialogs
      setTimeout(() => {
        if (isProtectedRoundActive()) return;
        if (Date.now() < unlockCooldownRef.current) return;
        if (document.hidden || document.visibilityState === 'hidden') {
          triggerLock('TAB_SWITCH');
        }
      }, 250);
    };

    // 5. Workstation reload / refresh interceptor (browser reload button, closing/leaving tab)
    const handleBeforeUnload = (e) => {
      if (isProtectedRoundActive()) return;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_os_locked', 'PAGE_RELOAD_ATTEMPT');
        }
      } catch (err) { }
      triggerLock('PAGE_RELOAD_ATTEMPT');
      e.preventDefault();
      e.returnValue = 'Workstation session active. Reloading the workstation is prohibited.';
      return e.returnValue;
    };

    // 6. Security keyboard shortcuts: Screenshots, Reload, DevTools Inspector
    const handleSecurityKeyDown = (e) => {
      if (isProtectedRoundActive()) return;
      if (Date.now() < unlockCooldownRef.current) return;

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 6a. Page Reload shortcuts: F5, Ctrl+R, Ctrl+Shift+R, Cmd+R
      if (e.key === 'F5' || e.keyCode === 116 || (isCtrlOrMeta && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('PAGE_RELOAD_ATTEMPT');
        return;
      }

      // 6b. Screenshot shortcut: PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      // 6c. Screenshot shortcut: Win+Shift+S or Ctrl+Shift+S (Snipping Tool)
      if ((e.key === 'S' || e.key === 's') && e.shiftKey && isCtrlOrMeta) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      // 6d. Mac screenshot: Cmd+Shift+3, 4, 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      // 6e. DevTools Inspector shortcut: F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }

      // 6f. DevTools Inspector shortcut: Ctrl+Shift+I, J, C, K
      if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }

      // 6g. Mac DevTools Inspector: Cmd+Option+I, J, C, K, U
      if (e.metaKey && e.altKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k', 'U', 'u'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }

      // 6h. View Source shortcut: Ctrl+U
      if (isCtrlOrMeta && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }
    };

    const handleSecurityKeyUp = (e) => {
      if (isProtectedRoundActive()) return;
      if (Date.now() < unlockCooldownRef.current) return;
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerLock('SCREENSHOT_ATTEMPT');
      }
    };

    // 7. Global Context Menu Block (Blocks native browser right-click Inspect menu)
    const handleGlobalContextMenu = (e) => {
      if (isProtectedRoundActive()) return;
      // Allow legitimate custom in-app context menus (File Manager)
      if (e.target && e.target.closest && e.target.closest('.fm-container, .fm-content-pane, .fm-sidebar, .fm-context-menu')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
    };

    // 8. Docked DevTools Inspector Detection (Outer vs Inner Viewport Dimension Delta)
    const checkDevTools = () => {
      if (isProtectedRoundActive()) return;
      if (Date.now() < unlockCooldownRef.current) return;

      const widthDelta = window.outerWidth - window.innerWidth;
      const heightDelta = window.outerHeight - window.innerHeight;

      // When docked DevTools is opened, widthDelta > 160 or heightDelta > 160 (or > 250 in non-fullscreen)
      const isDockedInspector = document.fullscreenElement
        ? (widthDelta > 160 || heightDelta > 160)
        : (widthDelta > 160 || heightDelta > 250);

      if (isDockedInspector && (hasEnteredFullscreenRef.current || document.fullscreenElement)) {
        triggerLock('INSPECTOR_DEVTOOLS');
      }
    };

    const devToolsInterval = setInterval(checkDevTools, 1000);

    // Listen for security triggers or unlock requests from child iframes (Round 3)
    const handleChildSecurityMessage = (e) => {
      if (e.data?.type === 'CYPHORA_TRIGGER_LOCK') {
        triggerLock(e.data?.reason || 'FULLSCREEN_EXIT');
      } else if (e.data?.type === 'CYPHORA_UNLOCK_GATE') {
        unlockGate();
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleGlobalContextMenu, true);
    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('resize', checkDevTools);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleSecurityKeyDown, true);
    window.addEventListener('keyup', handleSecurityKeyUp, true);
    window.addEventListener('message', handleChildSecurityMessage);

    return () => {
      clearInterval(devToolsInterval);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleGlobalContextMenu, true);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('resize', checkDevTools);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleSecurityKeyDown, true);
      window.removeEventListener('keyup', handleSecurityKeyUp, true);
      window.removeEventListener('message', handleChildSecurityMessage);
    };
  }, []);

  const openApp = (appId, options = {}) => {
    const appDef = APP_REGISTRY[appId];
    if (appId === 'tasks' || appId === 'task-terminal') {
      eventBus.emit('OPEN_TASKS');
      return;
    }

    if (!appDef) {
      console.error(`[OS] App not found in registry: ${appId}`);
      return;
    }

    if (ROUND2_APP_IDS.includes(appId)) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_active_round', '2');
          sessionStorage.removeItem('cyphora_os_locked');
        }
      } catch (e) { }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });
    } else if (ROUND3_APP_IDS.includes(appId)) {
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_active_round', '3');
          sessionStorage.removeItem('cyphora_os_locked');
        }
      } catch (e) { }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });
    }

    const title = options.title || (options.meta?.filePath ? `${appDef.title} - ${options.meta.filePath.split('/').pop()}` : appDef.title);

    dispatch({
      type: OS_ACTIONS.OPEN_WINDOW,
      payload: {
        appId,
        title,
        icon: appDef.icon,
        defaultBounds: appDef.defaultBounds,
        meta: options.meta || {}
      }
    });

    eventBus.emit('APP_OPENED', { appId, title, meta: options.meta });
  };

  const closeWindow = (id) => {
    const win = state.windows.find(w => w.id === id);
    if (win) {
      eventBus.emit('APP_CLOSED', { appId: win.appId, windowId: id });
    }
    dispatch({ type: OS_ACTIONS.CLOSE_WINDOW, payload: { id } });

    // If closing a Round 2 or Round 3 app and no other Round 2 or Round 3 window remains open, reset active round
    const remainingWindows = state.windows.filter(w => w.id !== id);
    const hasOtherRound2 = remainingWindows.some(w => ROUND2_APP_IDS.includes(w.appId));
    const hasOtherRound3 = remainingWindows.some(w => ROUND3_APP_IDS.includes(w.appId));

    if (ROUND3_APP_IDS.includes(win?.appId) || ROUND2_APP_IDS.includes(win?.appId)) {
      if (hasOtherRound3) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('cyphora_active_round', '3');
          }
        } catch (e) { }
      } else if (hasOtherRound2) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('cyphora_active_round', '2');
          }
        } catch (e) { }
      } else if (!initialAppIdRef.current || (!ROUND2_APP_IDS.includes(initialAppIdRef.current) && !ROUND3_APP_IDS.includes(initialAppIdRef.current))) {
        try {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem('cyphora_active_round', '1');
          }
        } catch (e) { }
      }
    }
  };

  const minimizeWindow = (id) => {
    dispatch({ type: OS_ACTIONS.MINIMIZE_WINDOW, payload: { id } });
  };

  const maximizeWindow = (id) => {
    dispatch({ type: OS_ACTIONS.MAXIMIZE_WINDOW, payload: { id } });
  };

  const focusWindow = (id) => {
    dispatch({ type: OS_ACTIONS.FOCUS_WINDOW, payload: { id } });
  };

  const moveWindow = (id, x, y) => {
    dispatch({ type: OS_ACTIONS.MOVE_WINDOW, payload: { id, x, y } });
  };

  const resizeWindow = (id, width, height) => {
    dispatch({ type: OS_ACTIONS.RESIZE_WINDOW, payload: { id, width, height } });
  };

  const toggleStartMenu = () => {
    dispatch({ type: OS_ACTIONS.TOGGLE_START_MENU });
  };

  const closeStartMenu = () => {
    dispatch({ type: OS_ACTIONS.SET_START_MENU, payload: false });
  };

  const toggleMute = () => {
    dispatch({ type: OS_ACTIONS.TOGGLE_MUTE });
  };

  const requestFullscreen = async () => {
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: false });
    } catch (err) {
      console.warn('[OS] Fullscreen request rejected/denied:', err);
    }
  };

  const dismissExitBanner = () => {
    dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: false });
  };

  const handleReturnToHub = () => {
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.removeItem('cyphora_os_locked');
        sessionStorage.removeItem('cyphora_active_round');
      }
    } catch (e) { }
    if (typeof onReturnToHub === 'function') {
      onReturnToHub();
    }
  };

  const value = {
    ...state,
    teamData: teamData || { name: 'Explorer', standing: '1st', score: 0 },
    liveExplorers,
    isWsConnected,
    fetchLeaderboard,
    vfs,
    eventBus,
    openApp,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    focusWindow,
    moveWindow,
    resizeWindow,
    toggleStartMenu,
    closeStartMenu,
    toggleMute,
    requestFullscreen,
    dismissExitBanner,
    triggerLock,
    unlockGate,
    onReturnToHub: handleReturnToHub,
    round1State: round1State || null,
    setRound1State: setRound1State || (() => { }),
    isRound2Active,
    isRound3Active,
    isProtectedRoundActive
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    console.warn('[useOS] Warning: useOS accessed outside or during transition of OSProvider');
    return {
      windows: [],
      activeWindowId: null,
      isStartMenuOpen: false,
      isMuted: false,
      isFullscreen: false,
      showExitBanner: false,
      exitReason: '',
      openApp: () => {},
      closeApp: () => {},
      focusWindow: () => {},
      minimizeWindow: () => {},
      maximizeWindow: () => {},
      restoreWindow: () => {},
      moveWindow: () => {},
      resizeWindow: () => {},
      toggleStartMenu: () => {},
      closeStartMenu: () => {},
      toggleMute: () => {},
      requestFullscreen: () => {},
      dismissExitBanner: () => {},
      triggerLock: () => {},
      unlockGate: () => {},
      onReturnToHub: () => {},
      round1State: null,
      setRound1State: () => {},
      isRound2Active: () => false,
      isRound3Active: () => false,
      isProtectedRoundActive: () => false,
      vfs,
      eventBus,
      teamData: null,
      liveExplorers: [],
      isWsConnected: false,
      fetchLeaderboard: () => {}
    };
  }
  return context;
}
