# 🖥️ CYPHORA — Virtual OS ("OS Navigator") Architecture & Design Specification

## 1. Overview & Understanding Summary

* **What is being built**: A direct, zero-reload React SPA transition from CYPHORA’s Stage 1 *"Enter OS"* button into a sandboxed **Virtual Desktop Operating System ("OS Navigator")**, complete with a cyberpunk boot sequence, interactive desktop canvas, top competition HUD, draggable window manager, taskbar, start menu, and core working applications (Terminal, File Manager, Text Editor/Notes) backed by a unified Virtual File System (VFS).
* **Why it exists**: Provides an immersive, responsive competition environment where participants navigate directories, inspect files, and execute simulated terminal commands to uncover stage clues without accessing the host machine.
* **Who it is for**: CYPHORA competition teams and participants running across 100+ concurrent workstations with real-time score tracking.
* **Key Constraints**:
  * **SPA Continuity**: Operates directly inside the Vite + React frontend without page reloads, maintaining active team authentication, tokens, and WebSocket state.
  * **Decoupled Architecture**: The OS shell contains zero hardcoded puzzle answers; it solely provides capabilities and emits system events for a future Task & Validation engine.
  * **Resilience**: State and VFS modifications persist in `localStorage` to survive accidental page reloads.
* **Explicit Non-Goals**:
  * Hardcoding puzzle clues or specific challenge verification into the OS components.
  * Direct interaction with host filesystem or native operating system binaries.

---

## 2. Core Assumptions

1. **Virtual Filesystem**: Runs entirely in-memory as an indexed map with JSON serialization to `localStorage`.
2. **Kiosk Policy**: Enters fullscreen automatically on transition; displays a non-punitive re-entry banner if fullscreen is exited.
3. **Sound**: Subtle audio cues for boot chime and window actions, with an immediate mute/toggle option in the system tray.
4. **App Registry**: Extensible application registry pattern allowing seamless addition of future apps (Browser, Calculator, Task Manager).

---

## 3. Decision Log

| Decision | Alternatives Considered | Selected Option | Rationale |
| :--- | :--- | :--- | :--- |
| **OS Host Integration** | Separate `/round1` HTML vs. Iframe | **React SPA View Transition** | Preserves session tokens, WebSocket stream, and zero-reload user experience. |
| **Initial Phasing** | Phase 1 only vs. Full 6 Phases | **Phase 1 + Core Shell** | Delivers immediate working value (Desktop + Terminal + Files) while maintaining clean boundaries. |
| **Fullscreen Policy** | Strict Lock vs. Optional | **Auto + Re-entry Banner** | High immersion without risking browser deadlocks or accidental disqualifications. |
| **Architecture Pattern** | Micro-Kernel IPC vs. Flat Hierarchy | **Modular VFS Store + Event Bus** | Optimal balance of testability, performance, and decoupled task hooks (*YAGNI*). |
| **VFS Data Model** | Nested Tree vs. Indexed Path Map | **Indexed Path Map (`Record<path, VFSNode>`)** | $O(1)$ path lookup, simple serialization, instant two-way sync between Terminal and File Manager. |
| **Window Drag Engine** | External Drag Libraries vs. Native Events | **Native Pointer Events + Transforms** | Zero dependency bloat, 60 FPS hardware-accelerated movement. |

---

## 4. System Architecture & Component Hierarchy

```
App.jsx (stage: 'initial' | 'waking' | 'main' | 'os-boot' | 'os-desktop')
  │
  ├── stage === 'os-boot' ──► <BootScreen /> (2.5s BIOS / VFS check, progress bar)
  │
  └── stage === 'os-desktop' ──► <OSContainer />
        │
        ├── <SystemHUD /> (Team Name, Standing, Score, Round Timer, Fullscreen Toggle)
        ├── <Desktop /> (Wallpaper, Shortcuts grid, Context Menu)
        │     └── <WindowManager />
        │           ├── <WindowFrame id="term-1" title="Terminal">
        │           │     └── <TerminalApp />
        │           ├── <WindowFrame id="fm-1" title="File Manager">
        │           │     └── <FileManagerApp />
        │           └── <WindowFrame id="edit-1" title="Text Editor">
        │                 └── <TextEditorApp />
        │
        ├── <Taskbar /> (Start button, Running app tabs, System tray clock & audio)
        ├── <StartMenu /> (App launcher, VFS shortcuts, Return to Hub)
        └── <FullscreenBanner /> (Conditional re-entry prompt when not fullscreen)
```

