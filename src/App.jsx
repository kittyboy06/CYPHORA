import { useState, useEffect, useRef } from 'react';
import { Terminal, Users, X, ChevronRight, Shield } from 'lucide-react';
import { BootScreen } from './os/boot/BootScreen.jsx';
import { OSContainer } from './os/OSContainer.jsx';
import './App.css';

// Fallback explorer data if server is unreachable
const EXPLORERS = [
  { name: 'Team Cipher',  standing: '1st (350 pts)', status: 'active' },
  { name: 'Team Vortex',  standing: '2nd (280 pts)', status: 'active' },
  { name: 'Team Nexus',   standing: '3rd (220 pts)', status: 'active' },
  { name: 'Team Phantom', standing: '4th (160 pts)', status: 'idle' },
  { name: 'Team Glitch',  standing: '5th (120 pts)', status: 'idle' },
  { name: 'Team Rogue',   standing: '6th (80 pts)',  status: 'idle' },
  { name: 'Team Epoch',   standing: '7th (40 pts)',  status: 'idle' },
  { name: 'Team Blaze',   standing: '8th (0 pts)',   status: 'idle' },
];

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDev = typeof window !== 'undefined' && window.location.port === '5173';
const API_BASE = isDev ? `http://${hostname}:8000` : '';
const WS_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_HOST = isDev ? `${hostname}:8000` : (typeof window !== 'undefined' ? window.location.host : 'localhost:8000');
const WS_BASE_URL = `${WS_PROTOCOL}//${WS_HOST}/ws/live`;

