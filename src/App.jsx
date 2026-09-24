import { useState, useEffect, useRef } from 'react';
import { Terminal, Users, X, ChevronRight } from 'lucide-react';
import { BootScreen } from './os/boot/BootScreen.jsx';
import { OSContainer } from './os/OSContainer.jsx';
import './App.css';

// Mock explorer data — replace with real API/backend data later
const EXPLORERS = [
  { name: 'Team Cipher',  standing: '1st', status: 'active' },
  { name: 'Team Vortex',  standing: '2nd', status: 'active' },
  { name: 'Team Nexus',   standing: '3rd', status: 'active' },
  { name: 'Team Phantom', standing: '4th', status: 'idle' },
  { name: 'Team Glitch',  standing: '5th', status: 'idle' },
  { name: 'Team Rogue',   standing: '6th', status: 'idle' },
  { name: 'Team Epoch',   standing: '7th', status: 'idle' },
  { name: 'Team Blaze',   standing: '8th', status: 'idle' },
];

const API_BASE = window.location.port === '5173' ? 'http://localhost:8000' : '';
const WS_URL = window.location.port === '5173'
  ? 'ws://localhost:8000/ws/live'
  : `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`;

function App() {
  const [stage, setStage] = useState('initial'); // 'initial' | 'waking' | 'main'
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamInput, setTeamInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [liveExplorers, setLiveExplorers] = useState([]);
  const [teamData, setTeamData] = useState({
    name: 'Wandering Nomad',
    standing: 'Unranked',
    score: 0,
    isSelected: false,
  });
  const wakeTimerRef = useRef(null);

  useEffect(() => {
    return () => { if (wakeTimerRef.current) clearTimeout(wakeTimerRef.current); };
  }, []);

  useEffect(() => {
    // Read from query params or localStorage
    const params = new URLSearchParams(window.location.search);
    const paramTeam = params.get('team');
    let savedTeam = '';
    let savedPin = '';
    try {
      savedTeam = localStorage.getItem('cyphora_team_name') || '';
      savedPin = localStorage.getItem('cyphora_team_pin') || '';
    } catch (err) {}

    const initialName = paramTeam || savedTeam || 'Wandering Nomad';
    setTeamData(prev => ({
      ...prev,
      name: initialName,
      standing: params.get('standing') || prev.standing,
      isSelected: params.get('selected') === 'true' || prev.isSelected,
    }));
    if (paramTeam || savedTeam) {
      setTeamInput(paramTeam || savedTeam);
    }
    if (savedPin) {
      setPinInput(savedPin);
    }
  }, []);

  // WebSocket Live Stream for 100 Workstations
  useEffect(() => {
    if (stage !== 'main') return;

    let socket;
    let reconnectTimeout;

    const connect = () => {
      try {
        socket = new WebSocket(WS_URL);
        socket.onopen = () => {
          console.log('[CYPHORA] Connected to live event stream');
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
                    standing: `${self.rank}`,
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
          reconnectTimeout = setTimeout(connect, 3000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (socket) socket.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [stage, teamData.name]);

  const handleBeginClick = () => {
    setShowTeamModal(true);
  };

  const handleTeamSubmit = async (e) => {
    if (e) e.preventDefault();
    setAuthError('');
    const finalName = teamInput.trim() || 'Wandering Nomad';
    const finalPin = pinInput.trim() || '1234';

    try {
      const res = await fetch(`${API_BASE}/api/auth/quick-join`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: finalName, pin: finalPin })
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
      setTeamData(prev => ({
        ...prev,
        name: data.team.name,
        standing: data.team.standing ? `${data.team.standing}` : 'Unranked',
        score: data.team.score
      }));
    } catch (err) {
      // Offline fallback
      localStorage.setItem('cyphora_team_name', finalName);
      setTeamData(prev => ({ ...prev, name: finalName }));
    }

    setShowTeamModal(false);
    setStage('waking');
    wakeTimerRef.current = setTimeout(() => setStage('main'), 6000);
  };

  const handleSkip = () => {
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
        standing: `${e.rank}${e.rank === 1 ? 'st' : e.rank === 2 ? 'nd' : e.rank === 3 ? 'rd' : 'th'} (${e.score} pts)`,
        status: e.status || 'active'
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

      {/* Team Name Modal */}
      {showTeamModal && (
        <div className="team-modal-backdrop">
          <div className="team-modal">
            <h2>Identify Your Team</h2>
            <p>Declare your team name and secret PIN to enter the CYPHORA expedition.</p>
            <form onSubmit={handleTeamSubmit}>
              <div className="team-input-wrapper">
                <input
                  type="text"
                  className="team-input"
                  placeholder="Enter Team Name..."
                  value={teamInput}
                  onChange={(e) => setTeamInput(e.target.value)}
                  autoFocus
                  maxLength={30}
                />
              </div>
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
              <h3>Other Explorers</h3>
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
