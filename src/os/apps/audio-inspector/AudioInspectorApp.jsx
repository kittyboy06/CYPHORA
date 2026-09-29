import React, { useState } from 'react';
import { Volume2, Play, Pause, Activity, CheckCircle } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './AudioInspectorApp.css';

const SAMPLE_AUDIO_FILES = [
  { label: 'distress_beacon.wav (Task 07 Audio File)', path: '/Audio/distress_beacon.wav' }
];

export function AudioInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const node = vfs.getNode(selectedPath);
  const audioCode = node?.audioSequence || 'ALPHA-4-9-2';

  const handleTogglePlay = () => {
    setIsPlaying(p => !p);
    eventBus.emit('AUDIO_INSPECTED', {
      filePath: selectedPath,
      audioSequence: audioCode
    });
  };

  const handleSubmitCode = () => {
    eventBus.emit('AUDIO_INSPECTED', {
      audioSequence: audioCode
    });
    eventBus.emit('TASK_ANSWER_SUBMITTED', {
      answer: audioCode
    });
    setStatusMsg(`✓ Submitted spoken audio sequence (${audioCode}) to task!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="audio-inspector-app">
      <div className="audio-header">
        <div className="title-wrap">
          <Volume2 size={18} className="icon" />
          <span>Audio Signal Inspector</span>
        </div>
        <p className="sub">Waveform visualizer, acoustic analysis, and voice signal decoding</p>
      </div>

      <div className="audio-controls">
        <label>SELECT AUDIO RECORDING:</label>
        <select value={selectedPath} onChange={(e) => setSelectedPath(e.target.value)} className="audio-select">
          {SAMPLE_AUDIO_FILES.map(f => (
            <option key={f.path} value={f.path}>{f.label}</option>
          ))}
        </select>
      </div>

      {/* Waveform Visualization Viewport */}
      <div className="waveform-container">
        <div className="waveform-meta">
          <span>FORMAT: WAV 44.1kHz</span>
          <span>DURATION: 00:08</span>
          <span>CHANNELS: MONO</span>
        </div>

        <div className={`bars-wrapper ${isPlaying ? 'playing' : ''}`}>
          {Array.from({ length: 28 }).map((_, i) => (
            <div key={i} className="wave-bar" style={{ animationDelay: `${(i % 5) * 0.15}s` }} />
          ))}
        </div>

        <div className="playback-bar">
          <button className="play-btn" onClick={handleTogglePlay}>
            {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            <span>{isPlaying ? 'Pause Playback' : 'Play Transmission'}</span>
          </button>
          <div className="progress-track">
            <div className={`progress-fill ${isPlaying ? 'animating' : ''}`} />
          </div>
        </div>
      </div>

      {/* Audio Transcript / Signal Analysis Output */}
      <div className="audio-transcript-panel">
        <div className="transcript-title">
          <Activity size={14} />
          <span>DECODED ACOUSTIC TRANSMISSION TRANSCRIPT</span>
        </div>

        <div className="spoken-text-box">
          <span className="box-label">SPOKEN SEQUENCE DETECTED:</span>
          <span className="spoken-code">{audioCode}</span>
        </div>

        <div className="transcript-footer">
          <button className="submit-audio-btn" onClick={handleSubmitCode}>
            <CheckCircle size={15} />
            <span>Submit Spoken Sequence ({audioCode})</span>
          </button>
        </div>
      </div>

      {statusMsg && <div className="audio-msg">{statusMsg}</div>}
    </div>
  );
}
