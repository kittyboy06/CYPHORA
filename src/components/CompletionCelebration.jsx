import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Compass, Radio, Zap, Unlock, ArrowRight, X } from 'lucide-react';
import { useOS } from '../os/state/OSContext.jsx';
import './CompletionCelebration.css';

export function CompletionCelebration({ onDismiss }) {
  const { onReturnToHub, openApp, setRound1State, eventBus } = useOS();

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

  const handleDismiss = () => {
    try {
      sessionStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
      localStorage.setItem('cyphora_round1_celebration_dismissed', 'true');
    } catch (e) {}

    if (typeof setRound1State === 'function') {
      setRound1State(prev => ({
        ...prev,
        finalMemoryVisible: false,
        celebrationDismissed: true
      }));
    }
    if (eventBus && typeof eventBus.emit === 'function') {
      eventBus.emit('DISMISS_ROUND1_CELEBRATION');
    }
    if (typeof onDismiss === 'function') {
      onDismiss();
    }
  };

  const handleProceedToRound2 = () => {
    handleDismiss();
    try {
      localStorage.setItem('cyphora_round2_unlocked', 'true');
      sessionStorage.setItem('cyphora_round2_unlocked', 'true');
      sessionStorage.setItem('cyphora_active_round', '2');
    } catch (e) {}
    window.dispatchEvent(new CustomEvent('cyphora_round2_access_changed', { detail: { unlocked: true } }));
    if (typeof openApp === 'function') {
      openApp('round2');
    }
  };

  const handleReturnToHub = () => {
    handleDismiss();
    if (typeof onReturnToHub === 'function') {
      onReturnToHub();
    }
  };

  return (
    <div className="completion-celebration" role="status">
      <div className="completion-backdrop" onClick={handleDismiss} />
      <motion.div
        className="completion-card"
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <button
          type="button"
          className="completion-close-btn"
          onClick={handleDismiss}
          title="Close notification and return to OS desktop"
          aria-label="Close"
        >
          <X size={18} />
        </button>

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
          <p className="terminal-line primary">&gt; SYSTEM RESTORATION COMPLETE (12/12 TASKS)</p>
          <p className="terminal-line">&gt; SIGNAL SOURCE LOCATED.</p>
          <p className="terminal-line">&gt; DISTANCE: UNKNOWN.</p>
          <p className="terminal-line">&gt; ROUTE TO ROUND 2: UNLOCKED.</p>
        </div>

        <div className="completion-monolith-reveal">
          <div className="monolith-glow-ring" />
          <h2 className="monolith-proclamation">THE PATH TO THE LIGHT IS OPEN.</h2>
          <p className="monolith-subtext">The signal coordinates are locked. Proceed into Round 2: Image Navigation.</p>
        </div>

        <div className="completion-actions">
          <button className="completion-proceed-btn" onClick={handleProceedToRound2}>
            <Compass size={17} />
            <span>START ROUND 2: IMAGE NAVIGATION</span>
            <ArrowRight size={17} />
          </button>
          <button className="completion-hub-btn" onClick={handleReturnToHub}>
            <span>Return to Expedition Hub</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
