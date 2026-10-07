import React, { useEffect, useRef, useState } from 'react';
import { OSProvider, useOS } from './state/OSContext.jsx';
import { Desktop } from './shell/Desktop.jsx';
import { WindowManager } from './windows/WindowManager.jsx';
import { Taskbar } from './shell/Taskbar.jsx';
import { StartMenu } from './shell/StartMenu.jsx';
import { BlueScreenGate } from './shell/BlueScreenGate.jsx';
import { BootScreen } from './boot/BootScreen.jsx';
import { CompletionCelebration } from '../components/CompletionCelebration.jsx';
import { TaskBoard } from '../components/TaskBoard.jsx';
import { Round3PermissionModal } from './apps/round3/Round3PermissionModal.jsx';
import { Round3FullscreenView } from './apps/round3/Round3FullscreenView.jsx';
import './OSContainer.css';

const ROUND3_APP_IDS = ['round3', 'jungle-code', 'temple-trials'];

function OSContent({ stage, setStage, teamData, round1State, initialAppId }) {
  const {
    windows = [],
    openApp = () => {},
    closeWindow = () => {},
    showExitBanner = false,
    exitReason = '',
    unlockGate = () => {},
    isRound2Active = () => false,
    isRound3Active = () => false,
    isProtectedRoundActive = () => false
  } = useOS();
  const lastOpenedAppRef = useRef(null);

  useEffect(() => {
    if (stage === 'os-desktop' && initialAppId && lastOpenedAppRef.current !== initialAppId) {
      lastOpenedAppRef.current = initialAppId;
      openApp(initialAppId);
    }
  }, [stage, initialAppId, openApp]);

  // Round 3 authorization state
  const [isR3Authorized, setIsR3Authorized] = useState(() => {
    return Boolean(
      teamData?.round3Unlocked ||
      teamData?.round3_unlocked ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_unlocked') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_unlocked') === 'true') ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_supervisor_override') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_supervisor_override') === 'true')
    );
  });

  useEffect(() => {
    if (teamData?.round3Unlocked || teamData?.round3_unlocked) {
      setIsR3Authorized(true);
    }
  }, [teamData?.round3Unlocked, teamData?.round3_unlocked]);

  useEffect(() => {
    const handleAccessChange = (e) => {
      const detail = e.detail || {};
      const myId = teamData?.id || (typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('cyphora_team_id'), 10) : null);
      const myName = (teamData?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_name') : '') || '').toLowerCase();

      if (detail.unlocked !== undefined) {
        if (!detail.team_id && !detail.team_name) {
          setIsR3Authorized(Boolean(detail.unlocked));
        } else if ((detail.team_id && detail.team_id === myId) || (detail.team_name && detail.team_name.toLowerCase() === myName)) {
          setIsR3Authorized(Boolean(detail.unlocked));
        }
      }
    };

    window.addEventListener('cyphora_round3_access_changed', handleAccessChange);
    return () => window.removeEventListener('cyphora_round3_access_changed', handleAccessChange);
  }, [teamData?.id, teamData?.name]);

  const round3Window = windows.find(w => ROUND3_APP_IDS.includes(w.appId));
  const isR2 = typeof isRound2Active === 'function' ? isRound2Active() : false;
  const isProtected = typeof isProtectedRoundActive === 'function'
    ? isProtectedRoundActive()
    : isR2;

  return (
    <div className="os-desktop-root">
      {stage === 'os-boot' ? (
        <BootScreen
          teamName={teamData?.name || 'Explorer'}
          onComplete={() => setStage('os-desktop')}
        />
      ) : round3Window && isR3Authorized ? (
        /* Round 3: Pure full screen with NO taskbar, NO padding, NO border */
        <Round3FullscreenView
          teamData={teamData}
          onClose={() => closeWindow(round3Window.id)}
        />
      ) : (
        /* Standard OS Workspace */
        <>
          <TaskBoard round1State={round1State} />
          {round1State?.finalMemoryVisible && <CompletionCelebration />}
          <main className="os-workspace-area">
            <Desktop />
            <WindowManager />
          </main>
          <StartMenu />
          <Taskbar />

          {/* If Round 3 is requested but team does not yet have clearance, display permission modal */}
          {round3Window && !isR3Authorized && (
            <Round3PermissionModal
              teamData={teamData}
              onAuthorized={() => setIsR3Authorized(true)}
              onCancel={() => closeWindow(round3Window.id)}
            />
          )}
        </>
      )}

      {/* Suppress blue screen gate during protected rounds (Round 2 & Round 3) */}
      {!isProtected && showExitBanner && (
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
      initialAppId={initialAppId}
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
