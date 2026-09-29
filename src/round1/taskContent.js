/**
 * CYPHORA Round 1 Task Content & Presentation Definitions
 * Exactly 12 structured tasks following the Round 1 Multi-Application Technical Investigation specification.
 */

export const TASK_DEFINITIONS = [
  {
    id: 'r1_t01',
    round: 1,
    order: 1,
    title: 'Task 01 — Encoded Message',
    story: 'An intercepted signal stream from an unknown relay has been saved to your workstation evidence files.',
    question: 'Convert the encoded value into a readable format and enter the resulting message below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t1_msg', name: 'message.txt', path: '/Desktop/message.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'HIDE',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Inspect /Desktop/message.txt to find the encoded byte string.',
      'Use the Universal Converter to transform the numeric representation step-by-step into readable text.'
    ]
  },
  {
    id: 'r1_t02',
    round: 1,
    order: 2,
    title: 'Task 02 — File Information',
    story: 'An expedition photograph contains hidden structural credentials embedded within its metadata properties.',
    question: 'The visible contents do not contain the requested information. Investigate the file\'s stored information and enter the value associated with the requested author field.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t2_photo', name: 'evidence.jpg', path: '/Pictures/evidence.jpg', mimeType: 'image/jpeg' }
      ]
    },
    answer: {
      expected: 'ARLO',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Load /Pictures/evidence.jpg into the Metadata Inspector to view stored EXIF/author fields.',
      'Convert the extracted encoded author value into readable text using the Universal Converter.'
    ]
  },
  {
    id: 'r1_t03',
    round: 1,
    order: 3,
    title: 'Task 03 — Image Message',
    story: 'A technical poster image recovered from an abandoned terminal displays an optical code overlay.',
    question: 'The image contains information that is not directly readable. Determine the message encoded inside it and enter the result below.',
    difficulty: 'easy',
    requiredInput: {
      type: 'image',
      assets: [
        { id: 'asset_t3_poster', name: 'poster.png', path: '/Pictures/poster.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: 'SECTOR-7',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Scan /Pictures/poster.png using the QR Scanner to extract the raw payload.',
      'If the payload is encoded, use the Universal Converter to translate the data stream into text.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'Task 04 — Ordering / Reasoning',
    story: 'An access log record from the central server contains unsorted timestamped entries.',
    question: 'The records are not arranged in order. Determine the earliest recorded event and enter its associated value.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t4_log', name: 'access.log', path: '/Documents/access.log', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'YELLOW',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Open /Documents/access.log and compare the timestamp values of each line.',
      'Identify the line with the chronologically earliest time (04:03) and submit the color label paired with it.'
    ]
  },
  {
    id: 'r1_t05',
    round: 1,
    order: 5,
    title: 'Task 05 — File Comparison',
    story: 'Two system transmission logs appear almost identical, but a critical numerical key has been modified.',
    question: 'These files are almost identical. Compare them and identify the value that changed. Enter only the changed value below.',
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
      type: 'number',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-comparator', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Open the File Comparison tool and select message_old.txt and message_new.txt.',
      'Locate the modified KEY_VAL line and enter the new numeric replacement value.'
    ]
  },
  {
    id: 'r1_t06',
    round: 1,
    order: 6,
    title: 'Task 06 — Conversion Chain',
    story: 'An encrypted data file contains a multi-layer encoded text string.',
    question: 'The recovered value is not directly readable. Transform it into a useful intermediate representation, continue interpreting the result, and enter the final readable message.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t6_data', name: 'data.txt', path: '/Documents/data.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'INK',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'First convert the binary string in /Documents/data.txt to Decimal (0-9 format).',
      'Then convert the resulting decimal values to ASCII codes, and finally convert ASCII to Text to reveal the word.'
    ]
  },
  {
    id: 'r1_t07',
    round: 1,
    order: 7,
    title: 'Task 07 — Metadata to File Discovery',
    story: 'An evidence photograph holds a description tag pointing to a specific security report file.',
    question: 'Important information is stored in the file metadata rather than its visible contents. Find the relevant value, interpret it correctly, and enter the readable result below.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t7_evidence', name: 'evidence.jpg', path: '/Pictures/evidence.jpg', mimeType: 'image/jpeg' }
      ]
    },
    answer: {
      expected: 'HELP',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Inspect metadata of /Pictures/evidence.jpg to discover the description tag (48 45 4C 50).',
      'Convert the hexadecimal sequence step-by-step: Hex -> Decimal -> ASCII -> Text.'
    ]
  },
  {
    id: 'r1_t08',
    round: 1,
    order: 8,
    title: 'Task 08 — Hexadecimal Decoding Chain',
    story: 'A recovered data payload uses hexadecimal byte notation to disguise an emergency signal.',
    question: 'A code has been recovered in an unfamiliar representation. Determine what it represents and enter the resulting word.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t8_rec', name: 'recovered.dat', path: '/Downloads/recovered.dat', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'JUMP',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Open /Downloads/recovered.dat to find the hex string ("48 45 4C 50" or "4A 55 4D 50").',
      'Use the Universal Converter: Hex -> Decimal (0-9 format) -> ASCII -> Text.'
    ]
  },
  {
    id: 'r1_t09',
    round: 1,
    order: 9,
    title: 'Task 09 — QR Reference to Analysis',
    story: 'An archive map image contains an embedded optical pointer targeting a secondary document.',
    question: 'Follow the information contained in the evidence to the next file, then use the recovered value to determine the final answer.',
    difficulty: 'medium',
    requiredInput: {
      type: 'image',
      assets: [
        { id: 'asset_t9_map', name: 'archive_map.png', path: '/Pictures/archive_map.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: '17',
      type: 'number',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'text-editor', 'text-analyzer', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Scan /Pictures/archive_map.png in QR Scanner to extract the file path (/Documents/clues/numbers.txt).',
      'Open the target file and count number frequencies to find the value that appears most often.'
    ]
  },
  {
    id: 'r1_t10',
    round: 1,
    order: 10,
    title: 'Task 10 — Compare to Convert Chain',
    story: 'Two system archive records differ in a newly added encrypted string value.',
    question: 'Compare the two records, identify the newly added value, interpret that value, and enter the resulting message.',
    difficulty: 'medium',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t10_alpha', name: 'alpha.txt', path: '/Documents/alpha.txt', mimeType: 'text/plain' },
        { id: 'asset_t10_beta', name: 'beta.txt', path: '/Documents/beta.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'JUMP',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-comparator', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Compare alpha.txt and beta.txt in the File Comparison tool to find the modified string ("4A 55 4D 50").',
      'Convert the hexadecimal sequence using Universal Converter: Hex -> Decimal -> ASCII -> Text.'
    ]
  },
  {
    id: 'r1_t11',
    round: 1,
    order: 11,
    title: 'Task 11 — Multi-App Investigation',
    story: 'Evidence for a system breach is distributed across metadata tags, document archives, and multi-stage conversions.',
    question: 'The evidence is distributed across multiple files. Follow each useful result to determine what should be investigated next and continue until you can identify the final requested value.',
    difficulty: 'hard',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t11_photo', name: 'photo.png', path: '/Pictures/photo.png', mimeType: 'image/png' },
        { id: 'asset_t11_archive', name: 'Archive_04.txt', path: '/Documents/Archive_04.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'SHIFT',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'Inspect metadata of /Pictures/photo.png to find the description clue (ARCHIVE_04).',
      'Open /Documents/Archive_04.txt, extract the hex sequence "53 48 49 46 54", and convert it step-by-step to text.'
    ]
  },
  {
    id: 'r1_t12',
    round: 1,
    order: 12,
    title: 'Task 12 — Final Workstation Investigation',
    story: 'The ultimate workstation investigation key requires combining concealed folder discovery, EXIF metadata inspection, optical QR scanning, document navigation, and multi-stage hexadecimal decoding.',
    question: 'The final workstation log mentions a concealed location. Discover the concealed entry, analyze its metadata clue, locate the payload image, scan its embedded code to reveal a file path, inspect that record, and convert the hex sequence inside to readable format.',
    difficulty: 'boss',
    requiredInput: {
      type: 'files',
      assets: [
        { id: 'asset_t12_beacon', name: 'enclave_beacon.png', path: '/.hidden/enclave_beacon.png', mimeType: 'image/png' },
        { id: 'asset_t12_scan', name: 'beacon_scan.png', path: '/System/logs/beacon_scan.png', mimeType: 'image/png' },
        { id: 'asset_t12_cipher', name: 'final_cipher.txt', path: '/Documents/final_cipher.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: 'SYMPO',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'metadata-inspector', 'qr-scanner', 'text-editor', 'converter', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'Step 1: Discover the hidden folder /.hidden/ and inspect metadata of enclave_beacon.png.',
      'Step 2: Scan /System/logs/beacon_scan.png in QR Scanner to get /Documents/final_cipher.txt.',
      'Step 3: Open /Documents/final_cipher.txt, extract "53 59 4D 50 4F", and convert Hex -> Decimal -> ASCII -> Text.'
    ]
  }
];

export const TASK_PRESENTATIONS = TASK_DEFINITIONS.reduce((acc, task) => {
  acc[task.id] = {
    number: task.order.toString().padStart(2, '0'),
    playerTitle: task.title.toUpperCase(),
    objective: task.question,
    story: task.story,
    fieldNote: `Required Evidence: ${task.requiredInput.assets.map(a => a.name).join(', ')}. Use available tools to investigate.`,
    hints: task.hints
  };
  return acc;
}, {});

export const SET_PRESENTATIONS = {
  set1: { label: 'TIER 1', title: 'ONE-STEP TECHNICAL RECONNAISSANCE', message: 'Master single-step investigations across binary data, metadata, QR codes, log timestamps, and document diffs.' },
  set2: { label: 'TIER 2A', title: 'MULTI-STEP CONVERSIONS & DISCOVERY', message: 'Chain intermediate 0-9 representations, metadata pointers, and hexadecimal sequences.' },
  set3: { label: 'TIER 2B', title: 'CROSS-APPLICATION EVIDENCE CHAINS', message: 'Link optical QR references, frequency analysis, and diff-based conversions.' },
  set4: { label: 'TIER 3', title: 'ADVANCED WORKSTATION INVESTIGATION', message: 'Complete deep multi-app investigation chains and unlock workstation clearance!' }
};