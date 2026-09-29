import { TASK_DEFINITIONS } from './taskContent.js';

export const ROUND_1_DURATION_MS = 20 * 60 * 1000;
export const STORAGE_KEY = 'cyphora_round1_state';

export const ROUND_1_SETS = [
  {
    id: 'set1',
    title: 'TIER 1: ONE-STEP RECONNAISSANCE',
    description: 'Master single conceptual operations across binary data, metadata, QR codes, patterns, and document diffs.',
    tasks: ['r1_t01', 'r1_t02', 'r1_t03', 'r1_t04', 'r1_t05']
  },
  {
    id: 'set2',
    title: 'TIER 2A: MULTI-STEP CONVERSIONS',
    description: 'Chain intermediate representations: Binary to 0-9 format to Readable format, Metadata to File access, and Hex decoding.',
    tasks: ['r1_t06', 'r1_t07', 'r1_t08']
  },
  {
    id: 'set3',
    title: 'TIER 2B: CROSS-APP DISCOVERY',
    description: 'Combine QR scanner references with frequency analysis and document comparison conversions.',
    tasks: ['r1_t09', 'r1_t10']
  },
  {
    id: 'set4',
    title: 'TIER 3: ADVANCED CHAINED INVESTIGATION',
    description: 'Execute deep multi-app investigation chains and unlock the final workstation clearance key.',
    tasks: ['r1_t11', 'r1_t12']
  }
];

export const ROUND_1_TASKS = TASK_DEFINITIONS.map(def => ({
  ...def,
  acceptedEvents: ['TASK_ANSWER_SUBMITTED'],
  validator: (payload = {}) => {
    const rawInput = (payload.answer || '').toString();
    let userVal = rawInput;
    let expectedVal = (def.answer.expected || '').toString();

    if (def.answer.trimWhitespace !== false) {
      userVal = userVal.trim();
      expectedVal = expectedVal.trim();
    }

    if (!def.answer.caseSensitive) {
      userVal = userVal.toUpperCase();
      expectedVal = expectedVal.toUpperCase();
    }

    return userVal === expectedVal && userVal.length > 0;
  }
}));

export function buildDefaultRound1State() {
  const tasks = ROUND_1_TASKS.map((task, index) => ({
    ...task,
    status: index === 0 ? 'ACTIVE' : 'LOCKED',
    completionTimestamp: null,
    attemptCount: 0,
    hintsUsed: 0,
    actionSequence: []
  }));

  return {
    teamId: '',
    sessionId: '',
    roundNumber: 1,
    round1StartedAt: null,
    round1CompletedAt: null,
    round1Status: 'NOT_STARTED',
    round1DurationMs: ROUND_1_DURATION_MS,
    remainingTimeMs: ROUND_1_DURATION_MS,
    elapsedTimeMs: 0,
    percentageRemaining: 100,
    isTimerRunning: false,
    isExpired: false,
    isCompleted: false,
    lightReached: false,
    journeyProgress: 0,
    activeSet: 'set1',
    setStates: {
      set1: 'ACTIVE',
      set2: 'LOCKED',
      set3: 'LOCKED',
      set4: 'LOCKED'
    },
    tasks,
    taskCompletionTimestamps: {},
    setCompletionTimestamps: {},
    eventLog: [], // System-wide audit log for all 10 tracked event types
    storyScene: 'prologue',
    simulatedClock: null,
    memoryFragmentRecovered: false,
    finalMemoryVisible: false
  };
}

export function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const seconds = (totalSeconds % 60).toString().padStart(2, '0');
  return `${minutes}:${seconds}`;
}

