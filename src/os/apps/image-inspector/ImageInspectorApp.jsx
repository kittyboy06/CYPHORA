import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Eye,
  CheckCircle,
  Folder,
  Copy,
  ExternalLink,
  MapPin,
  Compass
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './ImageInspectorApp.css';

export function ImageInspectorApp({ windowId, meta = {} }) {
  const { vfs, eventBus, openApp } = useOS();
  const [selectedPath, setSelectedPath] = useState(meta?.filePath || '/Pictures/map.png');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showOverlay, setShowOverlay] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (meta?.filePath && meta.filePath !== selectedPath) {
      setSelectedPath(meta.filePath);
    }
  }, [meta?.filePath]);

  const node = selectedPath ? vfs.getNode(selectedPath) : null;
  const fileName = (node?.name || selectedPath.split('/').pop() || '').toLowerCase();

  const isMap = fileName.includes('map');
  const isPoster = fileName.includes('poster');
  const isPhoto = fileName.includes('photo') || fileName.includes('archive');
  const isDevice = fileName.includes('device');

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
  };

  const handleVirtualFileSelected = (virtualNode) => {
    if (!virtualNode) return;
    setSelectedPath(virtualNode.path);
    handleReset();
    eventBus.emit('IMAGE_INSPECTED', {
      filePath: virtualNode.path,
      fileName: virtualNode.name,
      clueAnswer: virtualNode.name.includes('map') ? 'CLUE-42' : virtualNode.name.includes('poster') ? 'VECTOR-7' : 'STANDARD_IMAGE'
    });
  };

  const getOpticalKey = () => {
    if (node?.qrPayload) return node.qrPayload;
    if (isMap) return 'CLUE-42';
    if (isPoster) return 'VECTOR-7';
    if (isPhoto) return '82 69 83 67 85 69';
    if (isDevice) return 'DEVICE-9';
    return 'OPTICAL-RAW';
  };

  const opticalKey = getOpticalKey();

  const handleCopyCode = (valToCopy = opticalKey) => {
    if (!valToCopy) return;
    navigator.clipboard.writeText(valToCopy);
    setStatusMsg(`✓ Copied "${valToCopy}" to clipboard!`);
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleSubmitVisualCode = () => {
    eventBus.emit('IMAGE_INSPECTED', {
      filePath: selectedPath,
      clueAnswer: opticalKey
    });
    eventBus.emit('TASK_ANSWER_SUBMITTED', {
      answer: opticalKey
    });
    setStatusMsg(`✓ Submitted clue key (${opticalKey}) to current task!`);
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleOpenIndexFile = () => {
    openApp('text-editor', {
      meta: { filePath: '/Documents/clues/index.txt' }
    });
  };

  return (
    <div className="image-inspector-app">
      {/* Header */}
      <div className="inspector-header">
        <div className="title-wrap">
          <ImageIcon size={18} className="icon" />
          <span>Image & Optical Scanning Inspector</span>
        </div>
        <p className="inspector-sub">Examine visual artifacts, survey maps, optical markings, and embedded reference keys</p>
      </div>

      {/* Toolbar: Browse Virtual OS & Image Controls */}
      <div className="inspector-toolbar">
        <div className="file-selection-bar">
          <div className="selected-file-display">
            <span className="file-label">TARGET OPTICAL IMAGE:</span>
            <span className={`file-path-tag ${selectedPath ? 'has-file' : 'no-file'}`}>
              {selectedPath || 'No image selected — Click Browse to choose from Virtual OS'}
            </span>
          </div>

          <button
            className="browse-vfs-btn"
            onClick={() => setShowPicker(true)}
            title="Browse and select an image from the Virtual OS"
          >
            <Folder size={15} color="#58a6ff" />
            <span>Browse Virtual OS</span>
          </button>
        </div>

        <div className="tool-controls">
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
          <span className="zoom-text">{zoom}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></button>
          <button className="tool-btn" onClick={handleReset} title="Reset View"><RefreshCw size={14} /></button>
          <button
            className={`tool-btn ${showOverlay ? 'active' : ''}`}
            onClick={() => setShowOverlay(o => !o)}
            title="Toggle Visual Feature Overlay"
          >
            <Eye size={14} />
          </button>
        </div>
      </div>

      {/* Main Viewport & Inspection Canvas */}
      <div className="image-viewport">
        <div
          className="canvas-container"
          style={{
            transform: `scale(${zoom / 100})`,
            filter: `brightness(${brightness}%) contrast(${contrast}%)`
          }}
        >
          {isMap ? (
            /* --- MAP.PNG TOPOGRAPHIC SURVEY RENDERING (TASK 9) --- */
            <div className="simulated-image-frame survey-map-frame">
              <div className="poster-header map-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Compass size={14} color="#58a6ff" />
                  <span>SURVEY RECONNAISSANCE MAP // SECTOR 04-B</span>
                </div>
                <span className="map-coord">REF: CYPH-SURVEY-2026</span>
              </div>

              <div className="map-canvas-area">
                <svg viewBox="0 0 340 180" className="map-svg-render">
                  <defs>
                    <pattern id="surveyGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                      <line x1="0" y1="0" x2="20" y2="0" stroke="rgba(88, 166, 255, 0.15)" strokeWidth="0.8" />
                      <line x1="0" y1="0" x2="0" y2="20" stroke="rgba(88, 166, 255, 0.15)" strokeWidth="0.8" />
                    </pattern>
                  </defs>

                  {/* Coordinate Grid */}
                  <rect width="340" height="180" fill="url(#surveyGrid)" />

                  {/* Topographic Contour Lines */}
                  <path d="M 20 140 Q 90 60 160 110 T 300 80" fill="none" stroke="rgba(126, 231, 135, 0.35)" strokeWidth="1.5" />
                  <path d="M 10 110 Q 100 40 190 90 T 330 60" fill="none" stroke="rgba(126, 231, 135, 0.5)" strokeWidth="1.5" />
                  <path d="M 30 70 Q 120 20 210 60 T 320 30" fill="none" stroke="rgba(126, 231, 135, 0.25)" strokeWidth="1.2" />

                  {/* Elevation Ridges */}
                  <path d="M 60 150 L 120 85 L 180 120 L 250 55 L 310 95" fill="none" stroke="#238636" strokeWidth="2.5" strokeDasharray="4 3" />

                  {/* Waypoint A & B */}
                  <circle cx="120" cy="85" r="4" fill="#58a6ff" />
                  <text x="126" y="82" fill="#58a6ff" fontSize="9" fontFamily="monospace">WP-ALPHA</text>

                  {/* OPTICAL CLUE REFERENCE KEY (TASK 9 CORE EVIDENCE) */}
                  <g transform="translate(180, 55)" className={showOverlay ? 'optical-target-pulse' : ''}>
                    <rect x="-8" y="-8" width="115" height="34" rx="4" fill="rgba(13, 17, 23, 0.92)" stroke="#58a6ff" strokeWidth="1.5" />
                    <circle cx="4" cy="9" r="6" fill="#f85149" opacity="0.85" />
                    <text x="16" y="13" fill="#ffffff" fontSize="12" fontWeight="800" fontFamily="monospace" letterSpacing="1px">
                      CLUE-42
                    </text>
                  </g>
                </svg>

                <div className="map-legend-row">
                  <div className="legend-item">
                    <span className="dot dot-blue" />
                    <span>Optical Marker Target</span>
                  </div>
                  <div className="legend-item">
                    <span className="dot dot-green" />
                    <span>Topographic Contour</span>
                  </div>
                </div>
              </div>

              <div className="poster-footer">
                OPTICAL MARKING RECOVERED: <strong>CLUE-42</strong> → CROSS-REFERENCE IN /Documents/clues/index.txt
              </div>
            </div>
          ) : isPoster ? (
            /* --- FIELD_POSTER.PNG (TASK 2) --- */
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
          ) : (
            /* --- GENERIC VISUAL RASTER FRAME --- */
            <div className="simulated-image-frame generic-frame">
              <div className="poster-header">{node?.name || 'VISUAL ARTIFACT'}</div>
              <div className="poster-body" style={{ alignItems: 'center', padding: '1rem 0' }}>
                <ImageIcon size={48} color="#58a6ff" />
                <span style={{ fontSize: '0.85rem', color: '#8b949e', marginTop: '0.5rem' }}>
                  {node?.path || selectedPath}
                </span>
                <span style={{ fontSize: '0.75rem', color: '#7ee787', fontFamily: 'monospace' }}>
                  {opticalKey !== 'OPTICAL-RAW' ? `ENCODED MARKING: ${opticalKey}` : 'STANDARD RASTER IMAGE'}
                </span>
              </div>
              <div className="poster-footer">DIMENSIONS: {node?.dimensions || '1024x1024'} | SIZE: {node?.size || 'Unknown'}</div>
            </div>
          )}
        </div>

        {/* Viewport Brightness / Contrast Adjustments */}
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

      {/* Visual Element Analysis Summary Panel */}
      <div className="visual-breakdown-panel">
        <div className="panel-title">OPTICAL SCANNING & EVIDENCE BREAKDOWN</div>
        <div className="elements-grid">
          <div className="element-item">
            <span>Selected File</span>
            <strong style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {node?.name || selectedPath.split('/').pop() || 'None'}
            </strong>
          </div>

          <div className="element-item">
            <span>Artifact Category</span>
            <strong>{isMap ? 'Survey Map' : isPoster ? 'Field Poster' : isPhoto ? 'Photo Archive' : 'Raster Image'}</strong>
          </div>

          <div className="element-item highlight-item">
            <span>Optical Clue Reference Key</span>
            <strong className="code-highlight">{opticalKey}</strong>
          </div>

          <div className="element-item">
            <span>Next Investigative Step</span>
            <strong style={{ fontSize: '0.8rem', color: '#79c0ff' }}>
              {isMap ? 'Cross-ref in index.txt' : isPoster ? 'Submit VECTOR-7' : 'Analyze metadata'}
            </strong>
          </div>
        </div>

        <div className="panel-actions">
          <button className="copy-code-btn" onClick={() => handleCopyCode(opticalKey)}>
            <Copy size={14} />
            <span>Copy Key ({opticalKey})</span>
          </button>

          {isMap && (
            <button className="next-step-btn" onClick={handleOpenIndexFile} title="Open /Documents/clues/index.txt in Text Editor">
              <ExternalLink size={14} />
              <span>Open index.txt</span>
            </button>
          )}

          {isPoster && (
            <button className="submit-code-btn" onClick={handleSubmitVisualCode}>
              <CheckCircle size={15} />
              <span>Submit Code ({opticalKey})</span>
            </button>
          )}
        </div>
      </div>

      {statusMsg && <div className="inspector-msg">{statusMsg}</div>}

      {/* Virtual OS File Picker Modal */}
      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleVirtualFileSelected}
        filterExts={['.png', '.jpg', '.jpeg', '.webp', '.svg']}
        title="Select Image in Virtual OS"
      />
    </div>
  );
}
