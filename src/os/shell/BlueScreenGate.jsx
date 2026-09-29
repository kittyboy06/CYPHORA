import React, { useState } from 'react';
import './BlueScreenGate.css';

const EXIT_PASSWORD = 'Sympo@789';

export function BlueScreenGate({ onUnlock }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    if (password.trim() === EXIT_PASSWORD) {
      setError('');
      onUnlock();
      return;
    }
    setError('The password is incorrect.');
  };

  return (
    <div className="blue-screen-gate">
      <div className="blue-screen-face">:(</div>
      <h1>Your PC ran into a problem and needs to restart.</h1>
      <p>Fullscreen protection was interrupted. Enter the recovery password to resume the expedition.</p>
      <form onSubmit={handleSubmit} className="blue-screen-form">
        <label htmlFor="recovery-password">Recovery Password</label>
        <div className="blue-screen-input-group">
          <input
            id="recovery-password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter password..."
            autoFocus
            autoComplete="off"
          />
          <button type="submit">Resume expedition</button>
        </div>
        {error && <span className="blue-screen-error">⚠️ {error}</span>}
      </form>
      <div className="blue-screen-details">
        <small>STOP CODE: CYPHORA_FULLSCREEN_EXIT</small>
      </div>
    </div>
  );
}