export function getTimeSnapshot(state) {
  if (!state || !state.round1StartedAt) {
    return {
      remainingTimeMs: state?.round1DurationMs ?? ROUND_1_DURATION_MS,
      elapsedTimeMs: 0,
      percentageRemaining: 100,
      isExpired: false,
      isTimerRunning: false
    };
  }

  const startedAt = new Date(state.round1StartedAt).getTime();
  const now = Date.now();
  const remaining = Math.max(0, startedAt + state.round1DurationMs - now);
  const elapsed = state.round1DurationMs - remaining;
  const isExpired = remaining <= 0 || state.isExpired;

  return {
    remainingTimeMs: remaining,
    elapsedTimeMs: elapsed,
    percentageRemaining: isExpired ? 0 : Math.max(0, (remaining / state.round1DurationMs) * 100),
    isExpired,
    isTimerRunning: state.isTimerRunning && !isExpired && !state.isCompleted
  };
}

export function persistRound1State(state) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function hydrateTasks(tasks = []) {
  return ROUND_1_TASKS.map(taskDefinition => {
    const savedTask = tasks.find(task => task.id === taskDefinition.id) || {};
    return {
      ...taskDefinition,
      ...savedTask,
      validator: taskDefinition.validator,
      status: savedTask.status || taskDefinition.status || 'LOCKED',
      actionSequence: savedTask.actionSequence || []
    };
  });
}

export function loadRound1State() {
  if (typeof window === 'undefined') {
    return buildDefaultRound1State();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return buildDefaultRound1State();
    }

    const parsed = JSON.parse(raw);
    const defaultState = buildDefaultRound1State();
    const hydrated = {
      ...defaultState,
      ...parsed,
      setStates: { ...defaultState.setStates, ...(parsed.setStates || {}) },
      tasks: hydrateTasks(parsed.tasks || defaultState.tasks),
      eventLog: parsed.eventLog || []
    };

    return normalizeRound1State(hydrated);
  } catch (err) {
    console.warn('[Round1] Failed to restore saved progress', err);
    return buildDefaultRound1State();
  }
}

export function normalizeRound1State(state) {
  const base = buildDefaultRound1State();
  const merged = {
    ...base,
    ...state,
    round1DurationMs: ROUND_1_DURATION_MS,
    setStates: { ...base.setStates, ...(state.setStates || {}) },
    tasks: hydrateTasks(state.tasks || base.tasks),
    eventLog: state.eventLog || []
  };

  const snapshot = getTimeSnapshot(merged);
  merged.remainingTimeMs = snapshot.remainingTimeMs;
  merged.elapsedTimeMs = snapshot.elapsedTimeMs;
  merged.percentageRemaining = snapshot.percentageRemaining;
  merged.isExpired = snapshot.isExpired;
  merged.isTimerRunning = snapshot.isTimerRunning;

  if (!merged.round1StartedAt || merged.isExpired || merged.round1Status === 'COMPLETED') {
    merged.isTimerRunning = false;
  }

  return recalculateRound1State(merged);
}

export function beginRound1(state, team) {
  const next = normalizeRound1State(state || buildDefaultRound1State());
  const startedAt = new Date().toISOString();
  
  const startEvent = {
    eventName: 'task_started',
    taskId: 'r1_t01',
    timestamp: startedAt,
    details: 'Expedition Round 1 Started'
  };

  const startedState = {
    ...next,
    teamId: team?.teamId || team?.teamName || next.teamId || 'unknown-team',
    sessionId: team?.sessionId || next.sessionId || `session-${Date.now()}`,
    round1StartedAt: startedAt,
    round1Status: 'IN_PROGRESS',
    isTimerRunning: true,
    isExpired: false,
    isCompleted: false,
    lightReached: false,
    finalMemoryVisible: false,
    round1CompletedAt: null,
    eventLog: [...(next.eventLog || []), startEvent]
  };

  return recalculateRound1State(startedState);
}

