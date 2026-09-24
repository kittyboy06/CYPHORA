import React, { useState, useEffect } from 'react';
import { Save, Check, FileText, WrapText } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './TextEditorApp.css';

export function TextEditorApp({ meta = {} }) {
  const { vfs } = useOS();
  const filePath = meta.filePath || '/Desktop/welcome.txt';
  const [content, setContent] = useState('');
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [wordWrap, setWordWrap] = useState(true);

  // Load file content on mount
  useEffect(() => {
    try {
      if (vfs.exists(filePath)) {
        const text = vfs.readFile(filePath, 'text-editor');
        setContent(text);
        setIsDirty(false);
      } else {
        setContent('');
        setIsDirty(false);
      }
    } catch (err) {
      setContent(`// Error loading file: ${err.message}`);
    }
  }, [filePath, vfs]);

  const handleSave = () => {
    try {
      vfs.writeFile(filePath, content, 'text-editor');
      setIsDirty(false);
      setSaveStatus('Saved!');
      setTimeout(() => setSaveStatus(''), 2000);
    } catch (err) {
      setSaveStatus(`Save Error: ${err.message}`);
    }
  };

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      handleSave();
    }
  };

  const lines = content.split('\n');
  const lineCount = lines.length;
  const charCount = content.length;

  return (
    <div className="te-container" onKeyDown={handleKeyDown}>
      {/* Top action toolbar */}
      <div className="te-toolbar">
        <div className="te-file-info">
          <FileText size={15} className="te-icon" />
          <span className="te-filename">{filePath}</span>
          {isDirty && <span className="te-dirty-dot" title="Unsaved changes">•</span>}
        </div>

        <div className="te-actions">
          {saveStatus && (
            <span className={`te-status-badge ${saveStatus.includes('Error') ? 'error' : 'success'}`}>
              {saveStatus.includes('Saved') && <Check size={13} />}
              {saveStatus}
            </span>
          )}
          <button
            className={`te-btn ${wordWrap ? 'active' : ''}`}
            onClick={() => setWordWrap(!wordWrap)}
            title="Toggle Word Wrap"
          >
            <WrapText size={14} />
          </button>
          <button
            className="te-btn te-save-btn"
            onClick={handleSave}
            title="Save File (Ctrl+S)"
          >
            <Save size={14} />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Editor area with line numbers */}
      <div className="te-editor-wrapper">
        <div className="te-line-numbers">
          {Array.from({ length: Math.max(1, lineCount) }).map((_, i) => (
            <div key={i} className="te-line-num">{i + 1}</div>
          ))}
        </div>
        <textarea
          className={`te-textarea ${wordWrap ? 'wrap' : 'nowrap'}`}
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            setIsDirty(true);
          }}
          spellCheck="false"
          placeholder="Type or edit text here..."
        />
      </div>

      {/* Status bar */}
      <div className="te-statusbar">
        <span>Lines: {lineCount} | Chars: {charCount}</span>
        <span className="te-hint">Ctrl + S to save</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
}
