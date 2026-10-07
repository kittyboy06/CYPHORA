import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

/**
 * CustomCursor - Renders the animated Pansage cursor (from pansage s.ani)
 * across the entire web application.
 *
 * Features:
 * - Direct transform updating via pointermove/mousemove for 0ms lag
 * - Animated sprite (6fps Pansage bounce from the original ANI file)
 * - Exact (0, 0) hotspot alignment matching the green arrow tip
 * - Seamless pointer / click feedback
 * - Auto-disables on coarse touchscreens
 * - CSS native cursor fallback
 */
export default function CustomCursor() {
  const cursorRef = useRef(null);
  const isPointerRef = useRef(false);
  const isClickingRef = useRef(false);
  const isHiddenRef = useRef(true);

  useEffect(() => {
    // If touchscreen device without fine pointer, keep default touch behaviors
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    document.documentElement.classList.add('has-custom-cursor');

    let posX = -100;
    let posY = -100;

    const updatePosition = (x, y) => {
      posX = x;
      posY = y;
      cursorEl.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        cursorEl.classList.remove('is-hidden');
      }
    };

    const handlePointerMove = (e) => {
      updatePosition(e.clientX, e.clientY);
    };

    const handlePointerDown = () => {
      isClickingRef.current = true;
      cursorEl.classList.add('is-clicking');
    };

    const handlePointerUp = () => {
      isClickingRef.current = false;
      cursorEl.classList.remove('is-clicking');
    };

    const handleMouseOver = (e) => {
      const target = e.target;
      if (!target) return;

      const interactive = target.closest(
        'button, a, input, select, textarea, [role="button"], .clickable, [onclick], [tabindex]:not([tabindex="-1"])'
      );

      if (interactive) {
        if (!isPointerRef.current) {
          isPointerRef.current = true;
          cursorEl.classList.add('is-pointer');
        }
      } else {
        if (isPointerRef.current) {
          isPointerRef.current = false;
          cursorEl.classList.remove('is-pointer');
        }
      }
    };

    const handleMouseLeave = () => {
      isHiddenRef.current = true;
      cursorEl.classList.add('is-hidden');
    };

    const handleMouseEnter = (e) => {
      if (e.clientX && e.clientY) {
        updatePosition(e.clientX, e.clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });
    window.addEventListener('pointerup', handlePointerUp, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div
      ref={cursorRef}
      className="pansage-cursor-container is-hidden"
      aria-hidden="true"
    >
      <img
        src="/assets/cursor/pansage.gif"
        alt=""
        className="pansage-cursor-sprite"
        draggable={false}
      />
    </div>
  );
}
