import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export const LandingScreen: React.FC<Props> = ({ onEnter }) => {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    if (!isVisible) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={() => setIsVisible(true)}
      className="absolute inset-0 bg-[#050804] flex flex-col items-center justify-center p-8 z-[100] overflow-hidden"
    >
      {/* Background ambient effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent-gold)] via-transparent to-transparent" />

      {/* Mouse Follow Glow Effect */}
      <div
        className={`pointer-events-none absolute top-0 left-0 w-[220px] h-[220px] rounded-full transition-opacity duration-500 ease-out z-[5] ${isVisible ? 'opacity-35' : 'opacity-0'
          }`}
        style={{
          transform: `translate3d(${mousePos.x - 110}px, ${mousePos.y - 110}px, 0)`,
          transition: 'transform 180ms cubic-bezier(0.1, 0.2, 0.1, 1), opacity 500ms ease-out',
          background: 'radial-gradient(circle, var(--accent-gold, #dfb125) 0%, rgba(223, 177, 37, 0.3) 40%, transparent 70%)',
          filter: 'blur(20px)',
        }}
      />

      <div className="max-w-2xl text-center space-y-8 relative z-10">
        <h1 className="text-5xl md:text-7xl font-cinzel text-[var(--accent-gold)] tracking-widest mb-4 drop-shadow-lg shadow-black">
          CYPHORA
        </h1>
        <h2 className="text-xl md:text-2xl font-mono text-[var(--text-muted)] tracking-[0.3em] uppercase">
          Round 3 : The Temple Trials
        </h2>

        <div className="pt-16">
          <button
            onClick={onEnter}
            className="px-10 py-5 bg-[var(--bg-panel)] border border-[var(--border-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-black transition-all uppercase tracking-widest font-bold flex items-center gap-3 mx-auto text-lg shadow-[0_0_20px_rgba(223,177,37,0.15)] hover:shadow-[0_0_30px_rgba(223,177,37,0.4)]"
          >
            Enter The Temple <Play size={24} />
          </button>
          <p className="mt-8 text-sm text-[var(--accent-gold)]/60 font-mono animate-pulse uppercase tracking-widest">
            Warning: This trial requires absolute focus.
          </p>
        </div>
      </div>
    </div>
  );
};
