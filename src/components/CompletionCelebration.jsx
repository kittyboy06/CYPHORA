import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Compass, Radio, Zap, Unlock, ArrowRight } from 'lucide-react';
import { useOS } from '../os/state/OSContext.jsx';
import './CompletionCelebration.css';

export function CompletionCelebration() {
  const { onReturnToHub } = useOS();

  useEffect(() => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        [110, 164.81, 220, 329.63, 440, 554.37, 659.25].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = idx < 2 ? 'sawtooth' : 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.12);
          gain.gain.setValueAtTime(0.06, now + idx * 0.12);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.12);
          osc.stop(now + idx * 0.12 + 1.3);
        });
      }
    } catch (e) {}
  }, []);

  return (
    <div className="completion-celebration" role="status">
      <div className="completion-backdrop" />
      <motion.div
        className="completion-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="completion-header">
          <Shield size={18} className="completion-shield-icon" />
          <span className="completion-kicker">EXPEDITION FIELD MODULE // STATUS RESTORED</span>
        </div>

        <div className="completion-status-grid">
          <div className="subsystem-row">
            <span className="subsystem-name"><Zap size={14} /> POWER</span>
            <span className="subsystem-dots">................</span>
            <span className="subsystem-val online">ONLINE</span>
          </div>
          <div className="subsystem-row">
            <span className="subsystem-name"><Radio size={14} /> RADIO</span>
            <span className="subsystem-dots">................</span>
            <span className="subsystem-val online">ONLINE</span>
          </div>
          <div className="subsystem-row">
            <span className="subsystem-name"><Compass size={14} /> NAVIGATION</span>
            <span className="subsystem-dots">...........</span>
            <span className="subsystem-val online">ONLINE</span>
          </div>
          <div className="subsystem-row">
            <span className="subsystem-name"><Unlock size={14} /> ARCHIVE</span>
            <span className="subsystem-dots">..............</span>
            <span className="subsystem-val online">UNLOCKED</span>
          </div>
        </div>

        <div className="completion-terminal-output">
          <p className="terminal-line primary">&gt; SYSTEM RESTORATION COMPLETE</p>
          <p className="terminal-line">&gt; SIGNAL SOURCE LOCATED.</p>
          <p className="terminal-line">&gt; DISTANCE: UNKNOWN.</p>
          <p className="terminal-line">&gt; ROUTE: AVAILABLE.</p>
        </div>

        <div className="completion-monolith-reveal">
          <div className="monolith-glow-ring" />
          <h2 className="monolith-proclamation">THE PATH TO THE LIGHT IS OPEN.</h2>
          <p className="monolith-subtext">The signal coordinates are locked. Proceed into the unknown.</p>
        </div>

        <div className="completion-actions">
          <button className="completion-proceed-btn" onClick={onReturnToHub}>
            <span>PROCEED TOWARD THE LIGHT</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </motion.div>
    </div>
  );
}
