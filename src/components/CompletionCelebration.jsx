import React from 'react';
import './CompletionCelebration.css';

const confetti = Array.from({ length: 28 }, (_, index) => index);

export function CompletionCelebration() {
  return (
    <div className="completion-celebration" role="status">
      <div className="confetti-field" aria-hidden="true">
        {confetti.map((piece) => <span key={piece} style={{ '--i': piece }} />)}
      </div>
      <div className="completion-card">
        <span className="completion-kicker">EXPEDITION OBJECTIVE COMPLETE</span>
        <h2>Beacon restored</h2>
        <p>The field system is online. Your journey is complete.</p>
        <div className="completion-party">MISSION COMPLETE</div>
      </div>
    </div>
  );
}
