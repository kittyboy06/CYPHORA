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
      const { appId, title, icon, meta = {}, defaultBounds } = action.payload;

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

      // Stagger new window position
      const offset = (state.windows.length % 6) * 28;
      const initialWidth = defaultBounds?.width || 680;
      const initialHeight = defaultBounds?.height || 480;
      const initialX = Math.max(40, (window.innerWidth - initialWidth) / 2 + offset);
      const initialY = Math.max(60, (window.innerHeight - initialHeight) / 2 + offset - 40);

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
        isMaximized: false,
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
        isFullscreen: action.payload,
        showExitBanner: !action.payload
      };
    }

    case OS_ACTIONS.SET_EXIT_BANNER: {
      return {
        ...state,
        showExitBanner: action.payload
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
