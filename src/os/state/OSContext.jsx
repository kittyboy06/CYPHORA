import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { osReducer, INITIAL_OS_STATE, OS_ACTIONS } from './osStore.js';
import { vfs } from '../vfs/vfsEngine.js';
import { eventBus } from '../events/eventBus.js';
import { APP_REGISTRY } from '../apps/registry.js';

const OSContext = createContext(null);
const SESSION_STORAGE_KEY = 'cyphora_os_session';

export function OSProvider({
  children,
  teamData,
  onReturnToHub,
  round1State,
  setRound1State,
  liveExplorers = [],
  isWsConnected = false,
  fetchLeaderboard = () => { }
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

  const triggerLock = (reason = 'FULLSCREEN_EXIT') => {
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

    // 3. Immediately dismiss the Blue Screen gate
    dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: { visible: false } });

    // 4. Synchronously request fullscreen on the user submit gesture (never re-lock on catch)
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn('[OS] Fullscreen restore rejected or pending:', err);
        });
      }
    } catch (err) {
      console.warn('[OS] Fullscreen request error:', err);
    }
  };

  // Track security triggers: Fullscreen exit, Screenshots, Tab Switch, DevTools Inspector
  useEffect(() => {
    // 1. Initial lock state recovery from sessionStorage
    let initialLock = null;
    try {
      if (typeof sessionStorage !== 'undefined') {
        initialLock = sessionStorage.getItem('cyphora_os_locked');
      }
    } catch (e) { }

    // If an initial lock exists, restore it.
    // Otherwise, do NOT immediately lock! Check if in fullscreen or allow user to transition.
    if (initialLock) {
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
        // Only trigger lock if the user was previously in fullscreen and explicitly exited
        if (hasEnteredFullscreenRef.current && Date.now() >= unlockCooldownRef.current) {
          triggerLock('FULLSCREEN_EXIT');
        }
      }
    };

    // 3. Tab switch / visibility monitor
    const handleVisibilityChange = () => {
      if (Date.now() < unlockCooldownRef.current) return;
      if (document.hidden || document.visibilityState === 'hidden') {
        triggerLock('TAB_SWITCH');
      }
    };

    // 4. Window blur monitor (switching to other apps or desktop)
    const handleWindowBlur = () => {
      if (Date.now() < unlockCooldownRef.current) return;
      // Brief debounce to prevent false triggers during OS transitions or browser dialogs
      setTimeout(() => {
        if (Date.now() < unlockCooldownRef.current) return;
        if (document.hidden || document.visibilityState === 'hidden') {
          triggerLock('TAB_SWITCH');
        }
      }, 250);
    };

    // 5. Screenshots and Inspector keyboard shortcuts
    const handleSecurityKeyDown = (e) => {
      if (Date.now() < unlockCooldownRef.current) return;

      // Screenshot shortcut: PrintScreen
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // Screenshot shortcut: Win+Shift+S or Ctrl+Shift+S (Snipping Tool)
      if ((e.key === 'S' || e.key === 's') && e.shiftKey && isCtrlOrMeta) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      // Mac screenshot: Cmd+Shift+3, 4, 5
      if (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('SCREENSHOT_ATTEMPT');
        return;
      }

      // DevTools Inspector shortcut: F12
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }

      // DevTools Inspector shortcut: Ctrl+Shift+I, J, C (or Mac equivalents)
      if (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }

      // View Source shortcut: Ctrl+U
      if (isCtrlOrMeta && (e.key === 'U' || e.key === 'u')) {
        e.preventDefault();
        e.stopPropagation();
        triggerLock('INSPECTOR_DEVTOOLS');
        return;
      }
    };

    const handleSecurityKeyUp = (e) => {
      if (Date.now() < unlockCooldownRef.current) return;
      if (e.key === 'PrintScreen' || e.code === 'PrintScreen') {
        triggerLock('SCREENSHOT_ATTEMPT');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);
    window.addEventListener('keydown', handleSecurityKeyDown, true);
    window.addEventListener('keyup', handleSecurityKeyUp, true);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
      window.removeEventListener('keydown', handleSecurityKeyDown, true);
      window.removeEventListener('keyup', handleSecurityKeyUp, true);
    };
  }, []);

  const openApp = (appId, options = {}) => {
    const appDef = APP_REGISTRY[appId];
    if (!appDef) {
      console.error(`[OS] App not found in registry: ${appId}`);
      return;
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
    onReturnToHub,
    round1State: round1State || null,
    setRound1State: setRound1State || (() => { })
  };

  return <OSContext.Provider value={value}>{children}</OSContext.Provider>;
}

export function useOS() {
  const context = useContext(OSContext);
  if (!context) {
    throw new Error('useOS must be used within an OSProvider');
  }
  return context;
}
