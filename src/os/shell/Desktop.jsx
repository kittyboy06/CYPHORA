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
  FilePlus,
  RotateCcw,
  Trophy,
  Radio
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { SET_PRESENTATIONS } from '../../round1/taskContent.js';
import { ROUND_1_SETS } from '../../round1/round1Engine.js';

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
  const [contextMenu, setContextMenu] = useState(null);

  useEffect(() => {
    if (typeof fetchLeaderboard === 'function') {
      fetchLeaderboard();
      const pollTimer = setInterval(() => {
        fetchLeaderboard();
      }, 7000);
      return () => clearInterval(pollTimer);
    }
  }, [fetchLeaderboard]);

  const displayTeams = Array.isArray(liveExplorers) && liveExplorers.length > 0
    ? liveExplorers
    : (teamData?.name && teamData.name !== 'Wandering Nomad' && teamData.name !== 'Explorer'
        ? [{ rank: 1, name: teamData.name, score: teamData.score ?? 0, status: 'active' }]
        : []);

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

  const loadDesktopItems = () => {
    try {
      const files = vfs.listDir('/Desktop', false);
      setDesktopFiles(files);
    } catch (e) {
      console.error('Failed to load desktop items', e);
    }
  };

  useEffect(() => {
    loadDesktopItems();
  }, [vfs]);

  const handleDesktopClick = () => {
    setSelectedId(null);
    setContextMenu(null);
    closeStartMenu();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleCreateNewFile = () => {
    setContextMenu(null);
    const fileName = `note_${Date.now().toString().slice(-4)}.txt`;
    const targetPath = `/Desktop/${fileName}`;
    vfs.writeFile(targetPath, 'New document created.\n', 'desktop');
    loadDesktopItems();
    openApp('text-editor', {
      title: `Text Editor - ${fileName}`,
      meta: { filePath: targetPath }
    });
  };

  const handleResetDesktop = () => {
    setContextMenu(null);
    if (confirm('Reset Virtual Filesystem to default factory configuration?')) {
      vfs.resetVFS();
      loadDesktopItems();
    }
  };

  const systemApps = [
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
              <FileText size={32} className="desktop-icon-svg file-color" />
            </div>
            <span className="desktop-icon-label" title={file.name}>
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* Top-Right Desktop HUD Stack: Journey HUD + Synced Database Leaderboard */}
      <aside
        className="desktop-top-right-hud"
        aria-label="Expedition Progress and Leaderboard"
        onClick={(e) => {
          e.stopPropagation();
          closeStartMenu();
          setContextMenu(null);
        }}
      >
        <div className="desktop-journey-hud">
          <span>JOURNEY</span>
          <strong>{Math.round(round1State?.journeyProgress || 0)}%</strong>
          {setPresentation?.label ? (
            <small>{setPresentation.label} — {setPresentation.title}</small>
          ) : (
            <small>TIER 1 — ONE-STEP TECHNICAL RECONNAISSANCE</small>
          )}
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

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="desktop-context-menu"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="ctx-item"
            onClick={() => {
              setContextMenu(null);
              openApp('converter');
            }}
          >
            <RefreshCw size={14} />
            <span>Open Universal Converter</span>
          </button>
          <button
            className="ctx-item"
            onClick={() => {
              setContextMenu(null);
              openApp('terminal');
            }}
          >
            <Terminal size={14} />
            <span>Open Terminal</span>
          </button>
          <button
            className="ctx-item"
            onClick={() => {
              setContextMenu(null);
              openApp('file-manager');
            }}
          >
            <Folder size={14} />
            <span>Open File Manager</span>
          </button>
          <div className="ctx-sep" />
          <button className="ctx-item" onClick={handleCreateNewFile}>
            <FilePlus size={14} />
            <span>New Text Document</span>
          </button>
          <button className="ctx-item" onClick={handleResetDesktop}>
            <RotateCcw size={14} />
            <span>Reset VFS Filesystem</span>
          </button>
        </div>
      )}
    </div>
  );
}
