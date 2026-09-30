/**
 * CYPHORA Round 1 Task Content & Presentation Definitions
 * Exactly 12 structured tasks following the Round 1 Task Description Redesign specification (pro2.md).
 * 
 * Rules:
 * 1. Task objectives mention bare filenames (e.g., message.txt) without filesystem directories.
 * 2. Task objectives mention generic tool categories (converter, inspector, optical scanner, comparison tool) without brand names.
 * 3. Hint 1 provides the exact virtual filesystem location(s) for the task's files.
 * 4. Hint 2 provides the complete, step-by-step procedural solution.
 * 5. Distinct reasoning patterns and answers across all 12 tasks to eliminate repetitiveness.
 */

export const TASK_DEFINITIONS = [
  {
    id: 'r1_t01',
    round: 1,
    order: 1,
    title: 'TASK 01 — ENCODED MESSAGE',
    story: 'A short message recovered from an unknown source has been left on the workstation. Its original meaning is unreadable in its current numerical form.',
    question: '1. Locate message.txt.\n2. Use a data converter to translate the numerical character values into readable text.\n3. Enter the decoded word below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t1_msg', name: 'message.txt', path: '/Desktop/message.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'HIDE',
      accepted: ['HIDE'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file message.txt is located at /Desktop/message.txt.',
      '1. Open message.txt in Text Editor to view the numerical values: 72 73 68 69.\n2. Open the Universal Converter from the dock.\n3. Set Source to Decimal (or ASCII) and Target to Text.\n4. Enter "72 73 68 69" and convert to reveal "HIDE".\n5. Submit HIDE.'
    ]
  },
  {
    id: 'r1_t02',
    round: 1,
    order: 2,
    title: 'TASK 02 — FILE INFORMATION',
    story: 'An expedition image was recovered during the investigation, but its visual picture does not identify its creator. The underlying file records hold the author entry.',
    question: '1. Locate evidence.jpg.\n2. Use a file inspector to inspect the file properties and technical attributes rather than the visual pixels.\n3. Enter the registered author name below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t2_photo', name: 'evidence.jpg', path: '/Pictures/evidence.jpg', mimeType: 'image/jpeg' }
      ]
    },
    answer: {
      expected: 'ARLO',
      accepted: ['ARLO', 'DR. ARLO VANCE', 'DR ARLO VANCE', 'ARLO VANCE'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file evidence.jpg is located in /Pictures/evidence.jpg.',
      '1. Open the Metadata Inspector from the dock.\n2. Select evidence.jpg from the file list.\n3. Find the "Author" property listed in the technical properties table to see "ARLO".\n4. Submit ARLO.'
    ]
  },
  {
    id: 'r1_t03',
    round: 1,
    order: 3,
    title: 'TASK 03 — IMAGE MESSAGE',
    story: 'A recovered poster contains an embedded optical matrix marking that cannot be interpreted through standard visual viewing.',
    question: '1. Locate poster.png.\n2. Use an optical scanning inspector to scan the machine-readable matrix graphic.\n3. Enter the revealed sector code below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'image',
      assets: [
        { id: 'asset_t3_poster', name: 'poster.png', path: '/Pictures/poster.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: 'SECTOR-7',
      accepted: ['SECTOR-7', 'SECTOR 7', 'SECTOR7'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file poster.png is located at /Pictures/poster.png.',
      '1. Open the QR / Barcode Scanner from the dock.\n2. Select poster.png from the image dropdown.\n3. Read the decoded payload displayed in the scan result: "SECTOR-7".\n4. Submit SECTOR-7.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'TASK 04 — THE EARLIEST RECORD',
    story: 'Workstation access records are scrambled out of order. An initial trigger event initiated the recorded sequence.',
    question: '1. Locate access.log.\n2. Inspect the chronological timestamps at the beginning of each line using a document inspector or text reader.\n3. Identify which entry occurred earliest and enter its associated color code below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t4_log', name: 'access.log', path: '/Documents/access.log', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'YELLOW',
      accepted: ['YELLOW'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file access.log is located at /Documents/access.log.',
      '1. Open access.log in the Text Editor.\n2. Compare the bracketed timestamps at the start of each line ([04:12], [04:07], [04:19], [04:03], [04:15]).\n3. The earliest time is [04:03], which is paired with YELLOW.\n4. Submit YELLOW.'
    ]
  },
  {
    id: 'r1_t05',
    round: 1,
    order: 5,
    title: 'TASK 05 — THE CHANGED RECORD',
    story: 'Two versions of a critical transmission log exist on the workstation. Most lines are identical, but one operational parameter was modified.',
    question: '1. Locate message_old.txt and message_new.txt.\n2. Use a file comparison inspector to analyze both documents side-by-side.\n3. Enter the updated operational value from the revised record below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t5_old', name: 'message_old.txt', path: '/Documents/message_old.txt', mimeType: 'text/plain' },
        { id: 'asset_t5_new', name: 'message_new.txt', path: '/Documents/message_new.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: '9941',
      accepted: ['9941'],
      type: 'number',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-comparator', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Both files (message_old.txt and message_new.txt) are located in /Documents/.',
      '1. Open the File Comparison Tool from the dock.\n2. Select message_old.txt as File A and message_new.txt as File B.\n3. Note the highlighted modified line 4 (KEY_VAL changed from 8492 to 9941).\n4. Submit 9941.'
    ]
  },
  {
    id: 'r1_t06',
    round: 1,
    order: 6,
    title: 'TASK 06 — THE FRAGMENTED PASSWORD',
    story: 'Three fragments of a security passcode were recovered separately. Each fragment is incomplete on its own, and their order is scrambled.',
    question: '1. Locate fragment_01.txt, fragment_02.txt, and fragment_03.txt.\n2. Inspect each fragment to determine its recorded timestamp and sort them chronologically.\n3. Combine the ordered values and use a data converter to decode the complete password below.',
    difficulty: 'hard',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t6_f1', name: 'fragment_01.txt', path: '/Documents/fragment_01.txt', mimeType: 'text/plain' },
        { id: 'asset_t6_f2', name: 'fragment_02.txt', path: '/Documents/fragment_02.txt', mimeType: 'text/plain' },
        { id: 'asset_t6_f3', name: 'fragment_03.txt', path: '/Documents/fragment_03.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'CYPHORA',
      accepted: ['CYPHORA', 'JUMP'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The fragment files (fragment_01.txt, fragment_02.txt, fragment_03.txt) are located in /Documents/.',
      '1. Open each fragment file in the Text Editor to inspect its timestamp:\n   - fragment_01.txt (09:10): Q1lQ\n   - fragment_02.txt (09:25): SE9S\n   - fragment_03.txt (09:40): QQ==\n2. Assemble them in chronological order: Q1lPUE9SQQ==\n3. Open Universal Converter, set Source to Base64 and Target to Text.\n4. Convert "Q1lPUE9SQQ==" to reveal "CYPHORA".\n5. Submit CYPHORA.'
    ]
  },
  {
    id: 'r1_t07',
    round: 1,
    order: 7,
    title: 'TASK 07 — THE HIDDEN RECORD',
    story: 'An archival survey photograph appears ordinary, but operational data was preserved inside its descriptive technical properties.',
    question: '1. Locate archive_photo.png.\n2. Use a file inspector to examine its technical file properties and recover the embedded description code.\n3. Use a data converter to translate the character codes into readable text and enter the message below.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t7_photo', name: 'archive_photo.png', path: '/Pictures/archive_photo.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: 'RESCUE',
      accepted: ['RESCUE', 'HELP'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file archive_photo.png is located at /Pictures/archive_photo.png.',
      '1. Open the Metadata Inspector from the dock.\n2. Select archive_photo.png from the file list.\n3. Look at the Description property: "82 69 83 67 85 69".\n4. Open Universal Converter, set Source to Decimal (or ASCII) and Target to Text.\n5. Convert "82 69 83 67 85 69" to reveal "RESCUE".\n6. Submit RESCUE.'
    ]
  },
  {
    id: 'r1_t08',
    round: 1,
    order: 8,
    title: 'TASK 08 — THE DISGUISED FILE',
    story: 'Crucial investigation evidence has been deliberately concealed in a hidden subdirectory within the workstation archives.',
    question: '1. Explore the directory structure using a file inspector or manager capable of revealing concealed files.\n2. Locate clue.txt inside the hidden archive.\n3. Submit the numerical passcode contained within.',
    difficulty: 'hard',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t8_clue', name: 'clue.txt', path: '/Archive/.hidden/clue.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: '7314',
      accepted: ['7314', 'RECOVERY'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'text-editor', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'The file clue.txt is concealed inside /Archive/.hidden/clue.txt.',
      '1. Open the File Manager from the dock and navigate into the Archive directory.\n2. Click the "Show Hidden" button in the toolbar (or open Terminal and run "ls -a /Archive").\n3. Open the newly revealed .hidden directory and open clue.txt in Text Editor.\n4. Read the passcode value "7314".\n5. Submit 7314.'
    ]
  },
  {
    id: 'r1_t09',
    round: 1,
    order: 9,
    title: 'TASK 09 — THE EVIDENCE TRAIL',
    story: 'An investigative trail spans across multiple records, beginning with an optical marking on a survey map.',
    question: '1. Locate map.png and use an optical scanning inspector to recover the clue reference key.\n2. Cross-reference that key in index.txt to determine the target log record.\n3. Inspect activity.log to identify which file ID USER-A downloaded, and enter that number below.',
    difficulty: 'hard',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t9_map', name: 'map.png', path: '/Pictures/map.png', mimeType: 'image/png' },
        { id: 'asset_t9_index', name: 'index.txt', path: '/Documents/clues/index.txt', mimeType: 'text/plain' },
        { id: 'asset_t9_log', name: 'activity.log', path: '/Documents/logs/activity.log', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: '17',
      accepted: ['17'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The files are located at /Pictures/map.png, /Documents/clues/index.txt, and /Documents/logs/activity.log.',
      '1. Open QR / Barcode Scanner from the dock and select map.png to decode "CLUE-42".\n2. Open /Documents/clues/index.txt in Text Editor to see that CLUE-42 points to "activity.log".\n3. Open /Documents/logs/activity.log in Text Editor and find the entry "08:37 USER-A DOWNLOAD FILE=17".\n4. Submit 17.'
    ]
  },
  {
    id: 'r1_t10',
    round: 1,
    order: 10,
    title: 'TASK 10 — THE ALTERED RECORD',
    story: 'Two versions of a secure configuration record contain a subtle hexadecimal difference that conceals an operational word.',
    question: '1. Locate alpha.txt and beta.txt.\n2. Use a file comparison inspector to isolate the modified configuration entry.\n3. Use a data converter to translate the altered hexadecimal sequence into readable text and enter the resulting word below.',
    difficulty: 'hard',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t10_alpha', name: 'alpha.txt', path: '/Documents/alpha.txt', mimeType: 'text/plain' },
        { id: 'asset_t10_beta', name: 'beta.txt', path: '/Documents/beta.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'VECTOR',
      accepted: ['VECTOR', 'JUMP'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-comparator', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Both configuration files (alpha.txt and beta.txt) are located in /Documents/.',
      '1. Open the File Comparison Tool from the dock.\n2. Compare alpha.txt (File A) with beta.txt (File B).\n3. Find the modified line 3 in beta.txt: NOTE=56 45 43 54 4F 52.\n4. Open Universal Converter, set Source to Hexadecimal and Target to Text.\n5. Convert "56 45 43 54 4F 52" to reveal "VECTOR".\n6. Submit VECTOR.'
    ]
  },
  {
    id: 'r1_t11',
    round: 1,
    order: 11,
    title: 'TASK 11 — FOLLOW THE TRAIL',
    story: 'A field note points to an archive document, which links to monitored hardware evidence across the workstation.',
    question: '1. Locate incident_note.txt and follow its pointer to the referenced archive record.\n2. Check the archive file to identify the target device photo.\n3. Use a file inspector on the device image to retrieve its encoded attribute, then use a data converter to translate the value into the clearance word below.',
    difficulty: 'very hard',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t11_note', name: 'incident_note.txt', path: '/Documents/incident_note.txt', mimeType: 'text/plain' },
        { id: 'asset_t11_arch', name: 'archive-17.txt', path: '/Archive/archive-17.txt', mimeType: 'text/plain' },
        { id: 'asset_t11_dev', name: 'device-9.jpg', path: '/Pictures/device-9.jpg', mimeType: 'image/jpeg' }
      ]
    },
    answer: {
      expected: 'SHIFT',
      accepted: ['SHIFT'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'metadata-inspector', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The trail starts at /Documents/incident_note.txt, leads to /Archive/archive-17.txt, and finishes at /Pictures/device-9.jpg.',
      '1. Open /Documents/incident_note.txt in Text Editor to see "REFERENCE: ARCHIVE-17".\n2. Open /Archive/archive-17.txt in Text Editor to see "NEXT: DEVICE-9".\n3. Open Metadata Inspector from the dock and select /Pictures/device-9.jpg.\n4. Read the Description property: "53 48 49 46 54".\n5. Open Universal Converter, set Source to Hexadecimal and Target to Text.\n6. Convert "53 48 49 46 54" to reveal "SHIFT".\n7. Submit SHIFT.'
    ]
  },
  {
    id: 'r1_t12',
    round: 1,
    order: 12,
    title: 'TASK 12 — TRACE THE INCIDENT',
    story: 'Four pieces of evidence across logs, device photos, archives, and transfer records form a connected incident chain.',
    question: '1. Locate system.log to observe the incident sequence.\n2. Use a file inspector on device.png to identify the registered hardware ID.\n3. Open the corresponding archive record to find the transfer ID, inspect the transfer document, and use a data converter to decode the clearance code below.',
    difficulty: 'boss',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t12_log', name: 'system.log', path: '/Documents/system.log', mimeType: 'text/plain' },
        { id: 'asset_t12_img', name: 'device.png', path: '/Pictures/device.png', mimeType: 'image/png' },
        { id: 'asset_t12_arch', name: 'VX-27.txt', path: '/Documents/Archive/VX-27.txt', mimeType: 'text/plain' },
        { id: 'asset_t12_tr', name: 'TR-904.txt', path: '/Documents/Transfers/TR-904.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'SYMPO',
      accepted: ['SYMPO'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'text-editor', 'metadata-inspector', 'converter', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'The evidence is located across /Documents/system.log, /Pictures/device.png, /Documents/Archive/VX-27.txt, and /Documents/Transfers/TR-904.txt.',
      '1. Open /Documents/system.log in Text Editor to observe the timeline.\n2. Open Metadata Inspector from the dock and inspect /Pictures/device.png to find device ID "VX-27".\n3. Open /Documents/Archive/VX-27.txt in Text Editor to find "TRANSFER ID: TR-904".\n4. Open /Documents/Transfers/TR-904.txt in Text Editor to find payload "53 59 4D 50 4F".\n5. Open Universal Converter, set Source to Hexadecimal and Target to Text.\n6. Convert "53 59 4D 50 4F" to reveal "SYMPO".\n7. Submit SYMPO.'
    ]
  }
];

export const TASK_PRESENTATIONS = TASK_DEFINITIONS.reduce((acc, task) => {
  acc[task.id] = {
    number: task.order.toString().padStart(2, '0'),
    playerTitle: task.title,
    objective: task.question,
    story: task.story,
    fieldNote: `Investigate workstation files and tools to solve this challenge.`,
    hints: task.hints
  };
  return acc;
}, {});

export const SET_PRESENTATIONS = {
  set1: { label: 'STAGE 1', title: 'DISCOVERY', message: 'Discover single-step evidence across binary files, metadata, QR codes, log timestamps, and document diffs.' },
  set2: { label: 'STAGE 2', title: 'INVESTIGATION', message: 'Follow intermediate multi-step investigation chains and metadata references.' },
  set3: { label: 'STAGE 2', title: 'INVESTIGATION', message: 'Uncover cross-file pointers and subtle document changes.' },
  set4: { label: 'STAGE 3', title: 'RECONSTRUCTION', message: 'Reconstruct complex multi-app incident chains to unlock clearance.' }
};