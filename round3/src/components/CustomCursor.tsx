import React, { useEffect, useRef } from 'react';
import './CustomCursor.css';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement | null>(null);
  const isPointerRef = useRef(false);
  const isClickingRef = useRef(false);
  const isHiddenRef = useRef(true);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches && !window.matchMedia('(pointer: fine)').matches) {
      return;
    }

    const cursorEl = cursorRef.current;
    if (!cursorEl) return;

    document.documentElement.classList.add('has-custom-cursor');

    let posX = -100;
    let posY = -100;

    const updatePosition = (x: number, y: number) => {
      posX = x;
      posY = y;
      cursorEl.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      if (isHiddenRef.current) {
        isHiddenRef.current = false;
        cursorEl.classList.remove('is-hidden');
      }
    };

    const handlePointerMove = (e: MouseEvent | PointerEvent) => {
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

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
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

    const handleMouseOut = (e: MouseEvent) => {
      const related = e.relatedTarget as HTMLElement | null;
      if (!related) {
        isHiddenRef.current = true;
        cursorEl.classList.add('is-hidden');
      }
    };

    const handleWindowBlur = () => {
      isHiddenRef.current = true;
      cursorEl.classList.add('is-hidden');
    };

    const handleMouseEnter = (e: MouseEvent) => {
      if (e.clientX && e.clientY) {
        updatePosition(e.clientX, e.clientY);
      }
    };

    window.addEventListener('pointermove', handlePointerMove as any, { passive: true });
    window.addEventListener('mousemove', handlePointerMove as any, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('pointerup', handlePointerUp);
    window.addEventListener('blur', handleWindowBlur);
    document.addEventListener('mouseover', handleMouseOver);
    document.addEventListener('mouseout', handleMouseOut);
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      document.documentElement.classList.remove('has-custom-cursor');
      window.removeEventListener('pointermove', handlePointerMove as any);
      window.removeEventListener('mousemove', handlePointerMove as any);
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('pointerup', handlePointerUp);
      window.removeEventListener('blur', handleWindowBlur);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseout', handleMouseOut);
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
