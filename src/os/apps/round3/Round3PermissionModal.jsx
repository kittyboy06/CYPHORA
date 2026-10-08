import React, { useState, useEffect } from 'react';
import { Shield, Lock, Key, X, Check, AlertTriangle, Eye, EyeOff } from 'lucide-react';
import './Round3App.css';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
const API_BASE = isDevPort ? `http://${hostname}:8000` : '';

export function Round3PermissionModal({ teamData, round1State, onAuthorized, onCancel }) {
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const teamName = teamData?.name || localStorage.getItem('cyphora_team_name') || 'Explorer';
  const teamId = teamData?.id || localStorage.getItem('cyphora_team_id');

  const completedTasksCount = Array.isArray(round1State?.tasks)
    ? round1State.tasks.filter(t => t.status === 'COMPLETED').length
    : (Array.isArray(round1State?.completedTaskIds) ? round1State.completedTaskIds.length : 0);
  const isRound1Completed = Boolean(
    round1State?.round1Status === 'COMPLETED' ||
    completedTasksCount >= 12
  );

  useEffect(() => {
    const handleAccessChange = (e) => {
      const detail = e.detail || {};
      const myId = teamId ? parseInt(teamId, 10) : null;
      const myName = (teamName || '').toLowerCase();

      if (detail.unlocked) {
        if (!detail.team_id && !detail.team_name) {
          if (typeof onAuthorized === 'function') onAuthorized();
        } else if ((detail.team_id && detail.team_id === myId) || (detail.team_name && detail.team_name.toLowerCase() === myName)) {
          if (typeof onAuthorized === 'function') onAuthorized();
        }
      }
    };

    window.addEventListener('cyphora_round3_access_changed', handleAccessChange);
    return () => window.removeEventListener('cyphora_round3_access_changed', handleAccessChange);
  }, [teamId, teamName, onAuthorized]);

  const handleAuthorize = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setError('');

    const inputPassword = adminCode.trim();
    if (!inputPassword) {
      setError('Please enter administrator authorization password.');
      return;
    }

    setIsVerifying(true);
    let isAuthed = false;

    // Fast check for standard administrator master credentials
    if (
      inputPassword.toUpperCase() === 'JCEAIML' ||
      inputPassword.toLowerCase() === 'admin' ||
      inputPassword === '1234' ||
      inputPassword.toLowerCase() === 'cyphora-admin'
    ) {
      isAuthed = true;
    } else {
      // Validate against backend /api/admin/login
      try {
        const checkRes = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: inputPassword })
        });
        if (checkRes.ok) {
          isAuthed = true;
        }
      } catch (err) {
        console.warn('Central server auth failed:', err);
      }
    }

    if (!isAuthed) {
      setIsVerifying(false);
      setError('Invalid administrator authorization credentials.');
      return;
    }

    // Persist authorization in storage scoped to session
    try {
      if (teamId) {
        sessionStorage.setItem(`cyphora_round3_override_${teamId}`, 'true');
      }
      localStorage.setItem('cyphora_round3_unlocked', 'true');
      sessionStorage.setItem('cyphora_round3_unlocked', 'true');
      localStorage.setItem('cyphora_round3_supervisor_override', 'true');
      sessionStorage.setItem('cyphora_round3_supervisor_override', 'true');
    } catch (e) { }

    // Notify backend if available
    try {
      if (teamId) {
        await fetch(`${API_BASE}/api/admin/teams/${teamId}/round3-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': 'JCEAIML'
          },
          body: JSON.stringify({ unlocked: true })
        });
      }
    } catch (err) { }

    try {
      window.dispatchEvent(new CustomEvent('cyphora_round3_access_changed', {
        detail: { unlocked: true, team_id: teamId, team_name: teamName }
      }));
    } catch (e) { }

    setIsVerifying(false);
    if (typeof onAuthorized === 'function') {
      onAuthorized();
    }
  };

  return (
    <div className="round3-modal-backdrop" onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="round3-modal-card" role="dialog" aria-modal="true" aria-labelledby="r3-modal-title">
        <button
          type="button"
          className="round3-modal-close"
          onClick={onCancel}
          title="Close dialog"
        >
          <X size={18} />
        </button>

        <div className="round3-modal-badge">
          <Shield size={16} />
          <span>EXPEDITION CLEARANCE PROTOCOL</span>
        </div>

        <h2 id="r3-modal-title" className="round3-modal-title">
          ROUND 3 : THE TEMPLE TRIALS
        </h2>

        <p className="round3-modal-subtitle">
          ACCESS RESTRICTED &bull; SQUAD VERIFICATION REQUIRED
        </p>

        <div className="round3-modal-team-box">
          <span className="team-box-label">REGISTERED SQUAD</span>
          <span className="team-box-name">{teamName}</span>
        </div>

        <div className="round3-modal-body">
          <div className={`round3-warning-box ${isRound1Completed ? 'completed' : ''}`}>
            <Lock className="warning-box-icon" size={20} />
            <div className="warning-box-text">
              {!isRound1Completed ? (
                <>
                  <p>
                    <strong>ROUND 1 IN PROGRESS ({completedTasksCount}/12 Subsystems Restored)</strong>
                  </p>
                  <p>
                    This workstation is actively assigned to <strong>Round 1: OS Navigation</strong>. All 12 subsystem challenges must be solved before Round 3 (The Temple Trials / The Jungle Code) can be accessed.
                  </p>
                  <div className="round3-progress-wrap">
                    <div className="round3-progress-bar">
                      <div
                        className="round3-progress-fill"
                        style={{ width: `${Math.round((completedTasksCount / 12) * 100)}%` }}
                      />
                    </div>
                    <span className="round3-progress-text">
                      {completedTasksCount} of 12 Subsystems Restored ({Math.round((completedTasksCount / 12) * 100)}%)
                    </span>
                  </div>
                  <p className="warning-note">
                    Wait for administrator clearance from the Central Dashboard, or have an event proctor enter the station authorization master key below.
                  </p>
                </>
              ) : (
                <>
                  <p>
                    <strong>ROUND 1 COMPLETE (12/12) &bull; AWAITING ADMINISTRATOR CLEARANCE</strong>
                  </p>
                  <p>
                    Station subsystems are restored! Access to <strong>Round 3 (The Temple Trials / The Jungle Code)</strong> requires clearance from the competition administrator or event proctor.
                  </p>
                  <p className="warning-note">
                    Please wait for the administrator to unlock your team remotely, or have an event proctor enter the station authorization master key below.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="round3-beacon-indicator">
            <span className="round3-beacon-pulse" />
            <span>Listening for real-time clearance signal from Admin Command...</span>
          </div>

          <form onSubmit={handleAuthorize} className="round3-auth-form" autoComplete="off">
            <label htmlFor="r3_admin_code" className="round3-auth-label">
              <Key size={14} />
              <span>Administrator / Proctor Authorization Key</span>
            </label>

            <div className="round3-input-wrapper">
              <input
                id="r3_admin_code"
                type={showPassword ? 'text' : 'password'}
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  setError('');
                }}
                placeholder="Enter Proctor Key..."
                className={`round3-auth-input ${error ? 'has-error' : ''}`}
                autoFocus
                disabled={isVerifying}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
                data-form-type="other"
              />
              <button
                type="button"
                className="round3-eye-btn"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div className="round3-auth-error">
                <AlertTriangle size={14} />
                <span>{error}</span>
              </div>
            )}

            <div className="round3-modal-actions">
              <button
                type="button"
                className="round3-btn-cancel"
                onClick={onCancel}
                disabled={isVerifying}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="round3-btn-submit"
                disabled={isVerifying || !adminCode.trim()}
              >
                {isVerifying ? (
                  <span>Verifying...</span>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Authorize & Enter Round 3</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Round3PermissionModal;
