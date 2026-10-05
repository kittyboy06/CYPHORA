import React, { useState } from 'react';
import { ArrowRight, Copy, RefreshCw, Sparkles, Trash2, Check, Palette } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import './UniversalConverterApp.css';

const CONVERSION_OPTIONS = [
  { id: 'binary', label: 'Binary' },
  { id: 'decimal', label: 'Decimal (0–9 Format)' },
  { id: 'hex', label: 'Hexadecimal' },
  { id: 'color', label: 'Color Code (HEX / RGB)' },
  { id: 'ascii', label: 'ASCII (Character Codes)' },
  { id: 'text', label: 'Text (Readable Words / Color Names)' },
  { id: 'base64', label: 'Base64' },
  { id: 'url', label: 'URL' },
  { id: 'octal', label: 'Octal' }
];

const COLOR_NAMES_MAP = {
  '#000000': 'BLACK',
  '#FFFFFF': 'WHITE',
  '#FF0000': 'RED',
  '#00FF00': 'GREEN',
  '#0000FF': 'BLUE',
  '#FFFF00': 'YELLOW',
  '#FFA500': 'ORANGE',
  '#800080': 'PURPLE',
  '#FFC0CB': 'PINK',
  '#00FFFF': 'CYAN',
  '#FF00FF': 'MAGENTA',
  '#808080': 'GRAY',
  '#A52A2A': 'BROWN',
  '#000080': 'NAVY',
  '#008080': 'TEAL',
  '#800000': 'MAROON',
  '#808000': 'OLIVE',
  '#C0C0C0': 'SILVER',
  '#FFD700': 'GOLD',
  '#4B0082': 'INDIGO',
  '#EE82EE': 'VIOLET',
  '#FA8072': 'SALMON',
  '#F0E68C': 'KHAKI',
  '#E6E6FA': 'LAVENDER',
  '#40E0D0': 'TURQUOISE',
  '#DC143C': 'CRIMSON',
  '#FF4500': 'ORANGE RED',
  '#32CD32': 'LIME GREEN',
  '#00FF7F': 'SPRING GREEN',
  '#1E90FF': 'DODGER BLUE',
  '#87CEEB': 'SKY BLUE',
  '#DDA0DD': 'PLUM',
  '#F5F5DC': 'BEIGE',
  '#F5DEB3': 'WHEAT',
  '#FF1493': 'DEEP PINK',
  '#00CED1': 'DARK TURQUOISE',
  '#9400D3': 'DARK VIOLET',
  '#FF8C00': 'DARK ORANGE',
  '#2E8B57': 'SEA GREEN',
  '#98FB98': 'PALE GREEN',
  '#B22222': 'FIREBRICK',
  '#CD5C5C': 'INDIAN RED',
  '#708090': 'SLATE GRAY',
  '#4682B4': 'STEEL BLUE',
  '#008000': 'GREEN'
};

const COLOR_TO_HEX_MAP = Object.entries(COLOR_NAMES_MAP).reduce((acc, [hex, name]) => {
  acc[name.toUpperCase()] = hex;
  return acc;
}, {});

function hexToRgb(hexStr) {
  let clean = hexStr.replace(/^#|^0x/i, '').trim();
  if (clean.length === 3) {
    clean = clean.split('').map(c => c + c).join('');
  }
  if (clean.length !== 6) return null;
  const num = parseInt(clean, 16);
  if (isNaN(num)) return null;
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
    hex: '#' + clean.toUpperCase()
  };
}

function getClosestColorName(r, g, b, originalHex) {
  const normalizedHex = '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0').toUpperCase()).join('');
  if (COLOR_NAMES_MAP[normalizedHex]) {
    return COLOR_NAMES_MAP[normalizedHex];
  }
  if (originalHex && COLOR_NAMES_MAP[originalHex.toUpperCase()]) {
    return COLOR_NAMES_MAP[originalHex.toUpperCase()];
  }

  let closestName = 'CUSTOM COLOR';
  let minDistance = Infinity;

  for (const [hexKey, name] of Object.entries(COLOR_NAMES_MAP)) {
    const rgb = hexToRgb(hexKey);
    if (!rgb) continue;
    const dist = Math.sqrt(
      Math.pow(r - rgb.r, 2) +
      Math.pow(g - rgb.g, 2) +
      Math.pow(b - rgb.b, 2)
    );
    if (dist < minDistance) {
      minDistance = dist;
      closestName = name;
    }
  }
  return closestName;
}

