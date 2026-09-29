import React, { useState, useEffect } from 'react';
import {
  Terminal,
  Folder,
  FileText,
  Settings,
  RefreshCw,
  Info,
  QrCode,
  Image as ImageIcon,
  BarChart2,
  GitCompare,
  Volume2,
  FilePlus,
  RotateCcw
} from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import { SET_PRESENTATIONS } from '../../round1/taskContent.js';
import { ROUND_1_SETS } from '../../round1/round1Engine.js';

export function Desktop() {
  const { vfs, openApp, closeStartMenu, round1State } = useOS();
  const [desktopFiles, setDesktopFiles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

  const activeTask = round1State?.tasks?.find(t => t.status === 'ACTIVE');
  const currentSetId = activeTask?.setId || (activeTask ? ROUND_1_SETS.find(s => s.tasks.includes(activeTask.id))?.id : null) || round1State?.activeSet || 'set1';
  const setPresentation = SET_PRESENTATIONS[currentSetId];

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
      id: 'converter',
      title: 'Universal Converter',
      icon: <RefreshCw size={32} className="desktop-icon-svg file-color" />,
      action: () => openApp('converter')
    },
    {
      id: 'metadata-inspector',
      title: 'Metadata Inspector',
      icon: <Info size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('metadata-inspector')
    },
    {
      id: 'qr-scanner',
      title: 'QR Scanner',
      icon: <QrCode size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('qr-scanner')
    },
    {
      id: 'image-inspector',
      title: 'Image Inspector',
      icon: <ImageIcon size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('image-inspector')
    },
    {
      id: 'text-analyzer',
      title: 'Text Analyzer',
      icon: <BarChart2 size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('text-analyzer')
    },
    {
      id: 'file-comparator',
      title: 'File Comparison',
      icon: <GitCompare size={32} className="desktop-icon-svg file-color" />,
      action: () => openApp('file-comparator')
    },
    {
      id: 'audio-inspector',
      title: 'Audio Inspector',
      icon: <Volume2 size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('audio-inspector')
    },
    {
      id: 'file-manager',
      title: 'File Manager',
      icon: <Folder size={32} className="desktop-icon-svg folder-color" />,
      action: () => openApp('file-manager')
    },
    {
      id: 'terminal',
      title: 'Terminal',
      icon: <Terminal size={32} className="desktop-icon-svg terminal-color" />,
      action: () => openApp('terminal')
    },
    {
      id: 'text-editor',
      title: 'Text Editor',
      icon: <FileText size={32} className="desktop-icon-svg editor-color" />,
      action: () => openApp('text-editor')
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: <Settings size={32} className="desktop-icon-svg settings-color" />,
      action: () => openApp('settings')
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

      {/* Desktop Journey HUD — sits directly on the desktop canvas, never overlapping open/fullscreen windows */}
      {round1State?.round1StartedAt && (
        <div className="desktop-journey-hud">
          <span>JOURNEY</span>
          <strong>{Math.round(round1State.journeyProgress || 0)}%</strong>
          {setPresentation?.label && (
            <small>{setPresentation.label} — {setPresentation.title}</small>
          )}
        </div>
      )}

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
              openApp('converter');
            }}
          >
            <RefreshCw size={14} />
            <span>Open Universal Converter</span>
          </button>
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
