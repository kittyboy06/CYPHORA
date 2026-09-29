import React, { useState, useEffect } from 'react';
import { Play } from 'lucide-react';

interface Props {
  onComplete: () => void;
}

export const StoryIntro: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState(0);

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
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        if (step < storyScenes.length - 1) {
          setStep(s => s + 1);
        } else {
          onComplete();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [step, onComplete, storyScenes.length]);

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

        <p className="text-[var(--accent-gold)] font-mono text-xs md:text-sm uppercase tracking-widest animate-pulse pt-2 md:pt-4">
          [ Press Enter to {step < storyScenes.length - 1 ? 'continue' : 'begin trial'} ]
        </p>
      </div>
    </div>
  );
};
