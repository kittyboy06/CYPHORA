import React, { useEffect, useRef } from 'react';
import { ArrowLeft, Monitor } from 'lucide-react';
import './Round3App.css';

export function Round3FullscreenView({ onClose, teamData }) {
  const containerRef = useRef(null);

  useEffect(() => {
    // Set active round to 3
    try {
      if (typeof sessionStorage !== 'undefined') {
        sessionStorage.setItem('cyphora_active_round', '3');
        sessionStorage.removeItem('cyphora_os_locked');
      }
    } catch (e) { }

    // Request true browser fullscreen
    try {
      if (typeof document !== 'undefined' && !document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch((err) => {
          console.warn('[Round3] Fullscreen request pending gesture:', err);
        });
      }
    } catch (e) { }

    // Set page body overflow to hidden
    const origOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = origOverflow;
      try {
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('cyphora_active_round', '1');
        }
      } catch (e) { }
    };
  }, []);

  const handleReturnToOS = () => {
    if (typeof onClose === 'function') {
      onClose();
    }
  };

  return (
    <div ref={containerRef} className="round3-kiosk-view">
      {/* Floating unobtrusive Return to OS button in top-left */}
      <button
        type="button"
        onClick={handleReturnToOS}
        className="round3-floating-exit-btn"
        title="Exit Round 3 and return to workstation desktop"
      >
        <ArrowLeft size={14} />
        <span>Return to OS</span>
      </button>

      {/* The fully developed Round 3 application in pure full screen (no borders, no padding) */}
      <iframe
        src="/round3/index.html"
        title="CYPHORA Round 3 — The Jungle Code / Temple Trials"
        className="round3-kiosk-frame"
        allow="fullscreen; autoplay; clipboard-write; clipboard-read"
      />
    </div>
  );
}
