import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export const StoryIntro: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);
  const [canAdvance, setCanAdvance] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const storyScenes = [
    {
      text: "You've solved the ancient ciphers and recreated the maps... and there it is. The legendary temple, thought to exist only in myths, standing tall with its colossal guardian towering behind it.",
      image: "/assets/story/scene1.jpg"
    },
    {
      text: "As you finally approach the temple gates, a sudden chill runs down your spine. Its sheer scale is breathtaking, but a thick, impenetrable fog obscures the path ahead.",
      image: "/assets/story/scene2.jpg"
    },
    {
      text: "The mist slowly parts, revealing the true path to the sanctuary. A crumbling bridge filled with deadly traps, and a fierce beast guarding the entrance. Do you have what it takes to break through?",
      image: "/assets/story/scene3.jpg"
    },
    {
      text: "Only those with a sharp mind and clear logic can forge a path to the treasure. The final trials await. Prepare your code...",
      image: "/assets/story/scene4.jpg"
    }
  ];

  useEffect(() => {
    setCanAdvance(false);
    const timer = setTimeout(() => {
      setCanAdvance(true);
    }, 3000);
    return () => clearTimeout(timer);
  }, [step]);

  useEffect(() => {
    setCountdown(3);
    const interval = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && canAdvance) {
        if (step < storyScenes.length - 1) {
          setStep(s => s + 1);
        } else {
          onComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, canAdvance, onComplete, storyScenes.length]);

  return (
    <div className="absolute inset-0 bg-[var(--bg-dark)] flex flex-col items-center justify-center p-4 md:p-8 z-50">
      <div className="max-w-5xl w-full text-center space-y-3 md:space-y-4">
        <h1 className="text-3xl md:text-4xl font-cinzel text-[var(--accent-gold)] tracking-widest">
          THE TEMPLE TRIALS
        </h1>

        {/* Scene Image */}
        <div className="w-full aspect-video bg-black/50 border border-[var(--border-gold)] rounded-sm flex items-center justify-center shadow-2xl relative overflow-hidden transition-all duration-700">
          <img
            src={storyScenes[step].image}
            alt={`Scene ${step + 1}`}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
          <div className="absolute inset-0 border border-[var(--border-gold)] opacity-50" />
        </div>

        <div className="min-h-[70px] flex items-center justify-center px-2 md:px-8">
          <p className="text-base md:text-lg lg:text-xl font-cinzel text-[var(--text-primary)] transition-all duration-500 leading-relaxed shadow-black drop-shadow-md">
            {storyScenes[step].text}
          </p>
        </div>

        <div className="pt-2 md:pt-4 flex items-center justify-center" style={{ minHeight: '48px' }}>
          {!canAdvance ? (
            <div className="relative flex items-center justify-center">
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(223,177,37,0.2)" strokeWidth="3" />
                <circle cx="22" cy="22" r="18" fill="none" stroke="var(--accent-gold)" strokeWidth="3"
                  strokeDasharray={`${(2 * Math.PI * 18)}`}
                  strokeDashoffset={`${(2 * Math.PI * 18) * (1 - countdown / 3)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 0.9s linear', transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                />
              </svg>
              <span className="absolute text-[var(--accent-gold)] font-mono text-sm font-bold">{countdown}</span>
            </div>
          ) : (
            <p className="text-[var(--accent-gold)] font-mono text-xs md:text-sm uppercase tracking-widest animate-pulse opacity-100 transition-opacity duration-500">
              [ Press Enter to {step < storyScenes.length - 1 ? 'continue' : 'begin trial'} ]
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
