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
    size: 512,
    content: `================================================
CYPHORA EXPEDITION // WORKSTATION TERMINAL
ROUND 1: OS NAVIGATOR MULTI-APP SYSTEM
================================================

Explorer,

Welcome to the internal workstation terminal. You have accessed
the forward relay system.

Applications Available:
1. Universal Converter — Multi-step data format transformer
2. Metadata Inspector — Inspect hidden EXIF & file properties
3. QR Scanner — Scan machine-readable codes & payloads
4. Image Inspector — Examine visual dimensions & pixel data
5. Text Analyzer — Analyze word frequency & line patterns
6. File Comparison Tool — Identify document differences
7. File Manager — Navigate folders & inspect file properties
8. Terminal — Command line filesystem interaction
9. Text Editor — Open and read text documents

Status: WORKSTATION OPERATIONAL
`,
    updatedAt: new Date().toISOString()
  },
  '/Desktop/message.txt': {
    id: 'file_desktop_message',
    name: 'message.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/message.txt',
    mimeType: 'text/plain',
    size: 40,
    content: `01001000 01001001 01000100 01000101`,
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
  '/Evidence/message.txt': {
    id: 'file_evidence_message',
    name: 'message.txt',
    type: 'file',
    parentId: 'evidence',
    path: '/Evidence/message.txt',
    mimeType: 'text/plain',
    size: 40,
    content: `01001000 01001001 01000100 01000100`,
    updatedAt: new Date().toISOString()
  },
  '/Evidence/evidence.jpg': {
    id: 'file_evidence_jpg_evidence',
    name: 'evidence.jpg',
    type: 'file',
    parentId: 'evidence',
    path: '/Evidence/evidence.jpg',
    mimeType: 'image/jpeg',
    author: 'ARLO',
    software: 'Field Camera',
    description: '48 45 4C 50',
    dimensions: '1280x720',
    size: 980000,
    content: '[IMAGE FILE: EVIDENCE JPG (Author: ARLO, Description: 48 45 4C 50)]',
    updatedAt: new Date().toISOString()
  },
  '/Evidence/clue.png': {
    id: 'file_evidence_clue_png',
    name: 'clue.png',
    type: 'file',
    parentId: 'evidence',
    path: '/Evidence/clue.png',
    mimeType: 'image/png',
    qrPayload: 'SECTOR-7',
    dimensions: '512x512',
    size: 420000,
    content: '[QR CODE IMAGE — PAYLOAD: SECTOR-7]',
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
  '/Shared': {
    id: 'shared',
    name: 'Shared',
    type: 'dir',
    parentId: 'root',
    path: '/Shared',
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
  '/Documents/binary_message.txt': {
    id: 'file_binary_message',
    name: 'binary_message.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/binary_message.txt',
    mimeType: 'text/plain',
    size: 40,
    content: `01001000 01001001 01000100 01000101`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/access.log': {
    id: 'file_access_log',
    name: 'access.log',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/access.log',
    mimeType: 'text/plain',
    size: 140,
    content: `[04:12] BLUE
[04:07] RED
[04:19] GREEN
[04:03] YELLOW
[04:15] WHITE
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/pattern_log.txt': {
    id: 'file_pattern_log',
    name: 'pattern_log.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/pattern_log.txt',
    mimeType: 'text/plain',
    size: 180,
    content: `ALPHA
BETA
GAMMA
ALPHA
DELTA
ALPHA
BETA
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/message_old.txt': {
    id: 'file_message_old',
    name: 'message_old.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/message_old.txt',
    mimeType: 'text/plain',
    size: 240,
    content: `[CYPHORA TRANSMISSION LOG v1.0]
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
    size: 240,
    content: `[CYPHORA TRANSMISSION LOG v1.0]
STATUS: ONLINE
RETRY: 3
KEY_VAL: 9941
ENCLAVE_ID: EXPEDITION-ALPHA
END_LOG
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/data.txt': {
    id: 'file_data_txt',
    name: 'data.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/data.txt',
    mimeType: 'text/plain',
    size: 30,
    content: `01001001 01001110 01001011`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/binary_chain.txt': {
    id: 'file_binary_chain',
    name: 'binary_chain.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/binary_chain.txt',
    mimeType: 'text/plain',
    size: 30,
    content: `01001001 01001110 01001011`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/REPORT_17.txt': {
    id: 'file_report_17',
    name: 'REPORT_17.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/REPORT_17.txt',
    mimeType: 'text/plain',
    size: 120,
    content: `[EXPEDITION SECURITY REPORT #17]
STATION_STATUS: OFFLINE
The access code is 4812.
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/hex_stream.txt': {
    id: 'file_hex_stream',
    name: 'hex_stream.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/hex_stream.txt',
    mimeType: 'text/plain',
    size: 20,
    content: `48 45 4C 50`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/clues': {
    id: 'dir_clues',
    name: 'clues',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/clues',
    updatedAt: new Date().toISOString()
  },
  '/Documents/clues/numbers.txt': {
    id: 'file_clues_numbers',
    name: 'numbers.txt',
    type: 'file',
    parentId: 'dir_clues',
    path: '/Documents/clues/numbers.txt',
    mimeType: 'text/plain',
    size: 80,
    content: `17
42
17
91
63
42
17
28
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/numbers.txt': {
    id: 'file_numbers',
    name: 'numbers.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/numbers.txt',
    mimeType: 'text/plain',
    size: 80,
    content: `17
42
17
91
63
42
17
28
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/alpha.txt': {
    id: 'file_alpha',
    name: 'alpha.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/alpha.txt',
    mimeType: 'text/plain',
    size: 160,
    content: `[LOG RECORD ARCHIVE ALPHA]
SYS_TIME: 10:45:00
CHECKSUM: OK
CHANGED_FIELD: 00 00 00 00
END_RECORD
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
    size: 160,
    content: `[LOG RECORD ARCHIVE ALPHA]
SYS_TIME: 10:45:00
CHECKSUM: OK
CHANGED_FIELD: 4A 55 4D 50
END_RECORD
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/Archive_04.txt': {
    id: 'file_archive_04',
    name: 'Archive_04.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/Archive_04.txt',
    mimeType: 'text/plain',
    size: 110,
    content: `[RECOVERED ARCHIVE RECORD #04]
ENCODED_MESSAGE: 53 48 49 46 54
`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/final_cipher.txt': {
    id: 'file_final_cipher',
    name: 'final_cipher.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/final_cipher.txt',
    mimeType: 'text/plain',
    size: 90,
    content: `[MASTER WORKSTATION CLEARANCE CIPHER]
ENCODED_VALUE: 53 59 4D 50 4F
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
  '/Downloads/recovered.dat': {
    id: 'file_recovered_dat',
    name: 'recovered.dat',
    type: 'file',
    parentId: 'downloads',
    path: '/Downloads/recovered.dat',
    mimeType: 'text/plain',
    size: 20,
    content: `48 45 4C 50`,
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
  '/Pictures/expedition_photo.png': {
    id: 'file_expedition_photo',
    name: 'expedition_photo.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/expedition_photo.png',
    mimeType: 'image/png',
    author: 'Dr. Arlo Vance',
    software: 'Expedition Cam v2',
    description: 'Field Outpost Survey',
    createdDate: '2026-09-24T09:12:00.000Z',
    modifiedDate: '2026-09-24T10:15:00.000Z',
    dimensions: '1920x1080',
    size: 1845000,
    content: '[IMAGE FILE: EXPEDITION PHOTO (Author: Dr. Arlo Vance)]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/evidence.jpg': {
    id: 'file_evidence_jpg',
    name: 'evidence.jpg',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/evidence.jpg',
    mimeType: 'image/jpeg',
    author: 'ARLO',
    software: 'Field Camera',
    description: '48 45 4C 50',
    dimensions: '1280x720',
    size: 980000,
    content: '[IMAGE FILE: EVIDENCE JPG (Author: ARLO, Description: 48 45 4C 50)]',
    updatedAt: new Date().toISOString()
  },
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
    content: '[QR CODE IMAGE — PAYLOAD: SECTOR-7]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/sector_qr.png': {
    id: 'file_sector_qr',
    name: 'sector_qr.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/sector_qr.png',
    mimeType: 'image/png',
    qrPayload: 'SECTOR-7',
    dimensions: '512x512',
    size: 420000,
    content: '[QR CODE IMAGE — PAYLOAD: SECTOR-7]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/archive_map.png': {
    id: 'file_archive_map_png',
    name: 'archive_map.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/archive_map.png',
    mimeType: 'image/png',
    qrPayload: '/Documents/clues/numbers.txt',
    dimensions: '512x512',
    size: 490000,
    content: '[QR CODE IMAGE — PAYLOAD: /Documents/clues/numbers.txt]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/location_qr.png': {
    id: 'file_location_qr',
    name: 'location_qr.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/location_qr.png',
    mimeType: 'image/png',
    qrPayload: '/Documents/numbers.txt',
    dimensions: '512x512',
    size: 490000,
    content: '[QR CODE IMAGE — PAYLOAD: /Documents/numbers.txt]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/photo.png': {
    id: 'file_photo_png',
    name: 'photo.png',
    type: 'file',
    parentId: 'pictures',
    path: '/Pictures/photo.png',
    mimeType: 'image/png',
    author: 'ARCHIVIST',
    software: 'Capture Pro',
    description: 'ARCHIVE_04',
    dimensions: '1920x1080',
    size: 1650000,
    content: '[IMAGE FILE: PHOTO PNG (Metadata Description: ARCHIVE_04)]',
    updatedAt: new Date().toISOString()
  },
  '/.hidden': {
    id: 'dir_hidden',
    name: '.hidden',
    type: 'dir',
    parentId: 'root',
    path: '/.hidden',
    hidden: true,
    updatedAt: new Date().toISOString()
  },
  '/.hidden/enclave_beacon.png': {
    id: 'file_enclave_beacon',
    name: 'enclave_beacon.png',
    type: 'file',
    parentId: 'dir_hidden',
    path: '/.hidden/enclave_beacon.png',
    mimeType: 'image/png',
    hidden: true,
    author: 'SYSTEM OPERATOR',
    description: 'Beacon QR payload inside /System/logs/beacon_scan.png',
    dimensions: '1024x1024',
    size: 780000,
    content: '[CONCEALED IMAGE FILE — METADATA DESCRIPTION: Beacon QR payload inside /System/logs/beacon_scan.png]',
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
  '/System/logs': {
    id: 'system_logs',
    name: 'logs',
    type: 'dir',
    parentId: 'system',
    path: '/System/logs',
    updatedAt: new Date().toISOString()
  },
  '/System/logs/sys_init.log': {
    id: 'file_sys_init',
    name: 'sys_init.log',
    type: 'file',
    parentId: 'system_logs',
    path: '/System/logs/sys_init.log',
    mimeType: 'text/plain',
    size: 320,
    content: `[SYSTEM INIT] Workstation booted successfully.`,
    updatedAt: new Date().toISOString()
  },
  '/System/logs/beacon_scan.png': {
    id: 'file_beacon_scan',
    name: 'beacon_scan.png',
    type: 'file',
    parentId: 'system_logs',
    path: '/System/logs/beacon_scan.png',
    mimeType: 'image/png',
    qrPayload: '/Documents/final_cipher.txt',
    dimensions: '512x512',
    size: 450000,
    content: '[BEACON SCAN QR IMAGE — PAYLOAD: /Documents/final_cipher.txt]',
    updatedAt: new Date().toISOString()
  }
};

