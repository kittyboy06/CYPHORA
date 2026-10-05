import React from 'react';
import { motion } from 'framer-motion';

export function StoryScene({
  title,
  location = 'UNKNOWN LOCATION',
  narration,
  children,
  variant = 'forest',
  image,
  alt = 'Expedition Prologue Scene',
  objectPosition = 'center',
  systemStatus = null,
  isMemory = false,
  memoryBadge = null,
  showSymbol = false,
  tagline = null
}) {
  return (
    <motion.div
      className={`story-scene ${variant} ${isMemory ? 'is-memory-scene' : ''}`}
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="story-scene-header">
        <div className="story-header-left">
          <span className="story-location">{location}</span>
          {memoryBadge && (
            <span className="memory-trigger-badge">
              ✦ {memoryBadge}
            </span>
          )}
        </div>
        {title && <h2>{title}</h2>}
      </div>

      <div className="story-visual-stage">
        {image && (
          <div className={`comic-panel-container ${isMemory ? 'dreamlike-memory-panel' : ''}`}>
            <motion.img
              src={image}
              alt={alt}
              className="comic-panel-image"
              style={{ objectPosition }}
              initial={{ scale: 1.02 }}
              animate={{ scale: 1.05 }}
              transition={{ duration: 12, ease: 'linear', repeat: Infinity, repeatType: 'reverse' }}
            />
            <div className="comic-panel-vignette" />
            <div className="comic-panel-gradient" />
            <div className="comic-panel-scanlines" />

            {/* Dreamlike memory bloom & distortion layer for Screen 3 */}
            {isMemory && (
              <div className="memory-dream-overlay">
                <div className="memory-light-bloom" />
                <div className="memory-particles" />
              </div>
            )}

            {/* Recurring Symbol Overlay for Screen 5 */}
            {showSymbol && (
              <motion.div
                className="recurring-symbol-overlay"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1.2, delay: 0.3 }}
              >
                <div className="symbol-glyph-box">
                  <svg className="symbol-svg" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <polygon points="50,6 92,80 8,80" stroke="#dfb125" strokeWidth="2.5" fill="rgba(223, 177, 37, 0.08)" />
                    <circle cx="50" cy="45" r="14" stroke="#dfb125" strokeWidth="2" fill="none" />
                    <path d="M46,45 L43,68 L57,68 L54,45 Z" stroke="#dfb125" strokeWidth="2" fill="rgba(223, 177, 37, 0.25)" />
                    <circle cx="50" cy="45" r="5" fill="#dfb125" />
                  </svg>
                  <span className="symbol-label">RECURRING EMBLEM // KEYHOLE TRIAD</span>
                </div>
              </motion.div>
            )}

            {/* System Status Readout for Screen 2 & Screen 6 */}
            {systemStatus && Array.isArray(systemStatus) && (
              <motion.div
                className="scene-system-status-box"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="status-box-header">
                  <span>FIELD SYSTEM TELEMETRY</span>
                  <span className="status-blink-dot" />
                </div>
                <div className="status-box-lines">
                  {systemStatus.map((item, idx) => (
                    <div key={idx} className="status-line-item">
                      <span className="status-item-label">{item.label}</span>
                      <span className="status-item-dots">........</span>
                      <span className={`status-item-val ${item.type || 'off'}`}>
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {tagline && (
              <div className="scene-floating-tagline">
                <span>{tagline}</span>
              </div>
            )}
          </div>
        )}
        {children}
      </div>

      {narration && <p className="story-narration">{narration}</p>}
    </motion.div>
  );
}


