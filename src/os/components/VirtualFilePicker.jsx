import React, { useState, useEffect } from 'react';
import { Folder, FileText, Image as ImageIcon, File, ChevronRight, ArrowLeft, ArrowUp, HardDrive, X, CheckCircle } from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import './VirtualFilePicker.css';

export function VirtualFilePicker({ isOpen, onClose, onSelectFile, title = 'Select Evidence File from Virtual OS', filterType = null }) {
  const { vfs } = useOS();
  const [currentPath, setCurrentPath] = useState('/');
  const [items, setItems] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadDirectory(currentPath);
    }
  }, [isOpen, currentPath]);

  const loadDirectory = (targetPath) => {
    try {
      // Always list all entries including hidden files for investigation
      const entries = vfs.listDir(targetPath, true);
      setItems(entries);
      setCurrentPath(targetPath);
      setSelectedNode(null);
    } catch (err) {
      console.warn('FilePicker directory load error:', err);
    }
  };

  if (!isOpen) return null;

  const navigateTo = (path) => {
    loadDirectory(path);
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : currentPath.substring(0, lastSlash);
    navigateTo(parentPath);
  };

  const getFileIcon = (item) => {
    if (item.type === 'dir') return <Folder size={20} className="picker-icon-dir" />;
    if (item.mimeType?.startsWith('image/') || item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
      return <ImageIcon size={20} className="picker-icon-img" />;
    }
    if (item.name.endsWith('.txt') || item.name.endsWith('.log') || item.name.endsWith('.dat')) {
      return <FileText size={20} className="picker-icon-txt" />;
    }
    return <File size={20} className="picker-icon-file" />;
  };

  const handleConfirm = () => {
    if (!selectedNode) return;
    onSelectFile(selectedNode);
    onClose();
  };

  const quickFolders = [
    { name: 'Desktop', path: '/Desktop' },
    { name: 'Documents', path: '/Documents' },
    { name: 'Downloads', path: '/Downloads' },
    { name: 'Pictures', path: '/Pictures' },
    { name: 'System Logs', path: '/System/logs' },
    { name: 'Hidden Archive', path: '/.hidden' }
  ];

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="vfp-backdrop" onClick={onClose}>
      <div className="vfp-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="vfp-header">
          <div className="vfp-title">
            <HardDrive size={16} />
            <span>{title}</span>
          </div>
          <button className="vfp-close-btn" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {/* Toolbar & Breadcrumbs */}
        <div className="vfp-toolbar">
          <button className="vfp-btn" onClick={handleUp} disabled={currentPath === '/'} title="Up Directory">
            <ArrowUp size={15} />
          </button>
          <div className="vfp-breadcrumbs">
            <button className="vfp-crumb" onClick={() => navigateTo('/')}>root</button>
            {pathParts.map((part, index) => {
              const segPath = '/' + pathParts.slice(0, index + 1).join('/');
              return (
                <React.Fragment key={segPath}>
                  <ChevronRight size={13} className="vfp-crumb-sep" />
                  <button className="vfp-crumb" onClick={() => navigateTo(segPath)}>{part}</button>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Main Body: Quick Sidebar + File List */}
        <div className="vfp-body">
          <div className="vfp-sidebar">
            <span className="vfp-sidebar-title">VIRTUAL OS FOLDERS</span>
            {quickFolders.map(f => (
              <button
                key={f.path}
                className={`vfp-sidebar-item ${currentPath === f.path ? 'active' : ''}`}
                onClick={() => navigateTo(f.path)}
              >
                <Folder size={14} />
                <span>{f.name}</span>
              </button>
            ))}
          </div>

          <div className="vfp-file-list">
            {items.length === 0 ? (
              <div className="vfp-empty">(Empty Directory)</div>
            ) : (
              items.map(item => {
                const isSelected = selectedNode?.path === item.path;
                const isHidden = item.hidden || item.name.startsWith('.');
                return (
                  <div
                    key={item.path}
                    className={`vfp-item ${isSelected ? 'selected' : ''} ${isHidden ? 'hidden-entry' : ''}`}
                    onClick={() => {
                      if (item.type === 'dir') {
                        navigateTo(item.path);
                      } else {
                        setSelectedNode(item);
                      }
                    }}
                    onDoubleClick={() => {
                      if (item.type === 'dir') {
                        navigateTo(item.path);
                      } else {
                        onSelectFile(item);
                        onClose();
                      }
                    }}
                  >
                    <div className="vfp-item-left">
                      {getFileIcon(item)}
                      <span className="vfp-item-name">{item.name}</span>
                    </div>
                    <span className="vfp-item-meta">
                      {item.type === 'dir' ? 'Folder' : `${item.size || 0} B`}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="vfp-footer">
          <div className="vfp-selected-preview">
            {selectedNode ? (
              <span>Selected: <strong>{selectedNode.path}</strong> ({selectedNode.mimeType || 'file'})</span>
            ) : (
              <span>Double click folder to navigate or select a file to open</span>
            )}
          </div>
          <div className="vfp-footer-actions">
            <button className="vfp-btn-cancel" onClick={onClose}>CANCEL</button>
            <button className="vfp-btn-open" onClick={handleConfirm} disabled={!selectedNode}>
              <CheckCircle size={15} />
              <span>OPEN FILE</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
