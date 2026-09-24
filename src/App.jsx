import { useState, useEffect, useRef } from 'react';
import { Lock, Unlock, Terminal, Image, Code2, Users, X, ChevronRight } from 'lucide-react';
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

function App() {
  const [stage, setStage] = useState('initial'); // 'initial' | 'waking' | 'main'
  const [panelOpen, setPanelOpen] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamInput, setTeamInput] = useState('');
  const [teamData, setTeamData] = useState({
    name: 'Wandering Nomad',
    standing: 'Unranked',
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
    try {
      savedTeam = localStorage.getItem('cyphora_team_name') || '';
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
  }, []);

  const handleBeginClick = () => {
    setShowTeamModal(true);
  };

  const handleTeamSubmit = (e) => {
    if (e) e.preventDefault();
    const finalName = teamInput.trim() || teamData.name || 'Wandering Nomad';
    setTeamData(prev => ({ ...prev, name: finalName }));
    try {
      localStorage.setItem('cyphora_team_name', finalName);
    } catch (err) {}
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
    window.location.href = `/round${level}/index.html`;
  };

  const explorerList = EXPLORERS.some(e => e.name.toLowerCase() === teamData.name.toLowerCase())
    ? EXPLORERS
    : [
        { name: teamData.name, standing: teamData.standing, status: 'active' },
        ...EXPLORERS
      ];

  return (
    <div className={`app-container ${stage === 'main' ? 'main-stage' : ''}`}>

      {/* Background */}
      <div className={`bg-container ${stage === 'waking' ? 'waking-bg' : ''}`}></div>

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
            <p>Declare your team name to enter the CYPHORA expedition.</p>
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
              {!teamData.isSelected && (
                <p className="notice">Awaiting Selection for Deep Stages</p>
              )}
            </div>

            <div className="levels-container">
              {/* Stage 1 — OS Navigation, always unlocked */}
              <div className="level-card unlocked" onClick={() => handleLevelClick(1, true)}>
                <div className="icon-container"><Terminal size={48} /></div>
                <h2>OS Navigation</h2>
                <p>Stage 1</p>
                <div className="status"><Unlock size={18} /> Available</div>
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

              {/* Stage 2 — Image Regeneration */}
              <div
                className={`level-card ${teamData.isSelected ? 'unlocked' : 'locked'}`}
                onClick={() => handleLevelClick(2, teamData.isSelected)}
              >
                <div className="icon-container"><Image size={48} /></div>
                <h2>Image Regen</h2>
                <p>Stage 2</p>
                <div className="status">
                  {teamData.isSelected
                    ? <><Unlock size={18} /> Unlocked</>
                    : <><Lock   size={18} /> Locked</>}
                </div>
              </div>

              {/* Stage 3 — Parsons Puzzle */}
              <div
                className={`level-card ${teamData.isSelected ? 'unlocked' : 'locked'}`}
                onClick={() => handleLevelClick(3, teamData.isSelected)}
              >
                <div className="icon-container"><Code2 size={48} /></div>
                <h2>Parsons Puzzle</h2>
                <p>Stage 3</p>
                <div className="status">
                  {teamData.isSelected
                    ? <><Unlock size={18} /> Unlocked</>
                    : <><Lock   size={18} /> Locked</>}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
