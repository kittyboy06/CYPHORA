import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Folder,
  Send,
  FileText,
  Compass,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Plus
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import { copyToClipboard } from '../../utils/clipboard.js';

export function PromptStudioApp() {
  const { vfs, openApp } = useOS();

  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('cyphora_round2_prompt') || '';
  });
  const [activeTarget, setActiveTarget] = useState(1);
  const [copied, setCopied] = useState(false);
  const [statusNotice, setStatusNotice] = useState('');
  const [showPicker, setShowPicker] = useState(false);

  const maxLength = 1500;
  const minLength = 10;
  const currentLength = prompt.length;
  const isValid = currentLength >= minLength;

  const keywordPacks = [
    {
      category: 'SUBJECT',
      tags: [
        'ancient towering obsidian monolith',
        'submerged desert outpost station',
        'weathered radio telemetry towers',
        'cyclopean carved stone architecture',
        'mysterious glowing spire artifact'
      ]
    },
    {
      category: 'LIGHTING',
      tags: [
        'volumetric golden hour sunbeams',
        'dramatic low-angle rim lighting',
        'subtle cyan bioluminescent veins',
        'harsh desert noon shadows',
        'atmospheric twilight dusk glow'
      ]
    },
    {
      category: 'ATMOSPHERE & TERRAIN',
      tags: [
        'shifting sand dunes with wind ripples',
        'swirling golden dust particulates',
        'dense volumetric atmospheric haze',
        'distant jagged rock formations',
        'desolate alien desert landscape'
      ]
    },
    {
      category: 'STYLE & CAMERA',
      tags: [
        'cinematic 8k octane render',
        'anamorphic lens with chromatic aberration',
        'hyper-detailed photorealistic texture',
        'wide-angle composition',
        'unreal engine 5 architectural render'
      ]
    }
  ];

  const handleAddTag = (tag) => {
    setPrompt(prev => {
      const clean = prev.trim();
      const updated = clean.length > 0 ? `${clean}, ${tag}` : tag;
      localStorage.setItem('cyphora_round2_prompt', updated);
      window.dispatchEvent(new Event('cyphora_round2_prompt_updated'));
      return updated;
    });
  };

  const handlePromptChange = (val) => {
    setPrompt(val);
    localStorage.setItem('cyphora_round2_prompt', val);
    window.dispatchEvent(new Event('cyphora_round2_prompt_updated'));
  };

  const handleCopy = async () => {
    if (!prompt) return;
    const ok = await copyToClipboard(prompt);
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleSaveToVfs = () => {
    if (!prompt.trim()) {
      setStatusNotice('Error: Cannot save empty prompt.');
      return;
    }
    try {
      const filename = `prompt_target${activeTarget}_${Date.now()}.txt`;
      const path = `/Documents/prompts/${filename}`;
      vfs.writeFile(path, prompt.trim(), 'prompt-studio');
      setStatusNotice(`Saved prompt to OS Drive: ${path}`);
    } catch (err) {
      console.warn('VFS save error:', err);
      setStatusNotice('Failed to write to OS Drive.');
    }
  };

  const handleLoadFromVfs = (node) => {
    if (!node || node.type === 'dir') return;
    try {
      const content = vfs.readFile(node.path, 'prompt-studio');
      if (content) {
        handlePromptChange(content);
        setStatusNotice(`Loaded prompt from ${node.path}`);
      }
    } catch (err) {
      console.warn('VFS read error:', err);
    }
  };

  const handleInjectIntoStage2 = () => {
    if (!isValid) {
      setStatusNotice(`Prompt must be at least ${minLength} characters.`);
      return;
    }
    localStorage.setItem('cyphora_round2_prompt', prompt);
    window.dispatchEvent(new Event('cyphora_round2_prompt_updated'));
    setStatusNotice('✓ Prompt synchronized with Round 2 Expedition Hub.');
    openApp('round2');
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
      {/* Top Toolbar */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Sparkles size={16} color="#dfb125" />
          <span style={{ fontFamily: 'Cinzel', fontSize: '0.88rem', fontWeight: 700, color: '#dfb125', letterSpacing: '1px' }}>
            PROMPT STUDIO
          </span>
          <div style={{ display: 'flex', gap: '0.3rem', marginLeft: '0.5rem' }}>
            <button
              type="button"
              onClick={() => setActiveTarget(1)}
              style={{
                background: activeTarget === 1 ? 'rgba(223, 177, 37, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid ' + (activeTarget === 1 ? '#dfb125' : 'rgba(223, 177, 37, 0.2)'),
                color: activeTarget === 1 ? '#ffe680' : '#a8a08d',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Target 1
            </button>
            <button
              type="button"
              onClick={() => setActiveTarget(2)}
              style={{
                background: activeTarget === 2 ? 'rgba(223, 177, 37, 0.25)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid ' + (activeTarget === 2 ? '#dfb125' : 'rgba(223, 177, 37, 0.2)'),
                color: activeTarget === 2 ? '#ffe680' : '#a8a08d',
                padding: '3px 8px',
                borderRadius: '4px',
                fontSize: '0.72rem',
                cursor: 'pointer'
              }}
            >
              Target 2
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            onClick={handleCopy}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: '#d1c7b7',
              padding: '4px 9px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            {copied ? <Check size={12} color="#7ee787" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveToVfs}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: '#d1c7b7',
              padding: '4px 9px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <Save size={12} />
            <span>Save VFS</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPicker(true)}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: '#d1c7b7',
              padding: '4px 9px',
              borderRadius: '4px',
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem',
              cursor: 'pointer'
            }}
          >
            <Folder size={12} />
            <span>Load VFS</span>
          </button>

          <button
            type="button"
            onClick={handleInjectIntoStage2}
            style={{
              background: 'linear-gradient(135deg, #dfb125, #b89114)',
              color: '#060905',
              border: 'none',
              padding: '4px 12px',
              borderRadius: '4px',
              fontFamily: 'Cinzel',
              fontWeight: 700,
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
          >
            <Send size={12} />
            <span>Inject to Round 2</span>
          </button>
        </div>
      </div>

      {/* Status notice */}
      {statusNotice && (
        <div style={{
          background: 'rgba(223, 177, 37, 0.15)',
          borderBottom: '1px solid rgba(223, 177, 37, 0.3)',
          color: '#ffe680',
          padding: '0.35rem 1rem',
          fontSize: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem'
        }}>
          <CheckCircle2 size={13} />
          <span>{statusNotice}</span>
        </div>
      )}

      {/* Main Studio Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        minHeight: 0,
        overflow: 'hidden',
        padding: '1rem',
        gap: '1rem'
      }}>
        {/* Editor Area */}
        <div style={{
          flex: 1.2,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(14, 20, 14, 0.75)',
          border: '1px solid rgba(223, 177, 37, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#dfb125' }}>
              RECREATION PROMPT EDITOR
            </span>
            <div style={{ fontSize: '0.72rem', color: currentLength > maxLength - 50 ? '#ef4444' : '#889280' }}>
              <span style={{ fontFamily: 'Fira Code', fontWeight: 600, color: '#eae0c8' }}>{currentLength}</span> / {maxLength} chars
            </div>
          </div>

          <textarea
            value={prompt}
            onChange={(e) => handlePromptChange(e.target.value)}
            placeholder="Type your recreation prompt describing the composition, lighting, artifacts, architecture, and mood..."
            rows={8}
            style={{
              flex: 1,
              width: '100%',
              background: '#0a0e0a',
              border: '1px solid ' + (isValid ? 'rgba(223, 177, 37, 0.4)' : 'rgba(239, 68, 68, 0.4)'),
              borderRadius: '6px',
              padding: '0.85rem',
              color: '#eae0c8',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '0.88rem',
              lineHeight: '1.5',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.74rem' }}>
            {isValid ? (
              <span style={{ color: '#7ee787', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <CheckCircle2 size={12} /> Minimum requirement satisfied
              </span>
            ) : (
              <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <AlertCircle size={12} /> Min {minLength} chars required ({minLength - currentLength} more needed)
              </span>
            )}
            <button
              type="button"
              onClick={() => handlePromptChange('')}
              style={{ background: 'transparent', border: 'none', color: '#889280', cursor: 'pointer', fontSize: '0.72rem' }}
            >
              Clear
            </button>
          </div>
        </div>

        {/* Tag Palette Sidebar */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(14, 20, 14, 0.75)',
          border: '1px solid rgba(223, 177, 37, 0.2)',
          borderRadius: '8px',
          padding: '1rem',
          gap: '0.75rem',
          overflowY: 'auto'
        }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#dfb125', letterSpacing: '0.5px' }}>
            PROMPT ENRICHMENT PALETTE
          </span>
          <p style={{ fontSize: '0.72rem', color: '#889280', margin: 0 }}>
            Click tags below to append them directly into your prompt.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {keywordPacks.map((pack, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <span style={{ fontSize: '0.68rem', fontWeight: 600, color: '#a8a08d', letterSpacing: '0.8px' }}>
                  {pack.category}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {pack.tags.map((tag, tIdx) => (
                    <button
                      key={tIdx}
                      type="button"
                      onClick={() => handleAddTag(tag)}
                      style={{
                        background: 'rgba(255, 255, 255, 0.04)',
                        border: '1px solid rgba(223, 177, 37, 0.2)',
                        color: '#d1c7b7',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.72rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        transition: 'all 0.15s ease'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.background = 'rgba(223, 177, 37, 0.15)';
                        e.currentTarget.style.borderColor = '#dfb125';
                        e.currentTarget.style.color = '#ffe680';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(223, 177, 37, 0.2)';
                        e.currentTarget.style.color = '#d1c7b7';
                      }}
                    >
                      <Plus size={10} color="#dfb125" />
                      <span>{tag}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <VirtualFilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelectFile={handleLoadFromVfs}
        title="Load Prompt Text File from Virtual OS"
      />
    </div>
  );
}
export default PromptStudioApp;
