import React, { useState } from 'react';
import { ShieldAlert, Lock, AlertTriangle, KeyRound, CheckCircle2 } from 'lucide-react';
import './RoundTimerLockScreen.css';

// Authorized master and station proctor override codes
const AUTHORIZED_OVERRIDE_CODES = [
  'JCEAIML',
  '8080',
  'CYPH',
  'ROOT',
  '7492',
  'NOVA'
];

export function RoundTimerLockScreen({
  round = 1,
  roundName = 'Round 1 — OS Navigation',
  teamName = 'Explorer',
  onUnlockOverride = () => {}
}) {
  const [overrideKey, setOverrideKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false);

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    const cleanKey = overrideKey.trim().toUpperCase();
    if (!cleanKey) {
      setErrorMsg('Please enter administrator override key.');
      return;
    }

    if (AUTHORIZED_OVERRIDE_CODES.includes(cleanKey)) {
      setErrorMsg('');
      setIsUnlockedSuccess(true);
      setTimeout(() => {
        onUnlockOverride();
      }, 400);
      return;
    }

    setErrorMsg('Access Denied: Invalid administrator override key.');
  };

  return (
    <div
      className="round-timer-lockscreen-root"
      onContextMenu={(e) => e.preventDefault()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="lock-heading"
    >
      <div className="lockscreen-scanner-line" aria-hidden="true" />
      <div className="lockscreen-glow-ambient" aria-hidden="true" />

      <div className="lockscreen-card">
        {/* Top Warning Icon Capsule */}
        <div className="lockscreen-icon-capsule">
          <ShieldAlert size={44} className="lockscreen-alert-icon" />
          <div className="lockscreen-icon-ring" />
        </div>

        {/* Header */}
        <div className="lockscreen-badges-row">
          <span className="lockscreen-badge round-badge">ROUND {round} EXPIRED</span>
          <span className="lockscreen-badge security-badge">
            <Lock size={11} /> SECURITY LOCKOUT
          </span>
        </div>

        <h1 id="lock-heading" className="lockscreen-title">
          TIME HAS EXPIRED
        </h1>
        <h2 className="lockscreen-round-sub">
          {roundName.toUpperCase()} CONCLUDED
        </h2>

        {/* Primary Contact Administrator Banner */}
        <div className="lockscreen-alert-box">
          <div className="alert-box-header">
            <AlertTriangle size={18} className="alert-triangle-icon" />
            <span>PLEASE CONTACT THE ADMINISTRATOR</span>
          </div>
          <p className="alert-box-text">
            Your allotted competition time for <strong>{roundName}</strong> has ended.
            This workstation has been securely frozen.
          </p>
          <p className="alert-box-instruction">
            Please notify the <strong>event administrator / competition proctor</strong> to verify your station, submit final evaluations, or authorize access.
          </p>
        </div>

        {/* Workstation Diagnostics */}
        <div className="lockscreen-diagnostics-grid">
          <div className="diag-item">
            <span className="diag-label">WORKSTATION TEAM</span>
            <span className="diag-val highlight">{teamName || 'Unregistered'}</span>
          </div>
          <div className="diag-item">
            <span className="diag-label">SECURITY STOP CODE</span>
            <span className="diag-val code-text">CYPHORA_ROUND_{round}_TIME_EXPIRED</span>
          </div>
          <div className="diag-item">
            <span className="diag-label">CENTRAL RECOVERY</span>
            <span className="diag-val">AUTO-SYNC VIA ADMIN PORTAL</span>
          </div>
        </div>

        {/* Proctor Override Key Section */}
        <div className="lockscreen-override-section">
          <div className="override-header">
            <KeyRound size={14} />
            <span>Administrator / Proctor Local Override</span>
          </div>
          <p className="override-caption">
            Event proctors can input the authorization master code or station recovery PIN to unlock this workstation locally:
          </p>

          <form onSubmit={handleOverrideSubmit} className="override-form" autoComplete="off" data-lpignore="true">
            <div className="override-input-wrap">
              <input
                type="text"
                name="admin_override_key"
                className="override-key-input pin-mask-input"
                placeholder="Enter Proctor Key..."
                value={overrideKey}
                onChange={(e) => {
                  setOverrideKey(e.target.value.toUpperCase());
                  if (errorMsg) setErrorMsg('');
                }}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
                data-lpignore="true"
                data-1p-ignore="true"
              />
              <button type="submit" className="override-submit-btn">
                <span>Unlock Station</span>
              </button>
            </div>
            {errorMsg && <div className="override-error-msg">{errorMsg}</div>}
            {isUnlockedSuccess && (
              <div className="override-success-msg">
                <CheckCircle2 size={14} /> Override Verified — Resuming Workstation...
              </div>
            )}
          </form>
        </div>

        {/* Auto-Unlock Note */}
        <div className="lockscreen-footer-hint">
          <span>Tip:</span> When the administrator updates, resets, or resumes the timer in the Admin Command Portal, this workstation unlocks automatically.
        </div>
      </div>
    </div>
  );
}

export default RoundTimerLockScreen;
