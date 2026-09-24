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
  Lock
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './FileManagerApp.css';

export function FileManagerApp() {
  const { vfs, eventBus, openApp } = useOS();
  const [currentPath, setCurrentPath] = useState('/Desktop');
  const [history, setHistory] = useState(['/Desktop']);
  const [historyIdx, setHistoryIdx] = useState(0);
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [statusMessage, setStatusMessage] = useState('');

  const loadDirectory = (targetPath) => {
    try {
      const entries = vfs.listDir(targetPath, true);
      setItems(entries);
      setCurrentPath(targetPath);
      setSelectedItem(null);
      setStatusMessage('');
      eventBus.emit('DIR_CHANGED', { to: targetPath, appId: 'file-manager' });
    } catch (err) {
      setStatusMessage(`Error: ${err.message}`);
    }
  };

  useEffect(() => {
    loadDirectory(currentPath);
  }, [currentPath]);

  // Listen to file creations or deletions
  useEffect(() => {
    const unsubCreated = eventBus.on('FILE_CREATED', () => loadDirectory(currentPath));
    const unsubDeleted = eventBus.on('FILE_DELETED', () => loadDirectory(currentPath));
    const unsubReset = eventBus.on('VFS_RESET', () => loadDirectory('/Desktop'));

    return () => {
      unsubCreated();
      unsubDeleted();
      unsubReset();
    };
  }, [currentPath]);

  const navigateTo = (path) => {
    if (path === currentPath) return;
    const newHistory = history.slice(0, historyIdx + 1);
    newHistory.push(path);
    setHistory(newHistory);
    setHistoryIdx(newHistory.length - 1);
    loadDirectory(path);
  };

  const handleBack = () => {
    if (historyIdx > 0) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      loadDirectory(history[prevIdx]);
    }
  };

  const handleForward = () => {
    if (historyIdx < history.length - 1) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      loadDirectory(history[nextIdx]);
    }
  };

  const handleUp = () => {
    if (currentPath === '/') return;
    const lastSlash = currentPath.lastIndexOf('/');
    const parentPath = lastSlash === 0 ? '/' : currentPath.substring(0, lastSlash);
    navigateTo(parentPath);
  };

  const handleItemDoubleClick = (item) => {
    if (item.type === 'dir') {
      navigateTo(item.path);
    } else {
      // Open in Text Editor if text/plain or recognized text extension
      const isText = item.mimeType === 'text/plain' ||
        item.name.endsWith('.txt') ||
        item.name.endsWith('.log') ||
        item.name.endsWith('.sys');

      if (isText) {
        openApp('text-editor', {
          title: `Text Editor - ${item.name}`,
          meta: { filePath: item.path }
        });
      } else {
        alert(`Binary/unsupported file preview: ${item.name} (${item.mimeType || 'unknown format'})`);
      }
    }
  };

  const getFileIcon = (item) => {
    if (item.type === 'dir') return <Folder size={32} className="fm-icon-folder" />;
    if (item.mimeType?.startsWith('image/') || item.name.endsWith('.png')) {
      return <ImageIcon size={32} className="fm-icon-image" />;
    }
    if (item.name.endsWith('.txt') || item.name.endsWith('.log')) {
      return <FileText size={32} className="fm-icon-text" />;
    }
    return <File size={32} className="fm-icon-file" />;
  };

  const quickLinks = [
    { name: 'Desktop', path: '/Desktop', icon: <HardDrive size={16} /> },
    { name: 'Documents', path: '/Documents', icon: <Folder size={16} /> },
    { name: 'Downloads', path: '/Downloads', icon: <Folder size={16} /> },
    { name: 'Pictures', path: '/Pictures', icon: <ImageIcon size={16} /> },
    { name: 'System', path: '/System', icon: <Lock size={16} /> },
    { name: 'Trash', path: '/Trash', icon: <Trash2 size={16} /> },
  ];

  // Breadcrumbs generator
  const pathParts = currentPath.split('/').filter(Boolean);

  return (
    <div className="fm-container">
      {/* Top toolbar */}
      <div className="fm-toolbar">
        <div className="fm-nav-controls">
          <button
            className="fm-btn"
            onClick={handleBack}
            disabled={historyIdx <= 0}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <button
            className="fm-btn"
            onClick={handleForward}
            disabled={historyIdx >= history.length - 1}
            title="Forward"
          >
            <ArrowRight size={16} />
          </button>
          <button
            className="fm-btn"
            onClick={handleUp}
            disabled={currentPath === '/'}
            title="Up Directory"
          >
            <ArrowUp size={16} />
          </button>
          <button
            className="fm-btn"
            onClick={() => loadDirectory(currentPath)}
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
        </div>

        {/* Breadcrumb address bar */}
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

        {/* View mode toggle */}
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
            <div className="fm-error-state">{statusMessage}</div>
          ) : items.length === 0 ? (
            <div className="fm-empty-state">This directory is empty</div>
          ) : viewMode === 'grid' ? (
            <div className="fm-grid-view">
              {items.map(item => {
                const isSelected = selectedItem?.path === item.path;
                return (
                  <div
                    key={item.path}
                    className={`fm-grid-item ${isSelected ? 'selected' : ''}`}
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
                return (
                  <div
                    key={item.path}
                    className={`fm-list-row ${isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedItem(item)}
                    onDoubleClick={() => handleItemDoubleClick(item)}
                  >
                    <span className="col-name">
                      {item.type === 'dir' ? <Folder size={16} /> : <FileText size={16} />}
                      <span className="name-text">{item.name}</span>
                    </span>
                    <span className="col-type">{item.type === 'dir' ? 'Folder' : (item.mimeType || 'File')}</span>
                    <span className="col-size">{item.type === 'dir' ? '--' : `${item.size || 0} B`}</span>
                    <span className="col-date">{new Date(item.updatedAt || Date.now()).toLocaleDateString()}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Status footer bar */}
      <div className="fm-footer">
        <span>{items.length} item{items.length === 1 ? '' : 's'}</span>
        {selectedItem && (
          <span className="fm-selected-desc">
            Selected: {selectedItem.name} ({selectedItem.type === 'dir' ? 'Folder' : `${selectedItem.size || 0} bytes`})
          </span>
        )}
      </div>
    </div>
  );
}
