import { useState, useEffect, useRef, useCallback } from 'react';
import { Terminal, Users, X, ChevronRight, Shield, Compass } from 'lucide-react';
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
  formatCountdown,
  recalculateRound1State,
} from './round1/round1Engine.js';
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

function App() {
  const [stage, setStage] = useState(() => (
    typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('stage') || 'initial')
      : 'initial'
  ));
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamInput, setTeamInput] = useState('');
  const [member1Input, setMember1Input] = useState('');
  const [member2Input, setMember2Input] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [liveExplorers, setLiveExplorers] = useState([]);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [teamData, setTeamData] = useState({
    id: null,
    name: '',
    member1: '',
    member2: '',
    standing: 'Unranked',
    score: 0,
    isSelected: false,
  });
  const [round1State, setRound1State] = useState(() => loadRound1State());
  const wakeTimerRef = useRef(null);
  const socketRef = useRef(null);
  const teamDataRef = useRef(teamData);
  const round1StateRef = useRef(round1State);
  const syncedTasksRef = useRef(new Set());

  useEffect(() => {
    teamDataRef.current = teamData;
  }, [teamData]);

  useEffect(() => {
    round1StateRef.current = round1State;
    persistRound1State(round1State);
  }, [round1State]);

  // Synchronize task completion with backend SQLite database
  const syncTaskSubmission = async (taskId, answer) => {
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
          proof: answer || null
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
  const syncCompletedTasksFromBackend = useCallback(async () => {
    try {
      const token = localStorage.getItem('cyphora_token');
      const teamId = teamDataRef.current?.id || localStorage.getItem('cyphora_team_id');
      const teamName = teamDataRef.current?.name || localStorage.getItem('cyphora_team_name');
      const headers = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      if (teamId) headers['X-Team-Id'] = String(teamId);
      if (teamName) headers['X-Team-Name'] = teamName;

      const res = await fetch(`${API_BASE}/api/stage1/tasks`, { headers });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.tasks)) {
          const completedKeys = new Set(data.tasks.filter(t => t.is_completed).map(t => t.key));
          if (completedKeys.size > 0) {
            setRound1State(prev => {
              const updatedTasks = prev.tasks.map(t => {
                if (completedKeys.has(t.id)) {
                  return { ...t, status: 'COMPLETED' };
                }
                return t;
              });
              return recalculateRound1State({
                ...prev,
                round1StartedAt: prev.round1StartedAt || new Date().toISOString(),
                round1Status: completedKeys.size === 12 ? 'COMPLETED' : 'IN_PROGRESS',
                isExpired: false,
                isTimerRunning: true,
                tasks: updatedTasks
              });
            });
          }
        }
      }
    } catch (err) {
      console.warn('[CYPHORA] Error fetching stage1 tasks from backend:', err);
    }
  }, []);

  // Synchronize global event countdown timer from backend
  const applyGlobalTimer = useCallback((timer) => {
    if (!timer) return;
    if (timer.action === 'start' && timer.ends_at) {
      const remainingMs = Math.max(0, new Date(timer.ends_at).getTime() - Date.now());
      setRound1State(prev => ({
        ...prev,
        isTimerRunning: remainingMs > 0,
        isExpired: remainingMs <= 0,
        remainingTimeMs: remainingMs,
        round1StartedAt: prev.round1StartedAt || timer.started_at,
        round1Status: remainingMs <= 0 ? 'TIME_EXPIRED' : 'IN_PROGRESS'
      }));
    } else if (timer.action === 'pause') {
      const remSec = timer.remaining_seconds !== undefined ? timer.remaining_seconds : 3600;
      setRound1State(prev => ({
        ...prev,
        isTimerRunning: false,
        remainingTimeMs: remSec * 1000
      }));
    } else if (timer.action === 'resume' && timer.ends_at) {
      const remainingMs = Math.max(0, new Date(timer.ends_at).getTime() - Date.now());
      setRound1State(prev => ({
        ...prev,
        isTimerRunning: remainingMs > 0,
        remainingTimeMs: remainingMs,
        round1Status: 'IN_PROGRESS'
      }));
    } else if (timer.action === 'reset') {
      const durationMs = (timer.duration_minutes || 60) * 60 * 1000;
      setRound1State(prev => ({
        ...prev,
        isTimerRunning: false,
        isExpired: false,
        remainingTimeMs: durationMs
      }));
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
          syncTaskSubmission(activeTask.id, event.payload.answer);
        }
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!round1State.isTimerRunning || round1State.isExpired || round1State.round1Status === 'COMPLETED') {
      return;
    }

    const tick = () => {
      setRound1State(prev => updateRound1TimerFromNow(prev));
    };

    tick();
    const intervalId = setInterval(tick, 1000);
    return () => clearInterval(intervalId);
  }, [round1State.isTimerRunning, round1State.isExpired, round1State.round1Status]);

  useEffect(() => {
    return () => { if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current); };
  }, []);

  // Strict full-webpage scroll lock for computer screen app (landing page & story page)
  useEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) {
      document.documentElement.scrollTop = 0;
      document.documentElement.scrollLeft = 0;
    }
    if (document.body) {
      document.body.scrollTop = 0;
      document.body.scrollLeft = 0;
    }

    const preventScroll = (e) => {
      const target = e.target;
      // Allow scrolling inside internal scrollable elements (e.g., explorer side panel list or OS app containers)
      if (target && target.closest && target.closest('.panel-list, .terminal-body, .window-body, .start-menu-content, .virtual-file-list, .text-editor-textarea, .desktop-leaderboard-list')) {
        return;
      }
      if (e.type === 'wheel' || e.type === 'touchmove') {
        e.preventDefault();
      }
      if (e.type === 'keydown') {
        const isInput = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
        if (!isInput && [' ', 'PageUp', 'PageDown', 'End', 'Home', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('wheel', preventScroll, { passive: false });
    window.addEventListener('touchmove', preventScroll, { passive: false });
    window.addEventListener('keydown', preventScroll, { passive: false });

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
      window.removeEventListener('wheel', preventScroll);
      window.removeEventListener('touchmove', preventScroll);
      window.removeEventListener('keydown', preventScroll);
      window.removeEventListener('scroll', handleWindowScroll);
    };
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    const container = document.querySelector('.app-container');
    if (container) {
      container.scrollTop = 0;
      container.scrollLeft = 0;
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
                score: self.score
              };
            });
          }
        }
        if (data.timer) {
          applyGlobalTimer(data.timer);
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
    let savedPin = '';
    let savedMember1 = '';
    let savedMember2 = '';
    let savedId = null;
    try {
      savedTeam = localStorage.getItem('cyphora_team_name') || '';
      savedPin = localStorage.getItem('cyphora_team_pin') || '';
      savedMember1 = localStorage.getItem('cyphora_member1') || '';
      savedMember2 = localStorage.getItem('cyphora_member2') || '';
      const rawId = localStorage.getItem('cyphora_team_id');
      if (rawId) savedId = parseInt(rawId, 10);
    } catch (err) {}

    const paramStage = params.get('stage');
    if (paramStage && ['initial', 'prologue', 'main'].includes(paramStage)) {
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
      setTeamInput(paramTeam || savedTeam);
    }
    if (savedPin) {
      setPinInput(savedPin);
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
                      score: self.score
                    };
                  });
                }
              }
              if (payload.timer) {
                applyGlobalTimer(payload.timer);
              }
            } else if (payload.event === 'EVENT_TIMER_SYNC') {
              applyGlobalTimer(payload.data);
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
    setShowTeamModal(true);
  };

  const completeRegistration = (finalName, finalPin, finalMember1, finalMember2, teamId = null, currentScore = 0, currentStanding = 'Unranked') => {
    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    }
    if (teamId) localStorage.setItem('cyphora_team_id', String(teamId));
    localStorage.setItem('cyphora_team_name', finalName);
    if (finalMember1) localStorage.setItem('cyphora_member1', finalMember1);
    if (finalMember2) localStorage.setItem('cyphora_member2', finalMember2);
    if (finalPin) localStorage.setItem('cyphora_team_pin', finalPin);

    // Clear previous OS session and lock states to prevent cross-team bleed
    try {
      sessionStorage.removeItem('cyphora_os_session');
      sessionStorage.removeItem('cyphora_os_locked');
      localStorage.removeItem('cyphora_vfs_data');
    } catch (e) {}

    setRound1State(previousState => {
      const savedTeamId = normalizeTeamName(previousState?.teamId);
      const currentTeamName = normalizeTeamName(finalName);
      const sameTeam = !savedTeamId
        || savedTeamId === currentTeamName
        || savedTeamId.startsWith(`${currentTeamName}-`);
      return sameTeam ? previousState : buildDefaultRound1State(finalName);
    });

    setTeamData(prev => ({
      ...prev,
      id: teamId || prev.id,
      name: finalName,
      member1: finalMember1,
      member2: finalMember2,
      standing: currentStanding !== 'Unranked' ? currentStanding : prev.standing,
      score: currentScore !== undefined ? currentScore : prev.score
    }));

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ action: 'identify', team: finalName, team_id: teamId }));
    }

    setShowTeamModal(false);
    setStage('waking');
    if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current);
    wakeTimerRef.current = setTimeout(() => setStage('prologue'), 6200);
  };

  const handleTeamSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const finalName = teamInput.trim();
    if (!finalName) {
      setAuthError('Please enter your team name.');
      return;
    }
    const finalPin = pinInput.trim();
    if (!finalPin) {
      setAuthError('Please enter your 4-digit team PIN.');
      return;
    }
    const finalMember1 = member1Input.trim();
    const finalMember2 = member2Input.trim();

    try {
      const res = await fetch(`${API_BASE}/api/auth/quick-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: finalName,
          pin: finalPin,
          member1: finalMember1,
          member2: finalMember2
        })
      });

      if (!res.ok) {
        let message = 'Authentication failed';
        try {
          const err = await res.json();
          message = err.detail || message;
        } catch {
          try {
            const text = await res.text();
            if (text) message = text;
          } catch {}
        }
        setAuthError(message);
        return;
      }

      const data = await res.json();
      localStorage.setItem('cyphora_token', data.token);
      localStorage.setItem('cyphora_team_id', String(data.team.id));
      localStorage.setItem('cyphora_team_name', data.team.name);
      localStorage.setItem('cyphora_team_pin', finalPin);
      if (finalMember1) localStorage.setItem('cyphora_member1', finalMember1);
      if (finalMember2) localStorage.setItem('cyphora_member2', finalMember2);

      completeRegistration(
        data.team.name,
        finalPin,
        data.team.member1 || finalMember1,
        data.team.member2 || finalMember2,
        data.team.id,
        data.team.score,
        data.team.standing ? formatOrdinal(data.team.standing) : 'Unranked'
      );
    } catch (err) {
      setAuthError('The server is unavailable. Verify that run_server.py is running.');
    }
  };

  const handleBeginExpedition = async () => {
    let started;
    try {
      started = beginRound1(round1State, {
        teamId: normalizeTeamName(teamData.name),
        sessionId: `session-${Date.now()}`,
        teamName: teamData.name
      });
      setRound1State(started);
      setStage('os-boot');
    } catch (error) {
      console.error('[Round1] Failed to begin expedition', error);
      setRound1State(loadRound1State());
      setAuthError('The expedition state was repaired. Press BEGIN EXPEDITION again.');
      return;
    }

    if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.warn('[Round1] Fullscreen request denied', err);
      }
    }
  };

  const handleLevelClick = (level, unlocked) => {
    if (!unlocked) return;
    if (level === 1) {
      try {
        sessionStorage.removeItem('cyphora_os_locked');
      } catch (e) {}
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
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
        <ParticleTextEffect onClick={handleBeginClick} />
      )}

      {/* Team & 2 Members Identification Modal */}
      {showTeamModal && (
        <div className="team-modal-backdrop">
          <div className="team-modal">
            <h2>Identify Your Team</h2>
            <p>Declare your expedition team name, two crew members, and secret PIN.</p>
            <form onSubmit={handleTeamSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
              {/* Team Name */}
              <div className="team-input-wrapper">
                <input
                  type="text"
                  name="cyphora_team_identity"
                  id="cyphora_team_identity"
                  className="team-input"
                  placeholder="Enter Team Name..."
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  autoFocus
                  maxLength={30}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  required
                />
              </div>

              {/* Two Team Members */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.8rem' }}>
                <div className="team-input-wrapper">
                  <input
                    type="text"
                    name="cyphora_crew_alpha"
                    className="team-input"
                    placeholder="Member 1 Name..."
                    value={member1Input}
                    onChange={(e) => setMember1Input(e.target.value)}
                    maxLength={30}
                    autoComplete="off"
                    spellCheck="false"
                    data-lpignore="true"
                  />
                </div>
                <div className="team-input-wrapper">
                  <input
                    type="text"
                    name="cyphora_crew_beta"
                    className="team-input"
                    placeholder="Member 2 Name..."
                    value={member2Input}
                    onChange={(e) => setMember2Input(e.target.value)}
                    maxLength={30}
                    autoComplete="off"
                    spellCheck="false"
                    data-lpignore="true"
                  />
                </div>
              </div>

              {/* Secret Team PIN - Uses text type with CSS text-security disc to prevent browser breached-password popups */}
              <div className="team-input-wrapper" style={{ marginTop: '0.8rem' }}>
                <input
                  type="text"
                  name="cyphora_team_key"
                  id="cyphora_team_key"
                  inputMode="numeric"
                  className="team-input pin-mask-input"
                  placeholder="Secret Team PIN (e.g. 1234)..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={8}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                />
              </div>

              {authError && (
                <p style={{ color: '#e06c75', fontSize: '0.85rem', marginTop: '0.5rem' }}>{authError}</p>
              )}
              <div className="modal-actions">
                <button type="submit" className="modal-submit-btn">
                  Proceed
                </button>
              </div>
            </form>
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

              {/* Stage 2 — Image Navigation */}
              <div className="level-card unlocked" onClick={() => handleLevelClick(2, true)}>
                <div className="icon-container"><Compass size={48} /></div>
                <h2>Image Navigation</h2>
                <p>Stage 2</p>
                <button
                  className="enter-os-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLevelClick(2, true);
                  }}
                >
                  <span>Enter Stage 2</span>
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
          onReturnToHub={() => setStage('main')}
          round1State={round1State}
          setRound1State={setRound1State}
          liveExplorers={liveExplorers}
          isWsConnected={isWsConnected}
          fetchLeaderboard={fetchLeaderboard}
        />
      )}
    </div>
  );
}

export default App;