---

## 5. File & Directory Layout

```text
src/os/
├── OSContainer.jsx               # Top-level OS wrapper & context provider
├── OSContainer.css               # Futuristic cyberpunk glassmorphism styling
├── boot/
│   ├── BootScreen.jsx            # Animated system boot & hardware verification
│   └── BootScreen.css
├── state/
│   ├── OSContext.jsx             # React Context & Provider
│   ├── osStore.js                # Central window, HUD, audio, active app reducer
│   └── useOS.js                  # Ergonomic hook for launching apps and interacting with the OS
├── vfs/
│   ├── vfsEngine.js              # Pure path resolution, readFile, writeFile, ls, rm, mkdir
│   ├── initialVFS.js             # Default filesystem structure (/Desktop, /Documents, etc.)
│   └── vfsStorage.js             # LocalStorage hydration & fallback recovery
├── events/
│   └── eventBus.js               # Synchronous in-memory pub-sub for task engine decoupling
├── shell/
│   ├── SystemHUD.jsx             # Top bar (CYPHORA stats & fullscreen toggle)
│   ├── Desktop.jsx               # Desktop icon grid & right-click context menu
│   ├── Taskbar.jsx               # Bottom bar with window instances & system tray
│   ├── StartMenu.jsx             # Application launcher & quick links
│   └── FullscreenBanner.jsx      # Non-punitive kiosk re-entry alert
├── windows/
│   ├── WindowManager.jsx         # Window instance mapping & z-index stacking
│   ├── WindowFrame.jsx           # Window header, minimize, maximize, close, drag/resize
│   └── WindowFrame.css
└── apps/
    ├── registry.js               # App definitions: metadata, default bounds, component
    ├── terminal/
    │   ├── TerminalApp.jsx       # Interactive CLI shell
    │   ├── commands.js           # ls, cd, cat, pwd, echo, mkdir, touch, rm, clear, help
    │   └── TerminalApp.css
    ├── file-manager/
    │   ├── FileManagerApp.jsx    # Dual-pane explorer with breadcrumbs & view modes
    │   └── FileManagerApp.css
    └── text-editor/
        ├── TextEditorApp.jsx     # Monospace editor with line count and save action
        └── TextEditorApp.css
```

---

## 6. Virtual File System (VFS) Specification

### Node Definition
```ts
interface VFSNode {
  id: string;
  name: string;
  type: 'file' | 'dir';
  parentId: string | null;
  path: string;            // Normalized absolute path (e.g. "/Users/Navigator/Documents/welcome.txt")
  content?: string;        // Text payload
  mimeType?: string;       // "text/plain", "image/png", etc.
  size?: number;           // Bytes
  hidden?: boolean;        // Hidden files prefixed with '.' or marked true
  locked?: boolean;        // Read-only files
  updatedAt: string;
}
```

### Initial Directory Hierarchy
```text
/
├── Desktop/
│   ├── welcome.txt        # Welcome briefing for the explorer
│   └── instructions.txt   # Basic navigation guidance
├── Documents/
│   ├── mission_log.txt    # System logs
│   └── archive/
├── Downloads/
├── Pictures/
├── System/
│   ├── config.sys
│   └── kernel.log
├── Users/
│   └── Navigator/
└── Trash/
```

---

## 7. Decoupled Event System

The OS emits notifications without knowing any puzzle logic.
Standard events emitted through `eventBus.emit(eventType, payload)`:

* `FILE_OPENED`: `{ path, appId, mimeType }`
* `FILE_MODIFIED`: `{ path, newContent }`
* `FILE_CREATED` / `FILE_DELETED`: `{ path }`
* `DIR_CHANGED`: `{ from, to }`
* `COMMAND_EXECUTED`: `{ command, args, raw, cwd }`
* `APP_OPENED` / `APP_CLOSED`: `{ appId, windowId }`

---

## 8. Resilience & Session Recovery

* **Instant Hydration**: On component mount, the VFS loads from `localStorage.getItem('cyphora_vfs_data')`. If missing or invalid, it restores from `initialVFS`.
* **State Preservation**: Active window positions, minimized states, and active working directory are stored to `cyphora_os_session`.
* **Return to Hub**: The Start Menu and HUD feature a clean *"Return to Hub"* button that transitions `stage` back to `'main'` without clearing data.
