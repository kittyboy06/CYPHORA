import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RefreshCw, Folder } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './ImageInspectorApp.css';

export function ImageInspectorApp({ meta = {} }) {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState(meta?.filePath || '');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (meta?.filePath) {
      setSelectedPath(meta.filePath);
      handleReset();
      eventBus.emit('IMAGE_INSPECTED', { filePath: meta.filePath });
    }
  }, [meta?.filePath]);

  const node = selectedPath ? vfs.getNode(selectedPath) : null;

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

  return (
    <div className="image-inspector-app">
      {/* Header */}
      <div className="inspector-header">
        <div className="title-wrap">
          <ImageIcon size={18} className="icon" />
          <span>Image & Optical Scanning Inspector</span>
        </div>
        <p className="inspector-sub">Examine visual artifacts, optical details, and image properties</p>
      </div>

      {/* Toolbar: Browse Virtual OS & Image Controls */}
      <div className="inspector-toolbar">
        <div className="file-selection-bar">
          <div className="selected-file-display">
            <span className="file-label">TARGET IMAGE:</span>
            <span className={`file-path-tag ${selectedPath ? 'has-file' : 'no-file'}`}>
              {selectedPath || 'No image selected — Click Browse to choose from Virtual OS'}
            </span>
          </div>
          <button
            className="browse-vfs-btn"
            onClick={() => setShowPicker(true)}
            title="Browse Virtual OS"
          >
            <Folder size={15} color="#58a6ff" />
            <span>Browse Virtual OS</span>
          </button>
        </div>

        <div className="tool-controls">
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out" disabled={!selectedPath}><ZoomOut size={14} /></button>
          <span className="zoom-text">{zoom}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In" disabled={!selectedPath}><ZoomIn size={14} /></button>
          <button className="tool-btn" onClick={handleReset} title="Reset View" disabled={!selectedPath}><RefreshCw size={14} /></button>
        </div>
      </div>

      {/* Main Viewport & Inspection Canvas */}
      <div className="image-viewport">
        {selectedPath ? (
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
                  {(node?.hardwareId || node?.deviceId || selectedPath.includes('device.png')) && (
                    <div style={{ margin: '0.8rem auto 0.4rem', padding: '0.5rem 1rem', background: 'rgba(88, 166, 255, 0.18)', border: '1px solid #58a6ff', borderRadius: '4px', display: 'inline-block' }}>
                      <span style={{ color: '#8b949e', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>REGISTERED HARDWARE ID: </span>
                      <strong style={{ color: '#58a6ff', fontSize: '1.15rem', fontFamily: 'monospace', marginLeft: '0.4rem' }}>
                        {node?.hardwareId || node?.deviceId || 'VX-27'}
                      </strong>
                    </div>
                  )}
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
        ) : (
          <div className="canvas-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
            <ImageIcon size={48} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c9d1d9', margin: '0 0 0.35rem 0' }}>No image loaded</p>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click "Browse Virtual OS" above to inspect an image file</span>
          </div>
        )}

        {/* Viewport Brightness / Contrast Adjustments */}
        {selectedPath && (
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
        )}
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
