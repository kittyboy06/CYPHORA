import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  FileText,
  RotateCcw,
  FilePlus,
  Plus
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';

export function Desktop() {
  const { vfs, openApp, closeStartMenu } = useOS();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const loadDesktopItems = () => {
    try {
      const files = vfs.listDir('/Desktop', false);
      setDesktopFiles(files);
    } catch (e) {
      console.error('Failed to load desktop items', e);
    }
  };

  useEffect(() => {
    loadDesktopItems();
  }, [vfs]);

  const handleDesktopClick = () => {
    setSelectedId(null);
    setContextMenu(null);
    closeStartMenu();
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY
    });
  };

  const handleCreateNewFile = () => {
    setContextMenu(null);
    const fileName = `note_${Date.now().toString().slice(-4)}.txt`;
    const targetPath = `/Desktop/${fileName}`;
    vfs.writeFile(targetPath, 'New document created.\n', 'desktop');
    loadDesktopItems();
    openApp('text-editor', {
      title: `Text Editor - ${fileName}`,
      meta: { filePath: targetPath }
    });
  };

  const handleResetDesktop = () => {
    setContextMenu(null);
    if (confirm('Reset Virtual Filesystem to default factory configuration?')) {
      vfs.resetVFS();
      loadDesktopItems();
    }
  };

  const systemApps = [
    {
      id: 'terminal',
      title: 'Terminal',
      icon: <Terminal size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('terminal')
    },
    {
      id: 'file-manager',
      title: 'File Manager',
      icon: <Folder size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('file-manager')
    },
    {
      id: 'text-editor',
      title: 'Text Editor',
      icon: <FileText size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('text-editor')
    }
  ];

  return (
    <div
      className="os-desktop-canvas"
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Icon Grid */}
      <div className="desktop-icon-grid">
        {/* Core App Icons */}
        {systemApps.map(app => (
          <div
            key={app.id}
            className={`desktop-icon-cell ${selectedId === app.id ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(app.id);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              app.action();
            }}
          >
            <div className="desktop-icon-glyph">{app.icon}</div>
            <span className="desktop-icon-label">{app.title}</span>
          </div>
        ))}

        {/* Dynamic VFS /Desktop file icons */}
        {desktopFiles.map(file => (
          <div
            key={file.path}
            className={`desktop-icon-cell ${selectedId === file.path ? 'selected' : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              setSelectedId(file.path);
            }}
            onDoubleClick={(e) => {
              e.stopPropagation();
              openApp('text-editor', {
                title: `Text Editor - ${file.name}`,
                meta: { filePath: file.path }
              });
            }}
          >
            <div className="desktop-icon-glyph">
              <FileText size={32} className="desktop-icon-svg file-color" />
            </div>
            <span className="desktop-icon-label" title={file.name}>
              {file.name}
            </span>
          </div>
        ))}
      </div>

      {/* Right-click Context Menu */}
      {contextMenu && (
        <div
          className="desktop-context-menu"
          style={{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="ctx-item"
            onClick={() => {
              setContextMenu(null);
              openApp('terminal');
            }}
          >
            <Terminal size={14} />
            <span>Open Terminal</span>
          </button>
          <button
            className="ctx-item"
            onClick={() => {
              setContextMenu(null);
              openApp('file-manager');
            }}
          >
            <Folder size={14} />
            <span>Open File Manager</span>
          </button>
          <div className="ctx-sep" />
          <button className="ctx-item" onClick={handleCreateNewFile}>
            <FilePlus size={14} />
            <span>New Text Document</span>
          </button>
          <button className="ctx-item" onClick={handleResetDesktop}>
            <RotateCcw size={14} />
            <span>Reset VFS Filesystem</span>
          </button>
        </div>
      )}
    </div>
  );
}
