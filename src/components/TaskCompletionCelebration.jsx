import React, { useEffect } from 'react';
import { PartyPopper } from 'lucide-react';
import './TaskCompletionCelebration.css';

const confetti = Array.from({ length: 48 }, (_, index) => index);

export function TaskCompletionCelebration({ task, setComplete }) {
  const title = task?.playerTitle || task?.title || 'OBJECTIVE COMPLETED';

  // Play synthetic audio chime for party popper celebration
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;

        // Fanfare notes: C5, E5, G5, C6
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);

          gain.gain.setValueAtTime(0.08, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.3);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.35);
        });
      }
    } catch (e) {
      // Audio autoplay catch
    }
  }, []);

  return (
    <div className="task-completion-celebration" role="status" aria-live="polite">
      <div className="task-confetti-field" aria-hidden="true">
        {confetti.map((piece) => <span key={piece} style={{ '--i': piece }} />)}
      </div>
      <div className="task-completion-toast">
        <PartyPopper size={28} aria-hidden="true" className="party-popper-icon" />
        <div>
          <span className="task-completion-kicker">{setComplete ? '🎉 SET COMPLETED!' : '🎉 OBJECTIVE COMPLETED!'}</span>
          <strong>{setComplete ? `${task.setId?.replace('set', 'SET ')} · ${title}` : title}</strong>
        </div>
      </div>
    </div>
  );
}