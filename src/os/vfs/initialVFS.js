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
  '/Transfers': {
    id: 'transfers',
    name: 'Transfers',
    type: 'dir',
    parentId: 'root',
    path: '/Transfers',
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
  '/Documents/Archive/.hidden': {
    id: 'dir_docs_archive_hidden',
    name: '.hidden',
    type: 'dir',
    parentId: 'dir_docs_archive',
    path: '/Documents/Archive/.hidden',
    hidden: true,
    updatedAt: new Date().toISOString()
  },
  '/Documents/Archive/.hidden/clue.txt': {
    id: 'file_docs_archive_clue',
    name: 'clue.txt',
    type: 'file',
    parentId: 'dir_docs_archive_hidden',
    path: '/Documents/Archive/.hidden/clue.txt',
    mimeType: 'text/plain',
    hidden: false,
    size: 35,
    content: `The missing value is:\n7314`,
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
  '/Documents/prompts': {
    id: 'dir_docs_prompts',
    name: 'prompts',
    type: 'dir',
    parentId: 'documents',
    path: '/Documents/prompts',
    updatedAt: new Date().toISOString()
  },
  '/Documents/prompts/sample_prompt.txt': {
    id: 'file_sample_prompt',
    name: 'sample_prompt.txt',
    type: 'file',
    parentId: 'dir_docs_prompts',
    path: '/Documents/prompts/sample_prompt.txt',
    mimeType: 'text/plain',
    size: 210,
    content: `Towering ancient obsidian monolith standing isolated in vast desert dunes, dramatic sunset lighting with volumetric sunbeams, atmospheric dust haze, cinematic photorealistic composition, 8k resolution.`,
    updatedAt: new Date().toISOString()
  },
  '/Documents/stage2_briefing.txt': {
    id: 'file_stage2_briefing',
    name: 'stage2_briefing.txt',
    type: 'file',
    parentId: 'documents',
    path: '/Documents/stage2_briefing.txt',
    mimeType: 'text/plain',
    size: 680,
    content: `================================================
CYPHORA EXPEDITION // STAGE 2: IMAGE NAVIGATION
================================================
MISSION OBJECTIVE:
Reconstruct the lost visual records of the Sector 4 expedition through prompt engineering and AI cosine similarity evaluation.

INTEGRATED OS SUITE:
1. Stage 2: Image Navigation — Central expedition hub for Phase 1 & Phase 2 submissions.
2. Vision Target Viewer — Protected optical inspector for Target 1 & Target 2 with 15s peek countdown.
3. Prompt Studio — Advanced prompter with keyword chips, character counter, and VFS file sync.
4. Similarity Evaluator — Independent cosine similarity tester for testing images against reference targets.
5. Expedition Standings — Real-time live scoreboard of all connected teams.
6. Mission Briefing — Recovered expedition story logs and audio transcript records.

EVALUATION RULES:
- Target 1 Cosine Similarity: Up to 200 Points
- Target 2 Cosine Similarity: Up to 200 Points
- Speed Bonus (15-min clock): Up to 600 Bonus Points
- Total Possible Points: 1,000 Points
`,
    updatedAt: new Date().toISOString()
  },
  '/Pictures/targets': {
    id: 'dir_pictures_targets',
    name: 'targets',
    type: 'dir',
    parentId: 'pictures',
    path: '/Pictures/targets',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/targets/target1.jpg': {
    id: 'file_target1_jpg',
    name: 'target1.jpg',
    type: 'file',
    parentId: 'dir_pictures_targets',
    path: '/Pictures/targets/target1.jpg',
    mimeType: 'image/jpeg',
    assetUrl: '/assets/round2/targets/target1.jpg',
    description: 'Sector 4 Anomaly Target 1 — Monolith Structure',
    size: 456870,
    content: '[IMAGE FILE: SECTOR 4 MONOLITH TARGET 1 (1920x1080)]',
    updatedAt: new Date().toISOString()
  },
  '/Pictures/targets/target2.jpg': {
    id: 'file_target2_jpg',
    name: 'target2.jpg',
    type: 'file',
    parentId: 'dir_pictures_targets',
    path: '/Pictures/targets/target2.jpg',
    mimeType: 'image/jpeg',
    assetUrl: '/assets/round2/targets/target2.jpg',
    description: 'Sector 4 Anomaly Target 2 — Desert Outpost Station',
    size: 419468,
    content: '[IMAGE FILE: SECTOR 4 OUTPOST TARGET 2 (1920x1080)]',
    updatedAt: new Date().toISOString()
  },
  '/Desktop/Stage 2 - Image Navigation.txt': {
    id: 'file_desktop_stage2_guide',
    name: 'Stage 2 - Image Navigation.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/Stage 2 - Image Navigation.txt',
    mimeType: 'text/plain',
    size: 380,
    content: `CYPHORA STAGE 2 // IMAGE NAVIGATION
------------------------------------
Stage 2 is fully integrated into the OS!
- Launch 'Stage 2: Image Navigation' from Desktop or Start Menu.
- Use 'Vision Target' to study organizer reference images.
- Use 'Prompt Studio' to craft descriptive prompts.
- Use 'Similarity Evaluator' to test cosine similarity.
- Check 'Expedition Standings' for real-time team rankings.
`,
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
  '/.hidden': {
    id: 'dir_root_hidden',
    name: '.hidden',
    type: 'dir',
    parentId: 'root',
    path: '/.hidden',
    hidden: true,
    updatedAt: new Date().toISOString()
  },
  '/.hidden/clue.txt': {
    id: 'file_root_hidden_clue',
    name: 'clue.txt',
    type: 'file',
    parentId: 'dir_root_hidden',
    path: '/.hidden/clue.txt',
    mimeType: 'text/plain',
    hidden: false,
    size: 35,
    content: `The missing value is:\n7314`,
    updatedAt: new Date().toISOString()
  },
  '/System': {
    id: 'system_root',
    name: 'System',
    type: 'dir',
    parentId: 'root',
    path: '/System',
    locked: true,
    updatedAt: new Date().toISOString()
  },
  '/System/logs': {
    id: 'system_logs_dir',
    name: 'logs',
    type: 'dir',
    parentId: 'system_root',
    path: '/System/logs',
    locked: true,
    updatedAt: new Date().toISOString()
  },
  '/System/logs/kernel.log': {
    id: 'file_system_kernel_log',
    name: 'kernel.log',
    type: 'file',
    parentId: 'system_logs_dir',
    path: '/System/logs/kernel.log',
    mimeType: 'text/plain',
    locked: true,
    size: 84,
    content: `[0.000000] Linux version 6.5-cyphora\n[0.001200] Workstation secure subsystem initialized`,
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
  '/Desktop/START.txt': {
    id: 'file_desktop_start',
    name: 'START.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/START.txt',
    mimeType: 'text/plain',
    size: 480,
    content: `================================================
CYPHORA INVESTIGATION WORKSTATION MANUAL
================================================
1. Launch the Tasks application from your desktop or taskbar to view your current active objective.
2. Use File Manager to explore workstation directories: /Documents, /Pictures, /Archive, and /Evidence.
3. Utilize specialized utility applications (Metadata Inspector, Universal Converter, File Comparator, QR Scanner, Image Inspector, Audio Inspector) to analyze evidence files.
4. Input discovered codes into the Tasks application to verify and proceed.
5. Good luck, Operative.
`,
    updatedAt: new Date().toISOString()
  },
  '/Desktop/Getting Started.txt': {
    id: 'file_desktop_getting_started',
    name: 'Getting Started.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/Getting Started.txt',
    mimeType: 'text/plain',
    size: 1100,
    content: `GETTING STARTED WITH CYPHORA OS
===============================

Welcome to Cyphora OS! This workstation has all the tools you need to solve
challenges, investigate clues, and reach The Monolith.

Quick Start:
1. Open Tasks: Double-click "Tasks" on the desktop to see your current objective.
2. Explore Files: Use "File Manager" or "Terminal" to search folders and find clues.
3. Decode Clues: Use the specialized tools to decode text, check metadata, or inspect images.
4. Submit Answers: Type your answer in the Tasks app to unlock the next mission.
5. Track Progress: Watch your journey progress and live leaderboard on the top right.

For detailed instructions on every tool, open "App Usage.txt" on the desktop.

--------------------------------------------------
APP USAGE SUMMARY
--------------------------------------------------
• Tasks: View your current mission, hints, and submit answers.
• File Manager: Browse folders and open files.
• Terminal: Run command-line searches (ls, cd, cat, grep).
• Text Editor: Read, edit, and save text notes and logs.
• Universal Converter: Decode Hex, Base64, Binary, ASCII, and ciphers.
• Metadata Inspector: View hidden file details, author tags, and device IDs.
• QR Scanner: Scan barcodes and QR codes from images.
• Image Inspector: Zoom, invert colors, and isolate color channels.
• Text Analyzer: Analyze character frequency to solve ciphers.
• File Comparison: Compare two files side-by-side to find differences.
• Audio Inspector: Play audio and inspect sound wave frequencies.
• Settings: Adjust volume, sound effects, and display preferences.
`,
    updatedAt: new Date().toISOString()
  },
  '/Desktop/App Usage.txt': {
    id: 'file_desktop_app_usage',
    name: 'App Usage.txt',
    type: 'file',
    parentId: 'desktop',
    path: '/Desktop/App Usage.txt',
    mimeType: 'text/plain',
    size: 2400,
    content: `CYPHORA OS - APPLICATION USAGE GUIDE
====================================

This guide describes each available application and how to use it:

1. TASKS
   • What it does: Your mission control dashboard.
   • How to use: Open it anytime to view your active objective briefing,
     reveal encrypted hints if you get stuck, and enter your answer codes to proceed.

2. FILE MANAGER
   • What it does: Graphical file explorer.
   • How to use: Browse folders like /Desktop, /Documents, /Pictures, /Archive,
     and /Evidence. Double-click any file to open it.

3. TERMINAL
   • What it does: Command-line shell interface.
   • How to use: Run commands like:
     - ls -a   : List all files including hidden ones.
     - cd      : Change directories.
     - cat     : View the contents of a file.
     - grep    : Search for specific text inside files.
     - help    : Show all available commands.

4. TEXT EDITOR
   • What it does: Plain text reader and notepad.
   • How to use: Double-click text files to read clues, edit notes, and save
     changes with Ctrl+S.

5. UNIVERSAL CONVERTER
   • What it does: Multi-format decoding and encoding tool.
   • How to use: Paste encoded text and convert between Hexadecimal, Base64,
     Binary, ASCII Decimal numbers, and Rot13 ciphers.

6. METADATA INSPECTOR
   • What it does: Deep file forensics inspector.
   • How to use: Select or drag-and-drop any file to reveal hidden EXIF tags,
     author names, camera details, device IDs, and creation dates.

7. QR / BARCODE SCANNER
   • What it does: Optical code reader.
   • How to use: Load an image containing a QR code or barcode to extract the
     hidden text payload or link.

8. IMAGE INSPECTOR
   • What it does: Visual analysis workstation.
   • How to use: Zoom into graphics, invert colors, adjust brightness/contrast,
     or isolate Red, Green, and Blue channels to reveal faint hidden clues.

9. TEXT ANALYZER
   • What it does: Cryptanalysis and letter frequency scanner.
   • How to use: Paste cipher text to view character counts, letter frequency
     charts, and entropy to help solve substitution ciphers.

10. FILE COMPARISON
    • What it does: Side-by-side file diff tool.
    • How to use: Select two files to view highlighted differences, line additions,
      and modified tokens side by side.

11. AUDIO INSPECTOR
    • What it does: Sonic signal visualizer.
    • How to use: Play audio files, view the waveform, and inspect frequency
      spectrums to detect Morse code or hidden audio tones.

12. SETTINGS
    • What it does: Workstation preferences.
    • How to use: Adjust ambient music volume, toggle UI sound effects, and
      configure display settings.
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
    size: 95,
    content: `[04:12] #0000FF
[04:07] #FF0000
[04:19] #00FF00
[04:03] #FFFF00
[04:15] #FFFFFF
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
    hidden: false,
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
  },
  '/Archive/VX-27.txt': {
    id: 'file_archive_vx27_txt',
    name: 'VX-27.txt',
    type: 'file',
    parentId: 'archive',
    path: '/Archive/VX-27.txt',
    mimeType: 'text/plain',
    size: 45,
    content: `DEVICE: VX-27

TRANSFER ID:
TR-904
`,
    updatedAt: new Date().toISOString()
  },
  '/Transfers/TR-904.txt': {
    id: 'file_transfers_tr904_txt',
    name: 'TR-904.txt',
    type: 'file',
    parentId: 'transfers',
    path: '/Transfers/TR-904.txt',
    mimeType: 'text/plain',
    size: 35,
    content: `PAYLOAD:
53 59 4D 50 4F
`,
    updatedAt: new Date().toISOString()
  }
};
