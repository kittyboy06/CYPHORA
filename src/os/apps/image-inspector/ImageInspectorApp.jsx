import React, { useState } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RefreshCw, Eye, Folder } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './ImageInspectorApp.css';

const DEFAULT_IMAGES = [
  { label: 'evidence.jpg', path: '/Pictures/evidence.jpg' },
  { label: 'poster.png', path: '/Pictures/poster.png' },
  { label: 'archive_photo.png', path: '/Pictures/archive_photo.png' },
  { label: 'map.png', path: '/Pictures/map.png' },
  { label: 'device-9.jpg', path: '/Pictures/device-9.jpg' },
  { label: 'device.png', path: '/Pictures/device.png' }
];

export function ImageInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('/Pictures/poster.png');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showPicker, setShowPicker] = useState(false);

  const node = vfs.getNode(selectedPath);

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 250));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 50));
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
  };

  const handleSelectImage = (path) => {
    setSelectedPath(path);
    handleReset();
    eventBus.emit('IMAGE_INSPECTED', { filePath: path });
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
        <p className="sub">Examine visual artifacts, optical details, and image properties</p>
      </div>

      {/* Toolbar: Browse Virtual OS & Image Controls */}
      <div className="inspector-toolbar">
        <div className="select-wrap">
          <label>SELECT IMAGE:</label>
          <select
            value={selectedPath}
            onChange={(e) => handleSelectImage(e.target.value)}
            className="image-select"
          >
            {DEFAULT_IMAGES.map(img => (
              <option key={img.path} value={img.path}>{img.label}</option>
            ))}
          </select>
          <button
            className="tool-btn"
            onClick={() => setShowPicker(true)}
            title="Browse Virtual OS"
            style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', padding: '0.3rem 0.6rem' }}
          >
            <Folder size={14} color="#58a6ff" />
            <span style={{ fontSize: '0.75rem' }}>Browse</span>
          </button>
        </div>

        <div className="tool-controls">
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={14} /></button>
          <span className="zoom-text">{zoom}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={14} /></button>
          <button className="tool-btn" onClick={handleReset} title="Reset View"><RefreshCw size={14} /></button>
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
          <div className="simulated-image-frame">
            <div className="poster-header">IMAGE FILE: {selectedPath.split('/').pop()}</div>
            <div className="poster-body">
              <div style={{ padding: '1.5rem', textAlign: 'center', color: '#eae0c8' }}>
                <p style={{ fontFamily: 'monospace', fontSize: '0.9rem' }}>
                  {node?.content || `[VISUAL EVIDENCE: ${selectedPath}]`}
                </p>
                {node?.dimensions && (
                  <p style={{ fontSize: '0.75rem', color: '#8b949e', marginTop: '0.5rem' }}>
                    Dimensions: {node.dimensions} | Size: {node.size ? Math.round(node.size / 1024) : 0} KB
                  </p>
                )}
              </div>
            </div>
            <div className="poster-footer">LOCATION: {selectedPath}</div>
          </div>
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

      {/* Virtual File Picker */}
      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={(f) => handleSelectImage(f.path)}
        title="Select Image to Inspect from Virtual OS"
      />
    </div>
  );
}
