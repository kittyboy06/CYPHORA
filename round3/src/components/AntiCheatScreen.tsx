import React, { useState, useEffect } from 'react';
import './AntiCheatScreen.css';

/**
 * Set of authorized recovery passwords (matches OS BlueScreenGate).
 * Entering any of these codes unlocks the screen and restores fullscreen.
 */
export const RECOVERY_PASSWORDS = [
  'CYPH', // Password 1 (Length: 4)
  '7492', // Password 2 (Length: 4)
  'ROOT', // Password 3 (Length: 4)
  '8080', // Password 4 (Length: 4)
  'NOVA', // Password 5 (Length: 4)
  'JCEAIML', // Master Supervisor Code
  'ADMIN', // Administrator Override
  '1234'
];

export const REASON_CONFIGS: Record<string, { title: string; code: string; description: string }> = {
  FULLSCREEN_EXIT: {
    title: 'Fullscreen display mode was exited.',
    code: 'CYPHORA_SECURITY_FULLSCREEN_EXIT',
    description: 'You left the mandated fullscreen competition environment.'
  },
  SCREENSHOT_ATTEMPT: {
    title: 'Screen capture attempt detected.',
    code: 'CYPHORA_SECURITY_SCREENSHOT_DETECTED',
    description: 'A screenshot shortcut (PrintScreen / Snipping Tool) was triggered.'
  },
  TAB_SWITCH: {
    title: 'Tab switch or window unfocus detected.',
    code: 'CYPHORA_SECURITY_TAB_SWITCH_DETECTED',
    description: 'You switched browser tabs or minimized/blurred the expedition window.'
  },
  INSPECTOR_DEVTOOLS: {
    title: 'Developer Tools / Inspector detected.',
    code: 'CYPHORA_SECURITY_DEVTOOLS_INSPECTOR',
    description: 'An attempt to inspect DOM elements or open developer tools was detected.'
  },
  PAGE_RELOAD_ATTEMPT: {
    title: 'Workstation reload or refresh detected.',
    code: 'CYPHORA_SECURITY_RELOAD_ATTEMPT',
    description: 'Reloading the workstation during competition mode is restricted.'
  }
};

interface Props {
  reason?: string;
  onAdminUnlock: () => void;
}

export const AntiCheatScreen: React.FC<Props> = ({ reason = 'FULLSCREEN_EXIT', onAdminUnlock }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Notify parent OS that lock is active
  useEffect(() => {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason }, '*');
      }
    } catch (e) { }
  }, [reason]);

  const config = REASON_CONFIGS[reason] || {
    title: 'Security perimeter violation detected.',
    code: `CYPHORA_SECURITY_${reason || 'VIOLATION'}`,
    description: 'An unauthorized environment change was detected.'
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();
    const cleanPass = password.trim().toUpperCase();

    if (RECOVERY_PASSWORDS.includes(cleanPass)) {
      setError('');
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage({ type: 'CYPHORA_UNLOCK_GATE' }, '*');
        }
      } catch (e) { }
      onAdminUnlock();
      return;
    }

    setError('Access Denied: Invalid recovery code.');
  };

  return (
    <div
      className="blue-screen-gate"
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="blue-screen-face">:(</div>
      <h1>Your PC ran into a problem and was locked by expedition security.</h1>
      <p>
        <strong>{config.title}</strong> {config.description}
      </p>
      <p style={{ fontSize: '0.95rem', opacity: 0.85, marginTop: '-0.4rem' }}>
        To prevent unauthorized activity, the operating system has been halted. Enter an authorized administrator recovery code to resume.
      </p>

      <form onSubmit={handleSubmit} className="blue-screen-form" autoComplete="off" data-lpignore="true" data-form-type="other">
        <label htmlFor="recovery-password">Authorized Recovery Code</label>
        <div className="blue-screen-input-group">
          <input
            id="recovery-password"
            name="security_recovery_code"
            type="text"
            className="pin-mask-input"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value.toUpperCase());
              if (error) setError('');
            }}
            placeholder="****"
            maxLength={10}
            autoFocus
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            data-lpignore="true"
            data-1p-ignore="true"
            data-form-type="other"
            style={{ letterSpacing: '0.35rem', fontWeight: 700 }}
          />
          <button type="submit">Resume Expedition</button>
        </div>
        {error && <span className="blue-screen-error">⚠️ {error}</span>}
      </form>

      <div className="blue-screen-details">
        <small>STOP CODE: {config.code}</small>
        <small style={{ opacity: 0.7 }}>AUTHORIZED PROTOCOL: 4-CHARACTER OVERRIDE KEY REQUIRED</small>
      </div>
    </div>
  );
};
