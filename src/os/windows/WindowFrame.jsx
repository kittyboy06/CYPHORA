import React, { useRef, useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useOS } from '../state/OSContext.jsx';
import './WindowFrame.css';

export function WindowFrame({ windowInstance, children }) {
  const {
    id,
    title,
    x,
    y,
    width,
    height,
    isMinimized,
    isMaximized,
    zIndex
  } = windowInstance;

  const {
    focusWindow,
    closeWindow,
    minimizeWindow,
    maximizeWindow,
    moveWindow,
    resizeWindow,
    activeWindowId
  } = useOS();

  const isFocused = activeWindowId === id;
  const frameRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, winX: 0, winY: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStart, setResizeStart] = useState({ mouseX: 0, mouseY: 0, winW: 0, winH: 0 });

  // Handle Dragging
  const handleTitleMouseDown = (e) => {
    if (e.button !== 0) return; // Left click only
    if (isMaximized) return; // Don't drag if maximized

    focusWindow(id);
    setIsDragging(true);
    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      winX: x,
      winY: y
    });
    e.preventDefault();
  };

  // Handle Resizing
  const handleResizeMouseDown = (e) => {
    if (e.button !== 0) return;
    if (isMaximized) return;

    focusWindow(id);
    setIsResizing(true);
    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      winW: width,
      winH: height
    });
    e.preventDefault();
    e.stopPropagation();
  };

  useEffect(() => {
    if (!isDragging && !isResizing) return;

    const handleMouseMove = (e) => {
      if (isDragging) {
        const dx = e.clientX - dragStart.mouseX;
        const dy = e.clientY - dragStart.mouseY;
        const newX = Math.max(0, Math.min(window.innerWidth - 120, dragStart.winX + dx));
        const newY = Math.max(38, Math.min(window.innerHeight - 80, dragStart.winY + dy));
        moveWindow(id, newX, newY);
      }

      if (isResizing) {
        const dx = e.clientX - resizeStart.mouseX;
        const dy = e.clientY - resizeStart.mouseY;
        const newW = Math.max(360, Math.min(window.innerWidth, resizeStart.winW + dx));
        const newH = Math.max(240, Math.min(window.innerHeight - 80, resizeStart.winH + dy));
        resizeWindow(id, newW, newH);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, isResizing, dragStart, resizeStart, id, moveWindow, resizeWindow]);

  if (isMinimized) return null;

  const style = isMaximized
    ? {
        position: 'fixed',
        top: '38px',
        left: 0,
        right: 0,
        bottom: '42px',
        width: '100%',
        height: 'calc(100vh - 80px)',
        zIndex
      }
    : {
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        zIndex
      };

  return (
    <div
      ref={frameRef}
      className={`window-frame ${isFocused ? 'window-focused' : ''} ${isMaximized ? 'window-maximized' : ''}`}
      style={style}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div
        className="window-titlebar"
        onMouseDown={handleTitleMouseDown}
        onDoubleClick={() => maximizeWindow(id)}
      >
        <div className="window-title-left">
          <div className="window-status-dot" />
          <span className="window-title-text">{title}</span>
        </div>

        <div className="window-controls">
          <button
            className="win-ctrl-btn win-ctrl-minimize"
            onClick={(e) => {
              e.stopPropagation();
              minimizeWindow(id);
            }}
            title="Minimize"
          >
            <Minus size={13} />
          </button>
          <button
            className="win-ctrl-btn win-ctrl-maximize"
            onClick={(e) => {
              e.stopPropagation();
              maximizeWindow(id);
            }}
            title={isMaximized ? 'Restore' : 'Maximize'}
          >
            {isMaximized ? <Copy size={11} /> : <Square size={11} />}
          </button>
          <button
            className="win-ctrl-btn win-ctrl-close"
            onClick={(e) => {
              e.stopPropagation();
              closeWindow(id);
            }}
            title="Close"
          >
            <X size={13} />
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="window-content-area">
        {children}
      </div>

      {/* Resize Handle */}
      {!isMaximized && (
        <div
          className="window-resize-handle"
          onMouseDown={handleResizeMouseDown}
        />
      )}
    </div>
  );
}
