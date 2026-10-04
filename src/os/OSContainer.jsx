import React, { useEffect } from 'react';
import { OSProvider, useOS } from './state/OSContext.jsx';
import { Desktop } from './shell/Desktop.jsx';
import { WindowManager } from './windows/WindowManager.jsx';
import { Taskbar } from './shell/Taskbar.jsx';
import { StartMenu } from './shell/StartMenu.jsx';
import { BlueScreenGate } from './shell/BlueScreenGate.jsx';
import { BootScreen } from './boot/BootScreen.jsx';
import { CompletionCelebration } from '../components/CompletionCelebration.jsx';
import './OSContainer.css';

function OSContent({ stage, setStage, teamData, round1State }) {
  const { windows = [], openApp = () => {}, showExitBanner = false, exitReason = '', unlockGate = () => {} } = useOS();

  // Auto-launch Tasks app as native OS window upon entering OS desktop
  useEffect(() => {
    if (stage === 'os-desktop') {
      const hasTasks = windows.some(w => w.appId === 'tasks');
      if (!hasTasks) {
        openApp('tasks');
      }
    }
  }, [stage]);

  return (
    <div className="os-desktop-root">
      {stage === 'os-boot' ? (
        <BootScreen
          teamName={teamData?.name || 'Explorer'}
          onComplete={() => setStage('os-desktop')}
        />
      ) : (
        <>
          {round1State?.finalMemoryVisible && <CompletionCelebration />}
          <main className="os-workspace-area">
            <Desktop />
            <WindowManager />
          </main>
          <StartMenu />
          <Taskbar />
        </>
      )}
      {showExitBanner && (
        <BlueScreenGate
          reason={exitReason}
          onUnlock={unlockGate}
        />
      )}
    </div>
  );
}

export function OSContainer({
  stage = 'os-desktop',
  setStage = () => {},
  teamData,
  onReturnToHub,
  round1State,
  setRound1State,
  liveExplorers = [],
  isWsConnected = false,
  fetchLeaderboard = () => {}
}) {
  return (
    <OSProvider
      teamData={teamData}
      onReturnToHub={onReturnToHub}
      round1State={round1State}
      setRound1State={setRound1State}
      liveExplorers={liveExplorers}
      isWsConnected={isWsConnected}
      fetchLeaderboard={fetchLeaderboard}
    >
      <OSContent stage={stage} setStage={setStage} teamData={teamData} round1State={round1State} />
    </OSProvider>
  );
}
