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
    title: 'TASK 01 — ENCODED MESSAGE',
    story: 'An intercepted signal stream from an unknown relay has been saved on your workstation.',
    question: 'Convert the encoded value into a human-readable format and enter the resulting message below.',
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
      'Think about what kind of representation the recovered value uses.'
    ]
  },
  {
    id: 'r1_t02',
    round: 1,
    order: 2,
    title: 'TASK 02 — FILE INFORMATION',
    story: 'An expedition photograph contains hidden structural credentials embedded within its metadata properties.',
    question: 'Investigate the file\'s stored information and enter the recorded author below.',
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
      'Think about what kind of information can be stored alongside the visible contents of a file.',
      'One of the workstation applications can reveal additional information attached to the file.'
    ]
  },
  {
    id: 'r1_t03',
    round: 1,
    order: 3,
    title: 'TASK 03 — IMAGE MESSAGE',
    story: 'An image recovered from an abandoned terminal displays machine-readable information.',
    question: 'Determine what the information embedded in the image reveals and enter the resulting value below.',
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
      'The image contains a pattern designed to be scanned by specialized software.',
      'Use an application that can read machine-readable matrix graphics.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'TASK 04 — ORDERING / REASONING',
    story: 'An access log record from the central server contains unsorted timestamped entries.',
    question: 'The records are out of order. Determine the earliest recorded event and enter its associated value.',
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
      'Examine the timestamps at the beginning of each line.',
      'Identify the line with the earliest time value and submit the word associated with it.'
    ]
  },
  {
    id: 'r1_t05',
    round: 1,
    order: 5,
    title: 'TASK 05 — FILE COMPARISON',
    story: 'Two system transmission logs appear almost identical.',
    question: 'The two records are almost identical. Determine what value changed between them and enter that value below.',
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
    title: 'TASK 06 — THE FRAGMENTED PASSWORD',
    story: 'Three fragments of a recovered message were found separately on the workstation.',
    question: 'Three fragments of a recovered message were found separately. Reconstruct them in the correct order, interpret the combined value, and enter the final message below.',
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
      expected: 'JUMP',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The fragments contain more than just data. Compare the information associated with each file.',
      'The pieces need to be reconstructed before they can be interpreted.'
    ]
  },
  {
    id: 'r1_t07',
    round: 1,
    order: 7,
    title: 'TASK 07 — METADATA → CONVERSION',
    story: 'An archive photo contains hidden properties storing an encoded string.',
    question: 'Important information is stored with the file rather than in its visible contents. Recover that value, interpret it, and enter the readable message below.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t7_photo', name: 'archive_photo.png', path: '/Pictures/archive_photo.png', mimeType: 'image/png' }
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
      'Useful information may exist outside the visible image.',
      'Look for an application that can reveal information stored with a file.'
    ]
  },
  {
    id: 'r1_t08',
    round: 1,
    order: 8,
    title: 'TASK 08 — HIDDEN EVIDENCE',
    story: 'A piece of evidence appears to have been concealed from standard directories.',
    question: 'The visible folders do not contain the required evidence. Something appears to have been deliberately concealed. Locate the hidden information and enter the value you recover.',
    difficulty: 'hard',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t8_clue', name: 'clue.txt', path: '/Archive/.hidden/clue.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: '7314',
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'text-editor', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'Check for concealed locations in the workstation file system.',
      'Some directories might be hidden from standard file listings.'
    ]
  },
  {
    id: 'r1_t09',
    round: 1,
    order: 9,
    title: 'TASK 09 — THE EVIDENCE NETWORK',
    story: 'Multiple pieces of evidence on the workstation point to one another in an investigation trail.',
    question: 'Follow the information from the first piece of evidence to the next, then determine the final value associated with the requested activity.',
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
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The first result is not the final answer.',
      'Use the recovered identifier to locate the next evidence.'
    ]
  },
  {
    id: 'r1_t10',
    round: 1,
    order: 10,
    title: 'TASK 10 — DIFF → INTERPRET → CONVERT',
    story: 'Two system records contain a single altered key parameter.',
    question: 'Two versions of the record contain one meaningful change. Identify the changed information, interpret it, and enter the resulting message below.',
    difficulty: 'hard',
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
      'Compare the two records to locate the changed value.',
      'The changed value is an encoded string that needs conversion.'
    ]
  },
  {
    id: 'r1_t11',
    round: 1,
    order: 11,
    title: 'TASK 11 — CROSS-APPLICATION INVESTIGATION',
    story: 'A sequence of investigation notes leads across multiple file formats and metadata attributes.',
    question: 'The evidence points from one file to another. Follow the trail across the workstation and recover the final value requested below.',
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
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'metadata-inspector', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The text note contains a reference code to another file.',
      'Inspect the properties of the final image file to find the encoded value.'
    ]
  },
  {
    id: 'r1_t12',
    round: 1,
    order: 12,
    title: 'TASK 12 — FINAL BOSS: TRACE THE TRANSFER',
    story: 'Four pieces of evidence recovered from different areas of the workstation describe a single security event.',
    question: 'Four pieces of evidence from the workstation describe the same trail. Follow the connections between them and recover the final clearance code.',
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
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'text-editor', 'metadata-inspector', 'converter', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'The evidence becomes useful when you connect information found in different files.',
      'A value discovered in one piece of evidence can help you locate another.'
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
  set1: { label: 'TIER 1', title: 'ONE-STEP TECHNICAL RECONNAISSANCE', message: 'Master single-step investigations across binary data, metadata, QR codes, log timestamps, and document diffs.' },
  set2: { label: 'TIER 2A', title: 'MULTI-STEP CONVERSIONS & DISCOVERY', message: 'Chain intermediate 0-9 representations, metadata pointers, and hexadecimal sequences.' },
  set3: { label: 'TIER 2B', title: 'CROSS-APPLICATION EVIDENCE CHAINS', message: 'Link optical QR references, frequency analysis, and diff-based conversions.' },
  set4: { label: 'TIER 3', title: 'ADVANCED WORKSTATION INVESTIGATION', message: 'Complete deep multi-app investigation chains and unlock workstation clearance!' }
};