const formatOrdinal = (rank) => {
  if (!rank || isNaN(rank)) return 'Unranked';
  const n = parseInt(rank, 10);
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

function App() {
  const [stage, setStage] = useState('initial'); // 'initial' | 'waking' | 'main' | 'os-boot' | 'os-desktop'
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
    name: 'Wandering Nomad',
    member1: '',
    member2: '',
    standing: 'Unranked',
    score: 0,
    isSelected: false,
  });
  const wakeTimerRef = useRef(null);
  const socketRef = useRef(null);

  useEffect(() => {
    return () => { if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current); };
  }, []);

  // Fetch initial leaderboard from real-time database via REST
  const fetchLeaderboard = async (currentTeamName) => {
    try {
      const res = await fetch(`${API_BASE}/api/teams/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.teams) && data.teams.length > 0) {
          setLiveExplorers(data.teams);
          const activeName = (currentTeamName || teamData.name || '').toLowerCase();
          const self = data.teams.find(e => e.name.toLowerCase() === activeName);
          if (self) {
            setTeamData(prev => ({
              ...prev,
              member1: self.member1 || prev.member1,
              member2: self.member2 || prev.member2,
              standing: formatOrdinal(self.rank),
              score: self.score
            }));
          }
        }
      }
    } catch (err) {
      console.warn('[CYPHORA] REST leaderboard fetch error:', err);
    }
  };

  useEffect(() => {
    // Read from query params or localStorage
    const params = new URLSearchParams(window.location.search);
    const paramTeam = params.get('team');
    let savedTeam = '';
    let savedPin = '';
    let savedMember1 = '';
    let savedMember2 = '';
    try {
      savedTeam = localStorage.getItem('cyphora_team_name') || '';
      savedPin = localStorage.getItem('cyphora_team_pin') || '';
      savedMember1 = localStorage.getItem('cyphora_member1') || '';
      savedMember2 = localStorage.getItem('cyphora_member2') || '';
    } catch (err) {}

    const initialName = paramTeam || savedTeam || 'Wandering Nomad';
    setTeamData(prev => ({
      ...prev,
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

    // Immediate initial sync with real-time database
    fetchLeaderboard(initialName);
  }, []);

  // Re-fetch whenever explorer panel is toggled
  useEffect(() => {
    if (panelOpen) {
      fetchLeaderboard();
    }
  }, [panelOpen]);

  // Persistent Real-Time WebSocket Connection for all workstations
  useEffect(() => {
    let reconnectTimeout;
    let pingInterval;

    const connect = () => {
      try {
        const currentName = encodeURIComponent(teamData.name || '');
        const wsUrl = currentName ? `${WS_BASE_URL}?team=${currentName}` : WS_BASE_URL;
        const socket = new WebSocket(wsUrl);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsWsConnected(true);
          // Send identify payload if team name is set
          if (teamData.name) {
            socket.send(JSON.stringify({ action: 'identify', team: teamData.name }));
          }
          // Periodic ping / heartbeat every 25 seconds
          pingInterval = setInterval(() => {
            if (socket.readyState === WebSocket.OPEN) {
              socket.send(JSON.stringify({ action: 'ping' }));
            }
          }, 25000);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'LEADERBOARD_UPDATE' || payload.event === 'INITIAL_STATE') {
              if (Array.isArray(payload.data) && payload.data.length > 0) {
                setLiveExplorers(payload.data);
                const self = payload.data.find(
                  e => e.name.toLowerCase() === teamData.name.toLowerCase()
                );
                if (self) {
                  setTeamData(prev => ({
                    ...prev,
                    member1: self.member1 || prev.member1,
                    member2: self.member2 || prev.member2,
                    standing: formatOrdinal(self.rank),
                    score: self.score
                  }));
                }
              }
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
    setShowTeamModal(true);
  };

  const handleTeamSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const finalName = teamInput.trim() || 'Wandering Nomad';
    const finalPin = pinInput.trim() || '1234';
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
        const err = await res.json();
        setAuthError(err.detail || 'Authentication failed');
        return;
      }
      const data = await res.json();
      localStorage.setItem('cyphora_token', data.token);
      localStorage.setItem('cyphora_team_name', data.team.name);
      localStorage.setItem('cyphora_team_pin', finalPin);
      if (finalMember1) localStorage.setItem('cyphora_member1', finalMember1);
      if (finalMember2) localStorage.setItem('cyphora_member2', finalMember2);

      setTeamData(prev => ({
        ...prev,
        name: data.team.name,
        member1: data.team.member1 || finalMember1,
        member2: data.team.member2 || finalMember2,
        standing: data.team.standing ? formatOrdinal(data.team.standing) : 'Unranked',
        score: data.team.score
      }));

      // Immediately identify to active WebSocket
      if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ action: 'identify', team: data.team.name }));
      }
    } catch (err) {
      // Offline fallback
      localStorage.setItem('cyphora_team_name', finalName);
      if (finalMember1) localStorage.setItem('cyphora_member1', finalMember1);
      if (finalMember2) localStorage.setItem('cyphora_member2', finalMember2);
      setTeamData(prev => ({ ...prev, name: finalName, member1: finalMember1, member2: finalMember2 }));
    }

    setShowTeamModal(false);
    setStage('waking');
    wakeTimerRef.current = setTimeout(() => setStage('main'), 6000);
  };

  const handleSkip = async () => {
    const finalName = teamInput.trim() || teamData.name || 'Wandering Nomad';
    const finalPin = pinInput.trim() || '1234';
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
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('cyphora_token', data.token);
        localStorage.setItem('cyphora_team_name', data.team.name);
        localStorage.setItem('cyphora_team_pin', finalPin);
        if (finalMember1) localStorage.setItem('cyphora_member1', finalMember1);
        if (finalMember2) localStorage.setItem('cyphora_member2', finalMember2);

        setTeamData(prev => ({
          ...prev,
          name: data.team.name,
          member1: data.team.member1 || finalMember1,
          member2: data.team.member2 || finalMember2,
          standing: data.team.standing ? formatOrdinal(data.team.standing) : prev.standing,
          score: data.team.score
        }));

        if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
          socketRef.current.send(JSON.stringify({ action: 'identify', team: data.team.name }));
        }
      }
    } catch (err) {
      localStorage.setItem('cyphora_team_name', finalName);
      setTeamData(prev => ({ ...prev, name: finalName }));
    }

    setShowTeamModal(false);
    setStage('waking');
    wakeTimerRef.current = setTimeout(() => setStage('main'), 6000);
  };

  const handleLevelClick = (level, unlocked) => {
    if (!unlocked) return;
    if (level === 1) {
      if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      }
      setStage('os-boot');
      return;
    }
    window.location.href = `/round${level}/index.html`;
  };

  const explorerList = liveExplorers.length > 0
    ? liveExplorers.map(e => ({
        name: e.name,
        member1: e.member1,
        member2: e.member2,
        standing: `${formatOrdinal(e.rank)} (${e.score ?? 0} pts)`,
        status: e.status || 'idle'
      }))
    : (
      EXPLORERS.some(e => e.name.toLowerCase() === teamData.name.toLowerCase())
        ? EXPLORERS
        : [
            { name: teamData.name, standing: teamData.standing, status: 'active' },
            ...EXPLORERS
          ]
    );

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
        <button className="enter-btn" onClick={handleBeginClick}>Begin Journey</button>
      )}

      {/* Team & 2 Members Identification Modal */}
      {showTeamModal && (
        <div className="team-modal-backdrop">
          <div className="team-modal">
            <h2>Identify Your Team</h2>
            <p>Declare your expedition team name, two crew members, and secret PIN.</p>
            <form onSubmit={handleTeamSubmit}>
              {/* Team Name */}
              <div className="team-input-wrapper">
                <input
                  type="text"
                  className="team-input"
                  placeholder="Enter Team Name..."
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  autoFocus
                  maxLength={30}
                  required
                />
              </div>

              {/* Two Team Members */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', marginTop: '0.8rem' }}>
                <div className="team-input-wrapper">
                  <input
                    type="text"
                    className="team-input"
                    placeholder="Member 1 Name..."
                    value={member1Input}
                    onChange={(e) => setMember1Input(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <div className="team-input-wrapper">
                  <input
                    type="text"
                    className="team-input"
                    placeholder="Member 2 Name..."
                    value={member2Input}
                    onChange={(e) => setMember2Input(e.target.value)}
                    maxLength={30}
                  />
                </div>
              </div>

              {/* Secret Team PIN */}
              <div className="team-input-wrapper" style={{ marginTop: '0.8rem' }}>
                <input
                  type="password"
                  className="team-input"
                  placeholder="Secret Team PIN (e.g. 1234)..."
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  maxLength={8}
                />
              </div>

              {authError && (
                <p style={{ color: '#e06c75', fontSize: '0.85rem', marginTop: '0.5rem' }}>{authError}</p>
              )}
              <div className="modal-actions">
                <button type="submit" className="modal-submit-btn">
                  Proceed
                </button>
                <button type="button" className="modal-skip-btn" onClick={handleSkip}>
                  Skip
                </button>
              </div>
            </form>
          </div>
        </div>
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

      {/* Stage 1 Virtual OS Boot Screen */}
      {stage === 'os-boot' && (
        <BootScreen
          teamName={teamData.name}
          onComplete={() => setStage('os-desktop')}
        />
      )}

      {/* Stage 1 Virtual OS Desktop Environment */}
      {stage === 'os-desktop' && (
        <OSContainer
          teamData={teamData}
          onReturnToHub={() => setStage('main')}
        />
      )}
    </div>
  );
}

export default App;
