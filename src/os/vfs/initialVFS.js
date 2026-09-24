/**
 * Default Virtual Filesystem (VFS) tree for CYPHORA OS Navigator
 */

export const INITIAL_VFS = {
  '/': {
    id: 'root',
    name: '/',
    type: 'dir',
    parentId: null,
    path: '/',
    updatedAt: new Date().toISOString()
  },
  '/Desktop': {
    id: 'desktop',
    name: 'Desktop',
    type: 'dir',
    parentId: 'root',
    path: '/Desktop',
    updatedAt: new Date().toISOString()
  },
  '/Desktop/welcome.txt': {
    id: 'file_welcome',
    name: 'welcome.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/welcome.txt',
    mimeType: 'text/plain',
    size: 420,
    content: `================================================
CYPHORA EXPEDITION // OS NAVIGATOR TERMINAL
STAGE 1: SYSTEM RECONNAISSANCE
================================================

Explorer,

Welcome to the internal workstation terminal. You have accessed
the forward relay system.

Your mission in Stage 1 is to navigate the workstation, inspect
encrypted system logs, and operate the terminal interpreter.

Tools at your disposal:
1. File Manager: Explore visual directory trees.
2. Terminal: Execute reconnaissance commands (ls, cat, cd, etc.).
3. Text Editor: Read and draft decoded communications.

Tip: Some system files are concealed. The terminal interpreter
may reveal what the visual explorer conceals.

Status: WORKSTATION SYNCHRONIZED
`,
    updatedAt: new Date().toISOString()
  },
  '/Desktop/instructions.txt': {
    id: 'file_instructions',
    name: 'instructions.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/instructions.txt',
    mimeType: 'text/plain',
    size: 260,
    content: `SYSTEM DIRECTIVES:
-------------------
1. Use standard CLI navigation:
   - 'ls' to list directory entries
   - 'ls -a' to display concealed items
   - 'cd <directory>' to traverse folders
   - 'cat <file>' to print file contents
   - 'clear' to reset terminal view

2. Double click any text document to open in Text Editor.
3. Keep track of coordinates found in system records.
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents': {
    id: 'documents',
    name: 'Documents',
    type: 'dir',
    parentId: 'root',
    path: '/Documents',
    updatedAt: new Date().toISOString()
  },
  '/Documents/mission_briefing.txt': {
    id: 'file_mission',
    name: 'mission_briefing.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/mission_briefing.txt',
    mimeType: 'text/plain',
    size: 340,
    content: `CYPHORA DISPATCH // SECTOR 7G
Subject: Forward Relay Outpost Assessment

Telemetry from the perimeter relay has gone silent.
The expedition command requires all workstations to verify
integrity before the gate can unlock Stage 2.

Observe system logs under /System and check the archive.
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/coordinates.log': {
    id: 'file_coordinates',
    name: 'coordinates.log',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/coordinates.log',
    mimeType: 'text/plain',
    size: 180,
    content: `[SECTOR TELEMETRY LOG]
RELAY_ALPHA:  37.7749 N, 122.4194 W [ONLINE]
RELAY_BETA:   51.5074 N,  0.1278 W [OFFLINE]
RELAY_GAMMA:  35.6762 N, 139.6503 E [ONLINE]
GATE_VECTOR:  CYPHORA-994-OMEGA
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/archive': {
    id: 'archive_dir',
    name: 'archive',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/archive',
    updatedAt: new Date().toISOString()
  },
  '/Documents/archive/old_comm.txt': {
    id: 'file_old_comm',
    name: 'old_comm.txt',
    type: 'file',
    parentId: 'archive_dir',
    path: '/Documents/archive/old_comm.txt',
    mimeType: 'text/plain',
    size: 210,
    content: `[TRANSCRIPT - 03:14:22]
Relay Operator: Signal degradation confirmed.
Control: Switch to local autonomous OS mode.
Relay Operator: Initiating OS Navigator protocol.
`,
    updatedAt: new Date().toISOString()
  },
  '/Downloads': {
    id: 'downloads',
    name: 'Downloads',
    type: 'dir',
    parentId: 'root',
    path: '/Downloads',
    updatedAt: new Date().toISOString()
  },
  '/Downloads/patch_v1.0.tar': {
    id: 'file_patch',
    name: 'patch_v1.0.tar',
    type: 'file',
    parentId: 'downloads',
    path: '/Downloads/patch_v1.0.tar',
    mimeType: 'application/octet-stream',
    size: 1048576,
    content: '[BINARY CONTENT — ENCRYPTED ARCHIVE]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures': {
    id: 'pictures',
    name: 'Pictures',
    type: 'dir',
    parentId: 'root',
    path: '/Pictures',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/station_map.png': {
    id: 'file_station_map',
    name: 'station_map.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/station_map.png',
    mimeType: 'image/png',
    size: 2457600,
    content: '[IMAGE FILE: STATION SCHEMATICS]',
    updatedAt: new Date().toISOString()
  },
  '/System': {
    id: 'system',
    name: 'System',
    type: 'dir',
    parentId: 'root',
    path: '/System',
    updatedAt: new Date().toISOString()
  },
  '/System/config.sys': {
    id: 'file_config_sys',
    name: 'config.sys',
    type: 'file',
    parentId: 'system',
    path: '/System/config.sys',
    mimeType: 'text/plain',
    size: 190,
    locked: true,
    content: `KERNEL_VERSION=CYPHORA-OS-6.4.12
SECURITY_LEVEL=STANDARD
TERMINAL_INTERPRETER=BASH_COMPAT_V1
NETWORK_STATUS=ONLINE_WEBSOCKET_LINKED
STORAGE_BACKEND=BROWSER_INDEXED_VFS
`,
    updatedAt: new Date().toISOString()
  },
  '/System/kernel.log': {
    id: 'file_kernel_log',
    name: 'kernel.log',
    type: 'file',
    parentId: 'system',
    path: '/System/kernel.log',
    mimeType: 'text/plain',
    size: 275,
    content: `[0.000000] Booting CYPHORA OS Navigator v1.0.4
[0.001240] Initializing VFS memory driver... OK
[0.002810] Loading window manager compositor... OK
[0.003920] Mounting /Desktop, /Documents, /System... OK
[0.004100] Team session verified. Station ready.
`,
    updatedAt: new Date().toISOString()
  },
  '/System/.security_key': {
    id: 'file_sec_key',
    name: '.security_key',
    type: 'file',
    parentId: 'system',
    path: '/System/.security_key',
    mimeType: 'text/plain',
    hidden: true,
    size: 72,
    content: `CYPHORA{VFS_SHADOW_KEY_8492_ALPHA}`,
    updatedAt: new Date().toISOString()
  },
  '/Users': {
    id: 'users',
    name: 'Users',
    type: 'dir',
    parentId: 'root',
    path: '/Users',
    updatedAt: new Date().toISOString()
  },
  '/Users/Navigator': {
    id: 'user_navigator',
    name: 'Navigator',
    type: 'dir',
    parentId: 'users',
    path: '/Users/Navigator',
    updatedAt: new Date().toISOString()
  },
  '/Trash': {
    id: 'trash',
    name: 'Trash',
    type: 'dir',
    parentId: 'root',
    path: '/Trash',
    updatedAt: new Date().toISOString()
  }
};
