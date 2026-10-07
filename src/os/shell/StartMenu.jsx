import React, { useState } from 'react';
import {
  CheckSquare,
  Search,
  Terminal,
  Folder,
  FileText,
  Shield,
  Layers,
  Settings,
  RefreshCw,
  Info,
  QrCode,
  Image as ImageIcon,
  BarChart2,
  GitCompare,
  Volume2,
  Compass,
  Eye,
  Sparkles,
  Zap,
  Trophy,
  BookOpen,
  LogOut,
  Code2
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { APP_REGISTRY } from '../apps/registry.js';

export function StartMenu() {
  const { isStartMenuOpen, closeStartMenu, openApp, teamData } = useOS();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isStartMenuOpen) return null;

  const appList = Object.values(APP_REGISTRY).filter(
    app => !['vision-target', 'prompt-studio', 'image-evaluator', 'leaderboard', 'jungle-code', 'image-navigation'].includes(app.id)
  );
  const filteredApps = appList.filter(app =>
    app.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    app.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAppIcon = (iconName) => {
    switch (iconName) {
      case 'CheckSquare': return <CheckSquare size={20} className="start-app-icon settings" />;
      case 'Compass': return <Compass size={20} className="start-app-icon folder" />;
      case 'Eye': return <Eye size={20} className="start-app-icon" />;
      case 'Sparkles': return <Sparkles size={20} className="start-app-icon text" />;
      case 'Zap': return <Zap size={20} className="start-app-icon settings" />;
      case 'Trophy': return <Trophy size={20} className="start-app-icon folder" />;
      case 'BookOpen': return <BookOpen size={20} className="start-app-icon" />;
      case 'Code2': return <Code2 size={20} className="start-app-icon text" />;
      case 'Terminal': return <Terminal size={20} className="start-app-icon" />;
      case 'Folder': return <Folder size={20} className="start-app-icon folder" />;
      case 'FileText': return <FileText size={20} className="start-app-icon text" />;
      case 'Settings': return <Settings size={20} className="start-app-icon settings" />;
      case 'RefreshCw': return <RefreshCw size={20} className="start-app-icon text" />;
      case 'Info': return <Info size={20} className="start-app-icon" />;
      case 'QrCode': return <QrCode size={20} className="start-app-icon text" />;
      case 'Image': return <ImageIcon size={20} className="start-app-icon folder" />;
      case 'BarChart2': return <BarChart2 size={20} className="start-app-icon" />;
      case 'GitCompare': return <GitCompare size={20} className="start-app-icon text" />;
      case 'Volume2': return <Volume2 size={20} className="start-app-icon settings" />;
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
        <div className="start-section-title">APPLICATIONS & TOOLS</div>
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

      {/* Footer Profile & Station Sign Out */}
      <div className="start-menu-footer">
        <div className="start-user-badge">
          <Shield size={16} className="user-icon" />
          <span className="user-name">{teamData?.name || 'Navigator'}</span>
        </div>
        <button
          className="start-logout-btn"
          onClick={() => {
            closeStartMenu();
            window.dispatchEvent(new CustomEvent('cyphora_request_signout'));
          }}
          title="Exit current workstation session for the next batch"
        >
          <LogOut size={13} />
          <span>Exit Station</span>
        </button>
      </div>
    </div>
  );
}
