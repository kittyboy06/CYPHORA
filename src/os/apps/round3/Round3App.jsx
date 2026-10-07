import React, { useState, useEffect } from 'react';
import { useOS } from '../../state/OSContext.jsx';
import { Round3PermissionModal } from './Round3PermissionModal.jsx';
import { Round3FullscreenView } from './Round3FullscreenView.jsx';

export function Round3App({ windowId }) {
  const { closeWindow, teamData } = useOS();

  const [isAuthorized, setIsAuthorized] = useState(() => {
    return Boolean(
      teamData?.round3Unlocked ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_unlocked') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_unlocked') === 'true') ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_round3_supervisor_override') === 'true') ||
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round3_supervisor_override') === 'true')
    );
  });

  useEffect(() => {
    const handleAccessChange = (e) => {
      const detail = e.detail || {};
      const myId = teamData?.id || (typeof localStorage !== 'undefined' ? parseInt(localStorage.getItem('cyphora_team_id'), 10) : null);
      const myName = (teamData?.name || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_name') : '') || '').toLowerCase();

      if (detail.unlocked !== undefined) {
        if (!detail.team_id && !detail.team_name) {
          setIsAuthorized(Boolean(detail.unlocked));
        } else if ((detail.team_id && detail.team_id === myId) || (detail.team_name && detail.team_name.toLowerCase() === myName)) {
          setIsAuthorized(Boolean(detail.unlocked));
        }
      }
    };

    window.addEventListener('cyphora_round3_access_changed', handleAccessChange);
    return () => window.removeEventListener('cyphora_round3_access_changed', handleAccessChange);
  }, [teamData?.id, teamData?.name]);

  const handleClose = () => {
    closeWindow(windowId);
  };

  if (!isAuthorized) {
    return (
      <Round3PermissionModal
        teamData={teamData}
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
