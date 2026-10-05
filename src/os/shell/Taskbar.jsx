import React from 'react';
import {
  Terminal,
  Folder,
  FileText,
  Volume2,
  VolumeX,
  Wifi,
  AppWindow,
  Compass,
  Settings,
  RefreshCw,
  Info,
  QrCode,
  Image,
  BarChart2,
  GitCompare,
  CheckSquare,
  Maximize,
  Minimize,
  LogOut,
  Clock
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { formatCountdown } from '../../round1/round1Engine.js';

export function Taskbar() {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    isStartMenuOpen,
    toggleStartMenu,
    isMuted,
    toggleMute,
    round1State,
    isFullscreen,
    requestFullscreen,
    onReturnToHub
  } = useOS();

  const getTaskIcon = (appId) => {
    switch (appId) {
      case 'tasks': return <CheckSquare size={15} />;
      case 'terminal': return <Terminal size={15} />;
      case 'file-manager': return <Folder size={15} />;
      case 'text-editor': return <FileText size={15} />;
      case 'converter': return <RefreshCw size={15} />;
      case 'metadata-inspector': return <Info size={15} />;
      case 'qr-scanner': return <QrCode size={15} />;
      case 'image-inspector': return <Image size={15} />;
      case 'text-analyzer': return <BarChart2 size={15} />;
      case 'file-comparator': return <GitCompare size={15} />;
      case 'audio-inspector': return <Volume2 size={15} />;
      case 'settings': return <Settings size={15} />;
      default: return <AppWindow size={15} />;
    }
  };

  const handleTaskClick = (win) => {
    if (activeWindowId === win.id && !win.isMinimized) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  const handleToggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      requestFullscreen();
    } else {
      if (document.exitFullscreen) {
        await document.exitFullscreen();
      }
    }
  };

  return (
    <footer className="os-taskbar">
      {/* Start Button */}
      <button
        className={`taskbar-start-btn ${isStartMenuOpen ? 'active' : ''}`}
        onClick={(e) => {
          e.stopPropagation();
          toggleStartMenu();
        }}
      >
        <Compass size={18} className="start-icon" />
        <span className="start-text">START</span>
      </button>

      {/* Open Windows Tabs */}
      <div className="taskbar-tasks-container">
        {windows.map(win => {
          const isActive = activeWindowId === win.id && !win.isMinimized;
          return (
            <button
              key={win.id}
              className={`taskbar-tab ${isActive ? 'active-tab' : ''} ${win.isMinimized ? 'minimized-tab' : ''}`}
              onClick={() => handleTaskClick(win)}
              title={win.title}
            >
              <span className="tab-icon">{getTaskIcon(win.appId)}</span>
              <span className="tab-title">{win.title}</span>
            </button>
          );
        })}
      </div>

      {/* System Tray */}
      <div className="taskbar-tray">
        {/* Round 1 Timer */}
        {round1State?.round1StartedAt && (
          <div className="tray-timer" title="Round 1 Remaining Time">
            <Clock size={13} style={{ color: '#dfb125' }} />
            <span className="tray-timer-val">{formatCountdown(round1State.remainingTimeMs ?? 1200000)}</span>
          </div>
        )}

        <button
          className="tray-btn"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>

        <button
          className="tray-btn"
          onClick={toggleMute}
          title={isMuted ? 'Sound Muted' : 'Sound Active'}
        >
          {isMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
        </button>

        <div className="tray-indicator online" title="Workstation Online">
          <Wifi size={14} />
        </div>

        <button
          className="tray-btn tray-return-btn"
          onClick={onReturnToHub}
          title="Return to Expedition Hub"
        >
          <LogOut size={14} />
          <span className="tray-return-text">Hub</span>
        </button>
      </div>
    </footer>
  );
}
