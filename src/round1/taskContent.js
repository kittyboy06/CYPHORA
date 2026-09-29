/**
 * CYPHORA Round 1 Task Content & Presentation Definitions
 * Exactly 12 structured tasks following the Round 1 Multi-Application Technical Investigation specification.
 * Questions and hints are strictly natural language objectives providing evidence file context without revealing tool names, technical conversion types, or auto-steps.
 */

export const TASK_DEFINITIONS = [
  {
    id: 'r1_t01',
    round: 1,
    order: 1,
    title: 'Task 01 — Encoded Message',
    story: 'An intercepted signal stream from an unknown relay has been saved as message.txt on your workstation.',
    question: 'An intercepted signal transmission has been saved as message.txt in your files. Convert the encoded value into a human-readable format and enter the resulting message below.',
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
      'Locate message.txt on the Desktop or in evidence folders.',
      'Determine what numerical or character representation the data uses, then translate it into readable text.'
    ]
  },
  {
    id: 'r1_t02',
    round: 1,
    order: 2,
    title: 'Task 02 — File Information',
    story: 'An expedition photograph evidence.jpg contains hidden structural credentials embedded within its metadata properties.',
    question: 'The visible contents of evidence.jpg in Pictures do not reveal the requested information. Investigate the file\'s stored properties and enter the recorded author below.',
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
      'Properties and creator credentials can be embedded within hidden file attributes.',
      'Look for a tool capable of inspecting underlying file metadata and EXIF properties.'
    ]
  },
  {
    id: 'r1_t03',
    round: 1,
    order: 3,
    title: 'Task 03 — Image Message',
    story: 'A technical poster image poster.png recovered from an abandoned terminal displays an optical code overlay.',
    question: 'The image poster.png in Pictures contains information that cannot be read directly. Determine what it reveals and enter the resulting value below.',
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
      'Optical matrix patterns store machine-readable data payloads.',
      'Use an analysis tool to extract the raw embedded code payload from the image.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'Task 04 — Ordering / Reasoning',
    story: 'An access log record access.log from the central server contains unsorted timestamped entries.',
    question: 'The records in access.log under Documents are out of order. Determine the earliest recorded event and enter its associated value below.',
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
      'Examine the log timestamps to establish chronological order.',
      'Identify the line with the earliest time value and submit the label paired with it.'
    ]
  },
  {
    id: 'r1_t05',
    round: 1,
    order: 5,
    title: 'Task 05 — File Comparison',
    story: 'Two system transmission logs message_old.txt and message_new.txt appear almost identical.',
    question: 'The two records message_old.txt and message_new.txt in Documents are almost identical. Determine what changed between them and enter the changed value below.',
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
      'Comparing document contents line by line highlights modified parameter values.',
      'Identify the updated numerical value that differs from the original record.'
    ]
  },
  {
    id: 'r1_t06',
    round: 1,
    order: 6,
    title: 'Task 06 — Conversion Chain',
    story: 'An encrypted data file data.txt contains a multi-layer encoded text string.',
    question: 'The recovered value in data.txt (Documents) is not directly readable. Transform it into a 0–9 numerical representation, continue interpreting the result into readable text, and enter the final message below.',
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
      'Work in stages: first convert the raw 0s and 1s sequence into numerical code values.',
      'Interpret those numerical codes as character values to reveal the final message.'
    ]
  },
  {
    id: 'r1_t07',
    round: 1,
    order: 7,
    title: 'Task 07 — Metadata to File Discovery',
    story: 'An evidence photograph evidence.jpg holds a description tag pointing to an encoded string.',
    question: 'Investigate the evidence photograph evidence.jpg in Pictures and recover the readable value hidden within its stored file information. Enter the final result below.',
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
      'Think about where information can be stored besides the visible pixels of an image file.',
      'Inspect metadata comment tags, copy the recovered code, and transform its representation into readable characters.'
    ]
  },
  {
    id: 'r1_t08',
    round: 1,
    order: 8,
    title: 'Task 08 — Hexadecimal Decoding Chain',
    story: 'A recovered data payload recovered.dat uses byte notation to disguise an emergency signal.',
    question: 'The file recovered.dat in Downloads contains a byte-formatted code. Transform it step-by-step into readable characters and enter the resulting word below.',
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
      'Recognize the byte notation representation used in the data file.',
      'Convert the byte sequence into 0–9 numerical codes, then turn those codes into readable text characters.'
    ]
  },
  {
    id: 'r1_t09',
    round: 1,
    order: 9,
    title: 'Task 09 — QR Reference to Analysis',
    story: 'An archive map image archive_map.png contains an embedded optical pointer targeting a secondary document.',
    question: 'Use the information contained in archive_map.png (Pictures) to locate the next clue document, then determine the requested final value.',
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
      'The visual evidence points to a file path within the workstation filesystem.',
      'Open the target document and analyze the number values to find which one appears most frequently.'
    ]
  },
  {
    id: 'r1_t10',
    round: 1,
    order: 10,
    title: 'Task 10 — Compare to Convert Chain',
    story: 'Two system archive records differ in a newly added encrypted string value.',
    question: 'Two versions of the evidence (alpha.txt and beta.txt in Documents) contain a meaningful difference. Find the changed information, interpret it, and enter the resulting value below.',
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
      'Compare the two archive documents to locate the modified parameter string.',
      'Transform the modified byte representation into 0–9 numerical codes, then convert them into readable text.'
    ]
  },
  {
    id: 'r1_t11',
    round: 1,
    order: 11,
    title: 'Task 11 — Multi-App Investigation',
    story: 'Evidence for a system breach is distributed across metadata tags, document archives, and multi-stage conversions.',
    question: 'The required information is distributed across photo.png in Pictures and related documents. Follow the evidence from one clue to the next until you can determine the final value requested below.',
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
      'Inspect metadata of the photo image to discover references to a secondary archive document.',
      'Locate the referenced archive document, extract the byte string inside, and transform it into readable text.'
    ]
  },
  {
    id: 'r1_t12',
    round: 1,
    order: 12,
    title: 'Task 12 — Final Workstation Investigation',
    story: 'The ultimate workstation investigation key requires combining concealed folder discovery, EXIF metadata inspection, optical QR scanning, document navigation, and multi-stage hexadecimal decoding.',
    question: 'The evidence is distributed across the workstation, including a concealed location. Follow the useful information across workstation tools to determine the requested final value.',
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
      'Look for concealed directory structures on the workstation.',
      'Trace clues from hidden image metadata to system logs, secondary documents, and multi-step decoding.'
    ]
  }
];

export const TASK_PRESENTATIONS = TASK_DEFINITIONS.reduce((acc, task) => {
  acc[task.id] = {
    number: task.order.toString().padStart(2, '0'),
    playerTitle: task.title.toUpperCase(),
    objective: task.question,
    story: task.story,
    fieldNote: `Investigate workstation files and tools to solve this challenge.`,
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