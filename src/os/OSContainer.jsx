import React, { useEffect, useRef } from 'react';
import { OSProvider, useOS } from './state/OSContext.jsx';
import { Desktop } from './shell/Desktop.jsx';
import { WindowManager } from './windows/WindowManager.jsx';
import { Taskbar } from './shell/Taskbar.jsx';
import { StartMenu } from './shell/StartMenu.jsx';
import { BlueScreenGate } from './shell/BlueScreenGate.jsx';
import { BootScreen } from './boot/BootScreen.jsx';
import { CompletionCelebration } from '../components/CompletionCelebration.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import './OSContainer.css';

function OSContent({ stage, setStage, teamData, round1State, initialAppId }) {
  const { windows = [], openApp = () => {}, showExitBanner = false, exitReason = '', unlockGate = () => {} } = useOS();
  const lastOpenedAppRef = useRef(null);

  useEffect(() => {
    if (stage === 'os-desktop' && initialAppId && lastOpenedAppRef.current !== initialAppId) {
      lastOpenedAppRef.current = initialAppId;
      openApp(initialAppId);
    }
  }, [stage, initialAppId, openApp]);

  return (
    <div className="os-desktop-root">
      {stage === 'os-boot' ? (
        <BootScreen
          teamName={teamData?.name || 'Explorer'}
          onComplete={() => setStage('os-desktop')}
        />
      ) : (
        <>
          <TaskBoard round1State={round1State} />
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
  fetchLeaderboard = () => {},
  initialAppId = null
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
      <OSContent
        stage={stage}
        setStage={setStage}
        teamData={teamData}
        round1State={round1State}
        initialAppId={initialAppId}
      />
    </OSProvider>
  );
}
export default OSContainer;
