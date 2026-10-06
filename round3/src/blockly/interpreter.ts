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
    dodgeStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'DODGE' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Dodge failed');
    },
    slideStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'SLIDE' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Slide failed');
    },
    activateTileStep: async (id: string) => {
      if (isFailed) return;
      blocklyRef.highlightBlock(id);
      useGameStore.getState().incExecutedCommands();
      const result = await gameRef.executeCommand({ type: 'ACTIVATE_TILE' });
      if (result === 'FAILED') isFailed = true;
      if (result === 'LEVEL_COMPLETE') throw new Error('LEVEL_COMPLETE');
      if (isFailed) throw new Error('Activate Tile failed');
    },
    getTileColor: async () => {
      return await gameRef.getTileColor();
    }
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
      
      // Calculate Score and Efficiency based on blockCount
      let efficiencyLabel = 'Acceptable';
      // Assume a generic par score for simplicity, or we can base it roughly on blocks
      // A typical good solution uses around 5-15 blocks depending on level
      if (blockCount <= 8) {
        efficiencyLabel = 'Excellent';
      } else if (blockCount <= 15) {
        efficiencyLabel = 'Good';
      }
      
      const maxScore = 1000;
      // Deduct 25 points for every block used
      const calculatedScore = Math.max(100, maxScore - (blockCount * 25));
      
      state.setEfficiency(efficiencyLabel);
      state.setScore(calculatedScore);
      return;
    } else {
      throw e;
    }
  }
};
