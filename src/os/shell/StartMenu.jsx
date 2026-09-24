import React, { useState } from 'react';
import {
  Search,
  Terminal,
  Folder,
  FileText,
  LogOut,
  Shield,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { APP_REGISTRY } from '../apps/registry.js';

export function StartMenu() {
  const { isStartMenuOpen, closeStartMenu, openApp, onReturnToHub, teamData } = useOS();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isStartMenuOpen) return null;

  const appList = Object.values(APP_REGISTRY);
  const filteredApps = appList.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAppIcon = (iconName) => {
    switch (iconName) {
      case 'Terminal': return <Terminal size={20} className="start-app-icon" />;
      case 'Folder': return <Folder size={20} className="start-app-icon folder" />;
      case 'FileText': return <FileText size={20} className="start-app-icon text" />;
      default: return <Layers size={20} className="start-app-icon" />;
    }
  };

  const handleLaunchApp = (appId) => {
    openApp(appId);
    closeStartMenu();
  };

  return (
    <div
      className="os-start-menu"
      onClick={(e) => e.stopPropagation()}
    >
      {/* Search Header */}
      <div className="start-menu-search">
        <Search size={16} className="search-icon" />
        <input
          type="text"
          placeholder="Search applications and commands..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          autoFocus
        />
      </div>

      {/* Main Apps Area */}
      <div className="start-menu-content">
        <div className="start-section-title">APPLICATIONS</div>
        <div className="start-apps-list">
          {filteredApps.map(app => (
            <button
              key={app.id}
              className="start-app-item"
              onClick={() => handleLaunchApp(app.id)}
            >
              <div className="start-app-icon-wrap">{getAppIcon(app.icon)}</div>
              <div className="start-app-info">
                <span className="start-app-title">{app.title}</span>
                <span className="start-app-cat">{app.category}</span>
              </div>
            </button>
          ))}
          {filteredApps.length === 0 && (
            <div className="start-no-results">No applications matched</div>
          )}
        </div>
      </div>

      {/* Footer Profile & Shutdown */}
      <div className="start-menu-footer">
        <div className="start-user-badge">
          <Shield size={16} className="user-icon" />
          <span className="user-name">{teamData.name || 'Navigator'}</span>
        </div>

        <button
          className="start-logout-btn"
          onClick={() => {
            closeStartMenu();
            onReturnToHub();
          }}
          title="Exit Virtual OS"
        >
          <LogOut size={15} />
          <span>Exit OS</span>
        </button>
      </div>
    </div>
  );
}
