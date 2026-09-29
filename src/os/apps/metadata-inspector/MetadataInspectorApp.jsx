import React, { useState } from 'react';
import { Info, FileSearch, Copy, Check, Folder } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './MetadataInspectorApp.css';

const DEFAULT_METADATA_FILES = [
  { label: 'evidence.jpg (Pictures - Task 02 & Task 07 Evidence)', path: '/Pictures/evidence.jpg' },
  { label: 'expedition_photo.png (Pictures)', path: '/Pictures/expedition_photo.png' },
  { label: 'photo.png (Pictures - Task 11 Evidence)', path: '/Pictures/photo.png' },
  { label: 'enclave_beacon.png (.hidden - Task 12 Concealed Evidence)', path: '/.hidden/enclave_beacon.png' },
  { label: 'poster.png (Pictures)', path: '/Pictures/poster.png' }
];

export function MetadataInspectorApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('');
  const [metadata, setMetadata] = useState(null);
  const [copiedKey, setCopiedKey] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleInspectVFS = (pathToInspect = selectedPath) => {
    const node = vfs.getNode(pathToInspect);
    if (!node) {
      setMetadata({ error: `File '${pathToInspect}' not found in Virtual Filesystem.` });
      return;
    }

    const isEvidence = node.path.includes('evidence');
    const isPhoto = node.path.includes('photo');
    const isBeacon = node.path.includes('enclave_beacon');

    const meta = {
      name: node.name,
      path: node.path,
      size: `${node.size || 2145760} bytes`,
      mimeType: node.mimeType || 'image/jpeg',
      author: node.author || (isEvidence ? 'ARLO' : isPhoto ? 'ARCHIVIST' : 'UNKNOWN'),
      software: node.software || 'Workstation Pro v3',
      createdDate: node.createdDate || '2026-09-24T09:12:00.000Z',
      modifiedDate: node.modifiedDate || '2026-09-24T10:15:00.000Z',
      description: node.description || (isEvidence ? '48 45 4C 50' : isPhoto ? 'ARCHIVE_04' : isBeacon ? 'Beacon QR payload inside /System/logs/beacon_scan.png' : 'STANDARD_METADATA'),
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

  const handleSelectFile = (e) => {
    const p = e.target.value;
    setSelectedPath(p);
    if (p) {
      handleInspectVFS(p);
    } else {
      setMetadata(null);
    }
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

      <div className="inspector-controls" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="control-group" style={{ flex: 1 }}>
          <label>SELECT FILE FROM VFS:</label>
          <select value={selectedPath} onChange={handleSelectFile} className="inspector-select">
            <option value="">-- Select File from Virtual OS --</option>
            {DEFAULT_METADATA_FILES.map(f => (
              <option key={f.path} value={f.path}>{f.label}</option>
            ))}
          </select>
        </div>

        <button
          className="inspect-btn"
          onClick={() => setShowPicker(true)}
          style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d' }}
        >
          <Folder size={15} color="#58a6ff" />
          <span>Browse Virtual OS</span>
        </button>

        <button className="inspect-btn" onClick={() => handleInspectVFS(selectedPath)} disabled={!selectedPath}>
          <FileSearch size={15} />
          <span>Inspect Metadata</span>
        </button>
      </div>

      {!selectedPath && !metadata && (
        <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: '#8b949e', fontStyle: 'italic', background: '#0d1117', border: '1px solid #21262d', borderRadius: '6px', marginTop: '1rem' }}>
          No file selected. Choose a file from the dropdown above or click 'Browse Virtual OS' to inspect a file.
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
            <div className="meta-row highlight-row">
              <span className="key">Author / Creator</span>
              <span className="val highlight" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{metadata.author}</span>
                <button className="copy-icon-btn" onClick={() => handleCopyVal('author', metadata.author)} title="Copy value">
                  {copiedKey === 'author' ? <Check size={13} color="#7ee787" /> : <Copy size={13} />}
                </button>
              </span>
            </div>
            <div className="meta-row"><span className="key">Software Used</span><span className="val">{metadata.software}</span></div>
            <div className="meta-row"><span className="key">Time Created</span><span className="val">{metadata.createdDate}</span></div>
            <div className="meta-row"><span className="key">Time Modified</span><span className="val">{metadata.modifiedDate}</span></div>
            <div className="meta-row highlight-row">
              <span className="key">Description / Comment</span>
              <span className="val highlight" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>{metadata.description}</span>
                <button className="copy-icon-btn" onClick={() => handleCopyVal('desc', metadata.description)} title="Copy value">
                  {copiedKey === 'desc' ? <Check size={13} color="#7ee787" /> : <Copy size={13} />}
                </button>
              </span>
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
