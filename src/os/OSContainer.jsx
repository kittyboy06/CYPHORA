import React, { useEffect } from 'react';
import { OSProvider, useOS } from './state/OSContext.jsx';
import { SystemHUD } from './shell/SystemHUD.jsx';
import { Desktop } from './shell/Desktop.jsx';
import { WindowManager } from './windows/WindowManager.jsx';
import { Taskbar } from './shell/Taskbar.jsx';
import { StartMenu } from './shell/StartMenu.jsx';
import { FullscreenBanner } from './shell/FullscreenBanner.jsx';
import './OSContainer.css';

function OSDesktopContent() {
  const { windows, openApp } = useOS();

  // If no windows are open on initial load, auto-launch Terminal to welcome the participant
  useEffect(() => {
    if (windows.length === 0) {
      openApp('terminal');
    }
  }, []);

  return (
    <div className="os-desktop-root">
      {/* Persistent System HUD */}
      <SystemHUD />

      {/* Fullscreen Re-entry Banner */}
      <FullscreenBanner />

      {/* Main Workspace Area (Desktop Canvas & Window Manager) */}
      <main className="os-workspace-area">
        <Desktop />
        <WindowManager />
      </main>

      {/* Start Menu Overlay */}
      <StartMenu />

      {/* Pinned Bottom Taskbar */}
      <Taskbar />
    </div>
  );
}

export function OSContainer({ teamData, onReturnToHub }) {
  return (
    <OSProvider teamData={teamData} onReturnToHub={onReturnToHub}>
      <OSDesktopContent />
    </OSProvider>
  );
}
