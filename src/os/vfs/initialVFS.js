/**
 * Canonical Virtual Filesystem (VFS) tree for CYPHORA OS Navigator
 * Configured for Round 1 Multi-App Technical Investigation Challenge (Tasks 1-12)
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

  // ROOT DIRECTORIES
  '/Desktop': {
    id: 'desktop',
    name: 'Desktop',
    type: 'dir',
    parentId: 'root',
    path: '/Desktop',
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
  '/Downloads': {
    id: 'downloads',
    name: 'Downloads',
    type: 'dir',
    parentId: 'root',
    path: '/Downloads',
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
  '/Archive': {
    id: 'archive',
    name: 'Archive',
    type: 'dir',
    parentId: 'root',
    path: '/Archive',
    updatedAt: new Date().toISOString()
  },
  '/Evidence': {
    id: 'evidence',
    name: 'Evidence',
    type: 'dir',
    parentId: 'root',
    path: '/Evidence',
    updatedAt: new Date().toISOString()
  },
  '/Shared': {
    id: 'shared',
    name: 'Shared',
    type: 'dir',
    parentId: 'root',
    path: '/Shared',
    updatedAt: new Date().toISOString()
  },

  // SUBDIRECTORIES
  '/Documents/clues': {
    id: 'dir_docs_clues',
    name: 'clues',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/clues',
    updatedAt: new Date().toISOString()
  },
  '/Documents/logs': {
    id: 'dir_docs_logs',
    name: 'logs',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/logs',
    updatedAt: new Date().toISOString()
  },
  '/Documents/Archive': {
    id: 'dir_docs_archive',
    name: 'Archive',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/Archive',
    updatedAt: new Date().toISOString()
  },
  '/Documents/Transfers': {
    id: 'dir_docs_transfers',
    name: 'Transfers',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/Transfers',
    updatedAt: new Date().toISOString()
  },
  '/Archive/.hidden': {
    id: 'dir_archive_hidden',
    name: '.hidden',
    type: 'dir',
    parentId: 'archive',
    path: '/Archive/.hidden',
    hidden: true,
    updatedAt: new Date().toISOString()
  },

  // TASK 01 EVIDENCE
  '/Desktop/message.txt': {
    id: 'file_desktop_message',
    name: 'message.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/message.txt',
    mimeType: 'text/plain',
    size: 11,
    content: `72 73 68 69`,
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
CYPHORA EXPEDITION // WORKSTATION TERMINAL
ROUND 1: OS NAVIGATOR MULTI-APP SYSTEM
================================================

Welcome to the internal workstation terminal.
Investigate workstation files and tools to solve challenges.
Applications do not auto-fill or solve tasks for you.

Status: WORKSTATION OPERATIONAL
`,
    updatedAt: new Date().toISOString()
  },

  // TASK 02 EVIDENCE
  '/Pictures/evidence.jpg': {
    id: 'file_evidence_jpg',
    name: 'evidence.jpg',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/evidence.jpg',
    mimeType: 'image/jpeg',
    author: 'ARLO',
    software: 'Field Camera v1.4',
    description: 'Expedition Survey Photo',
    dimensions: '1280x720',
    size: 980000,
    content: '[IMAGE FILE: EVIDENCE JPG (Author: ARLO)]',
    updatedAt: new Date().toISOString()
  },

  // TASK 03 EVIDENCE
  '/Pictures/poster.png': {
    id: 'file_poster_png',
    name: 'poster.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/poster.png',
    mimeType: 'image/png',
    qrPayload: 'SECTOR-7',
    dimensions: '512x512',
    size: 420000,
    content: '[OPTICAL MATRIX CODE — PAYLOAD: SECTOR-7]',
    updatedAt: new Date().toISOString()
  },

  // TASK 04 EVIDENCE
  '/Documents/access.log': {
    id: 'file_access_log',
    name: 'access.log',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/access.log',
    mimeType: 'text/plain',
    size: 85,
    content: `[04:12] BLUE
[04:07] RED
[04:19] GREEN
[04:03] YELLOW
[04:15] WHITE
`,
    updatedAt: new Date().toISOString()
  },

  // TASK 05 EVIDENCE
  '/Documents/message_old.txt': {
    id: 'file_message_old',
    name: 'message_old.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/message_old.txt',
    mimeType: 'text/plain',
    size: 110,
    content: `[CYPHORA TRANSMISSION LOG]
STATUS: ONLINE
RETRY: 3
KEY_VAL: 8492
ENCLAVE_ID: EXPEDITION-ALPHA
END_LOG
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/message_new.txt': {
    id: 'file_message_new',
    name: 'message_new.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/message_new.txt',
    mimeType: 'text/plain',
    size: 110,
    content: `[CYPHORA TRANSMISSION LOG]
STATUS: ONLINE
RETRY: 3
KEY_VAL: 9941
ENCLAVE_ID: EXPEDITION-ALPHA
END_LOG
`,
    updatedAt: new Date().toISOString()
  },

  // TASK 06 EVIDENCE
  '/Documents/fragment_01.txt': {
    id: 'file_fragment_01',
    name: 'fragment_01.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/fragment_01.txt',
    mimeType: 'text/plain',
    size: 30,
    content: `Q1lQ\n[TIMESTAMP: 09:10]`,
    updatedAt: '2026-09-29T09:10:00.000Z'
  },
  '/Documents/fragment_02.txt': {
    id: 'file_fragment_02',
    name: 'fragment_02.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/fragment_02.txt',
    mimeType: 'text/plain',
    size: 30,
    content: `SE9S\n[TIMESTAMP: 09:25]`,
    updatedAt: '2026-09-29T09:25:00.000Z'
  },
  '/Documents/fragment_03.txt': {
    id: 'file_fragment_03',
    name: 'fragment_03.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/fragment_03.txt',
    mimeType: 'text/plain',
    size: 30,
    content: `QQ==\n[TIMESTAMP: 09:40]`,
    updatedAt: '2026-09-29T09:40:00.000Z'
  },

  // TASK 07 EVIDENCE
  '/Pictures/archive_photo.png': {
    id: 'file_archive_photo',
    name: 'archive_photo.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/archive_photo.png',
    mimeType: 'image/png',
    author: 'ARCHIVIST-01',
    description: '82 69 83 67 85 69',
    dimensions: '1920x1080',
    size: 1540000,
    content: '[ARCHIVE PHOTO — METADATA DESCRIPTION: 82 69 83 67 85 69]',
    updatedAt: new Date().toISOString()
  },

  // TASK 08 EVIDENCE (ONLY hidden folder task)
  '/Archive/.hidden/clue.txt': {
    id: 'file_hidden_clue',
    name: 'clue.txt',
    type: 'file',
    parentId: 'dir_archive_hidden',
    path: '/Archive/.hidden/clue.txt',
    mimeType: 'text/plain',
    hidden: true,
    size: 35,
    content: `The missing value is:\n7314`,
    updatedAt: new Date().toISOString()
  },

  // TASK 09 EVIDENCE
  '/Pictures/map.png': {
    id: 'file_map_png',
    name: 'map.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/map.png',
    mimeType: 'image/png',
    qrPayload: 'CLUE-42',
    dimensions: '1024x1024',
    size: 890000,
    content: '[SURVEY MAP — OPTICAL PAYLOAD: CLUE-42]',
    updatedAt: new Date().toISOString()
  },
  '/Documents/clues/index.txt': {
    id: 'file_clues_index',
    name: 'index.txt',
    type: 'file',
    parentId: 'dir_docs_clues',
    path: '/Documents/clues/index.txt',
    mimeType: 'text/plain',
    size: 100,
    content: `CLUE-17 → notes.txt
CLUE-31 → archive.txt
CLUE-42 → activity.log
CLUE-58 → report.txt
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/logs/activity.log': {
    id: 'file_logs_activity',
    name: 'activity.log',
    type: 'file',
    parentId: 'dir_docs_logs',
    path: '/Documents/logs/activity.log',
    mimeType: 'text/plain',
    size: 160,
    content: `08:14 USER-A LOGIN
08:21 USER-B LOGIN
08:37 USER-A DOWNLOAD FILE=17
08:42 USER-C LOGIN
08:51 USER-A LOGOUT
09:03 USER-B DOWNLOAD FILE=22
`,
    updatedAt: new Date().toISOString()
  },

  // TASK 10 EVIDENCE
  '/Documents/alpha.txt': {
    id: 'file_alpha',
    name: 'alpha.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/alpha.txt',
    mimeType: 'text/plain',
    size: 60,
    content: `STATUS=READY
TOKEN=ACTIVE
NOTE=48 45 4C 50
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/beta.txt': {
    id: 'file_beta',
    name: 'beta.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/beta.txt',
    mimeType: 'text/plain',
    size: 65,
    content: `STATUS=READY
TOKEN=ACTIVE
NOTE=56 45 43 54 4F 52
`,
    updatedAt: new Date().toISOString()
  },

  // TASK 11 EVIDENCE
  '/Documents/incident_note.txt': {
    id: 'file_incident_note',
    name: 'incident_note.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/incident_note.txt',
    mimeType: 'text/plain',
    size: 70,
    content: `The trail begins where the picture ends.

REFERENCE:
ARCHIVE-17
`,
    updatedAt: new Date().toISOString()
  },
  '/Archive/archive-17.txt': {
    id: 'file_archive_17',
    name: 'archive-17.txt',
    type: 'file',
    parentId: 'archive',
    path: '/Archive/archive-17.txt',
    mimeType: 'text/plain',
    size: 25,
    content: `NEXT:
DEVICE-9
`,
    updatedAt: new Date().toISOString()
  },
  '/Pictures/device-9.jpg': {
    id: 'file_device_9_jpg',
    name: 'device-9.jpg',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/device-9.jpg',
    mimeType: 'image/jpeg',
    author: 'SYSTEM MONITOR',
    description: '53 48 49 46 54',
    dimensions: '1920x1080',
    size: 1100000,
    content: '[IMAGE FILE: DEVICE-9 (Metadata Description: 53 48 49 46 54)]',
    updatedAt: new Date().toISOString()
  },

  // TASK 12 EVIDENCE (FINAL BOSS)
  '/Documents/system.log': {
    id: 'file_system_log',
    name: 'system.log',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/system.log',
    mimeType: 'text/plain',
    size: 130,
    content: `08:15 — SYSTEM START
08:27 — FILE ACCESS
08:43 — UNKNOWN DEVICE
08:51 — FILE TRANSFER
09:02 — SYSTEM LOCK
`,
    updatedAt: new Date().toISOString()
  },
  '/Pictures/device.png': {
    id: 'file_device_png',
    name: 'device.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/device.png',
    mimeType: 'image/png',
    author: 'DEVICE LOG',
    description: 'Device ID: VX-27',
    deviceId: 'VX-27',
    dimensions: '1024x1024',
    size: 870000,
    content: '[DEVICE IMAGE — METADATA: Device ID: VX-27]',
    updatedAt: new Date().toISOString()
  },
  '/Documents/Archive/VX-27.txt': {
    id: 'file_vx27_txt',
    name: 'VX-27.txt',
    type: 'file',
    parentId: 'dir_docs_archive',
    path: '/Documents/Archive/VX-27.txt',
    mimeType: 'text/plain',
    size: 45,
    content: `DEVICE: VX-27

TRANSFER ID:
TR-904
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/Transfers/TR-904.txt': {
    id: 'file_tr904_txt',
    name: 'TR-904.txt',
    type: 'file',
    parentId: 'dir_docs_transfers',
    path: '/Documents/Transfers/TR-904.txt',
    mimeType: 'text/plain',
    size: 35,
    content: `PAYLOAD:
53 59 4D 50 4F
`,
    updatedAt: new Date().toISOString()
  }
};
