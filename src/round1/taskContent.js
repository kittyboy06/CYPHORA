/**
 * CYPHORA Round 1 Task Content & Presentation Definitions
 * Canonical Source of Truth as defined in Prompts/pro3.md
 */

export const TASK_DEFINITIONS = [
  {
    id: 'r1_t01',
    round: 1,
    order: 1,
    title: 'TASK 01 — ENCODED MESSAGE',
    story: 'A short message recovered from an unknown source has been left on the workstation. Its original meaning is unreadable in its current numerical form.',
    question: 'Decode the numerical values in message.txt.',
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
      'message.txt is on the Desktop.',
      'Open the file, identify the number sequence, and use Universal Converter Decimal/ASCII → Text.'
    ]
  },
  {
    id: 'r1_t02',
    round: 1,
    order: 2,
    title: 'TASK 02 — FILE INFORMATION',
    story: 'An expedition image was recovered during the investigation, but its visual picture does not identify its creator. The underlying file records hold the author entry.',
    question: 'Inspect evidence.jpg metadata and find the registered author.',
    difficulty: 'easy',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t2_photo', name: 'evidence.jpg', path: '/Pictures/evidence.jpg', mimeType: 'image/jpeg' }
      ]
    },
    answer: {
      expected: 'ARLO',
      accepted: ['ARLO'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The file is in Pictures.',
      'Open the image with Metadata Inspector, examine the metadata fields, and look for the creator/author information.'
    ]
  },
  {
    id: 'r1_t03',
    round: 1,
    order: 3,
    title: 'TASK 03 — IMAGE MESSAGE',
    story: 'A recovered poster contains an embedded optical matrix marking that cannot be interpreted through standard visual viewing.',
    question: 'Scan the optical matrix in poster.png.',
    difficulty: 'easy',
    requiredInput: {
      type: 'image',
      assets: [
        { id: 'asset_t3_poster', name: 'poster.png', path: '/Pictures/poster.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: 'SECTOR-7',
      accepted: ['SECTOR-7'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['qr-scanner', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The image is in Pictures.',
      'Use QR/Barcode Scanner and scan the matrix to retrieve the encoded message.'
    ]
  },
  {
    id: 'r1_t04',
    round: 1,
    order: 4,
    title: 'TASK 04 — THE EARLIEST RECORD',
    story: 'Workstation access records are scrambled out of order. An initial trigger event initiated the recorded sequence.',
    question: 'Find the earliest timestamp in access.log and determine the associated color.',
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
    allowedApps: ['text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'access.log is in Documents.',
      'Compare the timestamps and identify the earliest record and its associated information.'
    ]
  },
  {
    id: 'r1_t05',
    round: 1,
    order: 5,
    title: 'TASK 05 — THE CHANGED RECORD',
    story: 'Two versions of a critical transmission log exist on the workstation. Most lines are identical, but one operational parameter was modified.',
    question: 'Compare the old and new transmission logs and find the changed value.',
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
      'Both files are in Documents.',
      'Use File Comparison Tool, compare the files line by line, and locate the differing value.'
    ]
  },
  {
    id: 'r1_t06',
    round: 1,
    order: 6,
    title: 'TASK 06 — THE FRAGMENTED PASSWORD',
    story: 'Three fragments of a security passcode were recovered separately. Each fragment is incomplete on its own, and their order is scrambled.',
    question: 'Chronologically arrange three fragments and decode them.',
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
      accepted: ['CYPHORA'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['text-editor', 'converter', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'The fragments are in Documents.',
      'Check their timestamps, arrange them from earliest to latest, combine the fragments, and decode the result using Base64.'
    ]
  },
  {
    id: 'r1_t07',
    round: 1,
    order: 7,
    title: 'TASK 07 — THE HIDDEN RECORD',
    story: 'An archival survey photograph appears ordinary, but operational data was preserved inside its descriptive technical properties.',
    question: 'Inspect image metadata and decode the embedded character codes.',
    difficulty: 'medium',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t7_photo', name: 'archive_photo.png', path: '/Pictures/archive_photo.png', mimeType: 'image/png' }
      ]
    },
    answer: {
      expected: 'RESCUE',
      accepted: ['RESCUE'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['metadata-inspector', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'archive_photo.png is in Pictures.',
      'Use Metadata Inspector, examine the description/details, and convert the numerical character codes using Decimal/ASCII → Text.'
    ]
  },
  {
    id: 'r1_t08',
    round: 1,
    order: 8,
    title: 'TASK 08 — THE DISGUISED FILE',
    story: 'Crucial investigation evidence has been deliberately concealed in a hidden subdirectory within the workstation archives.',
    question: 'Find the file hidden inside the concealed directory.',
    difficulty: 'hard',
    requiredInput: {
      type: 'file',
      assets: [
        { id: 'asset_t8_clue', name: 'clue.txt', path: '/Archive/.hidden/clue.txt', mimeType: 'text/plain' }
      ]
    },
    answer: {
      expected: '7314',
      accepted: ['7314'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-manager', 'text-editor', 'terminal'],
    completionMode: 'answer_submission',
    hints: [
      'Look in Archive.',
      'Enable Show Hidden Files in File Manager, inspect the concealed directories, and locate the text file.'
    ]
  },
  {
    id: 'r1_t09',
    round: 1,
    order: 9,
    title: 'TASK 09 — THE EVIDENCE TRAIL',
    story: 'An investigative trail spans across multiple records, beginning with an optical marking on a survey map.',
    question: 'Follow the image clue → index → activity log.',
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
      'The starting image is in Pictures. Related files are in Documents.',
      'Scan the image to obtain the first clue, use that clue to locate the relevant entry in the index file, follow the reference to the activity log, and inspect the specified record.'
    ]
  },
  {
    id: 'r1_t10',
    round: 1,
    order: 10,
    title: 'TASK 10 — THE ALTERED RECORD',
    story: 'Two versions of a secure configuration record contain a subtle hexadecimal difference that conceals an operational word.',
    question: 'Compare two configuration files, identify the changed hexadecimal data, and decode it.',
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
      accepted: ['VECTOR'],
      type: 'text',
      caseSensitive: false,
      trimWhitespace: true
    },
    allowedApps: ['file-comparator', 'converter', 'text-editor', 'file-manager'],
    completionMode: 'answer_submission',
    hints: [
      'alpha.txt and beta.txt are in Documents.',
      'Compare both files, locate the modified line, identify the hexadecimal sequence, and convert Hexadecimal → Text.'
    ]
  },
  {
    id: 'r1_t11',
    round: 1,
    order: 11,
    title: 'TASK 11 — FOLLOW THE TRAIL',
    story: 'A field note points to an archive document, which links to monitored hardware evidence across the workstation.',
    question: 'Follow the chain from the incident note through the archive and device image, inspect the referenced metadata, and decode the recovered character sequence.',
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
      'Start with incident_note.txt in Documents.',
      'Follow the reference path in the note, continue through the archive and device image, inspect the metadata, and decode the character sequence using the appropriate conversion.'
    ]
  },
  {
    id: 'r1_t12',
    round: 1,
    order: 12,
    title: 'TASK 12 — TRACE THE INCIDENT',
    story: 'Four pieces of evidence across logs, device photos, archives, and transfer records form a connected incident chain.',
    question: 'Reconstruct the incident by following the references across the system record, device evidence, archive record, and transfer record. Decode the final hexadecimal payload to recover the clearance code.',
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
      'Evidence is spread across Documents, Pictures, Archive, and Transfers.',
      'Start with the system record and follow each file/reference identifier to the next piece of evidence. Reach the final transfer file and decode the hexadecimal payload into text.'
    ]
  }
];

export const TASK_PRESENTATIONS = TASK_DEFINITIONS.reduce((acc, task) => {
  acc[task.id] = {
    number: task.order.toString().padStart(2, '0'),
    playerTitle: task.title,
    objective: task.question,
    story: task.story,
    hints: task.hints
  };
  return acc;
}, {});

export const SET_PRESENTATIONS = {
  set1: { label: 'SUBSYSTEM 1', title: 'POWER RESTORATION', message: 'Recover foundational files and binary records to restore primary power distribution.' },
  set2: { label: 'SUBSYSTEM 2', title: 'RADIO TRANSCEIVER', message: 'Decode communications and frequency logs to reconnect long-range radio signals.' },
  set3: { label: 'SUBSYSTEM 3', title: 'NAVIGATION TRIANGULATION', message: 'Triangulate coordinates, optical codes, and sector logs to calculate the route to the Monolith.' },
  set4: { label: 'SUBSYSTEM 4', title: 'EXPEDITION ARCHIVE', message: 'Reconstruct chained incident records to unlock final clearance and open the path to the Light.' }
};