export function recalculateRound1State(state) {
  const next = { ...state };
  if (!next.tasks) {
    next.tasks = buildDefaultRound1State().tasks;
  }

  next.tasks = next.tasks.map((task, index) => {
    const isCompleted = task.status === 'COMPLETED';
    if (isCompleted) return task;
    const currentNonCompletedIndex = next.tasks.findIndex(entry => entry.status !== 'COMPLETED');
    if (currentNonCompletedIndex === index) {
      return { ...task, status: 'ACTIVE' };
    }
    return { ...task, status: 'LOCKED' };
  });

  const nextSetIndex = ROUND_1_SETS.findIndex(set => set.id === next.activeSet);
  const setStates = {};
  ROUND_1_SETS.forEach((set, index) => {
    const relevantTasks = next.tasks.filter(task => task.setId === set.id || task.setId === `set${index + 1}`);
    const isComplete = relevantTasks.length > 0 && relevantTasks.every(task => task.status === 'COMPLETED');
    if (isComplete) {
      setStates[set.id] = 'COMPLETED';
      return;
    }

    if (index === nextSetIndex && next.round1Status === 'IN_PROGRESS') {
      setStates[set.id] = 'ACTIVE';
      return;
    }

    if (index < nextSetIndex) {
      setStates[set.id] = 'COMPLETED';
      return;
    }

    setStates[set.id] = 'LOCKED';
  });

  next.setStates = setStates;

  const completedTasksCount = next.tasks.filter(t => t.status === 'COMPLETED').length;
  next.journeyProgress = next.round1Status === 'COMPLETED' ? 100 : Math.round((completedTasksCount / 12) * 100);

  if (next.round1Status === 'IN_PROGRESS' && completedTasksCount === 12) {
    next.lightReached = true;
  }

  if (next.round1Status === 'COMPLETED') {
    next.lightReached = true;
    next.journeyProgress = 100;
  }

  if (next.round1Status === 'IN_PROGRESS') {
    const activeTaskObj = next.tasks.find(t => t.status === 'ACTIVE');
    if (activeTaskObj) {
      next.activeSet = activeTaskObj.setId || 'set1';
    }
  }

  return next;
}

// Map external UI/App events to canonical system tracking event types
const EVENT_TYPE_MAP = {
  'APP_OPENED': 'app_opened',
  'FILE_OPENED': 'file_opened',
  'FILE_UPLOADED': 'file_uploaded',
  'CONVERSION_PERFORMED': 'conversion_performed',
  'METADATA_INSPECTED': 'metadata_inspected',
  'QR_SCANNED': 'qr_scanned',
  'FILES_COMPARED': 'comparison_performed',
  'TASK_ANSWER_SUBMITTED': 'answer_submitted',
  'HINT_REVEALED': 'hint_used',
  'TASK_STARTED': 'task_started',
  'TASK_COMPLETED': 'task_completed'
};

