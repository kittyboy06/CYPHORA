import { create } from 'zustand';

interface GameState {
  score: number;
  blockScore: number;
  timeScore: number;
  timeUsedSeconds: number;
  parBlocks: number;
  parTimeSeconds: number;
  efficiency: string;
  health: number;
  level: number;
  timeLimit: number;
  timeRemaining: number;
  status: 'idle' | 'running' | 'success' | 'failed';
  totalCommands: number;
  executedCommands: number;
  
  setScore: (score: number) => void;
  setScoreBreakdown: (data: {
    score: number;
    blockScore: number;
    timeScore: number;
    timeUsedSeconds: number;
    parBlocks: number;
    parTimeSeconds: number;
    efficiency: string;
  }) => void;
  setEfficiency: (efficiency: string) => void;
  setHealth: (health: number) => void;
  setStatus: (status: 'idle' | 'running' | 'success' | 'failed') => void;
  resetCommands: (total: number) => void;
  incExecutedCommands: () => void;
  tickTime: () => void;
  setLevel: (level: number) => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  blockScore: 0,
  timeScore: 0,
  timeUsedSeconds: 0,
  parBlocks: 14,
  parTimeSeconds: 180,
  efficiency: 'Excellent',
  health: 3,
  level: 1,
  timeLimit: 1800,
  timeRemaining: 1800,
  status: 'idle',
  totalCommands: 0,
  executedCommands: 0,

  setScore: (score) => set({ score }),
  setScoreBreakdown: (data) => set({ ...data }),
  setEfficiency: (efficiency) => set({ efficiency }),
  setHealth: (health) => set({ health }),
  setStatus: (status) => set({ status }),
  resetCommands: (total) => set({ totalCommands: total, executedCommands: 0 }),
  incExecutedCommands: () => set((state) => ({ executedCommands: state.executedCommands + 1 })),
  tickTime: () => set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),
  setLevel: (level) => set({ level, status: 'idle' }),
}));

if (typeof window !== 'undefined') {
  (window as any).useGameStore = useGameStore;
}

