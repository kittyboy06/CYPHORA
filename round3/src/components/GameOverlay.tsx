import React from 'react';
import { useGameStore } from '../state/gameStore';
import { RefreshCcw } from 'lucide-react';

interface Props {
  onRetry: () => void;
  onNextLevel: (next: number) => void;
}

const LEVEL_ORDER = [1, 2, 3];

export const GameOverlay: React.FC<Props> = ({ onRetry, onNextLevel }) => {
  const {
    status,
    score,
    blockScore,
    timeScore,
    timeUsedSeconds,
    parBlocks,
    parTimeSeconds,
    efficiency,
    totalCommands,
    level,
    setLevel
  } = useGameStore();

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };

  if (status === 'idle' || status === 'running') return null;

  const currentIdx = LEVEL_ORDER.indexOf(level);
  const nextLevel = currentIdx >= 0 && currentIdx < LEVEL_ORDER.length - 1 
    ? LEVEL_ORDER[currentIdx + 1] 
    : null;

  return (
    <div className="absolute inset-0 bg-black/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center p-8 text-center text-[var(--text-primary)]">
      {status === 'success' && (
        <div className="max-w-md w-full bg-[var(--bg-panel)] border border-[var(--border-gold)] p-8 rounded-sm shadow-2xl">
          <h2 className="text-3xl font-cinzel text-[var(--accent-gold)] mb-2">LEVEL COMPLETE</h2>
          <p className="text-sm text-[var(--text-muted)] tracking-widest uppercase mb-8">Destination Reached</p>

          <div className="space-y-3 mb-6 text-sm">
            {/* Blocks Row */}
            <div className="flex justify-between items-center border-b border-[var(--border-gold)]/20 pb-2">
              <span className="text-[var(--text-muted)]">Blocks Used</span>
              <div className="text-right">
                <span className="font-mono font-bold text-[var(--text-primary)]">{totalCommands}</span>
                <span className="text-xs text-[var(--text-muted)] ml-1.5">(Par: {parBlocks || 14})</span>
                <span className="text-xs text-green-400 font-mono ml-2 font-bold">+{blockScore || 0} pts</span>
              </div>
            </div>

            {/* Time Used Row */}
            <div className="flex justify-between items-center border-b border-[var(--border-gold)]/20 pb-2">
              <span className="text-[var(--text-muted)]">Time Used</span>
              <div className="text-right">
                <span className="font-mono font-bold text-[var(--text-primary)]">{formatTime(timeUsedSeconds || 0)}</span>
                <span className="text-xs text-[var(--text-muted)] ml-1.5">(Par: {formatTime(parTimeSeconds || 180)})</span>
                <span className="text-xs text-green-400 font-mono ml-2 font-bold">+{timeScore || 0} pts</span>
              </div>
            </div>

            {/* Efficiency Row */}
            <div className="flex justify-between items-center border-b border-[var(--border-gold)]/20 pb-2">
              <span className="text-[var(--text-muted)]">Efficiency Rating</span>
              <span className={`font-mono font-bold ${
                efficiency === 'Excellent' ? 'text-green-400' : efficiency === 'Good' ? 'text-yellow-400' : 'text-orange-400'
              }`}>{efficiency}</span>
            </div>

            {/* Total Level Score Row (Max 500) */}
            <div className="flex justify-between items-center pt-3 bg-black/40 px-3 py-2 border border-[var(--border-gold)]/40 rounded-sm">
              <span className="text-[var(--accent-gold)] font-bold text-xs tracking-wider uppercase">Level Score (Max 500)</span>
              <div className="text-right">
                <span className="font-cinzel text-2xl font-bold text-[var(--accent-gold)]">{score}</span>
                <span className="text-xs text-[var(--text-muted)] font-mono ml-1">/ 500</span>
              </div>
            </div>
          </div>

          {nextLevel ? (
            <button 
              onClick={() => onNextLevel(nextLevel)}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-dark)] font-bold tracking-widest hover:brightness-110 transition-all uppercase">
              Next Level
            </button>
          ) : (
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-[var(--accent-gold)] text-[var(--bg-dark)] font-bold tracking-widest hover:brightness-110 transition-all uppercase">
              🏆 Victory — Return to Base
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
