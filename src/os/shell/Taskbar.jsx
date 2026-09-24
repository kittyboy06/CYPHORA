import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  FileText,
  Volume2,
  VolumeX,
  Wifi,
  AppWindow,
  Compass
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';

export function Taskbar() {
  const {
    windows,
    activeWindowId,
    focusWindow,
    minimizeWindow,
    isStartMenuOpen,
    toggleStartMenu,
    isMuted,
    toggleMute
  } = useOS();

  const [time, setTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTaskIcon = (appId) => {
    switch (appId) {
      case 'terminal': return <Terminal size={15} />;
      case 'file-manager': return <Folder size={15} />;
      case 'text-editor': return <FileText size={15} />;
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

        <div className="tray-clock">
          <span>{time}</span>
        </div>
      </div>
    </footer>
  );
}
