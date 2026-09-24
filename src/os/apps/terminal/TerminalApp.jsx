import React, { useState, useRef, useEffect } from 'react';
import { useOS } from '../../state/OSContext.jsx';
import { executeCommand } from './commands.js';
import './TerminalApp.css';

export function TerminalApp({ windowId }) {
  const { vfs, eventBus, teamData, closeWindow } = useOS();
  const [cwd, setCwd] = useState('/Desktop');
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  const [lines, setLines] = useState([
    { type: 'info', text: 'CYPHORA OS Navigator v1.0.4 [TTY 0]' },
    { type: 'info', text: `Authorized Session: ${teamData.name || 'Navigator'}` },
    { type: 'info', text: "Type 'help' to inspect command capabilities." },
    { type: 'text', text: '' }
  ]);

  const inputRef = useRef(null);
  const terminalEndRef = useRef(null);

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const commandLine = inputVal;
      setInputVal('');
      setHistoryIdx(-1);

      if (!commandLine.trim()) {
        setLines(prev => [...prev, { type: 'prompt', cwd, text: '' }]);
        return;
      }

      // Add to history
      const newHistory = [...history, commandLine];
      setHistory(newHistory);

      // Add prompt line
      setLines(prev => [...prev, { type: 'prompt', cwd, text: commandLine }]);

      if (commandLine.trim().toLowerCase() === 'exit') {
        closeWindow(windowId);
        return;
      }

      const results = executeCommand({
        commandLine,
        cwd,
        vfs,
        eventBus,
        teamName: teamData.name,
        setCwd,
        clearTerminal: () => setLines([]),
        history: newHistory
      });

      if (results && results.length > 0) {
        setLines(prev => [...prev, ...results]);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleTabCompletion();
    }
  };

  const handleTabCompletion = () => {
    const parts = inputVal.split(' ');
    const lastWord = parts[parts.length - 1];
    if (!lastWord) return;

    try {
      const entries = vfs.listDir(cwd, true);
      const matches = entries.filter(e => e.name.toLowerCase().startsWith(lastWord.toLowerCase()));
      if (matches.length === 1) {
        const completed = matches[0].name + (matches[0].type === 'dir' ? '/' : ' ');
        parts[parts.length - 1] = completed;
        setInputVal(parts.join(' '));
      } else if (matches.length > 1) {
        setLines(prev => [
          ...prev,
          { type: 'prompt', cwd, text: inputVal },
          {
            type: 'entry-grid',
            entries: matches.map(m => ({
              name: m.name + (m.type === 'dir' ? '/' : ''),
              isDir: m.type === 'dir',
              isHidden: m.name.startsWith('.')
            }))
          }
        ]);
      }
    } catch (e) {}
  };

  const formatCwd = (path) => {
    if (path === '/Users/Navigator') return '~';
    if (path.startsWith('/Users/Navigator/')) return '~' + path.slice('/Users/Navigator'.length);
    return path;
  };

  return (
    <div className="terminal-app-container" onClick={handleContainerClick}>
      <div className="terminal-output-area">
        {lines.map((line, idx) => {
          if (line.type === 'prompt') {
            return (
              <div key={idx} className="terminal-line prompt-line">
                <span className="terminal-user">{teamData.name || 'team'}@cyphora</span>
                <span className="terminal-colon">:</span>
                <span className="terminal-cwd">{formatCwd(line.cwd)}</span>
                <span className="terminal-dollar">$</span>
                <span className="terminal-cmd-text">{line.text}</span>
              </div>
            );
          }
          if (line.type === 'entry-grid') {
            return (
              <div key={idx} className="terminal-grid-output">
                {line.entries.map((entry, eIdx) => (
                  <span
                    key={eIdx}
                    className={`terminal-entry ${entry.isDir ? 'dir-entry' : 'file-entry'} ${entry.isHidden ? 'hidden-entry' : ''}`}
                  >
                    {entry.name}
                  </span>
                ))}
              </div>
            );
          }
          return (
            <div key={idx} className={`terminal-line line-${line.type}`}>
              {line.text}
            </div>
          );
        })}

        {/* Active prompt row */}
        <div className="terminal-line prompt-active-row">
          <span className="terminal-user">{teamData.name || 'team'}@cyphora</span>
          <span className="terminal-colon">:</span>
          <span className="terminal-cwd">{formatCwd(cwd)}</span>
          <span className="terminal-dollar">$</span>
          <input
            ref={inputRef}
            type="text"
            className="terminal-input-element"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
            spellCheck="false"
            autoComplete="off"
          />
        </div>
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
