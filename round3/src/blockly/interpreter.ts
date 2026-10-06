import { useGameStore } from '../state/gameStore';

export const executeCode = async (code: string, gameRef: any, blocklyRef: any, blockCount: number) => {
  useGameStore.getState().resetCommands(blockCount); // Set total blocks used
  
  // Wrap code in an async IIFE to allow await
  const wrappedCode = `
    return (async function(game) {
      ${code}
    })(gameContext);
  `;

  let isFailed = false;

  const gameContext = {
    runStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'RUN' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Collision with Trap');
    },
    jumpStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'JUMP' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Fell into gap');
    },
    attack: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'ATTACK' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Attack failed');
    },
    defend: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'DEFEND' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Defend failed');
    },
    equip: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'EQUIP' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Equip failed');
    },
    isBeastVulnerable: async () => {
      return await gameRef.isBeastVulnerable();
    },
    activateTotemStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'ACTIVATE_TOTEM' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Activate Totem failed');
    },
  };

  try {
    const fn = new Function('gameContext', wrappedCode);
    await fn(gameContext);
    
    // If it reaches here without throwing LEVEL_COMPLETE, it means code ended before goal
    throw new Error('Code finished before reaching destination.');
  } catch (e: any) {
    blocklyRef.highlightBlock(null);
    if (e.message === 'LEVEL_COMPLETE') {
      const state = useGameStore.getState();
      state.setStatus('success');
      
      // Per-level par block counts (optimal solution size)
      const PAR_BLOCKS: Record<number, number> = {
        1: 8,   // variables + while-loop + nested repeat + run + jump
        2: 17,  // item pickups, long approach, and five-hit beast fight
        3: 12,  // repeat(3) with for-loop, if/elseif/else, mod checks, totem
      };
      
      const level = state.level;
      const par = PAR_BLOCKS[level] || 10;
      
      // Score: Full 1000 if at/under par, -50 per excess block, min 200
      const excessBlocks = Math.max(0, blockCount - par);
      const calculatedScore = Math.max(200, 1000 - (excessBlocks * 50));
      
      // Efficiency label
      let efficiencyLabel = 'Acceptable';
      if (blockCount <= par) {
        efficiencyLabel = 'Excellent';
      } else if (blockCount <= par + 4) {
        efficiencyLabel = 'Good';
      }
      
      state.setEfficiency(efficiencyLabel);
      state.setScore(calculatedScore);
      return;
    } else {
      throw e;
    }
  }
};
