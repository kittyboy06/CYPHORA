import React from 'react';
import { motion } from 'framer-motion';

export function MemoryFragment({ visible, children }) {
  if (!visible) return null;

  return (
    <motion.div
      className="memory-fragment"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="memory-fragment-panel">
        <div className="memory-header">MEMORY RECOVERY</div>
        <div className="memory-percentage">37%</div>
        <div className="memory-status">MEMORY FRAGMENT RECOVERED</div>
        <div className="memory-meta">NEXT MEMORY SOURCE AVAILABLE</div>
        {children}
      </div>
    </motion.div>
  );
}
