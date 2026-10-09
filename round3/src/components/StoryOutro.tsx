import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Props {
  onComplete: () => void;
  isLocked?: boolean;
}

export interface OutroScene {
  id: number;
  stage: string;
  title: string;
  caption: string;
  image: string;
  fallbackImage: string;
}

export const OUTRO_SCENES: OutroScene[] = [
  {
    id: 1,
    stage: 'FINAL STAGE',
    title: '1. THE FINAL APPROACH',
    caption: 'THE FIELD SYSTEM IS RESTORED. THE ROUTE TO THE LIGHT IS CLEAR.',
    image: '/assets/outro/scene1.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(1).png'
  },
  {
    id: 2,
    stage: 'FINAL STAGE',
    title: '2. THE REVELATION',
    caption: "THIS ISN'T JUST A STRUCTURE. IT'S A MESSAGE. A GATE. SOMETHING MORE...",
    image: '/assets/outro/scene2.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(2).png'
  },
  {
    id: 3,
    stage: 'FINAL STAGE',
    title: '3. THE TRUTH',
    caption: 'THE SYMBOL WAS A KEY. I WAS A PART OF THIS.',
    image: '/assets/outro/scene3.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(3).png'
  },
  {
    id: 4,
    stage: 'FINAL STAGE',
    title: '4. THE ANSWERS',
    caption: 'THE MEMORIES RETURN. THE EXPEDITION... THE SIGNAL... WHAT HAPPENED HERE.',
    image: '/assets/outro/scene4.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(4).png'
  },
  {
    id: 5,
    stage: 'FINAL STAGE',
    title: '5. THE CHOICE',
    caption: 'I CAN STEP FORWARD. INTO THE LIGHT. AND THE UNKNOWN.',
    image: '/assets/outro/scene5.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(5).png'
  },
  {
    id: 6,
    stage: 'FINAL STAGE',
    title: '6. CYPHORA',
    caption: 'SOME QUESTIONS HAVE ANSWERS. BUT GREATER MYSTERIES STILL REMAIN. THIS IS NOT THE END.',
    image: '/assets/outro/scene6.png',
    fallbackImage: '/assets/outro/Round Three Finale_ Into the Light(6).png'
  }
];

