import React from 'react';
import { Maximize, X } from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';

export function FullscreenBanner() {
  const { showExitBanner, requestFullscreen, dismissExitBanner } = useOS();

  if (!showExitBanner) return null;

  return (
    <div className="os-fullscreen-banner">
      <div className="banner-content">
        <span className="banner-text">
          ⚠️ Fullscreen mode was exited. Click to re-engage competition immersion.
        </span>
        <div className="banner-actions">
          <button className="banner-restore-btn" onClick={requestFullscreen}>
            <Maximize size={13} />
            <span>Re-enter Fullscreen</span>
          </button>
          <button className="banner-dismiss-btn" onClick={dismissExitBanner} title="Dismiss">
            <X size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
