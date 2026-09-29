import React from 'react';
import { Play } from 'lucide-react';

interface Props {
  onEnter: () => void;
}

export const LandingScreen: React.FC<Props> = ({ onEnter }) => {
  return (
    <div className="absolute inset-0 bg-[#050804] flex flex-col items-center justify-center p-8 z-[100]">
      {/* Background ambient effect */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[var(--accent-gold)] via-transparent to-transparent" />
      
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
