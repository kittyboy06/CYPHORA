import React, { useState, useEffect } from 'react';
import { BarChart2, Scissors, Copy, Check } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './TextAnalyzerApp.css';

const SAMPLE_TEXT_FILES = [
  { label: 'pattern_log.txt (Task 04 Text Pattern)', path: '/Documents/pattern_log.txt' },
  { label: 'numbers.txt (Task 09 Frequency List)', path: '/Documents/numbers.txt' },
  { label: 'sensor_stream.txt (Documents)', path: '/Documents/sensor_stream.txt' },
  { label: 'REPORT_17.txt (Documents)', path: '/Documents/REPORT_17.txt' },
  { label: 'Archive_04.txt (Documents)', path: '/Documents/Archive_04.txt' },
  { label: 'final_cipher.txt (Documents)', path: '/Documents/final_cipher.txt' }
];

export function TextAnalyzerApp() {
  const { vfs, eventBus } = useOS();
  const [selectedPath, setSelectedPath] = useState('/Documents/numbers.txt');
  const [activeTab, setActiveTab] = useState('frequency'); // 'frequency' | 'splitter'
  const [textVal, setTextVal] = useState('');
  const [delimiter, setDelimiter] = useState('-');
  const [frequencies, setFrequencies] = useState([]);
  const [splitParts, setSplitParts] = useState([]);
  const [copiedWord, setCopiedWord] = useState('');

  const loadText = (path = selectedPath) => {
    try {
      const content = vfs.readFile(path, 'text-analyzer');
      setTextVal(content);
      eventBus.emit('FILE_OPENED', { filePath: path, openedBy: 'text-analyzer' });
    } catch (e) {
      setTextVal('17\n42\n17\n91\n63\n42\n17\n28');
    }
  };

  useEffect(() => {
    loadText(selectedPath);
  }, [selectedPath]);

  useEffect(() => {
    if (!textVal) return;

    if (activeTab === 'frequency') {
      const words = textVal.split(/[\s,\n\r\t]+/).filter(w => w.trim().length > 0);
      const map = {};
      words.forEach(w => {
        const clean = w.trim().toUpperCase();
        map[clean] = (map[clean] || 0) + 1;
      });

      const sorted = Object.entries(map)
        .map(([word, count]) => ({ word, count }))
        .sort((a, b) => b.count - a.count);

      setFrequencies(sorted);
    } else if (activeTab === 'splitter') {
      const parts = textVal.trim().split(delimiter).filter(Boolean);
      setSplitParts(parts);
    }
  }, [textVal, activeTab, delimiter]);

  const handleSelectFile = (e) => {
    const p = e.target.value;
    setSelectedPath(p);
    setActiveTab('frequency');
    loadText(p);
  };

  const handleCopyValue = (val) => {
    if (!val) return;
    navigator.clipboard.writeText(val);
    setCopiedWord(val);
    setTimeout(() => setCopiedWord(''), 2000);
  };

  return (
    <div className="text-analyzer-app">
      <div className="analyzer-header">
        <div className="title-wrap">
          <BarChart2 size={18} className="icon" />
          <span>Text Analyzer</span>
        </div>
        <p className="sub">Frequency pattern detection, token ranking, line counts, and tokenized stream analysis</p>
      </div>

      <div className="analyzer-toolbar">
        <div className="file-selector">
          <label>SELECT FILE:</label>
          <select value={selectedPath} onChange={handleSelectFile} className="analyzer-select">
            {SAMPLE_TEXT_FILES.map(f => (
              <option key={f.path} value={f.path}>{f.label}</option>
            ))}
          </select>
        </div>

        <div className="tab-buttons">
          <button className={`tab-btn ${activeTab === 'frequency' ? 'active' : ''}`} onClick={() => setActiveTab('frequency')}>
            <BarChart2 size={14} />
            <span>Frequency Counter</span>
          </button>
          <button className={`tab-btn ${activeTab === 'splitter' ? 'active' : ''}`} onClick={() => setActiveTab('splitter')}>
            <Scissors size={14} />
            <span>Delimiter Splitter</span>
          </button>
        </div>
      </div>

      {/* Main Analyzer Content */}
      <div className="analyzer-content">
        {activeTab === 'frequency' ? (
          <div className="frequency-panel">
            <div className="panel-sub-title">FREQUENCY PATTERN ANALYSIS (RANKED)</div>
            <div className="freq-list">
              {frequencies.slice(0, 10).map((item, index) => (
                <div key={index} className={`freq-row ${index === 0 ? 'top-rank' : ''}`}>
                  <span className="rank-num">#{index + 1}</span>
                  <span className="token-word">{item.word}</span>
                  <span className="token-count">{item.count} occurrences</span>
                  <button className="copy-token-btn" onClick={() => handleCopyValue(item.word)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}>
                    {copiedWord === item.word ? <Check size={12} color="#7ee787" /> : <Copy size={12} />}
                    <span>{copiedWord === item.word ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="splitter-panel">
            <div className="splitter-controls">
              <label>DELIMITER SYMBOL:</label>
              <input
                type="text"
                value={delimiter}
                onChange={(e) => setDelimiter(e.target.value)}
                maxLength={3}
                className="delimiter-input"
              />
              <span className="input-source-preview">SOURCE: "{textVal.trim()}"</span>
            </div>

            <div className="split-results">
              <div className="panel-sub-title">DECOMPOSED COMPONENTS</div>
              <div className="parts-list">
                {splitParts.map((part, index) => (
                  <div key={index} className="part-card">
                    <span className="part-idx">PART #{index + 1}</span>
                    <span className="part-val">{part}</span>
                    <button className="copy-token-btn" onClick={() => handleCopyValue(part)} style={{ background: '#21262d', color: '#c9d1d9', border: '1px solid #30363d', padding: '0.3rem 0.6rem', borderRadius: '4px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', fontWeight: 600 }}>
                      {copiedWord === part ? <Check size={12} color="#7ee787" /> : <Copy size={12} />}
                      <span>{copiedWord === part ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
