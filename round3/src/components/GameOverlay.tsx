import React from 'react';
import { useGameStore } from '../state/gameStore';
import { RefreshCcw } from 'lucide-react';

interface Props {
  onRetry: () => void;
}

export const GameOverlay: React.FC<Props> = ({ onRetry }) => {
  const { status, score, totalCommands, level, setLevel } = useGameStore();

  if (status === 'idle' || status === 'running') return null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center text-[var(--text-primary)]">
      {status === 'success' && (
        <div className="max-w-md w-full bg-[var(--bg-panel)] border border-[var(--border-gold)] p-8 rounded-sm shadow-2xl">
          <h2 className="text-3xl font-cinzel text-[var(--accent-gold)] mb-2">LEVEL COMPLETE</h2>
          <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase mb-8">Destination Reached</p>

          <div className="space-y-4 mb-8">
            <div className="flex justify-between border-b border-[var(--border-gold)]/30 pb-2">
              <span className="text-[var(--text-muted)]">Commands Used</span>
              <span className="font-mono">{totalCommands}</span>
            </div>
            <div className="flex justify-between border-b border-[var(--border-gold)]/30 pb-2">
              <span className="text-[var(--text-muted)]">Efficiency</span>
              <span className="font-mono text-green-400">Excellent</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-[var(--accent-gold)] font-bold">LEVEL SCORE</span>
              <span className="font-cinzel text-xl text-[var(--accent-gold)]">{score}</span>
            </div>
          </div>

          {level === 1 ? (
            <button 
              onClick={() => setLevel(2)}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-dark)] font-bold tracking-widest hover:brightness-110 transition-all uppercase">
              Next Level
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-dark)] font-bold tracking-widest hover:brightness-110 transition-all uppercase">
              Continue Expedition
            </button>
          )}
        </div>
      )}

      {status === 'failed' && (
        <div className="max-w-md w-full bg-[var(--bg-panel)] border border-red-900/50 p-8 rounded-sm shadow-2xl">
          <h2 className="text-3xl font-cinzel text-red-500 mb-2">EXPEDITION INTERRUPTED</h2>
          <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase mb-8">Critical Failure</p>

          <button 
            onClick={onRetry}
            className="w-full py-4 border border-red-500 text-red-500 flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all uppercase tracking-widest font-bold">
            <RefreshCcw size={18} /> Retry Level
          </button>
        </div>
      )}
    </div>
  );
};