export const StoryOutro: React.FC<Props> = ({ onComplete, isLocked = false }) => {
  const [step, setStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => new Set([0]));
  const [canAdvance, setCanAdvance] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [imgError, setImgError] = useState(false);

  const currentScene = useMemo(() => OUTRO_SCENES[step], [step]);

  // Audio cue on scene transition - deeper, resonant finale tone
  const playTransitionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.22);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.28);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.28);
      }
    } catch (_) {}
  }, []);

  // Preload all 6 outro images for instant transitions
  useEffect(() => {
    OUTRO_SCENES.forEach(scene => {
      const primary = new Image();
      primary.src = scene.image;
      const fallback = new Image();
      fallback.src = scene.fallbackImage;
    });
  }, []);

  // Countdown timer per scene
  useEffect(() => {
    setImgError(false);
    if (visitedSteps.has(step) && step !== 0) {
      setCanAdvance(true);
      setCountdown(0);
      return;
    }

    setCanAdvance(false);
    setCountdown(3);

    const timer = setTimeout(() => {
      setCanAdvance(true);
    }, 3000);

    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [step, visitedSteps]);

  const advanceStory = useCallback(() => {
    if (isLocked) return;
    playTransitionSound();
    if (step < OUTRO_SCENES.length - 1) {
      const nextStep = step + 1;
      setVisitedSteps(prev => new Set(prev).add(nextStep));
      setStep(nextStep);
    } else {
      onComplete();
    }
  }, [isLocked, playTransitionSound, step, onComplete]);

  const prevStory = useCallback(() => {
    if (isLocked || step <= 0) return;
    playTransitionSound();
    setStep(s => s - 1);
  }, [isLocked, playTransitionSound, step]);

  const jumpToStep = useCallback((targetStep: number) => {
    if (isLocked || targetStep === step) return;
    if (visitedSteps.has(targetStep)) {
      playTransitionSound();
      setStep(targetStep);
    }
  }, [isLocked, step, visitedSteps, playTransitionSound]);

  // Keyboard navigation: Enter, Space, Right Arrow -> Next; Left Arrow -> Prev
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLocked) return;
      if ((e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight') && canAdvance) {
        e.preventDefault();
        e.stopPropagation();
        advanceStory();
      } else if (e.key === 'ArrowLeft' && step > 0) {
        e.preventDefault();
        e.stopPropagation();
        prevStory();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, canAdvance, advanceStory, prevStory, isLocked]);

  return (
    <div className="absolute inset-0 bg-[#060905] flex flex-col items-center justify-between p-3 md:p-6 z-50 select-none overflow-hidden">
      {/* Ambient background atmosphere glow - warm gold / dawn theme */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-50 bg-[radial-gradient(circle_at_50%_40%,rgba(245,158,11,0.18),transparent_70%)]" 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(245,158,11,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(245,158,11,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" 
      />

      {/* TOP HEADER: Breadcrumbs & Scene Tracker */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-[var(--border-gold)]/40 pb-2.5 pt-1">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-pulse shadow-[0_0_12px_var(--accent-gold)]" />
          <div>
            <p className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent-gold)]/90">
              Expedition Epilogue // The Finale
            </p>
            <h1 className="text-lg md:text-2xl font-cinzel text-[var(--accent-gold)] tracking-widest font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              INTO THE LIGHT
            </h1>
          </div>
        </div>

        {/* Scene Steps Indicators */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {OUTRO_SCENES.map((s, idx) => {
            const isCurrent = idx === step;
            const isVisited = visitedSteps.has(idx);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpToStep(idx)}
                disabled={!isVisited || isLocked}
                title={`Finale Scene ${s.id}: ${s.title}`}
                className={`transition-all duration-300 rounded-sm font-mono text-[10px] md:text-xs px-2.5 py-0.5 border ${
                  isCurrent
                    ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)] font-bold shadow-[0_0_14px_rgba(223,177,37,0.6)] scale-105'
                    : isVisited
                    ? 'bg-black/60 text-[var(--accent-gold)]/80 border-[var(--border-gold)]/60 hover:border-[var(--accent-gold)] cursor-pointer'
                    : 'bg-black/30 text-neutral-600 border-neutral-800 cursor-not-allowed opacity-50'
                }`}
              >
                0{s.id}
              </button>
            );
          })}
        </div>

        {/* Skip button for quick testing / proctor override */}
        <button
          type="button"
          onClick={onComplete}
          disabled={isLocked}
          className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-neutral-400 hover:text-[var(--accent-gold)] transition-colors px-2 py-1 rounded border border-transparent hover:border-[var(--border-gold)]/40 cursor-pointer"
          title="Skip finale to conclusion"
        >
          Skip ⏩
        </button>
      </div>

      {/* CENTER STAGE: Cinematic Outro Card */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-2 md:my-3">
        <div 
          className="w-full relative rounded-lg overflow-hidden border border-[var(--border-gold)]/70 bg-black/95 shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_30px_rgba(245,158,11,0.2)] flex items-center justify-center transition-all duration-500"
          style={{ aspectRatio: '560 / 466', maxHeight: '66vh' }}
        >
          {/* Active Outro Image */}
          <img
            key={currentScene.id}
            src={imgError ? currentScene.fallbackImage : currentScene.image}
            alt={`${currentScene.title} - ${currentScene.caption}`}
            onError={() => {
              if (!imgError) setImgError(true);
            }}
            className="w-full h-full object-contain transition-opacity duration-500 ease-out animate-[fadeIn_0.4s_ease-in-out]"
          />

          {/* Subtle gold corner aesthetic markers */}
          <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-[var(--accent-gold)]/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-[var(--accent-gold)]/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-[var(--accent-gold)]/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-[var(--accent-gold)]/60 pointer-events-none" />
        </div>
      </div>

      {/* BOTTOM CONTROLS: Previous, Countdown Ring, Next / Finale Button */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-t border-[var(--border-gold)]/30 pt-3">
        {/* Left: Previous Button */}
        <div className="w-28 flex justify-start">
          {step > 0 ? (
            <button
              type="button"
              onClick={prevStory}
              disabled={isLocked}
              className="px-3 md:px-4 py-1.5 bg-black/50 border border-[var(--border-gold)]/50 text-[var(--accent-gold)]/80 hover:text-[var(--accent-gold)] hover:border-[var(--accent-gold)] font-mono text-xs uppercase tracking-wider rounded-sm transition-all cursor-pointer active:scale-95"
            >
              ← Prev
            </button>
          ) : (
            <span className="text-[11px] font-mono text-neutral-600 uppercase tracking-widest pl-2">
              Start
            </span>
          )}
        </div>

        {/* Center: Action / Countdown */}
        <div className="flex items-center justify-center gap-3">
          {!canAdvance ? (
            <div className="flex items-center gap-3 px-5 py-1.5 bg-black/60 border border-[var(--border-gold)]/40 rounded-sm">
              <div className="relative flex items-center justify-center">
                <svg width="34" height="34" viewBox="0 0 34 34">
                  <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(245,158,11,0.2)" strokeWidth="2.5" />
                  <circle
                    cx="17"
                    cy="17"
                    r="13"
                    fill="none"
                    stroke="var(--accent-gold)"
                    strokeWidth="2.5"
                    strokeDasharray={`${2 * Math.PI * 13}`}
                    strokeDashoffset={`${(2 * Math.PI * 13) * (1 - countdown / 3)}`}
                    strokeLinecap="round"
                    style={{
                      transition: 'stroke-dashoffset 0.9s linear',
                      transform: 'rotate(-90deg)',
                      transformOrigin: 'center'
                    }}
                  />
                </svg>
                <span className="absolute text-[var(--accent-gold)] font-mono text-xs font-bold">
                  {countdown}
                </span>
              </div>
              <span className="text-[11px] font-mono text-[var(--accent-gold)]/70 uppercase tracking-widest hidden sm:inline">
                Absorbing Revelation...
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={advanceStory}
              disabled={isLocked}
              className="px-6 md:px-8 py-2.5 bg-[var(--bg-panel)] border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-black font-mono text-xs md:text-sm uppercase tracking-widest font-semibold rounded-sm transition-all cursor-pointer shadow-[0_0_24px_rgba(245,158,11,0.3)] hover:shadow-[0_0_36px_rgba(245,158,11,0.6)] active:scale-95 flex items-center gap-2"
            >
              <span>
                {step < OUTRO_SCENES.length - 1
                  ? 'Continue To Next Scene →'
                  : '🏆 Step Into The Light // View Final Leaderboard →'}
              </span>
              <span className="text-[10px] opacity-70 font-mono lowercase">
                (enter / space)
              </span>
            </button>
          )}
        </div>

        {/* Right: Scene Counter */}
        <div className="w-28 flex justify-end">
          <div className="text-right">
            <span className="font-mono text-xs font-bold text-[var(--accent-gold)]">
              {step + 1}
            </span>
            <span className="font-mono text-xs text-neutral-500">
              {' '}/ {OUTRO_SCENES.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
