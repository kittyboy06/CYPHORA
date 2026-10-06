import React, { useState, useEffect, useRef } from 'react';
import {
  Eye,
  EyeOff,
  Shield,
  Clock,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Folder,
  Sparkles,
  Zap,
  Compass,
  AlertTriangle,
  Info
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';

export function VisionTargetApp() {
  const { openApp, teamData } = useOS();
  const teamName = teamData?.name || localStorage.getItem('cyphora_team_name') || 'Explorer';

  const [selectedTarget, setSelectedTarget] = useState(1);
  const [isRevealed, setIsRevealed] = useState(true);
  const [peekSecondsLeft, setPeekSecondsLeft] = useState(15);
  const [peekRunning, setPeekRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [showPicker, setShowPicker] = useState(false);
  const [customImage, setCustomImage] = useState(null);

  const targets = [
    {
      id: 1,
      title: 'Target 1: The Monolith Anomaly',
      src: '/assets/round2/targets/target1.jpg',
      sector: 'Sector 4-A',
      dimensions: '1920x1080',
      description: 'Towering obsidian spire discovered at the center of the incident zone. Volumetric dusk illumination with suspended particulate matter.'
    },
    {
      id: 2,
      title: 'Target 2: Desert Signal Outpost',
      src: '/assets/round2/targets/target2.jpg',
      sector: 'Sector 4-B',
      dimensions: '1920x1080',
      description: 'Classified auxiliary observation post with radio telemetry towers buried under shifting dunes. High contrast midday desert horizon.'
    }
  ];

  const currentTarget = customImage || targets.find(t => t.id === selectedTarget) || targets[0];

  // 15-second peek countdown timer
  useEffect(() => {
    if (!peekRunning || peekSecondsLeft <= 0) return;

    const timer = setInterval(() => {
      setPeekSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPeekRunning(false);
          setIsRevealed(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [peekRunning, peekSecondsLeft]);

  const handleStartPeek = () => {
    setPeekSecondsLeft(15);
    setIsRevealed(true);
    setPeekRunning(true);
  };

  const handleResetZoom = () => {
    setZoom(100);
    setBrightness(100);
    setContrast(100);
  };

  const handleSelectFromVfs = (node) => {
    if (!node || node.type === 'dir') return;
    const url = node.assetUrl || `/assets/round2/targets/${node.name}` || node.path;
    setCustomImage({
      id: 99,
      title: `VFS Target: ${node.name}`,
      src: url,
      sector: node.path,
      dimensions: node.dimensions || 'Custom',
      description: node.description || `Custom target loaded from Virtual OS at ${node.path}`
    });
    handleResetZoom();
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#070b07',
      color: '#eae0c8',
      fontFamily: 'Montserrat, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Action Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.6rem 1rem',
        background: 'rgba(22, 28, 20, 0.95)',
        borderBottom: '1px solid rgba(223, 177, 37, 0.25)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        {/* Target Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.75rem', color: '#a8a08d', fontWeight: 600 }}>TARGET:</span>
          <button
            type="button"
            onClick={() => { setSelectedTarget(1); setCustomImage(null); }}
            style={{
              background: selectedTarget === 1 && !customImage ? 'rgba(223, 177, 37, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (selectedTarget === 1 && !customImage ? '#dfb125' : 'rgba(223, 177, 37, 0.2)'),
              color: selectedTarget === 1 && !customImage ? '#ffe680' : '#d1c7b7',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Target 1 (Monolith)
          </button>
          <button
            type="button"
            onClick={() => { setSelectedTarget(2); setCustomImage(null); }}
            style={{
              background: selectedTarget === 2 && !customImage ? 'rgba(223, 177, 37, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (selectedTarget === 2 && !customImage ? '#dfb125' : 'rgba(223, 177, 37, 0.2)'),
              color: selectedTarget === 2 && !customImage ? '#ffe680' : '#d1c7b7',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Target 2 (Outpost)
          </button>
          <button
            type="button"
            onClick={() => setShowPicker(true)}
            style={{
              background: customImage ? 'rgba(88, 166, 255, 0.25)' : 'rgba(255, 255, 255, 0.05)',
              border: '1px solid ' + (customImage ? '#58a6ff' : 'rgba(88, 166, 255, 0.2)'),
              color: customImage ? '#79c0ff' : '#d1c7b7',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Folder size={12} />
            <span>Browse VFS</span>
          </button>
        </div>

        {/* Peek Timer & Display Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {peekRunning ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              color: '#fca5a5',
              padding: '4px 10px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              fontWeight: 700
            }}>
              <Clock size={13} />
              <span>PEEK: {peekSecondsLeft}s</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleStartPeek}
              style={{
                background: 'rgba(223, 177, 37, 0.15)',
                border: '1px solid #dfb125',
                color: '#ffe680',
                padding: '4px 10px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem'
              }}
            >
              <Eye size={13} />
              <span>Start 15s Peek</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsRevealed(r => !r)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: '#d1c7b7',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer'
            }}
          >
            {isRevealed ? <EyeOff size={13} /> : <Eye size={13} />}
          </button>

          <button
            type="button"
            onClick={() => setZoom(z => Math.max(z - 20, 50))}
            style={{ background: 'transparent', border: 'none', color: '#a8a08d', cursor: 'pointer' }}
          >
            <ZoomOut size={14} />
          </button>
          <span style={{ fontSize: '0.75rem', fontFamily: 'Fira Code', minWidth: '40px', textAlign: 'center' }}>
            {zoom}%
          </span>
          <button
            type="button"
            onClick={() => setZoom(z => Math.min(z + 20, 200))}
            style={{ background: 'transparent', border: 'none', color: '#a8a08d', cursor: 'pointer' }}
          >
            <ZoomIn size={14} />
          </button>
          <button
            type="button"
            onClick={handleResetZoom}
            style={{ background: 'transparent', border: 'none', color: '#a8a08d', cursor: 'pointer' }}
          >
            <RefreshCw size={13} />
          </button>
        </div>
      </div>

      {/* Main Split View: Image Viewport + Intel Sidebar */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* Optical Viewport with Watermark */}
        <div style={{
          flex: 1,
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#040604',
          overflow: 'auto',
          padding: '1.5rem',
          userSelect: 'none'
        }}
        onContextMenu={e => e.preventDefault()}
        >
          {isRevealed ? (
            <div style={{
              position: 'relative',
              display: 'inline-block',
              transform: `scale(${zoom / 100})`,
              filter: `brightness(${brightness}%) contrast(${contrast}%)`,
              transition: 'transform 0.15s ease, filter 0.15s ease',
              borderRadius: '6px',
              overflow: 'hidden',
              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.8), 0 0 20px rgba(223, 177, 37, 0.2)'
            }}>
              <img
                src={currentTarget.src}
                alt={currentTarget.title}
                draggable={false}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  maxHeight: '65vh',
                  objectFit: 'contain',
                  pointerEvents: 'none'
                }}
              />

              {/* Repeating Watermark Overlay */}
              <div style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                background: 'repeating-linear-gradient(45deg, rgba(223, 177, 37, 0.04) 0px, rgba(223, 177, 37, 0.04) 40px, transparent 40px, transparent 80px)'
              }}>
                <div style={{
                  color: 'rgba(223, 177, 37, 0.18)',
                  fontFamily: 'Cinzel',
                  fontSize: '1.2rem',
                  fontWeight: 700,
                  letterSpacing: '4px',
                  transform: 'rotate(-25deg)',
                  textAlign: 'center',
                  textTransform: 'uppercase'
                }}>
                  CYPHORA CLASSIFIED TARGET &bull; {teamName}
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '2rem',
              background: 'rgba(14, 20, 14, 0.85)',
              border: '1px solid rgba(223, 177, 37, 0.3)',
              borderRadius: '8px',
              maxWidth: '380px'
            }}>
              <Shield size={36} color="#dfb125" style={{ marginBottom: '0.75rem' }} />
              <h3 style={{ margin: '0 0 0.5rem', color: '#dfb125', fontFamily: 'Cinzel', fontSize: '1rem' }}>
                TARGET SECURED / SHIELDED
              </h3>
              <p style={{ margin: '0 0 1rem', fontSize: '0.8rem', color: '#a8a08d', lineHeight: '1.4' }}>
                Reference image is currently protected. Click "Start 15s Peek" or toggle the eye icon to examine the anomaly.
              </p>
              <button
                type="button"
                onClick={handleStartPeek}
                style={{
                  background: 'linear-gradient(135deg, #dfb125, #b89114)',
                  color: '#060905',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '4px',
                  fontFamily: 'Cinzel',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Reveal Target (15s)
              </button>
            </div>
          )}
        </div>

        {/* Intel & Actions Sidebar */}
        <div style={{
          width: '280px',
          background: 'rgba(14, 20, 14, 0.95)',
          borderLeft: '1px solid rgba(223, 177, 37, 0.25)',
          padding: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          overflowY: 'auto'
        }}>
          <div>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1px', color: '#dfb125', textTransform: 'uppercase' }}>
              TARGET INTEL
            </span>
            <h4 style={{ margin: '0.25rem 0 0.5rem', fontSize: '0.92rem', color: '#fff', fontFamily: 'Cinzel' }}>
              {currentTarget.title}
            </h4>
            <p style={{ fontSize: '0.78rem', color: '#a8a08d', margin: 0, lineHeight: '1.4' }}>
              {currentTarget.description}
            </p>
          </div>

          <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '0.75rem', borderRadius: '6px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', marginBottom: '0.3rem' }}>
              <span style={{ color: '#889280' }}>SECTOR:</span>
              <span style={{ color: '#dfb125', fontFamily: 'Fira Code' }}>{currentTarget.sector}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem' }}>
              <span style={{ color: '#889280' }}>RESOLUTION:</span>
              <span style={{ color: '#d1c7b7', fontFamily: 'Fira Code' }}>{currentTarget.dimensions}</span>
            </div>
          </div>

          {/* Quick Inter-App Buttons */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto' }}>
            <span style={{ fontSize: '0.68rem', letterSpacing: '1px', color: '#889280', textTransform: 'uppercase' }}>
              EXPEDITION BRIDGES
            </span>

            <button
              type="button"
              onClick={() => openApp('prompt-studio')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(223, 177, 37, 0.12)',
                border: '1px solid rgba(223, 177, 37, 0.35)',
                color: '#ffe680',
                padding: '0.5rem 0.75rem',
                borderRadius: '5px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Sparkles size={14} color="#dfb125" />
              <span>Send to Prompt Studio</span>
            </button>

            <button
              type="button"
              onClick={() => openApp('image-evaluator')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#d1c7b7',
                padding: '0.5rem 0.75rem',
                borderRadius: '5px',
                fontSize: '0.76rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              <Zap size={14} color="#f59e0b" />
              <span>Test in Similarity Evaluator</span>
            </button>

            <button
              type="button"
              onClick={() => openApp('round2')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: 'rgba(223, 177, 37, 0.2)',
                border: '1px solid #dfb125',
                color: '#ffe680',
                padding: '0.5rem 0.75rem',
                borderRadius: '5px',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              <Compass size={14} color="#dfb125" />
              <span>Open Round 2 Hub</span>
            </button>
          </div>
        </div>
      </div>

      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleSelectFromVfs}
        title="Select Target Image from OS Filesystem"
      />
    </div>
  );
}
export default VisionTargetApp;
