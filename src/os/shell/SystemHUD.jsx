import React, { useState, useEffect } from 'react';
import { Shield, Maximize, Minimize, LogOut, Award, Clock } from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';

export function SystemHUD() {
  const { teamData, isFullscreen, requestFullscreen, onReturnToHub } = useOS();
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

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
    <header className="os-system-hud">
      {/* Left: Branding */}
      <div className="hud-left">
        <div className="hud-brand">
          <Shield size={16} className="hud-brand-icon" />
          <span className="hud-brand-text">CYPHORA // OS NAVIGATOR</span>
        </div>
        <span className="hud-status-badge">STAGE 1</span>
      </div>

      {/* Middle: Team & Score Telemetry */}
      <div className="hud-center">
        <div className="hud-telemetry-item">
          <span className="hud-label">EXPLORER:</span>
          <span className="hud-val">{teamData.name || 'Anonymous'}</span>
        </div>
        <div className="hud-divider">|</div>
        <div className="hud-telemetry-item">
          <Award size={14} className="hud-gold-icon" />
          <span className="hud-label">STANDING:</span>
          <span className="hud-val highlight">{teamData.standing || 'Unranked'}</span>
        </div>
        <div className="hud-divider">|</div>
        <div className="hud-telemetry-item">
          <span className="hud-label">SCORE:</span>
          <span className="hud-val highlight">{teamData.score || 0} pts</span>
        </div>
      </div>

      {/* Right: Clock & Actions */}
      <div className="hud-right">
        <div className="hud-clock">
          <Clock size={13} />
          <span>{timeStr}</span>
        </div>

        <button
          className="hud-action-btn"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>

        <button
          className="hud-action-btn hud-exit-btn"
          onClick={onReturnToHub}
          title="Return to Expedition Hub"
        >
          <LogOut size={14} />
          <span>Return to Hub</span>
        </button>
      </div>
    </header>
  );
}
