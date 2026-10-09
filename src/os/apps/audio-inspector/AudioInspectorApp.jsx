import React, { useState } from 'react';
import { Volume2, Play, Pause, Activity } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './AudioInspectorApp.css';

const SAMPLE_AUDIO_FILES = [
  { label: 'distress_beacon.wav', path: '/Audio/distress_beacon.wav' }
];

export function AudioInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('/Audio/distress_beacon.wav');
  const [isPlaying, setIsPlaying] = useState(false);

  const node = vfs.getNode(selectedPath);
  const audioCode = node?.audioSequence || 'ALPHA-4-9-2';

  const handleTogglePlay = () => {
    setIsPlaying(p => !p);
    eventBus.emit('AUDIO_INSPECTED', {
      filePath: selectedPath,
      audioSequence: audioCode
    });
  };

  return (
    <div className="audio-inspector-app">
      <div className="audio-header">
        <div className="title-wrap">
          <Volume2 size={18} className="icon" />
          <span>Audio Signal Inspector</span>
        </div>
        <p className="sub">Waveform visualizer, acoustic analysis, and signal inspection</p>
      </div>

      <div className="audio-controls">
        <label>SELECT AUDIO RECORDING:</label>
        <select value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} className="audio-select">
          {SAMPLE_AUDIO_FILES.map(a => (
            <option key={a.path} value={a.path}>{a.label}</option>
          ))}
        </select>

        <button className={`play-btn ${isPlaying ? 'playing' : ''}`} onClick={handleTogglePlay}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
          <span>{isPlaying ? 'Pause Signal' : 'Playback Audio Stream'}</span>
        </button>
      </div>

      {/* Visualizer Simulation */}
      <div className="waveform-container">
        <div className={`bars-wrapper ${isPlaying ? 'playing' : ''}`}>
          {[40, 65, 20, 85, 95, 30, 70, 50, 90, 45, 60, 80, 25, 75, 55, 35, 90, 65, 40].map((h, idx) => (
            <div
              key={idx}
              className={`wave-bar ${isPlaying ? 'active' : ''}`}
              style={{
                height: isPlaying ? `${Math.max(15, (h * Math.random()).toFixed(0))}%` : `${h}%`,
                animationDelay: `${idx * 0.08}s`
              }}
            />
          ))}
        </div>
        <div className="frequency-display">
          <Activity size={14} color="#7ee787" />
          <span>CARRIER: 142.85 MHz | MODULATION: FSK | SNR: +18dB</span>
        </div>
      </div>
    </div>
  );
}
