import React, { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RefreshCw, Eye, CheckCircle } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './ImageInspectorApp.css';

const SAMPLE_IMAGES = [
  { label: 'field_poster.png (Task 02 Visual Clue)', path: '/Pictures/field_poster.png' },
  { label: 'terrain_map.png (Pictures)', path: '/Pictures/terrain_map.png' },
  { label: 'camp_photo.png (Pictures)', path: '/Pictures/camp_photo.png' }
];

export function ImageInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const node = vfs.getNode(selectedPath);
  const isPoster = selectedPath.includes('field_poster');

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
  };

  const handleSelectImage = (e) => {
    const p = e.target.value;
    setSelectedPath(p);
    handleReset();
    eventBus.emit('IMAGE_INSPECTED', {
      filePath: p,
      clueAnswer: p.includes('field_poster') ? 'VECTOR-7' : 'STANDARD_IMAGE'
    });
  };

  const handleSubmitVisualCode = () => {
    const code = isPoster ? 'VECTOR-7' : 'FIELD_MAP_OK';
    eventBus.emit('IMAGE_INSPECTED', {
      clueAnswer: code
    });
    eventBus.emit('TASK_ANSWER_SUBMITTED', {
      answer: code
    });
    setStatusMsg(`✓ Submitted visual clue code (${code}) to task!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  return (
    <div className="image-inspector-app">
      <div className="inspector-header">
        <div className="title-wrap">
          <ImageIcon size={18} className="icon" />
          <span>Image Inspector</span>
        </div>
        <p className="sub">Examine visual artifacts, symbols, color channels, and optical details</p>
      </div>

      <div className="inspector-toolbar">
        <div className="select-wrap">
          <label>SELECT IMAGE:</label>
          <select value={selectedPath} onChange={handleSelectImage} className="image-select">
            {SAMPLE_IMAGES.map(img => (
              <option key={img.path} value={img.path}>{img.label}</option>
            ))}
          </select>
        </div>

        <div className="tool-controls">
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
          <span className="zoom-text">{zoom}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></button>
          <button className="tool-btn" onClick={handleReset} title="Reset View"><RefreshCw size={14} /></button>
          <button className={`tool-btn ${showOverlay ? 'active' : ''}`} onClick={() => setShowOverlay(o => !o)} title="Toggle Visual Feature Overlay">
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Main Viewport & Inspection Frame */}
      <div className="image-viewport">
        <div
          className="canvas-container"
          style={{
            transform: `scale(${zoom / 100})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        >
          <div className="simulated-image-frame">
            <div className="poster-header">CYPHORA FIELD EXPEDITION POSTER</div>
            <div className="poster-body">
              <div className="symbols-row">
                <span className={`symbol-badge ${showOverlay ? 'highlight' : ''}`}>[VECTOR]</span>
                <span className="symbol-badge">[DELTA]</span>
                <span className="symbol-badge">[ALPHA]</span>
              </div>
              <div className="number-focus">
                <span className="label">NUMBER MARKER:</span>
                <span className={`number-val ${showOverlay ? 'highlight' : ''}`}>7</span>
              </div>
              <div className="letter-focus">
                <span className="label">HIGHLIGHTED LETTER:</span>
                <span className={`letter-val ${showOverlay ? 'highlight' : ''}`}>K</span>
              </div>
            </div>
            <div className="poster-footer">EXPEDITION RECONNAISSANCE POSTER // CLUE REF #02</div>
          </div>
        </div>

        {/* Adjustments Sidebar */}
        <div className="viewport-adjustments">
          <div className="adj-group">
            <label>BRIGHTNESS ({brightness}%)</label>
            <input type="range" min="50" max="180" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
          </div>
          <div className="adj-group">
            <label>CONTRAST ({contrast}%)</label>
            <input type="range" min="50" max="180" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
          </div>
        </div>
      </div>

      {/* Inspection Breakdown */}
      <div className="visual-breakdown-panel">
        <div className="panel-title">VISUAL ELEMENT ANALYSIS SUMMARY</div>
        <div className="elements-grid">
          <div className="element-item"><span>Primary Symbol</span><strong>VECTOR</strong></div>
          <div className="element-item"><span>Number Clue</span><strong>7</strong></div>
          <div className="element-item"><span>Letter Clue</span><strong>K</strong></div>
          <div className="element-item highlight-item"><span>Combined Code</span><strong className="code-highlight">VECTOR-7</strong></div>
        </div>

        <div className="panel-actions">
          <button className="submit-code-btn" onClick={handleSubmitVisualCode}>
            <CheckCircle size={15} />
            <span>Submit Visual Code (VECTOR-7)</span>
          </button>
        </div>
      </div>

      {statusMsg && <div className="inspector-msg">{statusMsg}</div>}
    </div>
  );
}
