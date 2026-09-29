import React, { useState } from 'react';
import { ArrowRight, Copy, RefreshCw, Sparkles, Trash2, Check } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './UniversalConverterApp.css';

const CONVERSION_OPTIONS = [
  { id: 'binary', label: 'Binary' },
  { id: 'decimal', label: 'Decimal (0-9 Format)' },
  { id: 'hex', label: 'Hexadecimal' },
  { id: 'ascii', label: 'ASCII' },
  { id: 'text', label: 'Text' },
  { id: 'base64', label: 'Base64' },
  { id: 'url', label: 'URL' },
  { id: 'octal', label: 'Octal' }
];

export function UniversalConverterApp() {
  const { eventBus } = useOS();
  const [sourceType, setSourceType] = useState('binary');
  const [targetType, setTargetType] = useState('decimal');
  const [inputVal, setInputVal] = useState('01001000 01000101 01001100 01010000');
  const [outputVal, setOutputVal] = useState('');
  const [copied, setCopied] = useState(false);

  const performConversion = () => {
    const raw = inputVal.trim();
    if (!raw) {
      setOutputVal('');
      return;
    }

    try {
      let result = '';
      const tokens = raw.split(/[\s,]+/).filter(Boolean);

      // BINARY
      if (sourceType === 'binary') {
        if (targetType === 'decimal') {
          // Binary -> Decimal (Intermediate 0-9 format)
          result = tokens.map(b => parseInt(b, 2)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'hex') {
          // Binary -> Hexadecimal
          result = tokens.map(b => parseInt(b, 2).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else if (targetType === 'ascii' || targetType === 'text') {
          // Binary -> ASCII (Preserves 0-9 intermediate codes when converting to ASCII)
          result = tokens.map(b => parseInt(b, 2)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'octal') {
          // Binary -> Octal
          result = tokens.map(b => parseInt(b, 2).toString(8)).join(' ');
        } else {
          result = raw;
        }
      }
      // DECIMAL
      else if (sourceType === 'decimal') {
        if (targetType === 'binary') {
          // Decimal -> Binary
          result = tokens.map(d => parseInt(d, 10).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'hex') {
          // Decimal -> Hexadecimal
          result = tokens.map(d => parseInt(d, 10).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else if (targetType === 'ascii') {
          // Decimal -> ASCII character codes
          result = tokens.map(d => String.fromCharCode(parseInt(d, 10))).join(' ');
        } else if (targetType === 'text') {
          // Decimal -> Text (Direct string output)
          result = tokens.map(d => String.fromCharCode(parseInt(d, 10))).join('');
        } else if (targetType === 'octal') {
          // Decimal -> Octal
          result = tokens.map(d => parseInt(d, 10).toString(8)).join(' ');
        } else {
          result = raw;
        }
      }
      // HEXADECIMAL
      else if (sourceType === 'hex') {
        if (targetType === 'decimal') {
          // Hexadecimal -> Decimal (Intermediate 0-9 format)
          result = tokens.map(h => parseInt(h, 16)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'binary') {
          // Hexadecimal -> Binary
          result = tokens.map(h => parseInt(h, 16).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'ascii') {
          // Hexadecimal -> ASCII codes
          result = tokens.map(h => parseInt(h, 16)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'text') {
          // Hexadecimal -> Text
          result = tokens.map(h => String.fromCharCode(parseInt(h, 16))).join('');
        } else {
          result = raw;
        }
      }
      // ASCII
      else if (sourceType === 'ascii') {
        if (targetType === 'text') {
          // ASCII -> Text (Converts numeric ASCII codes or space-separated ASCII characters into readable text)
          if (tokens.every(t => /^\d+$/.test(t))) {
            result = tokens.map(d => String.fromCharCode(parseInt(d, 10))).join('');
          } else {
            result = raw.replace(/\s+/g, '');
          }
        } else if (targetType === 'binary') {
          result = Array.from(raw).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'decimal') {
          result = Array.from(raw).map(c => c.charCodeAt(0)).join(' ');
        } else if (targetType === 'hex') {
          result = Array.from(raw).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else {
          result = raw;
        }
      }
      // BASE64
      else if (sourceType === 'base64') {
        if (targetType === 'text' || targetType === 'ascii') {
          // Base64 -> Text
          result = atob(raw);
        } else {
          result = atob(raw);
        }
      }
      // TEXT
      else if (sourceType === 'text') {
        if (targetType === 'base64') {
          // Text -> Base64
          result = btoa(raw);
        } else if (targetType === 'binary') {
          result = Array.from(raw).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'hex') {
          result = Array.from(raw).map(c => c.charCodeAt(0).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else if (targetType === 'decimal') {
          result = Array.from(raw).map(c => c.charCodeAt(0)).join(' ');
        } else {
          result = raw;
        }
      }
      // URL
      else if (sourceType === 'url') {
        if (targetType === 'text') {
          // URL Decode
          result = decodeURIComponent(raw);
        } else {
          // URL Encode
          result = encodeURIComponent(raw);
        }
      }
      // OCTAL
      else if (sourceType === 'octal') {
        if (targetType === 'decimal') {
          // Octal -> Decimal
          result = tokens.map(o => parseInt(o, 8)).filter(n => !isNaN(n)).join(' ');
        } else {
          result = tokens.map(o => String.fromCharCode(parseInt(o, 8))).join('');
        }
      } else {
        result = raw;
      }

      setOutputVal(result);

      // Emit CONVERSION_PERFORMED tracking event (audit only)
      eventBus.emit('CONVERSION_PERFORMED', {
        input: raw,
        inputType: sourceType,
        outputType: targetType,
        result: result.trim()
      });
    } catch (err) {
      setOutputVal('[CONVERSION ERROR: INVALID INPUT FORMAT]');
    }
  };

  const handleCopy = () => {
    if (!outputVal) return;
    navigator.clipboard.writeText(outputVal);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInputVal('');
    setOutputVal('');
  };

  return (
    <div className="universal-converter-app">
      <div className="converter-header">
        <div className="converter-title-wrap">
          <Sparkles size={18} className="converter-icon" />
          <span>Universal Converter</span>
        </div>
        <p className="converter-sub">Technical data format transformer for multi-stage representation reasoning</p>
      </div>

      <div className="converter-grid">
        {/* Source Section */}
        <div className="converter-section">
          <div className="selector-header">
            <label>INPUT</label>
            <div className="dropdown-wrap">
              <span>FROM</span>
              <select
                value={sourceType}
                onChange={(e) => setSourceType(e.target.value)}
                className="converter-select"
              >
                {CONVERSION_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            className="converter-textarea"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder="Enter raw input value (e.g. 01001000 01000101 or 48 45 4C 50)..."
            rows={5}
          />
        </div>

        {/* Action Bar */}
        <div className="converter-arrow-area">
          <ArrowRight size={22} className="converter-arrow" />
          <button className="convert-action-btn" onClick={performConversion}>
            CONVERT
          </button>
        </div>

        {/* Target Section */}
        <div className="converter-section">
          <div className="selector-header">
            <label>OUTPUT</label>
            <div className="dropdown-wrap">
              <span>TO</span>
              <select
                value={targetType}
                onChange={(e) => setTargetType(e.target.value)}
                className="converter-select"
              >
                {CONVERSION_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
          <textarea
            className="converter-textarea output-box"
            value={outputVal}
            readOnly
            placeholder="Converted intermediate or final result will appear here..."
            rows={5}
          />
        </div>
      </div>

      {/* Action Footer */}
      <div className="converter-footer">
        <div className="footer-left">
          <button className="footer-btn secondary" onClick={handleCopy} disabled={!outputVal}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : 'COPY OUTPUT'}</span>
          </button>
          <button className="footer-btn secondary" onClick={handleClear}>
            <Trash2 size={14} />
            <span>CLEAR</span>
          </button>
        </div>
      </div>
    </div>
  );
}
