import React, { useState, useEffect } from 'react';
import './BootScreen.css';

export function BootScreen({ teamName, onComplete }) {
  const [progress, setProgress] = useState(0);
  const [statusLog, setStatusLog] = useState([
    'CYPHORA BIOS v6.4.12 (Build 2026.09.24)',
    'CHECKING SYSTEM INTEGRITY...'
  ]);

  // Optional subtle synthetic audio chime using Web Audio API
  useEffect(() => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch (e) {
      // Audio autoplay policy catch
    }
  }, []);

  useEffect(() => {
    const logMilestones = [
      { at: 20, msg: '[VFS] MOUNTING ROOT FILESYSTEM TREE... OK' },
      { at: 45, msg: `[AUTH] VERIFYING WORKSTATION ENCLAVE: ${teamName.toUpperCase()}... VERIFIED` },
      { at: 70, msg: '[SYS] INITIALIZING COMPOSITOR & WINDOW MANAGER... OK' },
      { at: 90, msg: '[NET] CONNECTED TO EXPEDITION LIVE STREAM' },
      { at: 100, msg: 'SYSTEM READY. LAUNCHING OS NAVIGATOR DESKTOP...' }
    ];

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = Math.min(100, prev + Math.floor(Math.random() * 8) + 4);

        logMilestones.forEach(m => {
          if (prev < m.at && next >= m.at) {
            setStatusLog(l => [...l, m.msg]);
          }
        });

        if (next >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
        }
        return next;
      });
    }, 90);

    return () => clearInterval(interval);
  }, [teamName, onComplete]);

  return (
    <div className="bootscreen-container">
      <div className="bootscreen-terminal-frame">
        <div className="bootscreen-header">
          <div className="bootscreen-title">CYPHORA // STAGE 1: OS NAVIGATOR</div>
          <div className="bootscreen-chip">SYS_ID: {teamName.toUpperCase().replace(/\s+/g, '_')}</div>
        </div>

        <div className="bootscreen-logs">
          {statusLog.map((log, i) => (
            <div key={i} className="bootscreen-log-line">
              <span className="log-arrow">&gt;</span> {log}
            </div>
          ))}
        </div>

        <div className="bootscreen-progress-section">
          <div className="bootscreen-progress-meta">
            <span>INITIALIZING ENVIRONMENT...</span>
            <span className="progress-percent">{progress}%</span>
          </div>
          <div className="bootscreen-progress-bar">
            <div
              className="bootscreen-progress-fill"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="bootscreen-footer">
          <span>SECURE COMPETITION RUNTIME // STANDALONE ENCLAVE</span>
        </div>
      </div>
    </div>
  );
}