function convertColorCodeToHumanReadable(raw) {
  const lines = raw.split(/\r?\n/);
  const convertedLines = lines.map(line => {
    let replaced = line;

    // Check for #RRGGBB or #RGB or 0xRRGGBB
    replaced = replaced.replace(/(?:#|0x)([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/g, (match, hexPart) => {
      const rgb = hexToRgb(hexPart);
      if (rgb) {
        return getClosestColorName(rgb.r, rgb.g, rgb.b, rgb.hex);
      }
      return match;
    });

    // Check for rgb(r, g, b) or rgba(r, g, b, a)
    replaced = replaced.replace(/rgba?\(\s*(\d{1,3})\s*[, ]\s*(\d{1,3})\s*[, ]\s*(\d{1,3})(?:\s*[,/]\s*[\d.]+)?\s*\)/gi, (match, r, g, b) => {
      return getClosestColorName(parseInt(r, 10), parseInt(g, 10), parseInt(b, 10));
    });

    // Check if line is a standalone hex code without # (e.g. FFFF00 or 0000FF)
    if (replaced === line) {
      const bareHex = line.trim().match(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
      if (bareHex) {
        const rgb = hexToRgb(bareHex[1]);
        if (rgb) {
          return getClosestColorName(rgb.r, rgb.g, rgb.b, rgb.hex);
        }
      }
    }

    return replaced;
  });

  return convertedLines.join('\n');
}

export function UniversalConverterApp() {
  const { eventBus } = useOS();
  const [sourceType, setSourceType] = useState('color');
  const [targetType, setTargetType] = useState('text');
  const [inputVal, setInputVal] = useState('');
  const [outputVal, setOutputVal] = useState('');
  const [copied, setCopied] = useState(false);

  const getPlaceholder = () => {
    switch (sourceType) {
      case 'color':
        return 'Enter color code (e.g. #FFFF00, [04:03] #FFFF00, or rgb(255, 255, 0))...';
      case 'binary':
        return 'Enter binary data (e.g. 01001000 01001001 01000100 01000101)...';
      case 'decimal':
        return 'Enter decimal numbers (e.g. 72 73 68 69)...';
      case 'hex':
        return 'Enter hexadecimal values (e.g. 48 45 4C 50 or 56 45 43 54 4F 52)...';
      case 'ascii':
        return 'Enter ASCII character codes (e.g. 82 69 83 67 85 69)...';
      case 'base64':
        return 'Enter Base64 encoded string (e.g. Q1lQSE9SQQ==)...';
      case 'text':
        return 'Enter text or color name (e.g. YELLOW, HELLO, or CYPHORA)...';
      default:
        return 'Enter raw input value...';
    }
  };

  const performConversion = () => {
    const raw = inputVal.trim();
    if (!raw) {
      setOutputVal('');
      return;
    }

    try {
      let result = '';
      const tokens = raw.split(/[\s,]+/).filter(Boolean);

      // COLOR CODE
      if (sourceType === 'color') {
        if (targetType === 'text') {
          // Color Code -> Human Readable Color Name Text
          result = convertColorCodeToHumanReadable(inputVal);
        } else if (targetType === 'hex') {
          // Color Code -> Normalized Hex Code
          const parsed = hexToRgb(raw) || null;
          result = parsed ? parsed.hex : (COLOR_TO_HEX_MAP[raw.toUpperCase()] || raw);
        } else if (targetType === 'decimal') {
          // Color Code -> RGB Decimal components
          const rgb = hexToRgb(raw);
          result = rgb ? `${rgb.r} ${rgb.g} ${rgb.b}` : raw;
        } else if (targetType === 'binary') {
          // Color Code -> RGB 8-bit Binary
          const rgb = hexToRgb(raw);
          result = rgb ? [rgb.r, rgb.g, rgb.b].map(n => n.toString(2).padStart(8, '0')).join(' ') : raw;
        } else {
          result = convertColorCodeToHumanReadable(inputVal);
        }
      }
      // BINARY
      else if (sourceType === 'binary') {
        if (targetType === 'decimal' || targetType === 'ascii') {
          result = tokens.map(b => parseInt(b, 2)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'hex') {
          result = tokens.map(b => parseInt(b, 2).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else if (targetType === 'text') {
          result = tokens.map(b => String.fromCharCode(parseInt(b, 2))).join('');
        } else if (targetType === 'octal') {
          result = tokens.map(b => parseInt(b, 2).toString(8)).join(' ');
        } else {
          result = tokens.map(b => parseInt(b, 2)).filter(n => !isNaN(n)).join(' ');
        }
      }
      // DECIMAL
      else if (sourceType === 'decimal') {
        if (targetType === 'binary') {
          result = tokens.map(d => parseInt(d, 10).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'hex') {
          result = tokens.map(d => parseInt(d, 10).toString(16).toUpperCase().padStart(2, '0')).join(' ');
        } else if (targetType === 'ascii') {
          result = tokens.map(d => parseInt(d, 10)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'text') {
          result = tokens.map(d => String.fromCharCode(parseInt(d, 10))).join('');
        } else if (targetType === 'octal') {
          result = tokens.map(d => parseInt(d, 10).toString(8)).join(' ');
        } else {
          result = raw;
        }
      }
      // HEXADECIMAL
      else if (sourceType === 'hex') {
        if (targetType === 'color') {
          // Hex -> Color code or name
          result = convertColorCodeToHumanReadable(raw);
        } else if (targetType === 'decimal' || targetType === 'ascii') {
          result = tokens.map(h => parseInt(h, 16)).filter(n => !isNaN(n)).join(' ');
        } else if (targetType === 'binary') {
          result = tokens.map(h => parseInt(h, 16).toString(2).padStart(8, '0')).join(' ');
        } else if (targetType === 'text') {
          // Check if input is a hex color code (e.g. #FFFF00)
          if (raw.startsWith('#') || (raw.length === 6 && !raw.includes(' ') && COLOR_NAMES_MAP['#' + raw.toUpperCase()])) {
            result = convertColorCodeToHumanReadable(raw);
          } else {
            result = tokens.map(h => String.fromCharCode(parseInt(h, 16))).join('');
          }
        } else {
          result = tokens.map(h => parseInt(h, 16)).filter(n => !isNaN(n)).join(' ');
        }
      }
      // ASCII
      else if (sourceType === 'ascii') {
        if (targetType === 'text') {
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
          result = atob(raw);
        } else {
          result = atob(raw);
        }
      }
      // TEXT
      else if (sourceType === 'text') {
        if (targetType === 'color') {
          const upper = raw.toUpperCase().trim();
          result = COLOR_TO_HEX_MAP[upper] || `[NO COLOR MATCH FOR: ${raw}]`;
        } else if (targetType === 'base64') {
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
          result = decodeURIComponent(raw);
        } else {
          result = encodeURIComponent(raw);
        }
      }
      // OCTAL
      else if (sourceType === 'octal') {
        if (targetType === 'decimal') {
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

  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      performConversion();
    }
  };

  // Check if output or input is a valid color for preview indicator
  const previewColor = (() => {
    const rawOut = outputVal.trim();
    if (COLOR_TO_HEX_MAP[rawOut.toUpperCase()]) {
      return COLOR_TO_HEX_MAP[rawOut.toUpperCase()];
    }
    const hexMatch = rawOut.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/);
    if (hexMatch) return hexMatch[0];

    const rawIn = inputVal.trim();
    const inHex = rawIn.match(/(?:#|0x)([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\b/);
    if (inHex) {
      const rgb = hexToRgb(inHex[1]);
      if (rgb) return rgb.hex;
    }
    return null;
  })();

  const handleSwapFormats = () => {
    const prevSource = sourceType;
    const prevTarget = targetType;
    setSourceType(prevTarget);
    setTargetType(prevSource);
    if (outputVal && !outputVal.startsWith('[')) {
      setInputVal(outputVal);
      setOutputVal('');
    }
  };

  return (
    <div className="universal-converter-app">
      <div className="converter-header">
        <div className="converter-title-wrap">
          <Sparkles size={18} className="converter-icon" />
          <span>Universal Converter</span>
        </div>
        <p className="converter-sub">Technical data format & color code transformer for multi-stage representation reasoning</p>
      </div>

      <div className="converter-grid">
        {/* Source Section */}
        <div className="converter-section">
          <div className="format-selector-header">
            <span className="format-group-label">FROM (INPUT FORMAT)</span>
            <span className="format-selected-badge from">
              {CONVERSION_OPTIONS.find(o => o.id === sourceType)?.label}
            </span>
          </div>

          <div className="format-pills-bar from-pills">
            {CONVERSION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`format-pill-btn ${sourceType === opt.id ? 'active-from' : ''}`}
                onClick={() => {
                  setSourceType(opt.id);
                  if (opt.id === 'color' && targetType === 'color') {
                    setTargetType('text');
                  }
                }}
              >
                {opt.id === 'color' && <Palette size={12} className="pill-icon" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <textarea
            className="converter-textarea"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={getPlaceholder()}
            rows={4}
          />
        </div>

        {/* Action Bar with Convert & Swap */}
        <div className="converter-action-strip">
          <button
            className="swap-format-btn"
            onClick={handleSwapFormats}
            title="Swap input and output formats"
          >
            <RefreshCw size={14} />
            <span>SWAP FORMATS</span>
          </button>

          <button className="convert-action-btn" onClick={performConversion}>
            <Sparkles size={15} />
            <span>CONVERT DATA</span>
          </button>
        </div>

        {/* Target Section */}
        <div className="converter-section">
          <div className="format-selector-header">
            <div className="output-label-wrap">
              <span className="format-group-label">TO (OUTPUT FORMAT)</span>
              {previewColor && (
                <div className="color-preview-chip">
                  <span className="color-dot" style={{ backgroundColor: previewColor }} />
                  <span className="color-hex-label">{previewColor}</span>
                </div>
              )}
            </div>
            <span className="format-selected-badge to">
              {CONVERSION_OPTIONS.find(o => o.id === targetType)?.label}
            </span>
          </div>

          <div className="format-pills-bar to-pills">
            {CONVERSION_OPTIONS.map(opt => (
              <button
                key={opt.id}
                type="button"
                className={`format-pill-btn ${targetType === opt.id ? 'active-to' : ''}`}
                onClick={() => setTargetType(opt.id)}
              >
                {opt.id === 'color' && <Palette size={12} className="pill-icon" />}
                <span>{opt.label}</span>
              </button>
            ))}
          </div>

          <textarea
            className="converter-textarea output-box"
            value={outputVal}
            readOnly
            placeholder="Converted result (e.g. human-readable text or decoded color name) will appear here..."
            rows={4}
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
        <div className="footer-right">
          <span className="converter-hint">Press Ctrl+Enter to convert</span>
        </div>
      </div>
    </div>
  );
}

