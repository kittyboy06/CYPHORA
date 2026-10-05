import React, { useEffect } from 'react';
import { Zap, Radio, Compass, Unlock, CheckCircle } from 'lucide-react';
import './TaskCompletionCelebration.css';

const SET_NARRATIVE_MAP = {
  set1: { icon: Zap, label: '⚡ POWER SUBSYSTEM RESTORED', sub: 'Primary Station Power Online' },
  set2: { icon: Radio, label: '📻 RADIO SUBSYSTEM RESTORED', sub: 'Transmitter Reconnected · Monolith Signal Locked' },
  set3: { icon: Compass, label: '🧭 NAVIGATION SUBSYSTEM RESTORED', sub: 'Triangulation Active · Computing Route to Monolith' },
  set4: { icon: Unlock, label: '🗄️ ARCHIVE ACCESS UNLOCKED', sub: 'Expedition Records Recovered · Route Available' }
};

export function TaskCompletionCelebration({ task, setComplete }) {
  const title = task?.playerTitle || task?.title || 'OBJECTIVE COMPLETED';
  const setId = task?.setId || 'set1';
  const setInfo = SET_NARRATIVE_MAP[setId] || { icon: Zap, label: '⚡ SUBSYSTEM RESTORED', sub: 'System Restored' };
  const SetIcon = setInfo.icon;

  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const now = ctx.currentTime;
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
    } catch (e) {}
  }, []);

  return (
    <div className="task-completion-celebration" role="status" aria-live="polite">
      <div className="task-completion-toast">
        {setComplete ? (
          <SetIcon size={26} aria-hidden="true" className="party-popper-icon" />
        ) : (
          <CheckCircle size={26} aria-hidden="true" className="party-popper-icon" />
        )}
        <div style={{ flex: 1 }}>
          <span className="task-completion-kicker">
            {setComplete ? setInfo.label : '✓ FIELD DATA RECOVERED'}
          </span>
          <strong>{setComplete ? setInfo.sub : title}</strong>
        </div>
        <div style={{
          background: 'rgba(223, 177, 37, 0.2)',
          border: '1px solid rgba(223, 177, 37, 0.5)',
          color: '#dfb125',
          fontWeight: 800,
          fontSize: '0.85rem',
          padding: '0.3rem 0.6rem',
          borderRadius: '4px',
          marginLeft: '0.75rem',
          whiteSpace: 'nowrap'
        }}>
          +{task?.pointsAwarded ?? 20} PTS
        </div>
      </div>
    </div>
  );
}