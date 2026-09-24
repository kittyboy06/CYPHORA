import React, { useState, useRef } from 'react';
import PhaserGame from './game/PhaserGame';
import BlocklyEditor from './components/BlocklyEditor';
import { GameOverlay } from './components/GameOverlay';
import { StoryIntro } from './components/StoryIntro';
import { useGameStore } from './state/gameStore';
import { executeCode } from './blockly/interpreter';
import { Play, RotateCcw } from 'lucide-react';

function App() {
  const [showStory, setShowStory] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const blocklyRef = useRef<any>(null);
  const gameRef = useRef<any>(null);
  
  const handleRun = async () => {
    if (!blocklyRef.current || !gameRef.current || isRunning) return;
    
    setIsRunning(true);
    const code = blocklyRef.current.getGeneratedCode();
    
    try {
      useGameStore.getState().setStatus('running');
      await executeCode(code, gameRef.current, blocklyRef.current);
    } catch (e: any) {
      console.error(e);
      useGameStore.getState().setStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (isRunning) return;
    if (gameRef.current) {
      gameRef.current.resetLevel();
    }
    useGameStore.getState().setStatus('idle');
  };

  if (showStory) {
    return <StoryIntro onComplete={() => setShowStory(false)} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col relative bg-[var(--bg-dark)] overflow-hidden">
      <GameOverlay />

      {/* ═══ TOP HALF: Game Canvas ═══ */}
      <div className="h-[40%] min-h-[200px] relative bg-[#050804] border-b border-[var(--border-gold)]">
        <PhaserGame ref={gameRef} />
      </div>

      {/* ═══ TASK STRIP ═══ */}
      <div className="px-6 py-3 bg-[rgba(14,18,12,0.95)] border-b border-[var(--border-gold)] flex items-center justify-between">
        <div>
          <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
            Current Task: The Broken Bridge
          </h3>
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">
            The bridge has alternating stable and broken tiles. Write a loop to{' '}
            <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">jump()</code>{' '}
            on even steps and{' '}
            <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">run()</code>{' '}
            on odd steps to reach the other side.
          </p>
        </div>
        {/* Run / Reset buttons */}
        <div className="flex gap-2 ml-6 shrink-0">
          <button
            onClick={handleRun}
            disabled={isRunning}
            className={`flex items-center gap-2 px-6 py-2.5 font-bold text-sm tracking-wider uppercase transition-all rounded-sm
              ${isRunning 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700' 
                : 'bg-[var(--accent-gold)] text-[#0b0f08] hover:brightness-110'}`}
          >
            <Play size={15} /> Run
          </button>
          <button
            onClick={handleReset}
            disabled={isRunning}
            className={`px-3 flex items-center rounded-sm border transition-all
              ${isRunning
                ? 'border-gray-700 text-gray-500 cursor-not-allowed'
                : 'border-[var(--border-gold)] text-[var(--accent-gold)] hover:bg-[rgba(223,177,37,0.1)]'}`}
          >
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* ═══ BOTTOM HALF: Blockly Workspace (toolbox on left, workspace spanning full width) ═══ */}
      <div className="flex-1 relative">
        <BlocklyEditor ref={blocklyRef} />
      </div>
    </div>
  );
}

export default App;
