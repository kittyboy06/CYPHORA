import React from 'react';
import { Shield, Maximize, Minimize, Award, Clock } from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { formatCountdown, getSubsystemStatuses } from '../../round1/round1Engine.js';

const formatSimulatedClock = (value) => {
  if (!value) return 'CLOCK UNSYNCED';
  return value.replace('CYPHORA-EXPEDITION-', '').replace('-', ' ');
};

export function SystemHUD() {
  const { teamData, isFullscreen, requestFullscreen, round1State } = useOS();
  const subsystems = getSubsystemStatuses(round1State);

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

      {/* Middle: Team, Score & EFM Subsystems */}
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
        <div className="hud-divider">|</div>
        <div className="hud-subsystems-telemetry" title="EFM Field Subsystems: Restore all 4 to unlock the route to the Light">
          <span className={`hud-sub-badge ${subsystems.power === 'ONLINE' ? 'online' : 'crit'}`} title="Power Grid: Online after Set 1">
            ⚡ PWR
          </span>
          <span className={`hud-sub-badge ${subsystems.radio === 'ONLINE' ? 'online' : 'off'}`} title="Radio Transceiver: Online after Set 2">
            📻 RAD
          </span>
          <span className={`hud-sub-badge ${subsystems.navigation === 'ONLINE' ? 'online' : 'off'}`} title="Navigation Radar: Online after Set 3">
            🧭 NAV
          </span>
          <span className={`hud-sub-badge ${subsystems.archive === 'UNLOCKED' ? 'online' : 'lock'}`} title="Expedition Archive: Unlocked after Set 4">
            🗄️ ARC
          </span>
        </div>
      </div>

      {/* Right: Clock & Actions */}
      <div className="hud-right">
        {round1State?.round1StartedAt && (
          <div className="hud-round1-timer">
            <span className="hud-round1-label">ROUND 01</span>
            <span className="hud-round1-value">{formatCountdown(round1State.remainingTimeMs ?? (round1State?.round1DurationMs || 3600000))}</span>
          </div>
        )}
        <div className="hud-clock">
          <Clock size={13} />
          <span>{formatSimulatedClock(round1State?.simulatedClock)}</span>
        </div>

        <button
          className="hud-action-btn"
          onClick={handleToggleFullscreen}
          title={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
        >
          {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
        </button>
      </div>
    </header>
  );
}
