import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, ZoomIn, ZoomOut, RefreshCw, Folder, Info, Sliders, Maximize2 } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './ImageInspectorApp.css';

export function ImageInspectorApp({ meta = {} }) {
  const { vfs, eventBus, openApp } = useOS();
  const [selectedPath, setSelectedPath] = useState(meta?.filePath || '');
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showPicker, setShowPicker] = useState(false);
  const [showSliders, setShowSliders] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imgDimensions, setImgDimensions] = useState(null);

  useEffect(() => {
    if (meta?.filePath) {
      setSelectedPath(meta.filePath);
      handleReset();
      setImageError(false);
      setImgDimensions(null);
      eventBus.emit('IMAGE_INSPECTED', { filePath: meta.filePath });
    }
  }, [meta?.filePath]);

  const node = selectedPath ? vfs.getNode(selectedPath) : null;
  const fileName = selectedPath ? selectedPath.split('/').pop() : '';

  const resolveImageSrc = (fileNode, path) => {
    if (!path && !fileNode) return null;
    if (fileNode?.assetUrl) return fileNode.assetUrl;
    if (fileNode?.imageUrl) return fileNode.imageUrl;
    if (fileNode?.url) return fileNode.url;
    const name = fileNode?.name || (path ? path.split('/').pop() : '');
    if (name) {
      return `/assets/pictures/${name}`;
    }
    return null;
  };

  const imageSrc = resolveImageSrc(node, selectedPath);

  const handleZoomIn = () => setZoom(z => Math.min(z + 25, 300));
  const handleZoomOut = () => setZoom(z => Math.max(z - 25, 25));
  const handleReset = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
  };

  const handleSelectImage = (path) => {
    setSelectedPath(path);
    setImageError(false);
    setImgDimensions(null);
    handleReset();
    eventBus.emit('IMAGE_INSPECTED', { filePath: path });
  };

  const handleOpenMetadata = () => {
    if (!selectedPath) return;
    openApp('metadata-inspector', {
      title: `Metadata Inspector - ${fileName}`,
      meta: { filePath: selectedPath }
    });
  };

  return (
    <div className="image-inspector-app">
      {/* Header */}
      <div className="inspector-header">
        <div className="title-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="title-wrap">
            <ImageIcon size={18} className="icon" />
            <span>Image & Optical Inspector</span>
          </div>
          {selectedPath && (
            <button
              className="header-meta-btn"
              onClick={handleOpenMetadata}
              title="Open technical file attributes and EXIF in Metadata Inspector"
            >
              <Info size={14} />
              <span>Inspect Metadata</span>
            </button>
          )}
        </div>
        <p className="inspector-sub">Examine visual artifacts, inspect optical details, and review evidence</p>
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
          <button className="tool-btn" onClick={handleZoomOut} title="Zoom Out" disabled={!selectedPath}>
            <ZoomOut size={14} />
          </button>
          <span className="zoom-text">{zoom}%</span>
          <button className="tool-btn" onClick={handleZoomIn} title="Zoom In" disabled={!selectedPath}>
            <ZoomIn size={14} />
          </button>
          <button className="tool-btn" onClick={handleReset} title="Reset View (100%)" disabled={!selectedPath}>
            <RefreshCw size={14} />
          </button>
          <button
            className={`tool-btn ${showSliders ? 'active' : ''}`}
            onClick={() => setShowSliders(s => !s)}
            title="Adjust Brightness & Contrast"
            disabled={!selectedPath}
          >
            <Sliders size={14} />
          </button>
        </div>
      </div>

      {/* Main Viewport & Inspection Canvas */}
      <div className="image-viewport">
        {selectedPath ? (
          <div
            className="canvas-container"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'center center',
              filter: `brightness(${brightness}%) contrast(${contrast}%)`
            }}
          >
            {!imageError && imageSrc ? (
              <div className="inspector-image-frame">
                <img
                  src={imageSrc}
                  alt={fileName}
                  className="inspector-image-render"
                  onLoad={(e) => {
                    setImgDimensions({
                      width: e.target.naturalWidth,
                      height: e.target.naturalHeight
                    });
                    setImageError(false);
                  }}
                  onError={() => {
                    console.warn('[ImageInspector] Image file failed to load, falling back to simulated frame:', imageSrc);
                    setImageError(true);
                  }}
                />
              </div>
            ) : (
              <div className="simulated-image-frame">
                <div className="poster-header">IMAGE FILE: {fileName}</div>
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
            )}
          </div>
        ) : (
          <div className="canvas-container empty-canvas" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#8b949e' }}>
            <ImageIcon size={48} style={{ opacity: 0.35, marginBottom: '0.75rem' }} />
            <p style={{ fontSize: '0.95rem', fontWeight: 600, color: '#c9d1d9', margin: '0 0 0.35rem 0' }}>No image loaded</p>
            <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Click "Browse Virtual OS" above or double-click an image in File Manager</span>
          </div>
        )}

        {/* Viewport Brightness / Contrast Adjustments */}
        {selectedPath && showSliders && (
          <div className="viewport-adjustments">
            <div className="adj-group">
              <label>BRIGHTNESS ({brightness}%)</label>
              <input type="range" min="50" max="180" value={brightness} onChange={(e) => setBrightness(Number(e.target.value))} />
            </div>
            <div className="adj-group">
              <label>CONTRAST ({contrast}%)</label>
              <input type="range" min="50" max="180" value={contrast} onChange={(e) => setContrast(Number(e.target.value))} />
            </div>
            <button
              onClick={() => { setBrightness(100); setContrast(100); }}
              style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', fontSize: '0.7rem', padding: '2px 4px', borderRadius: '3px', cursor: 'pointer', marginTop: '4px' }}
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Telemetry & File Attributes Bar */}
      {selectedPath && (
        <div className="inspector-telemetry-bar">
          <div className="telemetry-badges">
            <span className="telemetry-badge">
              FILE: <strong>{fileName}</strong>
            </span>
            <span className="telemetry-badge">
              RES: <strong>{imgDimensions ? `${imgDimensions.width}×${imgDimensions.height}` : node?.dimensions || 'Auto'}</strong>
            </span>
            <span className="telemetry-badge">
              SIZE: <strong>{node?.size ? (node.size > 1000000 ? `${(node.size / 1048576).toFixed(2)} MB` : `${Math.round(node.size / 1024)} KB`) : '--'}</strong>
            </span>
            {(node?.hardwareId || node?.deviceId || selectedPath.includes('device.png')) && (
              <span className="telemetry-badge highlight-id">
                HARDWARE ID: <strong>{node?.hardwareId || node?.deviceId || 'VX-27'}</strong>
              </span>
            )}
            {node?.qrPayload && (
              <span className="telemetry-badge highlight-qr">
                OPTICAL PAYLOAD: <strong>{node.qrPayload}</strong>
              </span>
            )}
          </div>
          <button className="telemetry-meta-btn" onClick={handleOpenMetadata}>
            <Info size={13} />
            <span>Open in Metadata Inspector</span>
          </button>
        </div>
      )}

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
