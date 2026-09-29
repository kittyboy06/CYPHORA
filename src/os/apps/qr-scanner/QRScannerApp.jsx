import React, { useState } from 'react';
import { QrCode, Scan, Copy, ExternalLink, Folder } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './QRScannerApp.css';

const DEFAULT_QR_IMAGES = [
  { label: 'poster.png (Pictures - Task 03 Poster)', path: '/Pictures/poster.png' },
  { label: 'sector_qr.png (Pictures)', path: '/Pictures/sector_qr.png' },
  { label: 'archive_map.png (Pictures - Task 09 Map)', path: '/Pictures/archive_map.png' },
  { label: 'location_qr.png (Pictures)', path: '/Pictures/location_qr.png' },
  { label: 'beacon_scan.png (System/logs - Task 12 Scan)', path: '/System/logs/beacon_scan.png' }
];

export function QRScannerApp() {
  const { vfs, openApp, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('/Pictures/poster.png');
  const [isScanning, setIsScanning] = useState(false);
  const [qrOutput, setQrOutput] = useState('01010011 01000101 01000011 01010100 01001111 01000010 00101101 00110111');
  const [statusMsg, setStatusMsg] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const handleScan = (pathToScan = selectedPath) => {
    setIsScanning(true);
    setQrOutput('');
    setStatusMsg('');

    setTimeout(() => {
      setIsScanning(false);
      let payload = '01010011 01000101 01000011 01010100 01001111 01000010 00101101 00110111';
      const node = typeof pathToScan === 'string' ? vfs.getNode(pathToScan) : null;

      if (node && node.qrPayload) {
        payload = node.qrPayload;
      } else if (typeof pathToScan === 'string' && (pathToScan.includes('poster') || pathToScan.includes('sector'))) {
        payload = '01010011 01000101 01000011 01010100 01001111 01000010 00101101 00110111';
      } else if (typeof pathToScan === 'string' && (pathToScan.includes('archive') || pathToScan.includes('location') || pathToScan.includes('map'))) {
        payload = '/Documents/clues/numbers.txt';
      } else if (typeof pathToScan === 'string' && (pathToScan.includes('beacon') || pathToScan.includes('logs'))) {
        payload = '/Documents/final_cipher.txt';
      } else {
        payload = '01010011 01000101 01000011 01010100 01001111 01000010 00101101 00110111';
      }

      setQrOutput(payload);

      // Emit QR_SCANNED tracking event (audit only)
      eventBus.emit('QR_SCANNED', {
        imagePath: typeof pathToScan === 'string' ? pathToScan : '[Selected Virtual Image]',
        qrOutput: payload
      });
    }, 500);
  };

  const handleVirtualFileSelected = (virtualNode) => {
    if (!virtualNode) return;
    setSelectedPath(virtualNode.path);
    handleScan(virtualNode.path);
  };

  const handleSelectImage = (e) => {
    const p = e.target.value;
    setSelectedPath(p);
    handleScan(p);
  };

  const handleCopy = () => {
    if (!qrOutput) return;
    navigator.clipboard.writeText(qrOutput);
    setStatusMsg('✓ Payload copied to clipboard!');
    setTimeout(() => setStatusMsg(''), 2500);
  };

  const handleOpenTargetFile = () => {
    if (!qrOutput || !qrOutput.startsWith('/')) return;
    openApp('text-editor', {
      meta: { filePath: qrOutput }
    });
    eventBus.emit('FILE_OPENED', { filePath: qrOutput, openedBy: 'qr-scanner' });
  };

  return (
    <div className="qr-scanner-app">
      <div className="scanner-header">
        <div className="title-wrap">
          <QrCode size={18} className="icon" />
          <span>QR Scanner</span>
        </div>
        <p className="sub">Extract embedded machine-readable data payloads from optical image streams</p>
      </div>

      <div className="scanner-controls" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="control-group" style={{ flex: 1 }}>
          <label>SELECT IMAGE FROM VFS:</label>
          <select value={selectedPath.startsWith('/') ? selectedPath : DEFAULT_QR_IMAGES[0].path} onChange={handleSelectImage} className="scanner-select">
            {DEFAULT_QR_IMAGES.map(img => (
              <option key={img.path} value={img.path}>{img.label}</option>
            ))}
          </select>
        </div>

        <button
          className="scan-btn"
          onClick={() => setShowPicker(true)}
          style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d' }}
        >
          <Folder size={15} color="#58a6ff" />
          <span>Browse Virtual OS</span>
        </button>

        <button className="scan-btn" onClick={() => handleScan(selectedPath)} disabled={isScanning}>
          <Scan size={15} />
          <span>{isScanning ? 'Scanning...' : 'Scan Image'}</span>
        </button>
      </div>

      {/* Visual Scan Frame */}
      <div className={`scan-viewfinder ${isScanning ? 'scanning' : ''}`}>
        <div className="viewfinder-frame">
          <QrCode size={90} className="qr-glyph" />
          {isScanning && <div className="laser-line" />}
        </div>
        <span className="viewfinder-label">
          {isScanning ? 'DECODING OPTICAL MATRIX...' : `TARGET IMAGE: ${selectedPath}`}
        </span>
      </div>

      {/* Result Display */}
      {qrOutput && !isScanning && (
        <div className="scan-result-panel">
          <div className="result-header">DECODED QR PAYLOAD DATA</div>
          <div className="result-value">{qrOutput}</div>

          <div className="result-actions">
            {qrOutput.startsWith('/') && (
              <button className="action-btn" onClick={handleOpenTargetFile}>
                <ExternalLink size={14} />
                <span>Open Referenced File</span>
              </button>
            )}
            <button className="action-btn" onClick={handleCopy}>
              <Copy size={14} />
              <span>Copy Payload</span>
            </button>
          </div>
        </div>
      )}

      {statusMsg && <div className="scanner-msg" style={{ color: '#7ee787', fontWeight: 700, marginTop: '0.8rem' }}>{statusMsg}</div>}

      {/* Virtual File Picker Modal */}
      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleVirtualFileSelected}
        title="Select Image to Scan from Virtual OS"
      />
    </div>
  );
}
