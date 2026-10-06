import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  FileText,
  Settings,
  RefreshCw,
  Info,
  QrCode,
  Image as ImageIcon,
  BarChart2,
  GitCompare,
  Volume2,
  Trophy,
  Radio,
  Clock,
  CheckSquare,
  Compass,
  Eye,
  Sparkles,
  Zap,
  BookOpen
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { SET_PRESENTATIONS } from '../../round1/taskContent.js';
import { ROUND_1_SETS, getSubsystemStatuses, formatCountdown } from '../../round1/round1Engine.js';

export function Desktop() {
  const {
    vfs,
    openApp,
    closeStartMenu,
    round1State,
    liveExplorers = [],
    teamData,
    isWsConnected = false,
    fetchLeaderboard
  } = useOS();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (typeof fetchLeaderboard === 'function') {
      fetchLeaderboard();
      const pollTimer = setInterval(() => {
        fetchLeaderboard();
      }, 5000);
      return () => clearInterval(pollTimer);
    }
  }, [fetchLeaderboard]);

  const displayTeams = Array.isArray(liveExplorers) ? liveExplorers : [];

  const isCurrentTeam = (name, id) => {
    if (id && teamData?.id && id === teamData.id) return true;
    const savedId = parseInt(localStorage.getItem('cyphora_team_id'), 10);
    if (id && savedId && id === savedId) return true;
    if (!name || !teamData?.name) return false;
    const currentName = teamData.name.trim().toLowerCase();
    const savedName = (localStorage.getItem('cyphora_team_name') || '').trim().toLowerCase();
    const targetName = name.trim().toLowerCase();
    return targetName === currentName || targetName === savedName;
  };

  const activeTask = round1State?.tasks?.find(t => t.status === 'ACTIVE');
  const currentSetId = activeTask?.setId || (activeTask ? ROUND_1_SETS.find(s => s.tasks.includes(activeTask.id))?.id : null) || round1State?.activeSet || 'set1';
  const setPresentation = SET_PRESENTATIONS[currentSetId];
  const subsystems = getSubsystemStatuses(round1State);
  const remainingTimeMs = round1State?.remainingTimeMs ?? 1200000;
  const isCriticalTime = remainingTimeMs < 300000 && remainingTimeMs > 0;
  const isTimeExpired = Boolean(round1State?.isExpired || remainingTimeMs <= 0);
  const timerDisplay = formatCountdown(remainingTimeMs);
  const isRunning = Boolean(round1State?.isTimerRunning);

  const loadDesktopItems = () => {
    try {
      const files = vfs.listDir('/Desktop', false);
      const sorted = [...files].sort((a, b) => {
        const priority = { 'Getting Started.txt': 1, 'App Usage.txt': 2 };
        const pA = priority[a.name] || 99;
        const pB = priority[b.name] || 99;
        if (pA !== pB) return pA - pB;
        return a.name.localeCompare(b.name);
      });
      setDesktopFiles(sorted);
    } catch (e) {
      console.error('Failed to load desktop items', e);
    }
  };

  useEffect(() => {
    loadDesktopItems();
  }, [vfs]);

  const handleDesktopClick = () => {
    setSelectedId(null);
    closeStartMenu();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
  };

  const systemApps = [
    {
      id: 'round2',
      title: 'Stage 2: Image Navigation',
      icon: <Compass size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('round2')
    },
    {
      id: 'converter',
      title: 'Universal Converter',
      icon: <RefreshCw size={32} className="desktop-icon-svg file-color" />,
      action: () => openApp('converter')
    },
    {
      id: 'metadata-inspector',
      title: 'Metadata Inspector',
      icon: <Info size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('metadata-inspector')
    },
    {
      id: 'qr-scanner',
      title: 'QR Scanner',
      icon: <QrCode size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('qr-scanner')
    },
    {
      id: 'image-inspector',
      title: 'Image Inspector',
      icon: <ImageIcon size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('image-inspector')
    },
    {
      id: 'text-analyzer',
      title: 'Text Analyzer',
      icon: <BarChart2 size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('text-analyzer')
    },
    {
      id: 'file-comparator',
      title: 'File Comparison',
      icon: <GitCompare size={32} className="desktop-icon-svg file-color" />,
      action: () => openApp('file-comparator')
    },
    {
      id: 'audio-inspector',
      title: 'Audio Inspector',
      icon: <Volume2 size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('audio-inspector')
    },
    {
      id: 'file-manager',
      title: 'File Manager',
      icon: <Folder size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('file-manager')
    },
    {
      id: 'tasks',
      title: 'Task Terminal',
      icon: <CheckSquare size={32} className="desktop-icon-svg settings-color" />,
      action: () => openApp('tasks')
    },
    {
      id: 'terminal',
      title: 'Terminal',
      icon: <Terminal size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('terminal')
    },
    {
      id: 'text-editor',
      title: 'Text Editor',
      icon: <FileText size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('text-editor')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings size={32} className="desktop-icon-svg settings-color" />,
      action: () => openApp('settings')
    }
  ];

  return (
    <div
      className="os-desktop-canvas"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Pinned Top-Center Expedition Timer HUD */}
      <aside className="desktop-pinned-timer" aria-label="Expedition Countdown Timer">
        <div
          className={`pinned-timer-capsule ${isCriticalTime ? 'critical' : ''} ${isTimeExpired ? 'expired' : ''}`}
          title="Expedition Mission Timer — Live Remaining Time"
        >
          <div className="pinned-timer-glow" />
          <div className="pinned-timer-badge">
            <div className={`pinned-timer-dot ${isRunning ? 'running' : 'idle'}`} />
            <Clock size={16} className="pinned-timer-icon" />
          </div>
          <div className="pinned-timer-divider" />
          <div className="pinned-timer-content">
            <span className="pinned-timer-label">MISSION TIMER</span>
            <span className="pinned-timer-digits">{timerDisplay}</span>
          </div>
        </div>
      </aside>

      {/* Icon Grid */}
      <div className="desktop-icon-grid">
        {/* Core App Icons */}
        {systemApps.map(app => (
          <div
            key={app.id}
            className={`desktop-icon-cell ${selectedId === app.id ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(app.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              app.action();
            }}
          >
            <div className="desktop-icon-glyph">{app.icon}</div>
            <span className="desktop-icon-label">{app.title}</span>
          </div>
        ))}

        {/* Dynamic VFS /Desktop file icons */}
        {desktopFiles.map(file => (
          <div
            key={file.path}
            className={`desktop-icon-cell ${selectedId === file.path ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(file.path);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openApp('text-editor', {
                title: `Text Editor - ${file.name}`,
                meta: { filePath: file.path }
              });
            }}
          >
            <div className="desktop-icon-glyph">
              <FileText size={32} className={`desktop-icon-svg ${(file.name.includes('Getting Started') || file.name.includes('App Usage')) ? 'settings-color' : 'file-color'}`} />
            </div>
            <span className="desktop-icon-label" title={file.name}>
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* Top-Right Desktop HUD Stack: Monolith Telemetry HUD + Synced Database Leaderboard */}
      <aside
        className="desktop-top-right-hud"
        aria-label="Expedition Progress and Leaderboard"
        onClick={(e) => {
          e.stopPropagation();
          closeStartMenu();
        }}
      >
        <div className="desktop-journey-hud">
          <div className="journey-top-row">
            <span className="journey-target-title">TARGET: THE MONOLITH</span>
            <strong className="journey-pct">{Math.round(round1State?.journeyProgress || 0)}%</strong>
          </div>

          {/* Live Monolith Optical Feed / Telemetry */}
          <div className="monolith-telemetry-viewport" style={{ '--light-intensity': subsystems.lightIntensity }}>
            <div className="monolith-viewport-sky">
              <div className="monolith-spire-silhouette" />
              <div className="monolith-beacon-glow" />
              {subsystems.radio === 'ONLINE' && <div className="monolith-signal-waves" />}
              {subsystems.navigation === 'ONLINE' && (
                <div className="monolith-target-reticle">
                  <div className="reticle-ring" />
                  <div className="reticle-crosshair" />
                </div>
              )}
            </div>
            <div className="monolith-viewport-scanline" />
            <div className="monolith-viewport-caption">
              <span className="telemetry-tag">OPTICAL TELEMETRY</span>
              <span className="telemetry-status">{subsystems.routeStatusText}</span>
            </div>
          </div>

          <div className="journey-subsystems-mini">
            <span className={`sub-pill ${subsystems.power === 'ONLINE' ? 'on' : 'crit'}`} title="Power Grid: Online after Set 1">
              ⚡ PWR {subsystems.power}
            </span>
            <span className={`sub-pill ${subsystems.radio === 'ONLINE' ? 'on' : 'off'}`} title="Radio Transceiver: Online after Set 2">
              📻 RAD {subsystems.radio}
            </span>
            <span className={`sub-pill ${subsystems.navigation === 'ONLINE' ? 'on' : 'off'}`} title="Navigation Radar: Online after Set 3">
              🧭 NAV {subsystems.navigation}
            </span>
            <span className={`sub-pill ${subsystems.archive === 'UNLOCKED' ? 'on' : 'lock'}`} title="Expedition Archive: Unlocked after Set 4">
              🗄️ ARC {subsystems.archive}
            </span>
          </div>

          <div className="journey-route-badge">
            <small>ROUTE: <strong>{subsystems.routeToLight}</strong></small>
            <div className="journey-sub-note">{subsystems.stageDescription}</div>
          </div>
        </div>

        <div className="desktop-leaderboard-widget">
          <div className="desktop-leaderboard-header">
            <div className="desktop-leaderboard-title">
              <Trophy size={13} className="leaderboard-trophy-icon" />
              <span>EXPEDITION LEADERBOARD</span>
            </div>
            <div
              className={`desktop-leaderboard-sync-badge ${isWsConnected ? 'synced' : 'polling'}`}
              title={isWsConnected ? 'Real-time WebSocket connected' : 'Database sync active'}
            >
              <span className="sync-pulse-dot" />
              <span className="sync-label">{isWsConnected ? 'LIVE' : 'SYNCED'}</span>
            </div>
          </div>

          <div className="desktop-leaderboard-body">
            {displayTeams.length > 0 ? (
              <div className="desktop-leaderboard-list">
                {displayTeams.map((team, idx) => {
                  const isSelf = isCurrentTeam(team.name, team.id);
                  const rank = team.rank || idx + 1;
                  return (
                    <div
                      key={team.id || team.name || idx}
                      className={`desktop-leaderboard-row ${isSelf ? 'is-self' : ''}`}
                    >
                      <span className={`leaderboard-rank rank-${rank <= 3 ? rank : 'other'}`}>
                        #{rank}
                      </span>
                      <div className="leaderboard-team-info">
                        <span className="leaderboard-team-name" title={team.name}>
                          {team.name}
                        </span>
                        {isSelf && <span className="leaderboard-you-tag">YOU</span>}
                      </div>
                      <div className="leaderboard-score-pill">
                        <span className="score-num">{team.score ?? 0}</span>
                        <span className="score-unit">PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="desktop-leaderboard-empty">
                <Radio size={13} className="empty-radio-icon" />
                <span className="empty-title">Awaiting telemetry...</span>
                <span className="empty-subtitle">No teams recorded in database</span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
