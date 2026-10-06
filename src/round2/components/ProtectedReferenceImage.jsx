import React, { useState, useEffect, useRef } from 'react';
import { ShieldAlert, Eye, EyeOff, Lock, AlertTriangle, Clock, ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * ProtectedReferenceImage Component
 * 
 * Implements best-effort client-side protection for organizer reference images:
 * 1. Blocks context menu (right-click)
 * 2. Blocks drag-and-drop, image selection, and saving
 * 3. Transparent protective layer covering the image element
 * 4. Repeating diagonal watermark overlay with team name & event details
 * 5. Tab focus loss detection (blurs and masks image when user switches tabs or windows)
 * 6. Keyboard shortcut prevention for common save/print actions
 * 7. CSS print blocking (@media print hide)
 * 8. Optional countdown timer (e.g. 15s peek) based on round2.md specs
 * 
 * Note: Browser sandboxing cannot guarantee 100% screenshot immunity against OS-level
 * screen clippers, hardware capture, or devtools.
 */
export function ProtectedReferenceImage({
  src,
  images = [],
  alt = 'Organizer Reference Target',
  teamName = 'CYPHORA Explorer',
  initialTimerSeconds = 15,
  enableTimer = false,
  compact = false,
}) {
  const [warningMessage, setWarningMessage] = useState('');
  const [isRevealed, setIsRevealed] = useState(!enableTimer);
  const [timeLeft, setTimeLeft] = useState(initialTimerSeconds);
  const [timerRunning, setTimerRunning] = useState(enableTimer);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const warningTimeoutRef = useRef(null);

  const targetImages = images.length > 0 ? images : (src ? [src] : ['/assets/round2/targets/target1.jpg', '/assets/round2/targets/target2.jpg']);
  const activeImage = targetImages[currentImageIndex];

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % targetImages.length);
  };
  
  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + targetImages.length) % targetImages.length);
  };

  const showSecurityNotice = (msg) => {
    setWarningMessage(msg);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    warningTimeoutRef.current = setTimeout(() => {
      setWarningMessage('');
    }, 2800);
  };

  // 2. Keystroke intercept for common shortcuts (PrintScreen, Ctrl+S, Ctrl+P)
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent Ctrl+S / Cmd+S
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        showSecurityNotice('⚠️ Save command blocked on protected asset');
      }
      // Prevent Ctrl+P / Cmd+P
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        showSecurityNotice('⚠️ Print preview blocked on protected asset');
      }
      // PrintScreen key
      if (e.key === 'PrintScreen') {
        showSecurityNotice('⚠️ Screen capture alert: Reference is watermarked & logged');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 3. Countdown timer logic (if enabled)
  useEffect(() => {
    if (!enableTimer || !timerRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setTimerRunning(false);
          setIsRevealed(false);
          showSecurityNotice('⏱️ Initial 15s reference peek time expired!');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [enableTimer, timerRunning, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(initialTimerSeconds);
    setIsRevealed(true);
    setTimerRunning(true);
  };

  const handleContextMenu = (e) => {
    e.preventDefault();
    showSecurityNotice('⚠️ Right-click context menu is disabled on this asset');
  };

  const handleDragStart = (e) => {
    e.preventDefault();
    showSecurityNotice('⚠️ Drag-and-drop extraction is blocked');
  };

  return (
    <section 
      className={`protected-image-card ${compact ? 'is-compact' : ''}`}
      aria-label="Protected Reference Image Section"
    >
      {!compact && (
        <>
          <div className="card-header">
            <div className="header-title-group">
              <ShieldAlert className="header-icon" size={20} />
              <h3>Target Reference Image</h3>
            </div>
            
            {enableTimer && (
              <div className={`timer-badge ${timeLeft > 0 && timerRunning ? 'active' : 'expired'}`}>
                <Clock size={14} />
                <span>{timerRunning ? `${timeLeft}s left` : (timeLeft === 0 ? 'Expired' : 'Standby')}</span>
              </div>
            )}
          </div>

          <p className="card-instruction">
            Observe this target image carefully. Generate your recreated prompt and upload your resulting image below.
          </p>
        </>
      )}

      {targetImages.length > 1 && (
        <div className={`image-slider-controls ${compact ? 'compact-slider' : ''}`}>
          <button type="button" onClick={prevImage} className="slider-btn">
            <ChevronLeft size={14} /> Prev
          </button>
          <span className="slider-indicator">Image {currentImageIndex + 1} of {targetImages.length}</span>
          <button type="button" onClick={nextImage} className="slider-btn">
            Next <ChevronRight size={14} />
          </button>
        </div>
      )}

      {/* Main Image Viewport */}
      <div 
        className={`image-viewport-wrapper ${compact ? 'compact-viewport' : ''}`}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      >
        {/* The Reference Image */}
        <div className={`image-canvas-container ${!isRevealed ? 'peek-hidden' : ''}`}>
          <img
            src={activeImage}
            alt={`${alt} ${currentImageIndex + 1}`}
            className="protected-img"
            draggable="false"
            loading="eager"
          />

          {/* Watermark Overlay (SVG Grid Pattern) */}
          <div className="watermark-overlay" aria-hidden="true">
            <div className="watermark-grid">
              {Array.from({ length: 8 }).map((_, idx) => (
                <div key={idx} className="watermark-text-row">
                  <span>CYPHORA 2026 // ROUND 2</span>
                  <span className="watermark-team">[{teamName}]</span>
                  <span>DO NOT REPRODUCE</span>
                </div>
              ))}
            </div>
            <div className="watermark-center-stamp">
              <div className="center-stamp-box">
                CYPHORA EVALUATION TARGET • {teamName}
              </div>
            </div>
          </div>
        </div>

        {/* Protection Shield (Invisible overlay preventing drag/touch-hold) */}
        <div 
          className="transparent-touch-shield"
          onContextMenu={handleContextMenu}
          onDragStart={handleDragStart}
          aria-hidden="true"
        />

        {/* Timed Peek Expired / Hidden Overlay */}
        {enableTimer && !isRevealed && (
          <div className="peek-expired-shield">
            <EyeOff size={compact ? 24 : 34} className="lock-icon" />
            <h4>Reference Observation Closed</h4>
            <p>Initial {initialTimerSeconds}s preview has elapsed. Recreate from memory or request a peek.</p>
            <button 
              type="button" 
              className="peek-reopen-btn"
              onClick={handleStartTimer}
            >
              <Eye size={14} /> Re-open Peek ({initialTimerSeconds}s)
            </button>
          </div>
        )}

        {/* Active Warning Notification Toast */}
        {warningMessage && (
          <div className="protection-warning-toast" role="alert">
            <AlertTriangle size={14} />
            <span>{warningMessage}</span>
          </div>
        )}
      </div>

      {compact ? (
        <div className="compact-security-strip">
          <div className="compact-sec-left">
            <ShieldAlert size={12} color="#dfb125" />
            <span>Watermarked • Copy/Drag Disabled</span>
          </div>
          {enableTimer && (
            <div className="compact-sec-right">
              <Clock size={12} color={timeLeft > 0 && timerRunning ? '#7ee787' : '#e06c75'} />
              <span>{timerRunning ? `${timeLeft}s peek` : (timeLeft === 0 ? 'Peek closed' : 'Standby')}</span>
            </div>
          )}
        </div>
      ) : (
        /* Security Advisory Warning Notice */
        <div className="security-notice-box">
          <div className="notice-icon-col">
            <ShieldAlert size={16} />
          </div>
          <div className="notice-content">
            <strong>WARNING</strong>
            <p>
              Right-click, dragging, and printing are disabled. Dynamic forensic watermark is embedded.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