export function processRound1Event(state, eventName, payload = {}) {
  const next = normalizeRound1State(state || buildDefaultRound1State());
  if (!next.isTimerRunning || next.isExpired || next.isCompleted || next.round1Status === 'COMPLETED') {
    return next;
  }

  const task = next.tasks.find(item => item.status === 'ACTIVE');
  if (!task) {
    return next;
  }

  const timestamp = new Date().toISOString();
  const canonicalType = EVENT_TYPE_MAP[eventName] || eventName.toLowerCase();

  // Log system event to audit log & active task action sequence
  const newLogEntry = {
    eventName: canonicalType,
    rawEvent: eventName,
    taskId: task.id,
    timestamp,
    payload
  };

  let updatedTasks = next.tasks.map(item => {
    if (item.id !== task.id) return item;
    const hintsCount = eventName === 'HINT_REVEALED' ? (item.hintsUsed || 0) + 1 : (item.hintsUsed || 0);
    const attempts = eventName === 'TASK_ANSWER_SUBMITTED' ? (item.attemptCount || 0) + 1 : (item.attemptCount || 0);
    return {
      ...item,
      hintsUsed: hintsCount,
      attemptCount: attempts,
      actionSequence: [...(item.actionSequence || []), newLogEntry]
    };
  });

  let nextState = {
    ...next,
    tasks: updatedTasks,
    eventLog: [...(next.eventLog || []), newLogEntry]
  };

  // ONLY TASK_ANSWER_SUBMITTED CAN TRIGGER TASK COMPLETION
  if (eventName !== 'TASK_ANSWER_SUBMITTED') {
    return recalculateRound1State(nextState);
  }

  if (!task.validator(payload)) {
    // Log incorrect answer attempt
    const incorrectLogEntry = {
      eventName: 'answer_incorrect',
      taskId: task.id,
      timestamp,
      submittedValue: payload.answer
    };
    nextState.eventLog = [...nextState.eventLog, incorrectLogEntry];
    return recalculateRound1State(nextState);
  }

  // Task successfully completed!
  const correctLogEntry = {
    eventName: 'answer_correct',
    taskId: task.id,
    timestamp,
    submittedValue: payload.answer
  };

  const completedLogEntry = {
    eventName: 'task_completed',
    taskId: task.id,
    timestamp,
    details: `Task ${task.id} completed successfully`
  };

  updatedTasks = nextState.tasks.map(item => {
    if (item.id !== task.id) return item;
    return {
      ...item,
      status: 'COMPLETED',
      completionTimestamp: timestamp,
      completionCount: (item.completionCount || 0) + 1,
      actionSequence: [...(item.actionSequence || []), correctLogEntry, completedLogEntry]
    };
  });

  nextState = {
    ...nextState,
    tasks: updatedTasks,
    taskCompletionTimestamps: {
      ...nextState.taskCompletionTimestamps,
      [task.id]: timestamp
    },
    eventLog: [...nextState.eventLog, correctLogEntry, completedLogEntry]
  };

  const allComplete = nextState.tasks.every(item => item.status === 'COMPLETED');

  if (allComplete) {
    const completedAt = timestamp;
    nextState.round1CompletedAt = completedAt;
    nextState.round1Status = 'COMPLETED';
    nextState.isCompleted = true;
    nextState.journeyProgress = 100;
    nextState.lightReached = true;
    nextState.finalMemoryVisible = true;
    nextState.memoryFragmentRecovered = true;
    nextState.isTimerRunning = false;
    nextState.remainingTimeMs = Math.max(0, nextState.remainingTimeMs);
    nextState.percentageRemaining = 0;
  } else {
    nextState.round1Status = 'IN_PROGRESS';
  }

  const recalc = recalculateRound1State(nextState);
  recalc.round1Status = nextState.round1Status;
  recalc.isCompleted = nextState.isCompleted;
  recalc.lightReached = nextState.lightReached;
  recalc.finalMemoryVisible = nextState.finalMemoryVisible;
  recalc.memoryFragmentRecovered = nextState.memoryFragmentRecovered;
  return recalc;
}

export function updateRound1TimerFromNow(state) {
  const next = normalizeRound1State(state || buildDefaultRound1State());
  if (!next.round1StartedAt || !next.isTimerRunning) {
    return next;
  }

  const startedAt = new Date(next.round1StartedAt).getTime();
  const remaining = Math.max(0, startedAt + next.round1DurationMs - Date.now());

  if (remaining <= 0) {
    const expired = {
      ...next,
      remainingTimeMs: 0,
      elapsedTimeMs: next.round1DurationMs,
      percentageRemaining: 0,
      isExpired: true,
      isTimerRunning: false,
      round1Status: 'TIME_EXPIRED',
      isCompleted: false,
      lightReached: false
    };
    return normalizeRound1State(expired);
  }

  const updated = {
    ...next,
    remainingTimeMs: remaining,
    elapsedTimeMs: next.round1DurationMs - remaining,
    percentageRemaining: (remaining / next.round1DurationMs) * 100,
    isExpired: false,
    isTimerRunning: true
  };

  return normalizeRound1State(updated);
}
