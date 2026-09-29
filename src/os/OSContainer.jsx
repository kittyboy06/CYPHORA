import React, { useEffect } from 'react';
import { OSProvider, useOS } from './state/OSContext.jsx';
import { SystemHUD } from './shell/SystemHUD.jsx';
import { Desktop } from './shell/Desktop.jsx';
import { WindowManager } from './windows/WindowManager.jsx';
import { Taskbar } from './shell/Taskbar.jsx';
import { StartMenu } from './shell/StartMenu.jsx';
import { BlueScreenGate } from './shell/BlueScreenGate.jsx';
import { BootScreen } from './boot/BootScreen.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import { CompletionCelebration } from '../components/CompletionCelebration.jsx';
import './OSContainer.css';

function OSContent({ stage, setStage, teamData, round1State }) {
  const { windows, openApp, showExitBanner, requestFullscreen, dismissExitBanner } = useOS();

  useEffect(() => {
    if (stage === 'os-desktop' && windows.length === 0) {
      openApp('terminal');
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
          <SystemHUD />
          {round1State?.round1StartedAt && <TaskBoard round1State={round1State} />}
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
          onUnlock={async () => {
            dismissExitBanner();
            await requestFullscreen();
          }}
        />
      )}
    </div>
  );
}

export function OSContainer({ stage = 'os-desktop', setStage = () => {}, teamData, onReturnToHub, round1State, setRound1State }) {
  return (
    <OSProvider teamData={teamData} onReturnToHub={onReturnToHub} round1State={round1State} setRound1State={setRound1State}>
      <OSContent stage={stage} setStage={setStage} teamData={teamData} round1State={round1State} />
    </OSProvider>
  );
}
