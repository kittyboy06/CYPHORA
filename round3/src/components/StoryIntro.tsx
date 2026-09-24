import React, { useState } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const StoryIntro: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

  const storyTexts = [
    "The hunter has finally located the hidden temple...",
    "But the treasure is guarded by ancient mechanisms.",
    "Only those who understand the logic of the ancients may pass.",
    "Your code will guide the hunter. Be precise."
  ];

  const handleNext = () => {
    if (step < storyTexts.length - 1) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <div className="absolute inset-0 bg-[var(--bg-dark)] flex flex-col items-center justify-center p-8 z-50">
      <div className="max-w-2xl w-full text-center space-y-8">
        <h1 className="text-4xl font-cinzel text-[var(--accent-gold)] tracking-widest mb-12">
          THE TEMPLE TRIALS
        </h1>
        
        {/* Placeholder for cinematic video */}
        <div className="w-full aspect-video bg-black/50 border border-[var(--border-gold)] rounded-sm flex items-center justify-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-texture opacity-30" />
          <span className="text-[var(--text-muted)] tracking-widest text-sm relative z-10">[ CINEMATIC VIDEO PLACEHOLDER ]</span>
        </div>

        <div className="h-24 flex items-center justify-center">
          <p className="text-xl font-cinzel text-[var(--text-primary)] transition-all duration-500 animate-pulse">
            {storyTexts[step]}
          </p>
        </div>

        <button 
          onClick={handleNext}
          className="mt-8 px-8 py-4 bg-[var(--bg-panel)] border border-[var(--border-gold)] text-[var(--accent-gold)] hover:bg-[var(--accent-gold)] hover:text-black transition-all uppercase tracking-widest font-bold flex items-center gap-2 mx-auto"
        >
          {step < storyTexts.length - 1 ? 'Next' : 'Begin Trial'} <Play size={18} />
        </button>
      </div>
    </div>
  );
};
