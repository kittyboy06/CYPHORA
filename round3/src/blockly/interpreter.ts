import { useGameStore } from '../state/gameStore';

export const executeCode = async (code: string, gameRef: any, blocklyRef: any) => {
  useGameStore.getState().resetCommands(0); // We don't know total commands in advance for JS
  
  // Wrap code in an async IIFE to allow await
  // We provide `game` object that interacts with the phaser scene
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
      useGameStore.getState().setStatus('success');
      useGameStore.getState().setScore(100);
      return;
    } else {
      throw e;
    }
  }
};
