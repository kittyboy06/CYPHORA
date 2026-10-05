import React, { useState } from 'react';
import { ShieldAlert, Maximize } from 'lucide-react';

interface Props {
  onAdminUnlock: () => void;
}

export const AntiCheatScreen: React.FC<Props> = ({ onAdminUnlock }) => {
  const [adminCode, setAdminCode] = useState('');

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminCode === 'cyphora-admin') {
      onAdminUnlock();
    } else if (adminCode) {
      alert('Invalid ancient code.');
    }
  };

  return (
    <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-4 md:p-8 z-[200] backdrop-blur-md">
      <div className="max-w-3xl w-full text-center space-y-6 md:space-y-8 bg-black/80 p-8 md:p-12 border border-red-500/50 rounded-sm shadow-2xl">
        <ShieldAlert size={64} className="text-red-500 mx-auto animate-pulse" />
        
        <h1 className="text-2xl md:text-4xl font-cinzel text-red-500 tracking-widest">
          THE SPIRITS ARE ANGERED
        </h1>
        
        <p className="text-base md:text-xl font-cinzel text-[var(--text-primary)] leading-relaxed italic">
          "The power of the temple does not allow those who deviate from their path to claim its treasure."
        </p>
        
        <p className="text-xs md:text-sm font-mono text-red-400/80 uppercase tracking-widest mt-2">
          Fullscreen mode was exited. Focus is required to survive the trials.
        </p>
        


        {/* Admin override */}
        <div className="pt-10 mt-10 border-t border-red-900/30">
          <form onSubmit={handleAdminSubmit} className="flex flex-col items-center gap-2">
            <label className="text-[10px] text-red-500/50 uppercase tracking-widest font-mono">Admin Override</label>
            <input 
              type="password" 
              value={adminCode}
              onChange={(e) => setAdminCode(e.target.value)}
              placeholder="Access Code"
              className="bg-black/50 border border-red-900/50 text-red-500 text-center text-xs font-mono px-3 py-2 outline-none focus:border-red-500 w-48 transition-colors"
            />
          </form>
        </div>
      </div>
    </div>
  );
};
