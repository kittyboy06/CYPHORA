import React, { useState } from 'react';
import { Info, FileSearch, Copy, Check, Folder } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './MetadataInspectorApp.css';

export function MetadataInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleInspectVFS = (pathToInspect = selectedPath) => {
    if (!pathToInspect) return;
    const node = vfs.getNode(pathToInspect);
    if (!node) {
      setMetadata({ error: `File '${pathToInspect}' not found in Virtual Filesystem.` });
      return;
    }

    const isEvidence = node.path.includes('evidence');
    const isPhoto = node.path.includes('photo');
    const isBeacon = node.path.includes('enclave_beacon');
    const isDevice = node.path.toLowerCase().includes('device');

    const meta = {
      name: node.name,
      path: node.path,
      size: `${node.size || 2145760} bytes`,
      mimeType: node.mimeType || 'image/jpeg',
      author: node.author || (isEvidence ? 'ARLO' : isPhoto ? 'ARCHIVIST-01' : 'UNKNOWN'),
      hardwareId: node.hardwareId || node.deviceId || (node.path.includes('device.png') ? 'VX-27' : node.path.includes('device-9') ? 'DEV-09' : null),
      software: node.software || 'Workstation Pro v3',
      createdDate: node.createdDate || '2026-09-24T09:12:00.000Z',
      modifiedDate: node.modifiedDate || '2026-09-24T10:15:00.000Z',
      description: node.description || (isDevice ? 'Hardware ID: VX-27' : 'STANDARD_METADATA'),
      cameraModel: 'Field Recon Camera Mark II',
      hashMD5: '7f9a2b819e410c558d0a319f'
    };

    setMetadata(meta);

    // Emit METADATA_INSPECTED tracking event (audit only)
    eventBus.emit('METADATA_INSPECTED', {
      filePath: node.path,
      fileName: node.name,
      author: meta.author,
      metadataValue: meta.description
    });
  };

  const handleVirtualFileSelected = (virtualNode) => {
    if (!virtualNode) return;
    setSelectedPath(virtualNode.path);
    handleInspectVFS(virtualNode.path);
  };

  const handleCopyVal = (key, val) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  return (
    <div className="metadata-inspector-app">
      <div className="inspector-header">
        <div className="title-wrap">
          <Info size={18} className="icon" />
          <span>Metadata Inspector</span>
        </div>
        <p className="sub">Extract hidden file attributes, EXIF tags, author credentials, and structural comments</p>
      </div>

      <div className="inspector-controls">
        <div className="file-selection-bar">
          <div className="selected-file-display">
            <span className="file-label">TARGET EVIDENCE:</span>
            <span className={`file-path-tag ${selectedPath ? 'has-file' : 'no-file'}`}>
              {selectedPath || 'No file selected — Click Browse to choose from Virtual OS'}
            </span>
          </div>

          <div className="selection-actions">
            <button
              className="browse-vfs-btn"
              onClick={() => setShowPicker(true)}
            >
              <Folder size={15} color="#58a6ff" />
              <span>Browse Virtual OS</span>
            </button>

            <button
              className="inspect-btn"
              onClick={() => handleInspectVFS(selectedPath)}
              disabled={!selectedPath}
            >
              <FileSearch size={15} />
              <span>Inspect Metadata</span>
            </button>
          </div>
        </div>
      </div>

      {!selectedPath && !metadata && (
        <div className="empty-state-notice">
          <Info size={28} style={{ opacity: 0.6, marginBottom: '0.5rem' }} />
          <p>No file selected.</p>
          <span>Click <strong>"Browse Virtual OS"</strong> above to select and inspect an image or evidence file from your workstation folders.</span>
        </div>
      )}

      {/* Metadata Table Display */}
      {metadata && !metadata.error && (
        <div className="metadata-results">
          <h3>FILE METADATA RECORD</h3>
          <div className="meta-grid">
            <div className="meta-row"><span className="key">File Name</span><span className="val">{metadata.name}</span></div>
            <div className="meta-row"><span className="key">File Path</span><span className="val">{metadata.path}</span></div>
            <div className="meta-row"><span className="key">File Size</span><span className="val">{metadata.size}</span></div>
            <div className="meta-row"><span className="key">MIME Type</span><span className="val">{metadata.mimeType}</span></div>
            <div className="meta-row">
              <span className="key">Author / Creator</span>
              <span className="val">{metadata.author}</span>
            </div>
            {metadata.hardwareId && (
              <div className="meta-row" style={{ background: 'rgba(88, 166, 255, 0.15)', borderLeft: '3px solid #58a6ff' }}>
                <span className="key" style={{ color: '#58a6ff', fontWeight: 'bold' }}>Registered Hardware ID</span>
                <span className="val" style={{ color: '#58a6ff', fontWeight: 'bold', fontFamily: 'monospace', fontSize: '1.05rem' }}>
                  {metadata.hardwareId}
                </span>
              </div>
            )}
            <div className="meta-row"><span className="key">Software Used</span><span className="val">{metadata.software}</span></div>
            <div className="meta-row"><span className="key">Time Created</span><span className="val">{metadata.createdDate}</span></div>
            <div className="meta-row"><span className="key">Time Modified</span><span className="val">{metadata.modifiedDate}</span></div>
            <div className="meta-row">
              <span className="key">Description / Comment</span>
              <span className="val">{metadata.description}</span>
            </div>
            <div className="meta-row"><span className="key">Camera Model</span><span className="val">{metadata.cameraModel}</span></div>
            <div className="meta-row"><span className="key">MD5 Hash</span><span className="val mono">{metadata.hashMD5}</span></div>
          </div>
        </div>
      )}

      {metadata?.error && (
        <div className="meta-status-msg error">{metadata.error}</div>
      )}

      {/* Virtual File Picker Modal */}
      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleVirtualFileSelected}
        title="Select File to Inspect from Virtual OS"
      />
    </div>
  );
}
