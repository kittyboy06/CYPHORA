import React from 'react';
import { motion } from 'framer-motion';

export function StoryScene({
  title,
  narration,
  children,
  variant = 'forest',
  image,
  alt = 'Expedition Prologue Scene',
  objectPosition = 'center'
}) {
  return (
    <motion.div
      className={`story-scene ${variant}`}
      initial={{ opacity: 0, scale: 0.98, y: 15 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.6, ease: 'easeInOut' }}
    >
      <div className="story-scene-header">
        <span className="story-location">UNKNOWN LOCATION</span>
        {title && <h2>{title}</h2>}
      </div>
      <div className="story-visual-stage">
        {image && (
          <div className="comic-panel-container">
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
          </div>
        )}
        {children}
      </div>
      {narration && <p className="story-narration">{narration}</p>}
    </motion.div>
  );
}

