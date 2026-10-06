/**
 * CYPHORA Virtual OS — State Actions & Reducer
 */

export const INITIAL_OS_STATE = {
  windows: [],
  activeWindowId: null,
  nextZIndex: 10,
  isStartMenuOpen: false,
  isMuted: false,
  isFullscreen: false,
  showExitBanner: false,
  exitReason: 'FULLSCREEN_EXIT',
};

export const OS_ACTIONS = {
  OPEN_WINDOW: 'OPEN_WINDOW',
  CLOSE_WINDOW: 'CLOSE_WINDOW',
  MINIMIZE_WINDOW: 'MINIMIZE_WINDOW',
  MAXIMIZE_WINDOW: 'MAXIMIZE_WINDOW',
  FOCUS_WINDOW: 'FOCUS_WINDOW',
  MOVE_WINDOW: 'MOVE_WINDOW',
  RESIZE_WINDOW: 'RESIZE_WINDOW',
  TOGGLE_START_MENU: 'TOGGLE_START_MENU',
  SET_START_MENU: 'SET_START_MENU',
  TOGGLE_MUTE: 'TOGGLE_MUTE',
  SET_FULLSCREEN: 'SET_FULLSCREEN',
  SET_EXIT_BANNER: 'SET_EXIT_BANNER',
  RESTORE_SESSION: 'RESTORE_SESSION',
};

export function osReducer(state, action) {
  switch (action.type) {
    case OS_ACTIONS.OPEN_WINDOW: {
      let { appId, title, icon, meta = {}, defaultBounds } = action.payload;

      // Intercept Stage 2 launch to show prologue first
      if ((appId === 'round2' || appId === 'image-navigation') && typeof window !== 'undefined') {
        if (localStorage.getItem('cyphora_round2_os_started') !== 'true') {
          appId = 'mission-prologue';
          title = 'Sector 4 Briefing';
          icon = 'BookOpen';
          defaultBounds = { width: 880, height: 620 };
        }
      }

      // If single-instance app already exists (and no specific file meta), just focus it
      if (!meta.filePath) {
        const existing = state.windows.find(w => w.appId === appId);
        if (existing) {
          return {
            ...state,
            windows: state.windows.map(w =>
              w.id === existing.id
                ? { ...w, isMinimized: false, zIndex: state.nextZIndex + 1 }
                : w
            ),
            activeWindowId: existing.id,
            nextZIndex: state.nextZIndex + 1,
            isStartMenuOpen: false
          };
        }
      }

      // Cascade windows through the safe workspace below the HUD and above the taskbar.
      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1366;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;
      const safeTop = 64;
      const safeBottom = 72;
      const cascadeIndex = state.windows.filter(win => !win.isMinimized).length;
      const initialWidth = Math.max(280, Math.min(defaultBounds?.width || 760, viewportWidth - 48));
      const initialHeight = Math.max(220, Math.min(defaultBounds?.height || 500, viewportHeight - safeTop - safeBottom - 24));

      let initialX, initialY;
      if (appId === 'terminal') {
        initialX = 40;
        initialY = 70;
      } else if (appId === 'tasks' || appId === 'task-terminal') {
        initialX = 80;
        initialY = 75;
      } else if (appId === 'file-manager') {
        initialX = 140;
        initialY = 95;
      } else {
        initialX = Math.max(24, Math.min(viewportWidth - initialWidth - 360, 60 + cascadeIndex * 50));
        initialY = Math.max(safeTop, Math.min(viewportHeight - initialHeight - safeBottom, 80 + cascadeIndex * 35));
      }

      const newWindow = {
        id: `win_${appId}_${Date.now()}`,
        appId,
        title: title || appId.toUpperCase(),
        icon: icon || 'AppWindow',
        x: initialX,
        y: initialY,
        width: initialWidth,
        height: initialHeight,
        isMinimized: false,
        isMaximized: meta.isMaximized || false,
        zIndex: state.nextZIndex + 1,
        meta
      };

      return {
        ...state,
        windows: [...state.windows, newWindow],
        activeWindowId: newWindow.id,
        nextZIndex: state.nextZIndex + 1,
        isStartMenuOpen: false
      };
    }

    case OS_ACTIONS.CLOSE_WINDOW: {
      const remaining = state.windows.filter(w => w.id !== action.payload.id);
      let nextActive = null;
      if (remaining.length > 0) {
        // Pick the top-most visible window
        const visible = remaining.filter(w => !w.isMinimized);
        if (visible.length > 0) {
          nextActive = visible.reduce((top, w) => w.zIndex > top.zIndex ? w : top, visible[0]).id;
        }
      }

      return {
        ...state,
        windows: remaining,
        activeWindowId: nextActive
      };
    }

    case OS_ACTIONS.MINIMIZE_WINDOW: {
      const targetId = action.payload.id;
      const remainingVisible = state.windows.filter(w => w.id !== targetId && !w.isMinimized);
      let nextActive = null;
      if (remainingVisible.length > 0) {
        nextActive = remainingVisible.reduce((top, w) => w.zIndex > top.zIndex ? w : top, remainingVisible[0]).id;
      }

      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === targetId ? { ...w, isMinimized: true } : w
        ),
        activeWindowId: nextActive
      };
    }

    case OS_ACTIONS.MAXIMIZE_WINDOW: {
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === action.payload.id
            ? { ...w, isMaximized: !w.isMaximized, isMinimized: false, zIndex: state.nextZIndex + 1 }
            : w
        ),
        activeWindowId: action.payload.id,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case OS_ACTIONS.FOCUS_WINDOW: {
      const targetId = action.payload.id;
      if (state.activeWindowId === targetId) return state;

      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === targetId
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex + 1 }
            : w
        ),
        activeWindowId: targetId,
        nextZIndex: state.nextZIndex + 1
      };
    }

    case OS_ACTIONS.MOVE_WINDOW: {
      const { id, x, y } = action.payload;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, x, y } : w
        )
      };
    }

    case OS_ACTIONS.RESIZE_WINDOW: {
      const { id, width, height } = action.payload;
      return {
        ...state,
        windows: state.windows.map(w =>
          w.id === id ? { ...w, width, height } : w
        )
      };
    }

    case OS_ACTIONS.TOGGLE_START_MENU: {
      return {
        ...state,
        isStartMenuOpen: !state.isStartMenuOpen
      };
    }

    case OS_ACTIONS.SET_START_MENU: {
      return {
        ...state,
        isStartMenuOpen: action.payload
      };
    }

    case OS_ACTIONS.TOGGLE_MUTE: {
      return {
        ...state,
        isMuted: !state.isMuted
      };
    }

    case OS_ACTIONS.SET_FULLSCREEN: {
      return {
        ...state,
        isFullscreen: action.payload
      };
    }

    case OS_ACTIONS.SET_EXIT_BANNER: {
      const isVisible = typeof action.payload === 'object' ? Boolean(action.payload.visible) : Boolean(action.payload);
      const reason = typeof action.payload === 'object' && action.payload.reason
        ? action.payload.reason
        : (isVisible ? (state.exitReason || 'FULLSCREEN_EXIT') : state.exitReason);
      return {
        ...state,
        showExitBanner: isVisible,
        exitReason: reason
      };
    }

    case OS_ACTIONS.RESTORE_SESSION: {
      return {
        ...state,
        ...action.payload
      };
    }

    default:
      return state;
  }
}
