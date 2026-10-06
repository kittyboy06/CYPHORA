import { create } from 'zustand';

interface GameState {
  score: number;
  efficiency: string;
  health: number;
  level: number;
  timeLimit: number;
  timeRemaining: number;
  status: 'idle' | 'running' | 'success' | 'failed';
  totalCommands: number;
  executedCommands: number;
  
  setScore: (score: number) => void;
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
  efficiency: 'Excellent',
  health: 3,
  level: 1,
  timeLimit: 1800,
  timeRemaining: 1800,
  status: 'idle',
  totalCommands: 0,
  executedCommands: 0,

  setScore: (score) => set({ score }),
  setEfficiency: (efficiency) => set({ efficiency }),
  setHealth: (health) => set({ health }),
  setStatus: (status) => set({ status }),
  resetCommands: (total) => set({ totalCommands: total, executedCommands: 0 }),
  incExecutedCommands: () => set((state) => ({ executedCommands: state.executedCommands + 1 })),
  tickTime: () => set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),
  setLevel: (level) => set({ level, status: 'idle' }),
}));

