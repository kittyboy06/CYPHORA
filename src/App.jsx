import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Users, X, ChevronRight, Shield, Compass, LogOut, Key, Eye, EyeOff, AlertCircle, Code2 } from 'lucide-react';
import { BootScreen } from './os/boot/BootScreen.jsx';
import { OSContainer } from './os/OSContainer.jsx';
import { Prologue } from './components/Story/Prologue.jsx';
import { ParticleTextEffect } from './components/ParticleTextEffect.jsx';
import { eventBus } from './os/events/eventBus.js';
import {
  loadRound1State,
  buildDefaultRound1State,
  beginRound1,
  processRound1Event,
  persistRound1State,
  updateRound1TimerFromNow,
  recalculateRound1State,
  clearRound1LocalData,
} from './round1/round1Engine.js';
import { RoundTimerLockScreen } from './components/RoundTimerLockScreen.jsx';
import './App.css';



const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
const API_BASE = isDevPort ? `http://${hostname}:8000` : '';
const WS_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_HOST = isDevPort ? `${hostname}:8000` : (typeof window !== 'undefined' ? window.location.host : 'localhost:8000');
const WS_BASE_URL = `${WS_PROTOCOL}//${WS_HOST}/ws/live`;

const formatOrdinal = (rank) => {
  if (!rank || isNaN(rank)) return 'Unranked';
  const n = parseInt(rank, 10);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const normalizeTeamName = (name) => (name || '').trim().toLowerCase();

function App({ initialStage = null, defaultAppId = null }) {
  const [stage, setStage] = useState(() => {
    if (initialStage) return initialStage;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const s = params.get('stage');
      if (s) return s;
      if (params.get('round') === '2') return 'os-desktop';
      const storedStage = sessionStorage.getItem('cyphora_current_stage');
      if (storedStage && ['main', 'initial', 'prologue', 'os-desktop'].includes(storedStage)) {
        return storedStage;
      }
      const savedName = sessionStorage.getItem('cyphora_team_name');
      if (savedName) {
        return 'os-desktop';
      }
    }
    return 'initial';
  });
  const [initialAppId, setInitialAppId] = useState(() => {
    if (defaultAppId) return defaultAppId;
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('app') || (params.get('round') === '2' || params.get('stage') === 'round2' ? 'round2' : null);
    }
    return null;
  });
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [modalMode, setModalMode] = useState('register'); // 'register' | 'resume'
  const [registerTeamInput, setRegisterTeamInput] = useState('');
  const [registerPinInput, setRegisterPinInput] = useState('');
  const [showRegisterPin, setShowRegisterPin] = useState(false);
  const [member1Input, setMember1Input] = useState('');
  const [member2Input, setMember2Input] = useState('');
  const [registerError, setRegisterError] = useState('');

  const [resumeTeamInput, setResumeTeamInput] = useState('');
  const [resumePinInput, setResumePinInput] = useState('');
  const [showResumePin, setShowResumePin] = useState(false);
  const [resumeError, setResumeError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [liveExplorers, setLiveExplorers] = useState([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [teamData, setTeamData] = useState(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlTeam = params.get('team');
      const savedName = sessionStorage.getItem('cyphora_team_name') || localStorage.getItem('cyphora_team_name') || urlTeam;
      const initialStageRequested = params.get('stage') || initialStage;
      const isCleanStart = (!initialStageRequested || initialStageRequested === 'initial') && !urlTeam && !sessionStorage.getItem('cyphora_team_name');

      if (savedName && !isCleanStart) {
        return {
          id: parseInt(sessionStorage.getItem('cyphora_team_id') || localStorage.getItem('cyphora_team_id'), 10) || null,
          name: savedName,
          member1: sessionStorage.getItem('cyphora_member1') || localStorage.getItem('cyphora_member1') || '',
          member2: sessionStorage.getItem('cyphora_member2') || localStorage.getItem('cyphora_member2') || '',
          standing: '1st',
          score: 0,
          isSelected: true,
          round2Unlocked: false,
          round3Unlocked: false,
        };
      }
    }
    return {
      id: null,
      name: '',
      member1: '',
      member2: '',
      standing: 'Unranked',
      score: 0,
      isSelected: false,
      round2Unlocked: false,
      round3Unlocked: false,
    };
  });
  const [round1State, setRound1State] = useState(() => {
    const loaded = loadRound1State();
    if (stage !== 'os-desktop') {
      return { ...loaded, isTimerRunning: false };
    }
    return loaded;
  });
  const wakeTimerRef = useRef(null);
  const socketRef = useRef(null);
  const teamDataRef = useRef(teamData);
  const round1StateRef = useRef(round1State);
  const stageRef = useRef(stage);
  const syncedTasksRef = useRef(new Set());

  // Multi-Round Synchronized Timers & Workstation Lockout States
  const [round1Timer, setRound1Timer] = useState({ round: 1, action: 'reset', duration_minutes: 60, remaining_seconds: 3600 });
  const [round2Timer, setRound2Timer] = useState({ round: 2, action: 'reset', duration_minutes: 30, remaining_seconds: 1800 });
  const [isRound1LockedByTimer, setIsRound1LockedByTimer] = useState(false);
  const [isRound2LockedByTimer, setIsRound2LockedByTimer] = useState(false);
  const [proctorOverrideRound1, setProctorOverrideRound1] = useState(false);
  const [proctorOverrideRound2, setProctorOverrideRound2] = useState(false);

  useEffect(() => {
    stageRef.current = stage;
  }, [stage]);

  useEffect(() => {
    teamDataRef.current = teamData;
  }, [teamData]);

  useEffect(() => {
    round1StateRef.current = round1State;
    persistRound1State(round1State);
  }, [round1State]);

  // Synchronize task completion with backend SQLite database
  const syncTaskSubmission = async (taskId, answer, hintsUsed = 0) => {
    if (!taskId) return;
    try {
      const token = localStorage.getItem('cyphora_token');
      const teamId = teamDataRef.current.id || localStorage.getItem('cyphora_team_id');
      const teamName = teamDataRef.current.name || localStorage.getItem('cyphora_team_name');

      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (teamId) headers['X-Team-Id'] = String(teamId);
      if (teamName) headers['X-Team-Name'] = teamName;

      const res = await fetch(`${API_BASE}/api/stage1/submit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          task_key: taskId,
          proof: answer || null,
          hints_used: hintsUsed
        })
      });

      if (res.ok) {
        const data = await res.json();
        syncedTasksRef.current.add(taskId);
        if (data.new_total_score !== undefined) {
          setTeamData(prev => ({
            ...prev,
            score: data.new_total_score
          }));
        }
        // Guarantee round1State marks this task as COMPLETED and unblocks the next task
        if (data.success !== false) {
          setRound1State(prev => {
            const taskObj = prev.tasks.find(t => t.id === taskId);
            if (taskObj && taskObj.status !== 'COMPLETED') {
              const updatedTasks = prev.tasks.map(t => t.id === taskId ? { ...t, status: 'COMPLETED' } : t);
              return recalculateRound1State({
                ...prev,
                tasks: updatedTasks
              });
            }
            return prev;
          });
        }
      }
    } catch (err) {
      console.warn('[CYPHORA] Error syncing task submission to backend:', err);
    }
  };

  // Sync all verified task completions from backend on load/refresh
  const syncCompletedTasksFromBackend = useCallback(async (explicitId = null, explicitName = null, explicitToken = null) => {
    try {
      const token = explicitToken || sessionStorage.getItem('cyphora_token') || localStorage.getItem('cyphora_token');
      const teamId = explicitId || teamDataRef.current?.id || sessionStorage.getItem('cyphora_team_id') || localStorage.getItem('cyphora_team_id');
      const teamName = explicitName || teamDataRef.current?.name || sessionStorage.getItem('cyphora_team_name') || localStorage.getItem('cyphora_team_name');
      if (!teamName && !teamId) return null;

      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (teamId) headers['X-Team-Id'] = String(teamId);
      if (teamName) headers['X-Team-Name'] = teamName;

      const res = await fetch(`${API_BASE}/api/stage1/tasks`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (data.team_score !== undefined) {
          setTeamData(prev => ({ ...prev, score: data.team_score }));
        }
        if (Array.isArray(data.tasks)) {
          const completedKeys = new Set(data.tasks.filter(t => t.is_completed).map(t => t.key));
          setRound1State(prev => {
            const updatedTasks = prev.tasks.map(t => {
              if (completedKeys.has(t.id)) {
                return { ...t, status: 'COMPLETED' };
              }
              return t;
            });
            const isDesktop = stageRef.current === 'os-desktop';
            const isDismissed = Boolean(
              prev.celebrationDismissed ||
              sessionStorage.getItem('cyphora_round1_celebration_dismissed') === 'true' ||
              localStorage.getItem('cyphora_round1_celebration_dismissed') === 'true'
            );
            return recalculateRound1State({
              ...prev,
              round1StartedAt: prev.round1StartedAt || (isDesktop ? new Date().toISOString() : null),
              round1Status: completedKeys.size === 12 ? 'COMPLETED' : 'IN_PROGRESS',
              isExpired: false,
              isTimerRunning: isDesktop && completedKeys.size < 12,
              finalMemoryVisible: completedKeys.size === 12 && !isDismissed,
              celebrationDismissed: isDismissed,
              tasks: updatedTasks
            });
          });
          return { completedCount: completedKeys.size, totalTasks: data.tasks.length };
        }
      }
    } catch (err) {
      console.warn('[CYPHORA] Error fetching stage1 tasks from backend:', err);
    }
    return null;
  }, []);

  // Synchronize global event countdown timer from backend for Round 1 or Round 2
  // Synchronize configured duration from backend for Round 1, 2, or 3
  const applyGlobalTimer = useCallback((timer, roundNum = 1) => {
    if (!timer) return;
    const isDesktop = stageRef.current === 'os-desktop';
    const targetRound = timer.round || roundNum || 1;

    if (targetRound === 1) {
      setRound1Timer(timer);
      const configuredMinutes = timer.duration_minutes || 60;
      const durationMs = configuredMinutes * 60 * 1000;

      setRound1State(prev => {
        const storedStart = localStorage.getItem('cyphora_round1_started_at');
        if (storedStart && isDesktop) {
          const startedAtMs = parseInt(storedStart, 10);
          const elapsed = Math.max(0, Date.now() - startedAtMs);
          const remainingMs = Math.max(0, durationMs - elapsed);
          const isExp = remainingMs <= 0;
          return {
            ...prev,
            round1DurationMs: durationMs,
            remainingTimeMs: remainingMs,
            isExpired: isExp,
            isTimerRunning: isDesktop && !isExp && prev.round1Status !== 'COMPLETED'
          };
        }
        return {
          ...prev,
          round1DurationMs: durationMs,
          remainingTimeMs: durationMs
        };
      });
    } else if (targetRound === 2) {
      setRound2Timer(timer);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = eventBus.on('*', (event) => {
      setRound1State(prev => {
        const next = processRound1Event(prev, event.event, event.payload);
        return next;
      });

      if (event.event === 'TASK_ANSWER_SUBMITTED') {
        const currentState = round1StateRef.current;
        const activeTask = currentState.tasks.find(t => t.status === 'ACTIVE');
        if (activeTask && activeTask.validator && activeTask.validator(event.payload)) {
          const hintsUsed = event.payload.hintsUsed !== undefined ? event.payload.hintsUsed : (activeTask.hintsUsed || 0);
          syncTaskSubmission(activeTask.id, event.payload.answer, hintsUsed);
        }
      }
    });
    return unsubscribe;
  }, []);

  // Automatically start Round 1 countdown timer ONLY after entering the OS desktop
  useEffect(() => {
    if (stage === 'os-desktop') {
      let storedStart = localStorage.getItem('cyphora_round1_started_at');
      if (!storedStart) {
        storedStart = String(Date.now());
        localStorage.setItem('cyphora_round1_started_at', storedStart);
      }
      const startedAtMs = parseInt(storedStart, 10);
      const configuredMinutes = round1Timer?.duration_minutes || 60;
      const durationMs = configuredMinutes * 60 * 1000;
      const elapsed = Math.max(0, Date.now() - startedAtMs);
      const remainingMs = Math.max(0, durationMs - elapsed);
      const isExp = remainingMs <= 0;

      setRound1State(prev => {
        const base = (prev.round1Status === 'NOT_STARTED' || !prev.round1StartedAt)
          ? beginRound1(prev, {
              teamId: normalizeTeamName(teamData.name),
              sessionId: `session-${Date.now()}`,
              teamName: teamData.name
            })
          : prev;

        return {
          ...base,
          round1StartedAt: base.round1StartedAt || new Date(startedAtMs).toISOString(),
          round1DurationMs: durationMs,
          remainingTimeMs: remainingMs,
          isExpired: isExp,
          isTimerRunning: remainingMs > 0 && base.round1Status !== 'COMPLETED'
        };
      });

      if (isExp && !proctorOverrideRound1) {
        setIsRound1LockedByTimer(true);
      }
    } else {
      // While before OS (initial, waking, prologue, os-boot), timer must remain off
      setRound1State(prev => {
        if (prev.isTimerRunning) {
          return { ...prev, isTimerRunning: false };
        }
        return prev;
      });
    }
  }, [stage, teamData.name, round1Timer?.duration_minutes, proctorOverrideRound1]);

  // Tick interval for Round 1 timer ONLY while on os-desktop
  useEffect(() => {
    if (stage !== 'os-desktop') return;
    if (round1State.round1Status === 'COMPLETED') return;

    const tick = () => {
      const storedStart = localStorage.getItem('cyphora_round1_started_at');
      if (!storedStart) return;
      const startedAtMs = parseInt(storedStart, 10);
      const configuredMinutes = round1Timer?.duration_minutes || 60;
      const durationMs = configuredMinutes * 60 * 1000;
      const elapsed = Math.max(0, Date.now() - startedAtMs);
      const remainingMs = Math.max(0, durationMs - elapsed);
      const isExp = remainingMs <= 0;

      setRound1State(prev => ({
        ...prev,
        round1DurationMs: durationMs,
        remainingTimeMs: remainingMs,
        isExpired: isExp,
        isTimerRunning: !isExp && prev.round1Status !== 'COMPLETED'
      }));

      if (isExp && !proctorOverrideRound1) {
        setIsRound1LockedByTimer(true);
      }
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [stage, round1Timer?.duration_minutes, round1State.round1Status, proctorOverrideRound1]);

  useEffect(() => {
    return () => { if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current); };
  }, []);

  // Strict full-webpage scroll lock for computer screen app (landing page, eye animation, story page before OS)
  useEffect(() => {
    const lockScroll = () => {
      window.scrollTo(0, 0);
      if (document.documentElement) {
        document.documentElement.scrollTop = 0;
        document.documentElement.scrollLeft = 0;
        document.documentElement.style.overflow = 'hidden';
      }
      if (document.body) {
        document.body.scrollTop = 0;
        document.body.scrollLeft = 0;
        document.body.style.overflow = 'hidden';
      }
      const container = document.querySelector('.app-container');
      if (container) {
        container.scrollTop = 0;
        container.scrollLeft = 0;
        container.style.overflow = 'hidden';
      }
    };

    lockScroll();

    // Helper to find the primary scroll container of an OS window
    const getWindowScrollContainer = (winFrame) => {
      if (!winFrame) return null;

      // 1. Check for any active scrollable container with overflowing content
      const candidates = winFrame.querySelectorAll(
        '.terminal-output-area, .terminal-app-container, .te-textarea, .te-editor-wrapper, .os-round2-body, ' +
        '.universal-converter-app, .metadata-inspector-app, .file-comparator-app, ' +
        '.image-inspector-app, .audio-inspector-app, .qr-scanner-app, .text-analyzer-app, ' +
        '.fm-content-pane, .fm-sidebar, .settings-main, .tasks-scroll-content, ' +
        '.virtual-file-picker-body, .window-content-area, textarea'
      );
      for (const el of candidates) {
        if (el.scrollHeight > el.clientHeight + 2) {
          return el;
        }
      }

      // 2. Specific dedicated app scroll targets fallback
      const appScroll = winFrame.querySelector(
        '.terminal-output-area, .te-textarea, .os-round2-body, .universal-converter-app, ' +
        '.metadata-inspector-app, .file-comparator-app, .image-inspector-app, .audio-inspector-app, ' +
        '.qr-scanner-app, .text-analyzer-app, .fm-content-pane, .settings-main, ' +
        '.tasks-scroll-content, .virtual-file-picker-body'
      );
      if (appScroll) return appScroll;

      // 3. Inner window content area
      const contentArea = winFrame.querySelector('.window-content-area');
      if (contentArea) return contentArea;

      return winFrame;
    };

    const isInsideScrollable = (element, boundary) => {
      let cur = element;
      while (cur && cur !== boundary && cur !== document.body && cur !== document.documentElement) {
        if (cur.matches && cur.matches(
          '.terminal-output-area, .terminal-app-container, .te-textarea, .te-editor-wrapper, .te-container, .os-round2-body, ' +
          '.universal-converter-app, .metadata-inspector-app, .file-comparator-app, ' +
          '.image-inspector-app, .audio-inspector-app, .qr-scanner-app, .text-analyzer-app, ' +
          '.fm-content-pane, .fm-sidebar, .settings-main, .tasks-scroll-content, ' +
          '.virtual-file-picker-body, .start-menu-content, ' +
          '.desktop-leaderboard-list, .virtual-file-list, .panel-list, ' +
          '.objective-modal, .objective-shell, .window-content-area, textarea'
        )) {
          return cur;
        }
        if (typeof window !== 'undefined') {
          const style = window.getComputedStyle(cur);
          if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && cur.scrollHeight > cur.clientHeight) {
            return cur;
          }
        }
        cur = cur.parentElement;
      }
      return null;
    };

    const preventScroll = (e) => {
      const currentStage = stageRef.current;
      const isPreOS = ['initial', 'waking', 'prologue', 'main'].includes(currentStage);
      const target = e.target;

      // In landing, eye animation screen, and story screen before OS, absolutely no scrolling is permitted
      if (isPreOS) {
        if (e.type === 'wheel' || e.type === 'touchmove') {
          e.preventDefault();
        }
        if (e.type === 'keydown') {
          const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
          if (!isInput && [' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
            e.preventDefault();
          }
        }
        return;
      }

      // In OS desktop mode:
      if (e.type === 'wheel') {
        // 1. Standalone desktop UI elements (Start Menu, Leaderboard, File Picker, Objective Modal)
        const standaloneScrollable = target && target.closest && target.closest(
          '.start-menu-content, .desktop-leaderboard-list, .virtual-file-list, .panel-list, .objective-modal, .objective-shell'
        );
        if (standaloneScrollable) {
          return; // Allow native scroll
        }

        // If objective backdrop is open, route scroll to the objective modal
        const objectiveModal = document.querySelector('.objective-modal');
        if (objectiveModal && target && target.closest && target.closest('.objective-backdrop')) {
          e.preventDefault();
          objectiveModal.scrollBy({
            top: e.deltaY,
            left: e.deltaX,
            behavior: 'auto'
          });
          return;
        }

        // 2. Cursor is hovering a window
        const hoveredWindow = target && target.closest ? target.closest('.window-frame') : null;
        if (hoveredWindow) {
          // If cursor is directly inside a scroll container in this window, allow native scroll
          const innerScrollable = isInsideScrollable(target, hoveredWindow);
          if (innerScrollable) {
            return; // Allow native scroll with momentum and trackpad precision
          }

          // If cursor is on the window titlebar, header, or non-scrollable area:
          // Smoothly scroll the window's primary content container
          const primaryScroll = getWindowScrollContainer(hoveredWindow);
          if (primaryScroll) {
            e.preventDefault();
            primaryScroll.scrollBy({
              top: e.deltaY,
              left: e.deltaX,
              behavior: 'auto'
            });
            return;
          }
        }

        // 3. Immersive Selected App Scroll:
        // When cursor is anywhere on the OS workspace/canvas, drive the currently selected/focused app!
        const focusedWindow = document.querySelector('.window-frame.window-focused');
        if (focusedWindow) {
          const primaryScroll = getWindowScrollContainer(focusedWindow);
          if (primaryScroll) {
            e.preventDefault();
            primaryScroll.scrollBy({
              top: e.deltaY,
              left: e.deltaX,
              behavior: 'auto'
            });
            return;
          }
        }

        // Always prevent the outer browser document from scrolling or bouncing
        e.preventDefault();
        return;
      }

      if (e.type === 'touchmove') {
        const scrollable = isInsideScrollable(target, null);
        if (scrollable) {
          return; // Allow touch scroll on scrollable element
        }
        e.preventDefault();
        return;
      }

      if (e.type === 'keydown') {
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (isInput) {
          return; // Allow normal input typing and arrow keys
        }

        if ([' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          // If a window is focused in OS desktop mode, drive the selected app's scroll container
          const focusedWindow = document.querySelector('.window-frame.window-focused');
          if (focusedWindow) {
            const primaryScroll = getWindowScrollContainer(focusedWindow);
            if (primaryScroll) {
              e.preventDefault();
              const delta = e.key === 'ArrowDown' ? 60 :
                            e.key === 'ArrowUp' ? -60 :
                            e.key === 'PageDown' || e.key === ' ' ? 260 :
                            e.key === 'PageUp' ? -260 :
                            e.key === 'Home' ? -100000 :
                            e.key === 'End' ? 100000 : 0;
              if (delta !== 0) {
                primaryScroll.scrollBy({ top: delta, behavior: 'smooth' });
              }
              return;
            }
          }
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false, capture: true });
    window.addEventListener('touchmove', preventScroll, { passive: false, capture: true });
    window.addEventListener('keydown', preventScroll, { passive: false, capture: true });

    const handleWindowScroll = () => {
      if (window.scrollX !== 0 || window.scrollY !== 0) {
        window.scrollTo(0, 0);
      }
      const appContainer = document.querySelector('.app-container');
      if (appContainer && (appContainer.scrollTop !== 0 || appContainer.scrollLeft !== 0)) {
        appContainer.scrollTop = 0;
        appContainer.scrollLeft = 0;
      }
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });

    return () => {
      window.removeEventListener('wheel', preventScroll, { capture: true });
      window.removeEventListener('touchmove', preventScroll, { capture: true });
      window.removeEventListener('keydown', preventScroll, { capture: true });
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
      document.documentElement.style.overflow = 'hidden';
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
      document.body.style.overflow = 'hidden';
    }
    const container = document.querySelector('.app-container');
    if (container) {
      container.scrollTop = 0;
      container.scrollLeft = 0;
      container.style.overflow = 'hidden';
    }
    const prologue = document.querySelector('.prologue-shell');
    if (prologue) {
      prologue.scrollTop = 0;
      prologue.scrollLeft = 0;
      prologue.style.overflow = 'hidden';
    }
  }, [stage]);

  const lastLeaderboardFetchRef = useRef(0);
  const isFetchingLeaderboardRef = useRef(false);

  // Refresh leaderboard at most once every 5 seconds to reduce rate limit
  const fetchLeaderboard = useCallback(async (currentTeamName, force = false) => {
    const now = Date.now();
    if (!force && (now - lastLeaderboardFetchRef.current < 5000 || isFetchingLeaderboardRef.current)) {
      return;
    }
    lastLeaderboardFetchRef.current = now;
    isFetchingLeaderboardRef.current = true;
    try {
      const res = await fetch(`${API_BASE}/api/teams/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.teams)) {
          setLiveExplorers(data.teams);
          const current = teamDataRef.current;
          const savedId = parseInt(localStorage.getItem('cyphora_team_id'), 10) || current.id;
          const searchName = (currentTeamName || localStorage.getItem('cyphora_team_name') || current.name || '').toLowerCase();

          const self = data.teams.find(e => (savedId && e.id === savedId) || (searchName && e.name.toLowerCase() === searchName));
          if (self) {
            const completedTasks = Array.isArray(round1StateRef.current?.tasks)
              ? round1StateRef.current.tasks.filter(t => t.status === 'COMPLETED').length
              : 0;
            const r1Done = round1StateRef.current?.round1Status === 'COMPLETED' || completedTasks >= 12;

            const isR2Auth = Boolean(self.round2_unlocked || (r1Done && self.current_stage && self.current_stage >= 2));
            const isR3Auth = Boolean(self.round3_unlocked || (r1Done && self.current_stage && self.current_stage >= 3));

            setTeamData(prev => {
              if (self.name && self.name !== prev.name) {
                localStorage.setItem('cyphora_team_name', self.name);
              }
              return {
                ...prev,
                id: self.id,
                name: self.name || prev.name,
                member1: self.member1 || prev.member1,
                member2: self.member2 || prev.member2,
                standing: formatOrdinal(self.rank),
                score: self.score,
                round2Unlocked: isR2Auth,
                round3Unlocked: isR3Auth
              };
            });
          }
        }
        if (data.timers) {
          if (data.timers.round1) applyGlobalTimer(data.timers.round1, 1);
          if (data.timers.round2) applyGlobalTimer(data.timers.round2, 2);
        } else if (data.timer) {
          applyGlobalTimer(data.timer, 1);
        }
      }
    } catch (err) {
      console.warn('[CYPHORA] REST leaderboard fetch error:', err);
    } finally {
      isFetchingLeaderboardRef.current = false;
    }
  }, [applyGlobalTimer]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paramTeam = params.get('team');
    let savedTeam = '';
    let savedMember1 = '';
    let savedMember2 = '';
    let savedId = null;
    try {
      savedTeam = localStorage.getItem('cyphora_team_name') || '';
      savedMember1 = localStorage.getItem('cyphora_member1') || '';
      savedMember2 = localStorage.getItem('cyphora_member2') || '';
      const rawId = localStorage.getItem('cyphora_team_id');
      if (rawId) savedId = parseInt(rawId, 10);
    } catch (err) {}

    const paramStage = params.get('stage');
    if (paramStage && ['initial', 'prologue', 'main', 'os-boot', 'os-desktop'].includes(paramStage)) {
      setStage(paramStage);
    }

    const initialName = paramTeam || savedTeam || '';
    setTeamData(prev => ({
      ...prev,
      id: savedId || prev.id,
      name: initialName,
      member1: savedMember1 || prev.member1,
      member2: savedMember2 || prev.member2,
      standing: params.get('standing') || prev.standing,
      isSelected: params.get('selected') === 'true' || prev.isSelected,
    }));
    if (paramTeam || savedTeam) {
      setResumeTeamInput(paramTeam || savedTeam);
    }
    if (savedMember1) setMember1Input(savedMember1);
    if (savedMember2) setMember2Input(savedMember2);

    if (initialName) {
      fetchLeaderboard(initialName);
    } else {
      fetchLeaderboard();
    }
    syncCompletedTasksFromBackend();
  }, [syncCompletedTasksFromBackend]);

  useEffect(() => {
    if (panelOpen) {
      fetchLeaderboard();
      const interval = setInterval(() => {
        fetchLeaderboard();
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [panelOpen, fetchLeaderboard]);

  useEffect(() => {
    let reconnectTimeout;
    let pingInterval;

    const connect = () => {
      try {
        const current = teamDataRef.current;
        const currentName = current.name || (localStorage.getItem('cyphora_team_name') || '');
        const currentId = current.id || localStorage.getItem('cyphora_team_id');
        const encodedName = encodeURIComponent(currentName || '');
        const wsUrl = encodedName ? `${WS_BASE_URL}?team=${encodedName}` : WS_BASE_URL;
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsWsConnected(true);
          if (currentName || currentId) {
            socket.send(JSON.stringify({ action: 'identify', team: currentName, team_id: currentId }));
          }
          pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ action: 'ping' }));
            }
          }, 15000);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'LEADERBOARD_UPDATE' || payload.event === 'INITIAL_STATE') {
              if (Array.isArray(payload.data)) {
                setLiveExplorers(payload.data);
                const cur = teamDataRef.current;
                const savedId = parseInt(localStorage.getItem('cyphora_team_id'), 10) || cur.id;
                const searchName = (localStorage.getItem('cyphora_team_name') || cur.name || '').toLowerCase();

                const self = payload.data.find(e => (savedId && e.id === savedId) || (searchName && e.name.toLowerCase() === searchName));
                if (self) {
                  const completedTasks = Array.isArray(round1StateRef.current?.tasks)
                    ? round1StateRef.current.tasks.filter(t => t.status === 'COMPLETED').length
                    : 0;
                  const r1Done = round1StateRef.current?.round1Status === 'COMPLETED' || completedTasks >= 12;

                  const isR2Auth = Boolean(self.round2_unlocked || (r1Done && self.current_stage && self.current_stage >= 2));
                  const isR3Auth = Boolean(self.round3_unlocked || (r1Done && self.current_stage && self.current_stage >= 3));

                  if (isR2Auth) {
                    localStorage.setItem('cyphora_round2_unlocked', 'true');
                    sessionStorage.setItem('cyphora_round2_unlocked', 'true');
                  } else {
                    localStorage.removeItem('cyphora_round2_unlocked');
                    sessionStorage.removeItem('cyphora_round2_unlocked');
                  }

                  if (self.round3_unlocked !== undefined) {
                    if (isR3Auth) {
                      localStorage.setItem('cyphora_round3_unlocked', 'true');
                      sessionStorage.setItem('cyphora_round3_unlocked', 'true');
                    } else {
                      localStorage.removeItem('cyphora_round3_unlocked');
                      sessionStorage.removeItem('cyphora_round3_unlocked');
                    }
                  }
                  setTeamData(prev => {
                    if (self.name && self.name !== prev.name) {
                      localStorage.setItem('cyphora_team_name', self.name);
                    }
                    return {
                      ...prev,
                      id: self.id,
                      name: self.name || prev.name,
                      member1: self.member1 || prev.member1,
                      member2: self.member2 || prev.member2,
                      standing: formatOrdinal(self.rank),
                      score: self.score,
                      round2Unlocked: isR2Auth,
                      round3Unlocked: self.round3_unlocked !== undefined ? isR3Auth : prev.round3Unlocked
                    };
                  });
                }
              }
              if (payload.timers) {
                if (payload.timers.round1) applyGlobalTimer(payload.timers.round1, 1);
                if (payload.timers.round2) applyGlobalTimer(payload.timers.round2, 2);
              } else if (payload.timer) {
                applyGlobalTimer(payload.timer, 1);
              }
            } else if (payload.event === 'EVENT_TIMER_SYNC') {
              window.dispatchEvent(new CustomEvent('cyphora_timer_sync', { detail: payload.data }));
              if (payload.data?.all_timers) {
                if (payload.data.all_timers.round1) applyGlobalTimer(payload.data.all_timers.round1, 1);
                if (payload.data.all_timers.round2) applyGlobalTimer(payload.data.all_timers.round2, 2);
              } else {
                applyGlobalTimer(payload.data, payload.data?.round || 1);
              }
            } else if (payload.event === 'ROUND2_ACCESS_UPDATE') {
              const cur = teamDataRef.current;
              const savedId = parseInt(localStorage.getItem('cyphora_team_id'), 10) || cur.id;
              const searchName = (localStorage.getItem('cyphora_team_name') || cur.name || '').toLowerCase();
              const updateData = payload.data || {};
              if ((updateData.team_id && updateData.team_id === savedId) ||
                  (updateData.team_name && updateData.team_name.toLowerCase() === searchName)) {
                const isR2Auth = Boolean(updateData.unlocked);
                if (isR2Auth) {
                  localStorage.setItem('cyphora_round2_unlocked', 'true');
                  sessionStorage.setItem('cyphora_round2_unlocked', 'true');
                } else {
                  localStorage.removeItem('cyphora_round2_unlocked');
                  sessionStorage.removeItem('cyphora_round2_unlocked');
                  localStorage.removeItem('cyphora_round2_supervisor_override');
                  sessionStorage.removeItem('cyphora_round2_supervisor_override');
                  if (savedId) {
                    try { sessionStorage.removeItem(`cyphora_round2_override_${savedId}`); } catch (_) {}
                  }
                }
                setTeamData(prev => ({ ...prev, round2Unlocked: isR2Auth }));
                window.dispatchEvent(new CustomEvent('cyphora_round2_access_changed', { detail: updateData }));
              }
            } else if (payload.event === 'ROUND2_ACCESS_UPDATE_ALL') {
              const updateData = payload.data || {};
              const isR2Auth = Boolean(updateData.unlocked);
              if (isR2Auth) {
                localStorage.setItem('cyphora_round2_unlocked', 'true');
                sessionStorage.setItem('cyphora_round2_unlocked', 'true');
              } else {
                localStorage.removeItem('cyphora_round2_unlocked');
                sessionStorage.removeItem('cyphora_round2_unlocked');
                localStorage.removeItem('cyphora_round2_supervisor_override');
                sessionStorage.removeItem('cyphora_round2_supervisor_override');
              }
              setTeamData(prev => ({ ...prev, round2Unlocked: isR2Auth }));
              window.dispatchEvent(new CustomEvent('cyphora_round2_access_changed', { detail: updateData }));
            } else if (payload.event === 'ROUND3_ACCESS_UPDATE') {
              const cur = teamDataRef.current;
              const savedId = parseInt(localStorage.getItem('cyphora_team_id'), 10) || cur.id;
              const searchName = (localStorage.getItem('cyphora_team_name') || cur.name || '').toLowerCase();
              const updateData = payload.data || {};
              if ((updateData.team_id && updateData.team_id === savedId) ||
                  (updateData.team_name && updateData.team_name.toLowerCase() === searchName)) {
                const isR3Auth = Boolean(updateData.unlocked);
                if (isR3Auth) {
                  localStorage.setItem('cyphora_round3_unlocked', 'true');
                  sessionStorage.setItem('cyphora_round3_unlocked', 'true');
                } else {
                  localStorage.removeItem('cyphora_round3_unlocked');
                  sessionStorage.removeItem('cyphora_round3_unlocked');
                  localStorage.removeItem('cyphora_round3_supervisor_override');
                  sessionStorage.removeItem('cyphora_round3_supervisor_override');
                  if (savedId) {
                    try { sessionStorage.removeItem(`cyphora_round3_override_${savedId}`); } catch (_) {}
                  }
                }
                setTeamData(prev => ({ ...prev, round3Unlocked: isR3Auth }));
                window.dispatchEvent(new CustomEvent('cyphora_round3_access_changed', { detail: updateData }));
              }
            } else if (payload.event === 'ROUND3_ACCESS_UPDATE_ALL') {
              const updateData = payload.data || {};
              const isR3Auth = Boolean(updateData.unlocked);
              if (isR3Auth) {
                localStorage.setItem('cyphora_round3_unlocked', 'true');
                sessionStorage.setItem('cyphora_round3_unlocked', 'true');
              } else {
                localStorage.removeItem('cyphora_round3_unlocked');
                sessionStorage.removeItem('cyphora_round3_unlocked');
                localStorage.removeItem('cyphora_round3_supervisor_override');
                sessionStorage.removeItem('cyphora_round3_supervisor_override');
              }
              setTeamData(prev => ({ ...prev, round3Unlocked: isR3Auth }));
              window.dispatchEvent(new CustomEvent('cyphora_round3_access_changed', { detail: updateData }));
            }
          } catch (e) {
            console.error('Failed to parse WS payload', e);
          }
        };

        socket.onclose = () => {
          setIsWsConnected(false);
          if (pingInterval) clearInterval(pingInterval);
          reconnectTimeout = setTimeout(connect, 3000);
        };

        socket.onerror = () => {
          setIsWsConnected(false);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (pingInterval) clearInterval(pingInterval);
    };
  }, [teamData.name]);

  const handleBeginClick = () => {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    setModalMode('register');
    setRegisterError('');
    setResumeError('');
    setShowTeamModal(true);
  };

  const completeRegistration = (finalName, finalMember1, finalMember2, teamId = null, currentScore = 0, currentStanding = 'Unranked', token = '') => {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    if (token) {
      sessionStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_token', token);
    }
    if (teamId) {
      sessionStorage.setItem('cyphora_team_id', String(teamId));
      localStorage.setItem('cyphora_team_id', String(teamId));
    }
    sessionStorage.setItem('cyphora_team_name', finalName);
    localStorage.setItem('cyphora_team_name', finalName);
    if (finalMember1) {
      sessionStorage.setItem('cyphora_member1', finalMember1);
      localStorage.setItem('cyphora_member1', finalMember1);
    }
    if (finalMember2) {
      sessionStorage.setItem('cyphora_member2', finalMember2);
      localStorage.setItem('cyphora_member2', finalMember2);
    }

    // Clear previous OS session and lock states to prevent cross-team bleed
    try {
      sessionStorage.removeItem('cyphora_os_session');
      sessionStorage.removeItem('cyphora_os_locked');
      localStorage.removeItem('cyphora_vfs_data');
    } catch (e) {}

    setRound1State(buildDefaultRound1State(finalName));

    setTeamData(prev => ({
      ...prev,
      id: teamId || prev.id,
      name: finalName,
      member1: finalMember1,
      member2: finalMember2,
      standing: currentStanding !== 'Unranked' ? currentStanding : prev.standing,
      score: currentScore !== undefined ? currentScore : prev.score,
      isSelected: true,
      round2Unlocked: false
    }));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'identify', team: finalName, team_id: teamId }));
    }

    setShowTeamModal(false);
    setStage('waking');
    if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    wakeTimerRef.current = setTimeout(() => setStage('prologue'), 6200);
  };

  const completeResume = async (team, token) => {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }

    if (token) {
      sessionStorage.setItem('cyphora_token', token);
      localStorage.setItem('cyphora_token', token);
    }
    sessionStorage.setItem('cyphora_team_id', String(team.id));
    sessionStorage.setItem('cyphora_team_name', team.name);
    localStorage.setItem('cyphora_team_id', String(team.id));
    localStorage.setItem('cyphora_team_name', team.name);

    if (team.member1) {
      sessionStorage.setItem('cyphora_member1', team.member1);
      localStorage.setItem('cyphora_member1', team.member1);
    }
    if (team.member2) {
      sessionStorage.setItem('cyphora_member2', team.member2);
      localStorage.setItem('cyphora_member2', team.member2);
    }

    const isR2Auth = Boolean(team.round2_unlocked || (team.current_stage && team.current_stage >= 2));
    sessionStorage.setItem('cyphora_round2_unlocked', String(isR2Auth));
    localStorage.setItem('cyphora_round2_unlocked', String(isR2Auth));

    setTeamData({
      id: team.id,
      name: team.name,
      member1: team.member1 || '',
      member2: team.member2 || '',
      standing: team.standing ? formatOrdinal(team.standing) : 'Unranked',
      score: team.score || 0,
      isSelected: true,
      round2Unlocked: isR2Auth
    });

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'identify', team: team.name, team_id: team.id }));
    }

    setShowTeamModal(false);

    // Rehydrate complete task completion record directly from central database
    const syncResult = await syncCompletedTasksFromBackend(team.id, team.name, token);

    // Clear any previous OS locks and stale session windows so resuming player starts fresh inside the OS
    try {
      sessionStorage.removeItem('cyphora_os_locked');
      sessionStorage.removeItem('cyphora_os_session');
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
      if (isR2Auth || (syncResult && syncResult.completedCount >= 12)) {
        sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
      }
    } catch (e) {}

    // Resuming returning players always directly enters the OS!
    if (isR2Auth || (syncResult && syncResult.completedCount >= 12)) {
      setInitialAppId('round2');
    } else {
      setInitialAppId('tasks');
    }
    setStage('os-boot');
  };

  const handleExitWorkstation = useCallback(() => {
    const confirmed = window.confirm(
      "Exit workstation session?\n\nThis resets this computer for the next batch of participants.\nAll team progress, scores, and completed tasks remain permanently preserved on the central server and can be resumed at any time using your Team Name and PIN."
    );
    if (!confirmed) return;

    clearRound1LocalData();
    try {
      sessionStorage.clear();
      localStorage.removeItem('cyphora_token');
      localStorage.removeItem('cyphora_team_id');
      localStorage.removeItem('cyphora_team_name');
      localStorage.removeItem('cyphora_member1');
      localStorage.removeItem('cyphora_member2');
      localStorage.removeItem('cyphora_round2_unlocked');
      localStorage.removeItem('cyphora_vfs_data');
      localStorage.removeItem('cyphora_os_session');
      localStorage.removeItem('cyphora_os_locked');
      localStorage.removeItem('cyphora_round2_phase');
      localStorage.removeItem('cyphora_round2_image1_data');
      localStorage.removeItem('cyphora_round2_prompt');
      localStorage.removeItem('cyphora_round2_start_time');
      localStorage.removeItem('cyphora_round1_started_at');
      localStorage.removeItem('cyphora_round2_started_at');
      localStorage.removeItem('cyphora_round3_started_at');
      localStorage.removeItem('cyphora_round3_story_finished');
    } catch (e) {}

    setTeamData({
      id: null,
      name: '',
      member1: '',
      member2: '',
      standing: 'Unranked',
      score: 0,
      isSelected: false,
      round2Unlocked: false
    });
    setRound1State(buildDefaultRound1State());
    setRegisterTeamInput('');
    setRegisterPinInput('');
    setMember1Input('');
    setMember2Input('');
    setRegisterError('');
    setResumeTeamInput('');
    setResumePinInput('');
    setResumeError('');
    setModalMode('register');
    setShowTeamModal(false);
    setInitialAppId(null);
    setStage('initial');

    if (socketRef.current) {
      socketRef.current.close();
    }
  }, []);

  useEffect(() => {
    const handleSignOutEvent = () => handleExitWorkstation();
    window.addEventListener('cyphora_request_signout', handleSignOutEvent);
    return () => window.removeEventListener('cyphora_request_signout', handleSignOutEvent);
  }, [handleExitWorkstation]);

  const handleRegisterSubmit = async (e) => {
    if (e) e.preventDefault();
    setRegisterError('');
    const finalName = registerTeamInput.trim();
    if (!finalName) {
      setRegisterError('Please enter your team name.');
      return;
    }
    const cleanPin = registerPinInput.trim();
    if (!cleanPin) {
      setRegisterError('Please create a secret PIN.');
      return;
    }
    if (cleanPin.length < 4) {
      setRegisterError('Please create a secret PIN of at least 4 digits/characters.');
      return;
    }

    const finalMember1 = member1Input.trim();
    const finalMember2 = member2Input.trim();
    if (!finalMember1) {
      setRegisterError('Please enter Member 1 name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${API_BASE}/api/auth/register`;
      const bodyData = { name: finalName, pin: cleanPin, member1: finalMember1, member2: finalMember2 };

      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
      } catch {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
      }

      if (!res.ok) {
        let message = 'Registration failed';
        try {
          const err = await res.json();
          if (typeof err.detail === 'string') {
            message = err.detail;
          } else if (Array.isArray(err.detail) && err.detail.length > 0) {
            message = err.detail[0].msg || message;
          }
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setRegisterError(message);
        if (message.toLowerCase().includes('already taken') || message.toLowerCase().includes('already registered')) {
          setResumeTeamInput(finalName);
        }
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setIsSubmitting(false);
      completeRegistration(
        data.team.name,
        data.team.member1 || finalMember1,
        data.team.member2 || finalMember2,
        data.team.id,
        data.team.score,
        data.team.standing ? formatOrdinal(data.team.standing) : 'Unranked',
        data.token
      );
    } catch (err) {
      setIsSubmitting(false);
      console.warn('Backend server unavailable or network error:', err);
      setRegisterError('Central server is unreachable. Please verify network connection or proctor setup.');
    }
  };

  const handleResumeSubmit = async (e) => {
    if (e) e.preventDefault();
    setResumeError('');
    const finalName = resumeTeamInput.trim();
    if (!finalName) {
      setResumeError('Please enter your team name.');
      return;
    }
    const cleanPin = resumePinInput.trim();
    if (!cleanPin) {
      setResumeError('Please enter your team PIN.');
      return;
    }

    setIsSubmitting(true);
    try {
      const url = `${API_BASE}/api/auth/login`;
      const bodyData = { name: finalName, pin: cleanPin };

      let res;
      try {
        res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
      } catch {
        res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyData)
        });
      }

      if (!res.ok) {
        let message = 'Authentication failed';
        try {
          const err = await res.json();
          if (typeof err.detail === 'string') {
            message = err.detail;
          } else if (Array.isArray(err.detail) && err.detail.length > 0) {
            message = err.detail[0].msg || message;
          }
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setResumeError(message);
        setIsSubmitting(false);
        return;
      }

      const data = await res.json();
      setIsSubmitting(false);
      await completeResume(data.team, data.token);
    } catch (err) {
      setIsSubmitting(false);
      console.warn('Backend server unavailable or network error:', err);
      setResumeError('Central server is unreachable. Please verify network connection or proctor setup.');
    }
  };

  const handleBeginExpedition = async () => {
    // Clear any previous session lock flag when legitimately beginning expedition
    try {
      sessionStorage.removeItem('cyphora_os_locked');
      sessionStorage.setItem('cyphora_active_round', '1');
      sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
    } catch (e) { }

    // Transition to OS boot sequence - timer only starts when player lands on OS desktop
    setStage('os-boot');

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('[Round1] Fullscreen request denied', err);
      }
    }
  };

  const isRound1Completed = Boolean(
    round1State?.round1Status === 'COMPLETED' ||
    (Array.isArray(round1State?.tasks) && round1State.tasks.filter(t => t.status === 'COMPLETED').length >= 12) ||
    (Array.isArray(round1State?.completedTaskIds) && round1State.completedTaskIds.length >= 12) ||
    teamData?.round1Completed
  );

  const isStage2Unlocked = Boolean(
    teamData?.round2Unlocked ||
    teamData?.round2_unlocked ||
    (typeof sessionStorage !== 'undefined' && teamData?.id && sessionStorage.getItem(`cyphora_round2_override_${teamData.id}`) === 'true') ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round2_supervisor_override') === 'true') ||
    (isRound1Completed && (
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round2_unlocked') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round2_unlocked') === 'true')
    ))
  );

  const isStage3Unlocked = Boolean(
    teamData?.round3Unlocked ||
    teamData?.round3_unlocked ||
    (typeof sessionStorage !== 'undefined' && teamData?.id && sessionStorage.getItem(`cyphora_round3_override_${teamData.id}`) === 'true') ||
    (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_supervisor_override') === 'true') ||
    (isRound1Completed && (
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_unlocked') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_unlocked') === 'true')
    ))
  );

  const handleLevelClick = (level, unlocked) => {
    if (!unlocked) return;
    if (level === 1) {
      try {
        sessionStorage.removeItem('cyphora_os_locked');
        sessionStorage.setItem('cyphora_active_round', '1');
        sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
        sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
      } catch (e) {}
      if (setRound1State) {
        setRound1State(prev => prev ? { ...prev, finalMemoryVisible: false, celebrationDismissed: true } : prev);
      }
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setInitialAppId('tasks');
      setStage('os-boot');
      return;
    }
    if (level === 2) {
      const isR2Auth = Boolean(
        isStage2Unlocked ||
        teamData?.round2Unlocked ||
        sessionStorage.getItem('cyphora_round2_unlocked') === 'true' ||
        localStorage.getItem('cyphora_round2_unlocked') === 'true' ||
        sessionStorage.getItem('cyphora_round2_supervisor_override') === 'true' ||
        localStorage.getItem('cyphora_round2_supervisor_override') === 'true'
      );
      if (!isR2Auth) {
        alert('Round 2 is locked! Your team must complete Round 1 or receive administrator clearance to enter Round 2.');
        return;
      }
      try {
        sessionStorage.removeItem('cyphora_os_locked');
        sessionStorage.setItem('cyphora_active_round', '2');
        sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
        sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
        sessionStorage.setItem('cyphora_round2_unlocked', 'true');
      } catch (e) {}
      if (setRound1State) {
        setRound1State(prev => prev ? { ...prev, finalMemoryVisible: false, celebrationDismissed: true } : prev);
      }
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setInitialAppId('round2');
      setStage('os-boot');
      return;
    }
    if (level === 3) {
      const isR3Auth = Boolean(
        isStage3Unlocked ||
        teamData?.round3Unlocked ||
        sessionStorage.getItem('cyphora_round3_unlocked') === 'true' ||
        localStorage.getItem('cyphora_round3_unlocked') === 'true' ||
        sessionStorage.getItem('cyphora_round3_supervisor_override') === 'true' ||
        localStorage.getItem('cyphora_round3_supervisor_override') === 'true'
      );
      if (!isR3Auth) {
        alert('Round 3 is locked! Your team must receive administrator clearance to enter Round 3.');
        return;
      }
      try {
        sessionStorage.removeItem('cyphora_os_locked');
        sessionStorage.setItem('cyphora_active_round', '3');
        sessionStorage.setItem('cyphora_current_stage', 'os-desktop');
        sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
      } catch (e) {}
      if (setRound1State) {
        setRound1State(prev => prev ? { ...prev, finalMemoryVisible: false, celebrationDismissed: true } : prev);
      }
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setInitialAppId('round3');
      setStage('os-boot');
      return;
    }
    window.location.href = `/round${level}/index.html`;
  };

  const explorerList = Array.isArray(liveExplorers)
    ? liveExplorers.map(e => ({
        name: e.name,
        member1: e.member1,
        member2: e.member2,
        standing: `${formatOrdinal(e.rank)} (${e.score ?? 0} pts)`,
        score: e.score ?? 0,
        status: e.status || 'idle'
      }))
    : [];

  return (
    <div className={`app-container ${stage === 'main' ? 'main-stage' : ''}`}>

      {/* Background */}
      {stage !== 'os-boot' && stage !== 'os-desktop' && (
        <div className={`bg-container ${stage === 'waking' ? 'waking-bg' : ''}`}></div>
      )}

      {/* Eye blink overlay */}
      {(stage === 'waking' || stage === 'main') && (
        <div className={`eyelids-wrapper ${stage === 'waking' ? 'waking' : 'open'}`}>
          <div className="eyelid eyelid-top"></div>
          <div className="eyelid eyelid-bottom"></div>
        </div>
      )}

      {/* Initial screen */}
      {stage === 'initial' && (
        <ParticleTextEffect onStart={handleBeginClick} onClick={handleBeginClick} />
      )}

      {/* Team Registration & Session Recovery Modal */}
      {showTeamModal && (
        <div className="team-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) setShowTeamModal(false); }}>
          <div className="team-modal">
            <button
              type="button"
              className="team-modal-close"
              onClick={() => setShowTeamModal(false)}
              title="Close Modal"
            >
              <X size={18} />
            </button>

            <h2>{modalMode === 'register' ? 'Expedition Access' : 'Resume Expedition'}</h2>
            <p className="team-modal-subtitle">
              {modalMode === 'register'
                ? 'Register a new squad to begin the expedition.'
                : 'Enter your registered credentials to restore progress or access Round 2.'}
            </p>

            {modalMode === 'register' ? (
              /* Register Box */
              <div className="team-modal-section register-section">
                <div className="section-header">
                  <span className="section-title">Register New Team</span>
                  <span className="section-badge">New Batch</span>
                </div>

                <form onSubmit={handleRegisterSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
                  {/* Team Name */}
                  <div className="team-input-wrapper">
                    <label htmlFor="reg_team_name" className="team-input-label">
                      <span>Team Name</span>
                      <span className="label-hint">Must be globally unique</span>
                    </label>
                    <input
                      type="text"
                      name="reg_team_name"
                      id="reg_team_name"
                      className="team-input"
                      value={registerTeamInput}
                      onChange={(e) => setRegisterTeamInput(e.target.value)}
                      placeholder="e.g. CyberVanguard"
                      maxLength={30}
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-lpignore="true"
                      autoFocus
                      required
                    />
                  </div>

                  {/* Secret PIN */}
                  <div className="team-input-wrapper">
                    <label htmlFor="reg_team_pin" className="team-input-label">
                      <span>Create Team PIN</span>
                      <span className="label-hint">4+ chars — required to resume</span>
                    </label>
                    <div className="pin-input-container">
                      <input
                        type="text"
                        name="reg_team_pin_code"
                        id="reg_team_pin"
                        className={`team-input ${showRegisterPin ? '' : 'pin-mask-input'}`}
                        inputMode="numeric"
                        value={registerPinInput}
                        onChange={(e) => setRegisterPinInput(e.target.value)}
                        placeholder="Create 4-digit PIN"
                        maxLength={16}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        required
                      />
                      <button
                        type="button"
                        className="pin-toggle-btn"
                        onClick={() => setShowRegisterPin(!showRegisterPin)}
                        title={showRegisterPin ? 'Hide PIN' : 'Show PIN'}
                        tabIndex={-1}
                      >
                        {showRegisterPin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Two Team Members */}
                  <div className="team-members-grid">
                    <div className="team-input-wrapper">
                      <label htmlFor="reg_member_1" className="team-input-label">
                        <span>Member 1</span>
                      </label>
                      <input
                        type="text"
                        name="reg_member_1"
                        id="reg_member_1"
                        className="team-input"
                        value={member1Input}
                        onChange={(e) => setMember1Input(e.target.value)}
                        placeholder="First Explorer"
                        maxLength={30}
                        autoComplete="off"
                        spellCheck="false"
                        data-lpignore="true"
                        required
                      />
                    </div>
                    <div className="team-input-wrapper">
                      <label htmlFor="reg_member_2" className="team-input-label">
                        <span>Member 2 (Optional)</span>
                      </label>
                      <input
                        type="text"
                        name="reg_member_2"
                        id="reg_member_2"
                        className="team-input"
                        value={member2Input}
                        onChange={(e) => setMember2Input(e.target.value)}
                        placeholder="Second Explorer"
                        maxLength={30}
                        autoComplete="off"
                        spellCheck="false"
                        data-lpignore="true"
                      />
                    </div>
                  </div>

                  {/* Register Error Banner */}
                  {registerError && (
                    <div className="auth-error-alert">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertCircle size={15} color="#eb4d4b" style={{ flexShrink: 0 }} />
                        <span className="auth-error-text">{registerError}</span>
                      </div>
                      {(registerError.toLowerCase().includes('already taken') || registerError.toLowerCase().includes('already registered')) && (
                        <button
                          type="button"
                          className="auth-switch-link"
                          onClick={() => {
                            setResumeTeamInput(registerTeamInput);
                            setModalMode('resume');
                            setRegisterError('');
                            setResumeError('');
                          }}
                        >
                          Team already registered? Click to switch to Returning Player →
                        </button>
                      )}
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="submit" className="modal-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Registering...' : 'Register & Begin Expedition'}
                    </button>
                  </div>
                </form>

                {/* Returning Player Switcher Button Below Register */}
                <div className="modal-switch-divider">
                  <span className="divider-line" />
                  <span className="divider-text">RETURNING SQUAD?</span>
                  <span className="divider-line" />
                </div>
                <button
                  type="button"
                  className="returning-player-toggle-btn"
                  onClick={() => {
                    if (registerTeamInput.trim() && !resumeTeamInput.trim()) {
                      setResumeTeamInput(registerTeamInput.trim());
                    }
                    setModalMode('resume');
                    setRegisterError('');
                    setResumeError('');
                  }}
                >
                  <Key size={15} />
                  <span>Returning Player? Resume Expedition / Round 2 Login →</span>
                </button>
              </div>
            ) : (
              /* Returning Player Box */
              <div className="team-modal-section resume-section-container">
                <div className="section-header">
                  <span className="section-title">Resume / Round 2 Login</span>
                  <span className="section-badge">Returning Squad</span>
                </div>

                <form onSubmit={handleResumeSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
                  {/* Returning Team Name */}
                  <div className="team-input-wrapper">
                    <label htmlFor="resume_team_name" className="team-input-label">
                      <span>Registered Team Name</span>
                    </label>
                    <input
                      type="text"
                      name="resume_team_name"
                      id="resume_team_name"
                      className="team-input"
                      value={resumeTeamInput}
                      onChange={(e) => setResumeTeamInput(e.target.value)}
                      placeholder="Enter registered team name"
                      maxLength={30}
                      autoComplete="off"
                      spellCheck="false"
                      data-lpignore="true"
                      autoFocus
                      required
                    />
                  </div>

                  {/* Returning PIN */}
                  <div className="team-input-wrapper">
                    <label htmlFor="resume_team_pin" className="team-input-label">
                      <span>Team Secret PIN</span>
                      <span className="label-hint">PIN created at registration</span>
                    </label>
                    <div className="pin-input-container">
                      <input
                        type="text"
                        name="resume_team_pin_code"
                        id="resume_team_pin"
                        className={`team-input ${showResumePin ? '' : 'pin-mask-input'}`}
                        inputMode="numeric"
                        value={resumePinInput}
                        onChange={(e) => setResumePinInput(e.target.value)}
                        placeholder="Enter 4-digit PIN"
                        maxLength={16}
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck="false"
                        data-lpignore="true"
                        data-1p-ignore="true"
                        data-form-type="other"
                        required
                      />
                      <button
                        type="button"
                        className="pin-toggle-btn"
                        onClick={() => setShowResumePin(!showResumePin)}
                        title={showResumePin ? 'Hide PIN' : 'Show PIN'}
                        tabIndex={-1}
                      >
                        {showResumePin ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  {/* Resume Error Banner */}
                  {resumeError && (
                    <div className="auth-error-alert">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <AlertCircle size={15} color="#eb4d4b" style={{ flexShrink: 0 }} />
                        <span className="auth-error-text">{resumeError}</span>
                      </div>
                    </div>
                  )}

                  <div className="modal-actions">
                    <button type="submit" className="modal-submit-btn resume-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? 'Verifying...' : 'Verify PIN & Resume Expedition'}
                    </button>
                  </div>
                </form>

                {/* Back to Register Button */}
                <div className="modal-switch-divider">
                  <span className="divider-line" />
                  <span className="divider-text">NEW EXPEDITION SQUAD?</span>
                  <span className="divider-line" />
                </div>
                <button
                  type="button"
                  className="returning-player-toggle-btn back-btn"
                  onClick={() => {
                    if (resumeTeamInput.trim() && !registerTeamInput.trim()) {
                      setRegisterTeamInput(resumeTeamInput.trim());
                    }
                    setModalMode('register');
                    setRegisterError('');
                    setResumeError('');
                  }}
                >
                  <span>← Register a New Team</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {stage === 'prologue' && (
        <Prologue
          teamName={teamData.name}
          onBeginExpedition={handleBeginExpedition}
        />
      )}

      {/* Main landing */}
      {stage === 'main' && (
        <>
          {/* ── Explorers button ── */}
          <button
            className={`explorers-btn ${panelOpen ? 'active' : ''}`}
            onClick={() => setPanelOpen(o => !o)}
          >
            <Users size={18} />
            <span>Explorers</span>
            <ChevronRight size={14} className={`chevron ${panelOpen ? 'rotated' : ''}`} />
          </button>

          {/* ── Side panel ── */}
          <div className={`explorer-panel ${panelOpen ? 'open' : ''}`}>
            <div className="panel-header">
              <div className="panel-title-wrap">
                <h3>Other Explorers</h3>
                <span className={`live-badge ${isWsConnected ? 'connected' : 'syncing'}`}>
                  <span className="live-dot"></span> {isWsConnected ? 'LIVE' : 'SYNCING'}
                </span>
              </div>
              <button className="panel-close" onClick={() => setPanelOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="panel-list">
              {explorerList.length === 0 && (
                <div style={{ padding: '2.5rem 1.2rem', textAlign: 'center', color: '#8c8268', fontSize: '0.82rem', lineHeight: '1.5' }}>
                  No explorers connected yet.<br />
                  <span style={{ fontSize: '0.74rem', opacity: 0.7 }}>When participant workstations join, they will appear here live.</span>
                </div>
              )}
              {explorerList.map((e, i) => {
                const isYou = e.name.toLowerCase() === teamData.name.toLowerCase();
                return (
                  <div key={i} className={`explorer-row ${isYou ? 'you' : ''}`}>
                    <span className={`status-dot ${e.status}`}></span>
                    <div className="explorer-info">
                      <span className="explorer-name">
                        {e.name}{isYou ? ' (You)' : ''}
                      </span>
                      {(e.member1 || e.member2) && (
                        <span className="explorer-crew">
                          Crew: {e.member1 || 'M1'}{e.member2 ? ` & ${e.member2}` : ''}
                        </span>
                      )}
                      <span className="explorer-standing">{e.standing}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Backdrop click-away */}
          {panelOpen && (
            <div className="panel-backdrop" onClick={() => setPanelOpen(false)} />
          )}

          {/* Workstation Exit / Next Batch Button */}
          <button
            className="hub-signout-btn"
            onClick={handleExitWorkstation}
            title="Exit workstation and reset terminal for next batch"
          >
            <LogOut size={13} />
            <span>Exit Station</span>
          </button>

          {/* ── Main content ── */}
          <div className="main-ui">
            <div className="header-panel">
              <h1>CYPHORA</h1>
              <p className="team-name">Explorer: <span>{teamData.name}</span></p>
              {(teamData.member1 || teamData.member2) && (
                <p className="team-name" style={{ fontSize: '0.88rem', opacity: 0.85, marginTop: '0.2rem' }}>
                  Crew: <span>{teamData.member1 || 'Explorer 1'}{teamData.member2 ? ` & ${teamData.member2}` : ''}</span>
                </p>
              )}
              <p className="standing">Standing: <span>{teamData.standing}</span></p>
            </div>

            <div className="levels-container">
              {/* Stage 1 — OS Navigation */}
              <div className="level-card unlocked" onClick={() => handleLevelClick(1, true)}>
                <div className="icon-container"><Terminal size={48} /></div>
                <h2>OS Navigation</h2>
                <p>Stage 1</p>
                <button
                  className="enter-os-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(1, true);
                  }}
                >
                  <span>Enter OS</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Round 2 — Image Navigation */}
              <div className={`level-card ${isStage2Unlocked ? 'unlocked' : 'locked'}`} onClick={() => handleLevelClick(2, isStage2Unlocked)}>
                <div className="icon-container"><Compass size={48} /></div>
                <h2>Image Navigation</h2>
                <p>Round 2</p>
                <button
                  className="enter-os-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(2, isStage2Unlocked);
                  }}
                >
                  <span>{isStage2Unlocked ? 'Enter Round 2' : 'Locked (Admin Req)'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Round 3 — The Temple Trials */}
              <div className={`level-card ${isStage3Unlocked ? 'unlocked' : 'locked'}`} onClick={() => handleLevelClick(3, isStage3Unlocked)}>
                <div className="icon-container"><Code2 size={48} /></div>
                <h2>The Temple Trials</h2>
                <p>Round 3</p>
                <button
                  className="enter-os-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(3, isStage3Unlocked);
                  }}
                >
                  <span>{isStage3Unlocked ? 'Enter Round 3' : 'Locked (Admin Req)'}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Subtle Admin Portal Shortcut Link */}
          <a
            href="/admin"
            className="admin-shortcut-btn"
            title="Open CYPHORA Admin Command Portal"
            target="_blank"
            rel="noreferrer"
          >
            <Shield size={13} />
            <span>Admin</span>
          </a>
        </>
      )}

      {/* Stage 1 Virtual OS (Boot & Desktop Environment) */}
      {(stage === 'os-boot' || stage === 'os-desktop') && (
        <OSContainer
          stage={stage}
          setStage={setStage}
          teamData={teamData}
          onReturnToHub={() => {
            try {
              sessionStorage.removeItem('cyphora_active_round');
              sessionStorage.removeItem('cyphora_os_locked');
              sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
              sessionStorage.setItem('cyphora_current_stage', 'main');
            } catch (e) {}
            if (setRound1State) {
              setRound1State(prev => prev ? { ...prev, finalMemoryVisible: false, celebrationDismissed: true } : prev);
            }
            setInitialAppId(null);
            setStage('main');
          }}
          round1State={round1State}
          setRound1State={setRound1State}
          liveExplorers={liveExplorers}
          isWsConnected={isWsConnected}
          fetchLeaderboard={fetchLeaderboard}
          initialAppId={initialAppId}
        />
      )}

      {/* ── ROUND 1 TIME EXPIRED FULL-SCREEN LOCKOUT ── */}
      {isRound1LockedByTimer && !proctorOverrideRound1 && (stage === 'os-desktop' || stage === 'os-boot') && !(typeof sessionStorage !== 'undefined' && (sessionStorage.getItem('cyphora_active_round') === '2' || sessionStorage.getItem('cyphora_active_round') === '3')) && (
        <RoundTimerLockScreen
          round={1}
          roundName="Round 1 — OS Navigation"
          teamName={teamData?.name || 'Explorer'}
          onUnlockOverride={() => {
            setProctorOverrideRound1(true);
            setIsRound1LockedByTimer(false);
          }}
        />
      )}
    </div>
  );
}

export default App;
