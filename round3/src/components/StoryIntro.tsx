import React, { useState, useEffect, useCallback, useMemo } from 'react';

interface Props {
  onComplete: () => void;
  isLocked?: boolean;
}

interface StoryScene {
  id: number;
  title: string;
  location: string;
  caption: string;
  image: string;
  fallbackImage: string;
}

const STORY_SCENES: StoryScene[] = [
  {
    id: 1,
    title: '1. THE APPROACH',
    location: 'UNKNOWN LOCATION',
    caption: 'THE FIELD SYSTEM IS ONLINE. THE ROUTE TO THE LIGHT IS NOW WITHIN REACH.',
    image: '/assets/round3/scene1.png',
    fallbackImage: '/assets/round3/St_1(1).png'
  },
  {
    id: 2,
    title: '2. THE RUINS',
    location: 'UNKNOWN LOCATION',
    caption: "AS I MOVE CLOSER, THE LANDSCAPE CHANGES. THE STRUCTURES AREN'T NATURAL.",
    image: '/assets/round3/scene2.png',
    fallbackImage: '/assets/round3/St_2(1).png'
  },
  {
    id: 3,
    title: '3. THE ENTRANCE',
    location: 'UNKNOWN LOCATION',
    caption: 'THIS IS IT. THE LIGHT IS NO LONGER DISTANT.',
    image: '/assets/round3/scene3.png',
    fallbackImage: '/assets/round3/St_3(1).png'
  },
  {
    id: 4,
    title: '4. THE VISION',
    location: 'UNKNOWN LOCATION',
    caption: 'MEMORIES SURFACE. PIECES OF THE PAST BEGIN TO CONNECT.',
    image: '/assets/round3/scene4.png',
    fallbackImage: '/assets/round3/St_4(1).png'
  },
  {
    id: 5,
    title: '5. THE TRUTH',
    location: 'UNKNOWN LOCATION',
    caption: 'WHAT REALLY HAPPENED HERE? AND WHAT IS THIS LIGHT?',
    image: '/assets/round3/scene5.png',
    fallbackImage: '/assets/round3/St_5(1).png'
  },
  {
    id: 6,
    title: '6. THE CHOICE',
    location: 'UNKNOWN LOCATION',
    caption: 'I FINALLY HAVE MY ANSWERS. NOW I CHOOSE WHAT HAPPENS NEXT.',
    image: '/assets/round3/scene6.png',
    fallbackImage: '/assets/round3/St_6(1).png'
  }
];

export const StoryIntro: React.FC<Props> = ({ onComplete, isLocked = false }) => {
  const [step, setStep] = useState(0);
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(() => new Set([0]));
  const [canAdvance, setCanAdvance] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [imgError, setImgError] = useState(false);

  const currentScene = useMemo(() => STORY_SCENES[step], [step]);

  // Audio cue on scene transition
  const playTransitionSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(420, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(740, ctx.currentTime + 0.18);
        gain.gain.setValueAtTime(0.06, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.22);
      }
    } catch (_) {}
  }, []);

  // Preload all 6 images for instant transitions
  useEffect(() => {
    STORY_SCENES.forEach(scene => {
      const primary = new Image();
      primary.src = scene.image;
      const fallback = new Image();
      fallback.src = scene.fallbackImage;
    });
  }, []);

  // Countdown timer per scene
  useEffect(() => {
    setImgError(false);
    // If user has already visited this scene, unlock advance immediately
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
    if (step < STORY_SCENES.length - 1) {
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
      {/* Ambient background atmosphere glow */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(circle_at_50%_35%,rgba(223,177,37,0.12),transparent_70%)]" 
      />
      <div 
        className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(223,177,37,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(223,177,37,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" 
      />

      {/* TOP HEADER: Breadcrumbs & Scene Tracker */}
      <div className="relative z-10 w-full max-w-5xl flex items-center justify-between border-b border-[var(--border-gold)]/30 pb-2.5 pt-1">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-gold)] animate-pulse shadow-[0_0_8px_var(--accent-gold)]" />
          <div>
            <p className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent-gold)]/80">
              Expedition Prologue // Phase III
            </p>
            <h1 className="text-lg md:text-2xl font-cinzel text-[var(--accent-gold)] tracking-widest font-bold drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              THE TEMPLE TRIALS
            </h1>
          </div>
        </div>

        {/* Scene Steps Indicators */}
        <div className="flex items-center gap-1.5 md:gap-2">
          {STORY_SCENES.map((s, idx) => {
            const isCurrent = idx === step;
            const isVisited = visitedSteps.has(idx);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => jumpToStep(idx)}
                disabled={!isVisited || isLocked}
                title={`Scene ${s.id}: ${s.title}`}
                className={`transition-all duration-300 rounded-sm font-mono text-[10px] md:text-xs px-2 py-0.5 border ${
                  isCurrent
                    ? 'bg-[var(--accent-gold)] text-black border-[var(--accent-gold)] font-bold shadow-[0_0_12px_rgba(223,177,37,0.5)] scale-105'
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
          className="text-[10px] md:text-xs font-mono uppercase tracking-wider text-neutral-500 hover:text-[var(--accent-gold)] transition-colors px-2 py-1 rounded border border-transparent hover:border-[var(--border-gold)]/40 cursor-pointer"
          title="Skip prologue to trials"
        >
          Skip ⏩
        </button>
      </div>

      {/* CENTER STAGE: Cinematic Story Card */}
      <div className="relative z-10 w-full max-w-4xl flex-1 flex flex-col items-center justify-center my-2 md:my-3">
        <div 
          className="w-full relative rounded-lg overflow-hidden border border-[var(--border-gold)]/60 bg-black/90 shadow-[0_0_40px_rgba(0,0,0,0.9),0_0_25px_rgba(223,177,37,0.15)] flex items-center justify-center transition-all duration-500"
          style={{ aspectRatio: '687 / 380', maxHeight: '66vh' }}
        >
          {/* Active Scene Image - Completely uncropped with natural card presentation */}
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
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-[var(--accent-gold)]/40 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-[var(--accent-gold)]/40 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-[var(--accent-gold)]/40 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-[var(--accent-gold)]/40 pointer-events-none" />
        </div>
      </div>

      {/* BOTTOM CONTROLS: Previous, Countdown Ring, Next Button */}
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
                  <circle cx="17" cy="17" r="13" fill="none" stroke="rgba(223,177,37,0.2)" strokeWidth="2.5" />
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
                Absorbing Memory...
              </span>
            </div>
          ) : (
            <button
              type="button"
              onClick={advanceStory}
              disabled={isLocked}
              className="px-6 md:px-8 py-2.5 bg-[var(--bg-panel)] border border-[var(--accent-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-black font-mono text-xs md:text-sm uppercase tracking-widest font-semibold rounded-sm transition-all cursor-pointer shadow-[0_0_20px_rgba(223,177,37,0.25)] hover:shadow-[0_0_30px_rgba(223,177,37,0.55)] active:scale-95 flex items-center gap-2"
            >
              <span>
                {step < STORY_SCENES.length - 1
                  ? 'Continue To Next Scene →'
                  : 'Enter The Temple Trials →'}
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
              {' '}/ {STORY_SCENES.length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
