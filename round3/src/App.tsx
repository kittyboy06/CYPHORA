import React, { useState, useRef, useEffect } from 'react';
import PhaserGame from './game/PhaserGame';
import BlocklyEditor from './components/BlocklyEditor';
import { GameOverlay } from './components/GameOverlay';
import { StoryIntro } from './components/StoryIntro';
import { LandingScreen } from './components/LandingScreen';
import { AntiCheatScreen } from './components/AntiCheatScreen';
import { useGameStore } from './state/gameStore';
import { executeCode } from './blockly/interpreter';
import { Play, RotateCcw } from 'lucide-react';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);
  const [showStory, setShowStory] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const blocklyRef = useRef<any>(null);
  const gameRef = useRef<any>(null);
  const level = useGameStore((state) => state.level);
  const setStatus = useGameStore((state) => state.setStatus);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
      setHasEntered(true);
    } catch (e) {
      console.error("Fullscreen request failed", e);
      setHasEntered(true); // Allow them in anyway if API fails, they'll just get the warning if it actually didn't work
    }
  };

  const handleRun = async () => {
    if (!blocklyRef.current || !gameRef.current || isRunning) return;
    
    setIsRunning(true);
    const code = blocklyRef.current.getGeneratedCode();
    
    try {
      setStatus('running');
      await executeCode(code, gameRef.current, blocklyRef.current);
    } catch (e: any) {
      console.error(e);
      setStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    if (isRunning) return;
    if (gameRef.current) {
      gameRef.current.resetLevel();
    }
    setStatus('idle');
  };

  if (!hasEntered) {
    return <LandingScreen onEnter={enterFullscreen} />;
  }

  // Anti-Cheat is disabled:
  // if (!isFullscreen && !adminOverride) {
  //   return <AntiCheatScreen onReenter={enterFullscreen} onAdminUnlock={() => setAdminOverride(true)} />;
  // }

  if (showStory) {
    return <StoryIntro onComplete={() => setShowStory(false)} />;
  }

  return (
    <div className="w-screen h-screen flex flex-col relative bg-[var(--bg-dark)] overflow-hidden">
      <GameOverlay onRetry={handleReset} />

      {/* ═══ TOP HALF: Game Canvas ═══ */}
      <div className="h-[40%] min-h-[200px] relative bg-[#050804] border-b border-[var(--border-gold)]">
        <PhaserGame ref={gameRef} levelIndex={level} />
      </div>

      {/* ═══ TASK STRIP ═══ */}
      <div className="px-6 py-3 bg-[rgba(14,18,12,0.95)] border-b border-[var(--border-gold)] flex items-center justify-between">
        <div>
          {level === 1 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Broken Bridge
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                The bridge gaps are expanding! First you must run 1 tile and jump, then run 2 tiles and jump, then 3 tiles, and so on... (a triangular number progression). Use variables and nested loops with <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">run()</code> and <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">jump()</code> to reach the other side!
              </p>
            </>
          )}
          {level === 2 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Beast's Lair
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                The Guardian blocks the path! 
                Run forward, <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">jump()</code> over the fire at the 5th block, and <strong>stop exactly 2 blocks before the beast</strong> (at block 8).
                Then check its shield: if <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">is_beast_vulnerable()</code>, use <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">attack()</code>. 
                Otherwise, <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">defend()</code>.
              </p>
            </>
          )}
          {level === 3 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Ancient Colour Cipher
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                Decode the Guardian's clue: "Where blood burns, dodge. Where the sky flows, slide. Where the sun rests, awaken."
                Use <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">tile_color()</code> to check the floor, then choose the correct action!
              </p>
            </>
          )}
          {level === 4 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Path of Trials (FizzBuzz)
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                Traverse 3 zones. Each zone has a 14-tile track followed by a Totem. In the track, tiles are 1-indexed. If index is divisible by 3, it's FIRE (jump). If divisible by 5, GOBLIN (attack). If both, well there's no 15! Rest are GROUND (run). After 14 tiles, use{' '}
                <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">activate_totem()</code>.
              </p>
            </>
          )}
        </div>
        {/* Level Selector & Run / Reset buttons */}
        <div className="flex gap-4 ml-6 shrink-0 items-center">
          
          {/* Admin Lock / Level Selector */}
          {isAdminUnlocked ? (
            <select 
              value={level}
              onChange={(e) => {
                const newLevel = parseInt(e.target.value);
                useGameStore.getState().setLevel(newLevel);
                if (gameRef.current) gameRef.current.resetLevel();
              }}
              disabled={isRunning}
              className="bg-black/50 border border-[var(--border-gold)] text-[var(--accent-gold)] text-xs font-mono uppercase tracking-widest px-3 py-2 rounded-sm outline-none cursor-pointer"
            >
              <option value={1}>Level 1: Bridge</option>
              <option value={2}>Level 2: Beast</option>
              <option value={3}>Level 3: Colour Cipher</option>
              <option value={4}>Level 4: The Final Trial</option>
            </select>
          ) : (
            <button 
              onClick={() => {
                const pass = prompt('Enter Admin Password to unlock level skip:');
                if (pass === 'cyphora-admin') {
                  setIsAdminUnlocked(true);
                } else if (pass) {
                  alert('Incorrect password');
                }
              }}
              className="px-3 py-2 bg-black/30 border border-gray-800 text-gray-500 hover:text-gray-300 text-xs font-mono uppercase tracking-widest rounded-sm cursor-pointer transition-all"
            >
              🔒 Admin
            </button>
          )}

          <div className="flex gap-2">
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
      </div>

      {/* ═══ BOTTOM HALF: Blockly Workspace (toolbox on left, workspace spanning full width) ═══ */}
      <div className="flex-1 relative">
        <BlocklyEditor ref={blocklyRef} />
      </div>
    </div>
  );
}

export default App;
