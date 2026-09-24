import { create } from 'zustand';

interface GameState {
  score: number;
  health: number;
  level: number;
  timeLimit: number;
  timeRemaining: number;
  status: 'idle' | 'running' | 'success' | 'failed';
  totalCommands: number;
  executedCommands: number;
  
  setScore: (score: number) => void;
  setHealth: (health: number) => void;
  setStatus: (status: 'idle' | 'running' | 'success' | 'failed') => void;
  resetCommands: (total: number) => void;
  incExecutedCommands: () => void;
  tickTime: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  health: 3,
  level: 1,
  timeLimit: 180,
  timeRemaining: 180,
  status: 'idle',
  totalCommands: 0,
  executedCommands: 0,

  setScore: (score) => set({ score }),
  setHealth: (health) => set({ health }),
  setStatus: (status) => set({ status }),
  resetCommands: (total) => set({ totalCommands: total, executedCommands: 0 }),
  incExecutedCommands: () => set((state) => ({ executedCommands: state.executedCommands + 1 })),
  tickTime: () => set((state) => ({ timeRemaining: Math.max(0, state.timeRemaining - 1) })),
}));
