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
      
      // Per-level par block counts (optimal solution size: L1=14, L2=17, L3=27)
      const PAR_BLOCKS: Record<number, number> = {
        1: 14,
        2: 17,
        3: 27,
      };

      // Per-level par times in seconds (L1=3m, L2=5m, L3=7m)
      const PAR_TIME_SECONDS: Record<number, number> = {
        1: 180,
        2: 300,
        3: 420,
      };
      
      const level = state.level;
      const parBlocks = PAR_BLOCKS[level] || 15;
      const parTime = PAR_TIME_SECONDS[level] || 300;

      // Calculate time used to solve this level
      const teamId = (typeof localStorage !== 'undefined' ? (localStorage.getItem('cyphora_team_id') || sessionStorage.getItem('cyphora_team_id')) : '') || 'default';
      const startKey = `cyphora_r3_level_${level}_start_time_${teamId}`;
      let startMs = parseInt(localStorage.getItem(startKey) || '0', 10);
      if (!startMs || isNaN(startMs)) {
        startMs = parseInt(localStorage.getItem(`cyphora_r3_level_${level}_start_time`) || '0', 10);
      }
      if (!startMs || isNaN(startMs)) {
        startMs = Date.now() - 10000;
        localStorage.setItem(startKey, String(startMs));
      }
      const timeUsedSeconds = Math.max(1, Math.round((Date.now() - startMs) / 1000));

      // 1. Block Efficiency Score (Max 250 pts)
      const excessBlocks = Math.max(0, blockCount - parBlocks);
      const blockScore = Math.max(50, 250 - (excessBlocks * 15));

      // 2. Time Used / Speed Score (Max 250 pts)
      const excessTime = Math.max(0, timeUsedSeconds - parTime);
      const timeScore = Math.max(50, Math.round(250 - (excessTime * 0.3)));

      // 3. Total Level Score (Maximum 500 Scores)
      const calculatedScore = Math.min(500, Math.max(100, blockScore + timeScore));
      
      // Efficiency rating
      let efficiencyLabel = 'Acceptable';
      if (calculatedScore >= 450) {
        efficiencyLabel = 'Excellent';
      } else if (calculatedScore >= 350) {
        efficiencyLabel = 'Good';
      }
      
      state.setScoreBreakdown({
        score: calculatedScore,
        blockScore,
        timeScore,
        timeUsedSeconds,
        parBlocks,
        parTimeSeconds: parTime,
        efficiency: efficiencyLabel
      });

      // Automatically report level score to CYPHORA backend and sync scores
      try {
        const token = localStorage.getItem('cyphora_token') ||
                      sessionStorage.getItem('cyphora_token') ||
                      localStorage.getItem('cyphora_auth_token') ||
                      sessionStorage.getItem('cyphora_auth_token') || '';
        const teamName = localStorage.getItem('cyphora_team_name') ||
                         sessionStorage.getItem('cyphora_team_name') || '';

        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;
        if (teamId && teamId !== 'default') headers['X-Team-Id'] = teamId;
        if (teamName) headers['X-Team-Name'] = teamName;

        const queryParams = new URLSearchParams();
        if (teamName) queryParams.set('team', teamName);
        if (teamId && teamId !== 'default') queryParams.set('team_id', teamId);
        const submitUrl = `/api/teams/stage3/submit${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

        const res = await fetch(submitUrl, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            level,
            blocks_used: blockCount,
            time_used_seconds: timeUsedSeconds,
            block_score: blockScore,
            time_score: timeScore,
            efficiency: efficiencyLabel,
            score: calculatedScore,
            team_name: teamName
          })
        });

        let newTotalScore: number | null = null;
        let round3TotalScore: number | null = null;

        if (res.ok) {
          const resData = await res.json();
          newTotalScore = resData.new_score ?? resData.new_total_score ?? null;
          round3TotalScore = resData.round3_score ?? null;
        }

        // If backend returned scores, update storage; otherwise calculate locally
        if (newTotalScore !== null) {
          localStorage.setItem('cyphora_team_score', String(newTotalScore));
          sessionStorage.setItem('cyphora_team_score', String(newTotalScore));
        } else {
          const curTotal = parseInt(localStorage.getItem('cyphora_team_score') || '0', 10);
          const updatedTotal = curTotal + calculatedScore;
          localStorage.setItem('cyphora_team_score', String(updatedTotal));
          sessionStorage.setItem('cyphora_team_score', String(updatedTotal));
          newTotalScore = updatedTotal;
        }

        if (round3TotalScore !== null) {
          localStorage.setItem('cyphora_round3_score', String(round3TotalScore));
          sessionStorage.setItem('cyphora_round3_score', String(round3TotalScore));
        } else {
          const curR3 = parseInt(localStorage.getItem('cyphora_round3_score') || '0', 10);
          const updatedR3 = curR3 + calculatedScore;
          localStorage.setItem('cyphora_round3_score', String(updatedR3));
          sessionStorage.setItem('cyphora_round3_score', String(updatedR3));
          round3TotalScore = updatedR3;
        }

        // Post message to parent OS window if embedded in OS iframe
        if (typeof window !== 'undefined' && window.parent && window.parent !== window) {
          window.parent.postMessage({
            type: 'CYPHORA_ROUND3_LEVEL_COMPLETE',
            level,
            blocks_used: blockCount,
            time_used_seconds: timeUsedSeconds,
            block_score: blockScore,
            time_score: timeScore,
            efficiency: efficiencyLabel,
            score: calculatedScore,
            new_score: newTotalScore,
            new_total_score: newTotalScore,
            round3_score: round3TotalScore
          }, '*');
        }
      } catch (err) {
        console.warn('[Round 3] Failed to submit score to backend:', err);
      }

      return;
    } else {
      throw e;
    }
  }
};
