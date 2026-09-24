import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { osReducer, INITIAL_OS_STATE, OS_ACTIONS } from './osStore.js';
import { vfs } from '../vfs/vfsEngine.js';
import { eventBus } from '../events/eventBus.js';
import { APP_REGISTRY } from '../apps/registry.js';

const OSContext = createContext(null);
const SESSION_STORAGE_KEY = 'cyphora_os_session';

export function OSProvider({ children, teamData, onReturnToHub }) {
  const [state, dispatch] = useReducer(osReducer, INITIAL_OS_STATE, (init) => {
    try {
      const saved = localStorage.getItem(SESSION_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...init,
          ...parsed,
          isStartMenuOpen: false,
          showExitBanner: false,
        };
      }
    } catch (e) {
      console.warn('[OSProvider] Failed to restore session', e);
    }
    return init;
  });

  // Persist session state to localStorage on state changes
  useEffect(() => {
    try {
      const sessionToSave = {
        windows: state.windows,
        activeWindowId: state.activeWindowId,
        nextZIndex: state.nextZIndex,
        isMuted: state.isMuted
      };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionToSave));
    } catch (e) {
      console.error('[OSProvider] Failed to save session', e);
    }
  }, [state.windows, state.activeWindowId, state.nextZIndex, state.isMuted]);

  // Track browser fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!document.fullscreenElement;
      dispatch({ type: OS_ACTIONS.SET_FULLSCREEN, payload: isFull });
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    // Initial check
    if (document.fullscreenElement) {
      dispatch({ type: OS_ACTIONS.SET_FULLSCREEN, payload: true });
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
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
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      }
      dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: false });
    } catch (err) {
      console.warn('Fullscreen request denied or not supported', err);
    }
  };

  const dismissExitBanner = () => {
    dispatch({ type: OS_ACTIONS.SET_EXIT_BANNER, payload: false });
  };

  const value = {
    ...state,
    teamData: teamData || { name: 'Explorer', standing: '1st', score: 0 },
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
    onReturnToHub
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
