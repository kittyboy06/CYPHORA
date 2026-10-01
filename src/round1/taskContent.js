/**
 * CYPHORA Round 1 Task Content & Presentation Definitions
 * Exactly 12 structured tasks following the Round 1 Task Description Redesign specification (pro2.md).
 * 
 * Rules:
 * 1. Task objectives mention bare filenames (e.g., message.txt) without filesystem directories.
 * 2. Task objectives mention generic tool categories (converter, inspector, optical scanner, comparison tool) without brand names.
 * 3. Hint 1 provides the file location.
 * 4. Hint 2 provides the procedural guidance according to the specification table.
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
      'message.txt is located on the Desktop.',
      'Open the file and identify the number sequence. Use a Universal Converter and convert the values from Decimal/ASCII → Text.'
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
      'evidence.jpg is located in the Pictures folder.',
      'Open the image with a Metadata Inspector and examine the available information fields. Look specifically for the field related to the creator/author.'
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
      'poster.png is located in the Pictures folder.',
      'Open the image using a QR/Barcode Scanner and scan the optical matrix to retrieve its encoded message.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'TASK 04 — THE EARLIEST RECORD',
    story: 'Workstation access records are scrambled out of order. An initial trigger event initiated the recorded sequence.',
    question: '1. Locate access.log.\n2. Inspect the chronological timestamps at the beginning of each line using a document inspector or text reader.\n3. Identify the earliest entry and use the Universal Converter to decode its color code into a readable color name.\n4. Enter the decoded color name below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t4_log', name: 'access.log', path: '/Documents/access.log', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'YELLOW',
      accepted: ['YELLOW', 'Yellow', 'yellow', '#FFFF00', 'FFFF00'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'access.log is located in the Documents folder.',
      'Open the log and compare all the timestamps to identify the earliest entry. Use the Universal Converter (Color Code → Text) to translate the color code into readable text.'
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
      'message_old.txt and message_new.txt are located in the Documents folder.',
      'Open both files in a File Comparison Tool and compare them line by line. Locate the value that differs between the two versions.'
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
      'The three fragment files are located in the Documents folder.',
      'Check the timestamps of all three fragments and arrange them from earliest to latest. Combine the fragments and decode the resulting string using Base64.'
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
      'archive_photo.png is located in the Pictures folder.',
      'Open the image with a Metadata Inspector and examine its description/details. Convert the numerical character codes using Decimal/ASCII → Text.'
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
      'Look inside the Archive folder.',
      'Open the Archive folder in File Manager, right-click and select "Show Hidden Files" to reveal concealed directories, then locate clue.txt.'
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
      'The starting image is in Pictures; related files are in Documents.',
      'Scan the image to obtain the first clue. Use that clue to locate the relevant entry in the index file, then follow its reference to the activity log and inspect the specified record.'
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
      'alpha.txt and beta.txt are located in the Documents folder.',
      'Compare both configuration files and locate the modified line. Identify the hexadecimal sequence and convert it from Hexadecimal → Text.'
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
      'Start with incident_note.txt in the Documents folder.',
      'Follow the reference path given in the note. Continue through the archive and device image, then inspect the image metadata and decode the character sequence using the appropriate conversion method.'
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
      'The evidence is spread across Documents, Pictures, Archive, and Transfers folders.',
      'Start with the system record and follow each file/reference identifier to the next piece of evidence. Reach the final transfer file and decode its hexadecimal payload into text.'
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