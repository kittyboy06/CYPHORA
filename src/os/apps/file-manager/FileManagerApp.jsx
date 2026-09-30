import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  File,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  LayoutGrid,
  List,
  RefreshCw,
  HardDrive,
  Trash2,
  Lock,
  Compass,
  Eye,
  Info,
  X
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './FileManagerApp.css';

export function FileManagerApp() {
  const { vfs, eventBus, openApp } = useOS();
  const [currentPath, setCurrentPath] = useState('/');
  const [history, setHistory] = useState(['/']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [showHidden, setShowHidden] = useState(false);
  const [showPropertiesModal, setShowPropertiesModal] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');

  const loadDirectory = (targetPath, includeHidden = showHidden) => {
    try {
      const entries = vfs.listDir(targetPath, includeHidden);
      setItems(entries);
      setCurrentPath(targetPath);
      setSelectedItem(null);
      setStatusMessage('');
      eventBus.emit('DIR_CHANGED', { to: targetPath, appId: 'file-manager' });

      if (targetPath.includes('.hidden') || targetPath.includes('.archive')) {
        eventBus.emit('HIDDEN_FOLDER_FOUND', {
          folderPath: targetPath
        });
      }
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath, showHidden);
  }, [currentPath, showHidden]);

  useEffect(() => {
    const unsubCreated = eventBus.on('FILE_CREATED', () => loadDirectory(currentPath, showHidden));
    const unsubDeleted = eventBus.on('FILE_DELETED', () => loadDirectory(currentPath, showHidden));
    const unsubReset = eventBus.on('VFS_RESET', () => loadDirectory('/', showHidden));

    return () => {
      unsubCreated();
      unsubDeleted();
      unsubReset();
    };
  }, [currentPath, showHidden]);

  const navigateTo = (path, forceHidden = null) => {
    const nextHidden = forceHidden !== null ? forceHidden : (path.includes('.hidden') ? true : showHidden);
    if (nextHidden !== showHidden) {
      setShowHidden(nextHidden);
    }
    if (path === currentPath && nextHidden === showHidden) return;
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    loadDirectory(path, nextHidden);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      loadDirectory(history[prevIdx], showHidden);
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      loadDirectory(history[nextIdx], showHidden);
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : currentPath.substring(0, lastSlash);
    navigateTo(parentPath);
  };

  const handleToggleHidden = () => {
    const nextHidden = !showHidden;
    setShowHidden(nextHidden);
    loadDirectory(currentPath, nextHidden);
    if (nextHidden) {
      setStatusMessage('✓ Showing hidden directories (e.g. /.hidden/)');
      setTimeout(() => setStatusMessage(''), 2500);
    }
  };

  const handleInspectProperties = (item = selectedItem) => {
    if (!item) return;
    setSelectedItem(item);
    setShowPropertiesModal(true);

    eventBus.emit('FILE_PROPERTIES_VIEWED', {
      filePath: item.path,
      fileName: item.name,
      size: item.size,
      modifiedAt: item.updatedAt
    });
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'dir') {
      navigateTo(item.path);
    } else {
      const isText = item.mimeType === 'text/plain' ||
        item.name.endsWith('.txt') ||
        item.name.endsWith('.log') ||
        item.name.endsWith('.dat') ||
        item.name.endsWith('.cfg');

      if (isText) {
        openApp('text-editor', {
          title: `Text Editor - ${item.name}`,
          meta: { filePath: item.path }
        });
      } else if (item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
        openApp('metadata-inspector');
      } else {
        handleInspectProperties(item);
      }
    }
  };

  const getFileIcon = (item) => {
    if (item.type === 'dir') return <Folder size={32} className="fm-icon-folder" />;
    if (item.mimeType?.startsWith('image/') || item.name.endsWith('.png') || item.name.endsWith('.jpg')) {
      return <ImageIcon size={32} className="fm-icon-image" />;
    }
    if (item.name.endsWith('.txt') || item.name.endsWith('.log') || item.name.endsWith('.dat') || item.name.endsWith('.cfg')) {
      return <FileText size={32} className="fm-icon-text" />;
    }
    return <File size={32} className="fm-icon-file" />;
  };

  const quickLinks = [
    { name: 'Desktop', path: '/Desktop', icon: <HardDrive size={16} /> },
    { name: 'Documents', path: '/Documents', icon: <Folder size={16} /> },
    { name: 'Downloads', path: '/Downloads', icon: <Folder size={16} /> },
    { name: 'Pictures', path: '/Pictures', icon: <ImageIcon size={16} /> },
    { name: 'Archive', path: '/Archive', icon: <Folder size={16} /> },
    { name: 'System', path: '/System', icon: <Lock size={16} /> },
    { name: 'Hidden Archive', path: '/Archive/.hidden', icon: <Folder size={16} className="hidden-link" /> }
  ];

  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="fm-container">
      {/* Top toolbar */}
      <div className="fm-toolbar">
        <div className="fm-nav-controls">
          <button className="fm-btn" onClick={handleBack} disabled={historyIdx <= 0} title="Back">
            <ArrowLeft size={16} />
          </button>
          <button className="fm-btn" onClick={handleForward} disabled={historyIdx >= history.length - 1} title="Forward">
            <ArrowRight size={16} />
          </button>
          <button className="fm-btn" onClick={handleUp} disabled={currentPath === '/'} title="Up Directory">
            <ArrowUp size={16} />
          </button>
          <button className="fm-btn" onClick={() => loadDirectory(currentPath, showHidden)} title="Refresh">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Address bar */}
        <div className="fm-breadcrumb-bar">
          <button className="fm-crumb root-crumb" onClick={() => navigateTo('/')}>
            root
          </button>
          {pathParts.map((part, index) => {
            const segmentPath = '/' + pathParts.slice(0, index + 1).join('/');
            return (
              <React.Fragment key={segmentPath}>
                <ChevronRight size={14} className="fm-crumb-sep" />
                <button
                  className={`fm-crumb ${index === pathParts.length - 1 ? 'active-crumb' : ''}`}
                  onClick={() => navigateTo(segmentPath)}
                >
                  {part}
                </button>
              </React.Fragment>
            );
          })}
        </div>

        {/* Hidden toggle & View mode */}
        <div className="fm-right-tools">
          <button
            className={`fm-btn hidden-toggle-btn ${showHidden ? 'active' : ''}`}
            onClick={handleToggleHidden}
            title="Toggle Hidden Files & Folders"
          >
            <Eye size={15} />
            <span>{showHidden ? 'Hide Hidden' : 'Show Hidden'}</span>
          </button>

          <div className="fm-view-toggle">
            <button
              className={`fm-btn ${viewMode === 'grid' ? 'active-mode' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={16} />
            </button>
            <button
              className={`fm-btn ${viewMode === 'list' ? 'active-mode' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Main split area */}
      <div className="fm-body">
        {/* Sidebar */}
        <div className="fm-sidebar">
          <div className="fm-sidebar-group-title">QUICK ACCESS</div>
          {quickLinks.map(link => (
            <button
              key={link.path}
              className={`fm-sidebar-link ${currentPath === link.path ? 'active' : ''}`}
              onClick={() => navigateTo(link.path)}
            >
              {link.icon}
              <span>{link.name}</span>
            </button>
          ))}
        </div>

        {/* Files content pane */}
        <div className="fm-content-pane">
          {statusMessage ? (
            <div className="fm-info-state">{statusMessage}</div>
          ) : items.length === 0 ? (
            <div className="fm-empty-state">This directory is empty</div>
          ) : viewMode === 'grid' ? (
            <div className="fm-grid-view">
              {items.map(item => {
                const isSelected = selectedItem?.path === item.path;
                const isHidden = item.hidden || item.name.startsWith('.');
                return (
                  <div
                    key={item.path}
                    className={`fm-grid-item ${isSelected ? 'selected' : ''} ${isHidden ? 'hidden-item' : ''}`}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <div className="fm-icon-wrapper">{getFileIcon(item)}</div>
                    <span className="fm-item-name" title={item.name}>
                      {item.name}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="fm-list-view">
              <div className="fm-list-header">
                <span className="col-name">Name</span>
                <span className="col-type">Type</span>
                <span className="col-size">Size</span>
                <span className="col-date">Modified</span>
              </div>
              {items.map(item => {
                const isSelected = selectedItem?.path === item.path;
                const isHidden = item.hidden || item.name.startsWith('.');
                return (
                  <div
                    key={item.path}
                    className={`fm-list-row ${isSelected ? 'selected' : ''} ${isHidden ? 'hidden-item' : ''}`}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <span className="col-name">
                      {item.type === 'dir' ? <Folder size={16} /> : <FileText size={16} />}
                      <span className="name-text">{item.name}</span>
                    </span>
                    <span className="col-type">{item.type === 'dir' ? 'Folder' : (item.mimeType || 'File')}</span>
                    <span className="col-size">{item.type === 'dir' ? '--' : `${item.size || 0} B`}</span>
                    <span className="col-date">{new Date(item.updatedAt || Date.now()).toLocaleTimeString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* File Properties Modal */}
      {showPropertiesModal && selectedItem && (
        <div className="fm-modal-backdrop" onClick={() => setShowPropertiesModal(false)}>
          <div className="fm-properties-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <Info size={16} />
                <span>File Properties — {selectedItem.name}</span>
              </div>
              <button className="close-btn" onClick={() => setShowPropertiesModal(false)}>
                <X size={16} />
              </button>
            </div>

            <div className="modal-body">
              <div className="prop-row"><span>File Name:</span><strong>{selectedItem.name}</strong></div>
              <div className="prop-row"><span>Path:</span><strong>{selectedItem.path}</strong></div>
              <div className="prop-row"><span>Exact Size:</span><strong className="size-val">{selectedItem.size || 4096} bytes</strong></div>
              <div className="prop-row"><span>MIME Type:</span><strong>{selectedItem.mimeType || 'text/plain'}</strong></div>
            </div>
          </div>
        </div>
      )}

      {/* Status footer bar */}
      <div className="fm-footer">
        <span>{items.length} item{items.length === 1 ? '' : 's'}</span>
        {selectedItem && (
          <div className="fm-footer-right">
            <button className="inspect-prop-btn" onClick={() => handleInspectProperties(selectedItem)}>
              <Info size={13} />
              <span>Inspect Properties</span>
            </button>
            <span className="fm-selected-desc">
              Selected: {selectedItem.name} ({selectedItem.type === 'dir' ? 'Folder' : `${selectedItem.size || 0} B`})
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
