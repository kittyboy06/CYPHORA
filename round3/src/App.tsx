import React, { useState, useRef, useEffect } from 'react';
import PhaserGame from './game/PhaserGame';
import BlocklyEditor from './components/BlocklyEditor';
import { GameOverlay } from './components/GameOverlay';
import { StoryIntro } from './components/StoryIntro';
import { TutorialScreen } from './components/TutorialScreen';
import { LandingScreen } from './components/LandingScreen';
import { AntiCheatScreen } from './components/AntiCheatScreen';
import { useGameStore } from './state/gameStore';
import { executeCode } from './blockly/interpreter';
import { Play, RotateCcw, Wand2, Clock } from 'lucide-react';
import { SOLUTIONS } from './blockly/solutions';
import * as Blockly from 'blockly';
import { PromptDialog, AlertDialog } from './components/PromptDialog';

function App() {
  const [hasEntered, setHasEntered] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showStory, setShowStory] = useState(() => {
    if (typeof localStorage === 'undefined') return true;
    const teamId = localStorage.getItem('cyphora_team_id') || 'default';
    return localStorage.getItem(`cyphora_round3_story_finished_${teamId}`) !== 'true' && localStorage.getItem('cyphora_round3_story_finished') !== 'true';
  });
  const [showTutorial, setShowTutorial] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(false);
  const [round3DurationMinutes, setRound3DurationMinutes] = useState(30);
  const [adminCode, setAdminCode] = useState('');
  const blocklyRef = useRef<any>(null);
  const gameRef = useRef<any>(null);
  const level = useGameStore((state) => state.level);
  const score = useGameStore((state) => state.score);
  const setStatus = useGameStore((state) => state.setStatus);
  const timeRemaining = useGameStore((state) => state.timeRemaining);

  const [promptConfig, setPromptConfig] = useState<{ message: string, defaultValue: string, isPassword?: boolean, callback: (result: string | null) => void } | null>(null);
  const [alertConfig, setAlertConfig] = useState<{ message: string, callback?: () => void } | null>(null);

  useEffect(() => {
    // Override Blockly dialogs to use our React states
    Blockly.dialog.setPrompt(function(message, defaultValue, callback) {
      setPromptConfig({ message, defaultValue, callback });
    });
    Blockly.dialog.setAlert(function(message, callback) {
      setAlertConfig({ message, callback });
    });
  }, []);

  // Fetch admin configured duration for Round 3
  useEffect(() => {
    const fetchTimer = async () => {
      try {
        const res = await fetch('/api/teams/timer?round=3');
        if (res.ok) {
          const data = await res.json();
          const r3 = data.round3 || data;
          const mins = r3.duration_minutes || 30;
          setRound3DurationMinutes(mins);
        }
      } catch (e) {}
    };
    fetchTimer();
  }, []);

  // Round 3 countdown timer — starts ONLY after finishing the beginning story
  useEffect(() => {
    const teamId = (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : '') || 'default';
    const storyFinishedKey = `cyphora_round3_story_finished_${teamId}`;
    const isStoryFinished = typeof localStorage !== 'undefined' &&
      (localStorage.getItem(storyFinishedKey) === 'true' || localStorage.getItem('cyphora_round3_story_finished') === 'true');
    if (!isStoryFinished || showStory) return;

    const teamKey = `cyphora_round3_started_at_${teamId}`;
    let storedStart = localStorage.getItem(teamKey) || localStorage.getItem('cyphora_round3_started_at');
    const isNewStart = !storedStart;
    if (!storedStart) {
      storedStart = String(Date.now());
      try {
        localStorage.setItem(teamKey, storedStart);
        localStorage.setItem('cyphora_round3_started_at', storedStart);
      } catch (_) {}
    }

    if (isNewStart) {
      const token = typeof localStorage !== 'undefined' ? (localStorage.getItem('cyphora_token') || sessionStorage.getItem('cyphora_token')) : null;
      fetch('/api/teams/timer/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ round: 3 })
      }).catch(() => {});
    }

    const startedAtMs = parseInt(storedStart, 10);
    const totalSec = round3DurationMinutes * 60;

    const tick = () => {
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      const rem = Math.max(0, totalSec - elapsed);
      useGameStore.setState({ timeLimit: totalSec, timeRemaining: rem });
    };

    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [showStory, round3DurationMinutes]);

  const [isTabSwitched, setIsTabSwitched] = useState(false);
  const [lockReason, setLockReason] = useState('');
  const hadFullscreenRef = useRef(false);

  useEffect(() => {
    const handleFullscreenChange = () => {
      let isFull = !!document.fullscreenElement;
      try {
        if (!isFull && window.parent && window.parent.document && window.parent.document.fullscreenElement) {
          isFull = true;
        }
      } catch (e) { }
      setIsFullscreen(isFull);
      if (isFull) {
        hadFullscreenRef.current = true;
      } else if (hasEntered && hadFullscreenRef.current) {
        setLockReason('FULLSCREEN_EXIT');
        setIsTabSwitched(true);
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason: 'FULLSCREEN_EXIT' }, '*');
          }
        } catch (e) { }
      }
    };

    const handleVisibilityChange = () => {
      if (!hasEntered) return;
      if (document.hidden || document.visibilityState === 'hidden') {
        setLockReason('TAB_SWITCH');
        setIsTabSwitched(true);
        setIsFullscreen(false);
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason: 'TAB_SWITCH' }, '*');
          }
        } catch (e) { }
      }
    };

    const handleSecurityKeyDown = (e: KeyboardEvent) => {
      if (!hasEntered) return;
      const isCtrlOrMeta = e.ctrlKey || e.metaKey;

      // 1. Reload shortcuts: F5, Ctrl+R, Cmd+R
      if (e.key === 'F5' || e.keyCode === 116 || (isCtrlOrMeta && (e.key === 'r' || e.key === 'R'))) {
        e.preventDefault();
        e.stopPropagation();
        setLockReason('PAGE_RELOAD_ATTEMPT');
        setIsTabSwitched(true);
        setIsFullscreen(false);
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason: 'PAGE_RELOAD_ATTEMPT' }, '*');
          }
        } catch (err) { }
        return;
      }

      // 2. Screenshot shortcuts: PrintScreen, Win+Shift+S, Cmd+Shift+3/4/5
      if (e.key === 'PrintScreen' || (isCtrlOrMeta && e.shiftKey && (e.key === 'S' || e.key === 's'))) {
        e.preventDefault();
        e.stopPropagation();
        setLockReason('SCREENSHOT_ATTEMPT');
        setIsTabSwitched(true);
        setIsFullscreen(false);
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason: 'SCREENSHOT_ATTEMPT' }, '*');
          }
        } catch (err) { }
        return;
      }

      // 3. DevTools shortcuts: F12, Ctrl+Shift+I/J/C/K, Ctrl+U
      if (e.key === 'F12' || (isCtrlOrMeta && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c', 'K', 'k'].includes(e.key)) || (isCtrlOrMeta && (e.key === 'u' || e.key === 'U'))) {
        e.preventDefault();
        e.stopPropagation();
        setLockReason('INSPECTOR_DEVTOOLS');
        setIsTabSwitched(true);
        setIsFullscreen(false);
        try {
          if (window.parent && window.parent !== window) {
            window.parent.postMessage({ type: 'CYPHORA_TRIGGER_LOCK', reason: 'INSPECTOR_DEVTOOLS' }, '*');
          }
        } catch (err) { }
        return;
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleParentMessage = (e: MessageEvent) => {
      if (e.data?.type === 'CYPHORA_GATE_UNLOCKED') {
        setIsFullscreen(true);
        setIsTabSwitched(false);
        setLockReason('');
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('keydown', handleSecurityKeyDown, true);
    window.addEventListener('contextmenu', handleContextMenu, true);
    window.addEventListener('message', handleParentMessage);

    try {
      if (window.parent && window.parent.document && window.parent !== window) {
        window.parent.document.addEventListener('fullscreenchange', handleFullscreenChange);
      }
    } catch (e) { }

    // Initial check
    handleFullscreenChange();

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('keydown', handleSecurityKeyDown, true);
      window.removeEventListener('contextmenu', handleContextMenu, true);
      window.removeEventListener('message', handleParentMessage);
      try {
        if (window.parent && window.parent.document && window.parent !== window) {
          window.parent.document.removeEventListener('fullscreenchange', handleFullscreenChange);
        }
      } catch (e) { }
    };
  }, [hasEntered]);

  const enterFullscreen = async () => {
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      } else if (window.parent && window.parent.document && window.parent.document.documentElement.requestFullscreen) {
        await window.parent.document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request failed or pending gesture:", e);
    }
    setHasEntered(true);
    setIsFullscreen(true);
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: 'CYPHORA_UNLOCK_GATE' }, '*');
      }
    } catch (e) { }
  };

  const handleSolve = () => {
    if (blocklyRef.current && SOLUTIONS[level]) {
      handleReset(); // ensure level is reset before loading solution
      blocklyRef.current.setXml(SOLUTIONS[level]);
    }
  };

  const handleRun = async () => {
    if (!blocklyRef.current || !gameRef.current || isRunning) return;
    
    setIsRunning(true);
    const code = blocklyRef.current.getGeneratedCode();
    
    try {
      setStatus('running');
      await executeCode(code, gameRef.current, blocklyRef.current, blocklyRef.current.getBlockCount());
    } catch (e: any) {
      console.error(e);
      setStatus('failed');
    } finally {
      setIsRunning(false);
    }
  };

  const [levelElapsedSec, setLevelElapsedSec] = useState(0);

  // Initialize and track level solve timer
  useEffect(() => {
    const teamId = (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : '') || 'default';
    const isFinished = typeof localStorage !== 'undefined' && (
      localStorage.getItem(`cyphora_round3_story_finished_${teamId}`) === 'true' ||
      localStorage.getItem('cyphora_round3_story_finished') === 'true'
    );
    if (isFinished && !showStory && !showTutorial) {
      const key = `cyphora_r3_level_${level}_start_time_${teamId}`;
      if (!localStorage.getItem(key)) {
        localStorage.setItem(key, String(Date.now()));
      }
      if (!localStorage.getItem(`cyphora_r3_level_${level}_start_time`)) {
        localStorage.setItem(`cyphora_r3_level_${level}_start_time`, String(Date.now()));
      }
    }
    const updateElapsed = () => {
      const key = `cyphora_r3_level_${level}_start_time_${teamId}`;
      let startMs = parseInt(localStorage.getItem(key) || '0', 10);
      if (!startMs || isNaN(startMs)) {
        startMs = parseInt(localStorage.getItem(`cyphora_r3_level_${level}_start_time`) || '0', 10);
      }
      if (startMs > 0) {
        setLevelElapsedSec(Math.max(0, Math.floor((Date.now() - startMs) / 1000)));
      } else {
        setLevelElapsedSec(0);
      }
    };
    updateElapsed();
    const interval = setInterval(updateElapsed, 1000);
    return () => clearInterval(interval);
  }, [level, showStory, showTutorial]);

  const handleNextLevel = (nextLevel: number) => {
    setStatus('idle');
    useGameStore.getState().setLevel(nextLevel);
    // Initialize timestamp for next level
    const teamId = (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : '') || 'default';
    const nowMs = String(Date.now());
    localStorage.setItem(`cyphora_r3_level_${nextLevel}_start_time_${teamId}`, nowMs);
    localStorage.setItem(`cyphora_r3_level_${nextLevel}_start_time`, nowMs);
    if (gameRef.current) gameRef.current.resetLevel();
  };

  const handleReset = () => {
    if (isRunning) return;
    if (gameRef.current) {
      gameRef.current.resetLevel();
    }
    setStatus('idle');
  };

  const securityOverlay = (isTabSwitched && lockReason) ? (
    <AntiCheatScreen
      reason={lockReason}
      onAdminUnlock={() => {
        setIsTabSwitched(false);
        setLockReason('');
      }}
    />
  ) : null;

  if (!hasEntered) {
    return (
      <>
        <LandingScreen onEnter={enterFullscreen} />
        {securityOverlay}
      </>
    );
  }

  if (showStory) {
    return (
      <>
        <StoryIntro
          isLocked={isTabSwitched && !!lockReason}
          onComplete={() => {
            setShowStory(false);
            setShowTutorial(true);
            const teamId = (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : '') || 'default';
            try {
              localStorage.setItem('cyphora_round3_story_finished', 'true');
              localStorage.setItem(`cyphora_round3_story_finished_${teamId}`, 'true');
              if (!localStorage.getItem(`cyphora_round3_started_at_${teamId}`)) {
                const nowMs = String(Date.now());
                localStorage.setItem(`cyphora_round3_started_at_${teamId}`, nowMs);
                localStorage.setItem('cyphora_round3_started_at', nowMs);
              }
            } catch (_) {}
          }}
        />
        {securityOverlay}
      </>
    );
  }

  if (showTutorial) {
    return (
      <>
        <TutorialScreen onComplete={() => setShowTutorial(false)} />
        {securityOverlay}
      </>
    );
  }

  if (timeRemaining <= 0 && localStorage.getItem('cyphora_round3_story_finished') === 'true' && !isAdminUnlocked) {
    return (
      <>
        <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-4 md:p-8 z-[200] backdrop-blur-md">
          <div className="max-w-3xl w-full text-center space-y-6 md:space-y-8 bg-black/80 p-8 md:p-12 border border-red-500/50 rounded-sm shadow-2xl">
            <Clock size={64} className="text-red-500 mx-auto animate-pulse" />
            <h1 className="text-2xl md:text-4xl font-cinzel text-red-500 tracking-widest">
              ROUND 3 TIME EXPIRED
            </h1>
            <p className="text-base md:text-xl font-cinzel text-[var(--text-primary)] leading-relaxed italic">
              "The temple gates have closed. Your trial in the Blockly Forest has concluded."
            </p>
            <p className="text-xs md:text-sm font-mono text-red-400/80 uppercase tracking-widest mt-2">
              Round 3 time limit reached. Please await jury evaluation and final championship tally.
            </p>
            <div className="pt-6 mt-6 border-t border-red-900/30">
              <form onSubmit={(e) => {
                e.preventDefault();
                const code = adminCode.trim().toUpperCase();
                if (['JCEAIML', 'CYPHORA-ADMIN', '8080', 'ADMIN', '1234'].includes(code)) {
                  setIsAdminUnlocked(true);
                } else {
                  alert('Invalid admin override code.');
                }
              }} className="flex flex-col items-center gap-2">
                <label className="text-[10px] text-red-500/50 uppercase tracking-widest font-mono">Supervisor Proctor Unlock</label>
                <input
                  type="password"
                  value={adminCode}
                  onChange={(e) => setAdminCode(e.target.value)}
                  placeholder="Access Code"
                  className="bg-black/50 border border-red-900/50 text-red-500 text-center text-xs font-mono px-3 py-2 outline-none focus:border-red-500 w-48 transition-colors"
                />
              </form>
            </div>
          </div>
        </div>
        {securityOverlay}
      </>
    );
  }

  return (
    <div className="w-screen h-screen flex flex-col relative bg-[var(--bg-dark)] overflow-hidden">
      <GameOverlay onRetry={handleReset} onNextLevel={handleNextLevel} />

      {/* === TOP HALF: Game Canvas === */}
      <div className="h-[40%] min-h-[200px] relative bg-[#050804] border-b border-[var(--border-gold)]">
        <PhaserGame ref={gameRef} levelIndex={level} />
        
        {/* MASTER TIMER OVERLAY */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center pointer-events-none">
          <span className={`text-3xl font-mono font-bold tracking-widest ${timeRemaining < 300 ? 'text-red-500' : 'text-white'}`} style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.8)' }}>
            {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* TEAM INFO PANEL */}
        <div className="absolute top-3 right-3 z-50 pointer-events-none">
          <div className="bg-[rgba(8,12,6,0.85)] border border-[var(--border-gold)] px-3 py-2 rounded-sm text-right" style={{ minWidth: '140px' }}>
            <p className="text-[10px] text-[var(--accent-gold)] font-mono uppercase tracking-widest mb-1">Team</p>
            <p className="text-sm text-[var(--text-primary)] font-bold font-mono truncate" style={{ maxWidth: '160px' }}>
              {typeof window !== 'undefined' ? (localStorage.getItem('cyphora_team_name') || 'Explorer') : 'Explorer'}
            </p>
            <div className="mt-1.5 pt-1.5 border-t border-[var(--border-gold)]/30">
              <div className="flex justify-between items-center text-[10px] text-[var(--text-muted)] font-mono mb-1">
                <span>Level {level} Time:</span>
                <span className="text-[var(--accent-gold)] font-bold">
                  {Math.floor(levelElapsedSec / 60)}:{(levelElapsedSec % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)] font-mono uppercase tracking-wider">Level {level} Score</p>
              <p className="text-lg text-[var(--accent-gold)] font-cinzel font-bold">
                {score ? `${score} / 500` : '\u2014'}
              </p>
              {typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_team_score') && (
                <div className="mt-1 pt-1 border-t border-[var(--border-gold)]/20 flex justify-between items-center text-[9px] font-mono">
                  <span className="text-[var(--text-muted)]">Expedition:</span>
                  <span className="text-green-400 font-bold">{localStorage.getItem('cyphora_team_score')} pts</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === TASK STRIP === */}
      <div className="px-6 py-3 bg-[rgba(14,18,12,0.95)] border-b border-[var(--border-gold)] flex items-center justify-between">
        <div>
          {level === 1 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Broken Bridge
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                The bridge gaps are expanding! First you must jump, then run 1 tile and jump, then run 2 tiles and jump, then 3 tiles, and so on... (a triangular number progression). <strong className="text-red-400">⚠️ Low-hanging branches block jumping on solid ground — you can only jump over gaps!</strong> Use variables and nested loops with <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">run()</code> and <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">jump()</code> to reach the other side!
              </p>
            </>
          )}
          {level === 2 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Beast's Lair
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                Run right to collect the Sword at the 3rd tile and the Shield at the 5th tile with <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">equip()</code>. Keep moving right until the guardian is revealed, then stop exactly 3 blocks before it.
                Then check its shield: if <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">is_beast_vulnerable()</code>, use <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">attack()</code>. 
                Otherwise, <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">defend()</code>. Repeat the check until the guardian is defeated.
              </p>
            </>
          )}
          {level === 3 && (
            <>
              <h3 className="text-[11px] text-[var(--accent-gold)] tracking-[3px] uppercase mb-1 font-bold font-mono">
                Current Task: The Path of Trials (FizzBuzz)
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                Traverse 3 zones. Each zone has a 17-tile path that takes 14 action steps, followed by a Totem. In the path, tiles are 1-indexed. If index is divisible by 3, it's FIRE (jump). If divisible by 5, GOBLIN (attack). If both, well there's no 15! Rest are GROUND (run). After 14 action steps, use{' '}
                <code className="text-green-400 bg-black/40 px-1.5 py-0.5 rounded font-mono text-xs">activate_totem()</code>.
              </p>
            </>
          )}
          <div className="inline-flex items-center gap-2 mt-2 px-2.5 py-1 rounded bg-black/50 border border-[var(--border-gold)]/30 text-[11px] font-mono">
            <span className="text-[var(--text-muted)] uppercase tracking-wider text-[10px]">Optimal Target:</span>
            <span className="text-green-400 font-bold">{level === 1 ? '14' : level === 2 ? '17' : '27'} Blocks</span>
            <span className="text-zinc-600">•</span>
            <span className="text-yellow-400 font-bold">{level === 1 ? '3m' : level === 2 ? '5m' : '7m'} Par Time</span>
            <span className="text-zinc-600">•</span>
            <span className="text-[var(--accent-gold)] font-bold">Max 500 Scores</span>
          </div>
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
              <option value={3}>Level 3: The Path of Trials</option>
            </select>
          ) : (
            <button 
              onClick={() => {
                setPromptConfig({
                  message: 'Enter Admin Password to unlock level skip:',
                  defaultValue: '',
                  isPassword: true,
                  callback: (pass) => {
                    setPromptConfig(null);
                    if (pass === '1234') {
                      setIsAdminUnlocked(true);
                    } else if (pass) {
                      setAlertConfig({
                        message: 'Incorrect password',
                        callback: () => setAlertConfig(null)
                      });
                    }
                  }
                });
              }}
              className="px-3 py-2 bg-black/30 border border-gray-800 text-gray-500 hover:text-gray-300 text-xs font-mono uppercase tracking-widest rounded-sm cursor-pointer transition-all"
            >
              🔒 Admin
            </button>
          )}

          <div className="flex gap-2">
            {isAdminUnlocked && (
              <button
                onClick={handleSolve}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2.5 font-bold text-sm tracking-wider uppercase transition-all rounded-sm bg-purple-600/20 text-purple-400 border border-purple-500/50 hover:bg-purple-600/40"
                title="Load Solution"
              >
                <Wand2 size={15} /> Solve
              </button>
            )}
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

      {/* === BOTTOM HALF: Blockly Workspace (toolbox on left, workspace spanning full width) === */}
      <div className="flex-1 relative">
        <BlocklyEditor ref={blocklyRef} level={level} />
      </div>
      {promptConfig && (
        <PromptDialog 
          message={promptConfig.message}
          defaultValue={promptConfig.defaultValue}
          isPassword={promptConfig.isPassword}
          onSubmit={(result) => {
            promptConfig.callback(result);
            setPromptConfig(null);
          }}
        />
      )}
      {alertConfig && (
        <AlertDialog
          message={alertConfig.message}
          onConfirm={() => {
            if (alertConfig.callback) alertConfig.callback();
            setAlertConfig(null);
          }}
        />
      )}
      {securityOverlay}
    </div>
  );
}

export default App;









