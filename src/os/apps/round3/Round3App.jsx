import React, { useState, useEffect } from 'react';
import { useOS } from '../../state/OSContext.jsx';
import { Round3PermissionModal } from './Round3PermissionModal.jsx';
import { Round3FullscreenView } from './Round3FullscreenView.jsx';

export function Round3App({ windowId }) {
  const { closeWindow, teamData, round1State } = useOS();

  const teamId = teamData?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : null);

  const completedTasksCount = Array.isArray(round1State?.tasks)
    ? round1State.tasks.filter(t => t.status === 'COMPLETED').length
    : (Array.isArray(round1State?.completedTaskIds) ? round1State.completedTaskIds.length : 0);
  const isRound1Completed = Boolean(
    round1State?.round1Status === 'COMPLETED' ||
    completedTasksCount >= 12
  );

  const [isAuthorized, setIsAuthorized] = useState(() => {
    if (teamData?.round3Unlocked || teamData?.round3_unlocked) return true;
    if (typeof sessionStorage !== 'undefined') {
      if (teamId && sessionStorage.getItem(`cyphora_round3_override_${teamId}`) === 'true') return true;
      if (sessionStorage.getItem('cyphora_round3_supervisor_override') === 'true') return true;
    }
    if (typeof localStorage !== 'undefined' && (localStorage.getItem('cyphora_round3_unlocked') === 'true' || localStorage.getItem('cyphora_round2_completed') === 'true')) return true;
    if (isRound1Completed) {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_unlocked') === 'true') return true;
    }
    return false;
  });

  useEffect(() => {
    const handleAccessChange = (e) => {
      const detail = e.detail || {};
      const myId = teamData?.id || (typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('cyphora_team_id'), 10) : null);
      const myName = (teamData?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_name') : '') || '').toLowerCase();

      if (detail.unlocked !== undefined) {
        const matches = (!detail.team_id && !detail.team_name) ||
          ((detail.team_id && detail.team_id === myId) || (detail.team_name && detail.team_name.toLowerCase() === myName));
        if (matches) {
          setIsAuthorized(Boolean(detail.unlocked));
          if (!detail.unlocked && teamId) {
            try { sessionStorage.removeItem(`cyphora_round3_override_${teamId}`); } catch (_) {}
            try {
              localStorage.removeItem('cyphora_round3_unlocked');
              sessionStorage.removeItem('cyphora_round3_unlocked');
            } catch (_) {}
          }
        }
      }
    };

    window.addEventListener('cyphora_round3_access_changed', handleAccessChange);
    return () => window.removeEventListener('cyphora_round3_access_changed', handleAccessChange);
  }, [teamData?.id, teamData?.name, teamId]);

  const handleClose = () => {
    closeWindow(windowId);
  };

  if (!isAuthorized) {
    return (
      <Round3PermissionModal
        teamData={teamData}
        round1State={round1State}
        onAuthorized={() => setIsAuthorized(true)}
        onCancel={handleClose}
      />
    );
  }

  return (
    <Round3FullscreenView
      teamData={teamData}
      onClose={handleClose}
    />
  );
}

export default Round3App;
