import React, { useState, useEffect } from 'react';

interface Props {
  onComplete: () => void;
}

export const TutorialScreen: React.FC<Props> = ({ onComplete }) => {
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes

  useEffect(() => {
    if (timeLeft <= 0) {
      onComplete();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, onComplete]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full h-full bg-[#080c06] text-white flex flex-col items-center justify-center font-mono">
      <div className="absolute top-8 right-8 text-2xl text-[var(--accent-gold)]">
        Time Remaining: {formatTime(timeLeft)}
      </div>
      
      <h1 className="text-4xl text-[var(--accent-gold)] mb-8 tracking-widest uppercase text-center">
        Tutorial
      </h1>
      
      <div className="max-w-3xl border border-[var(--border-gold)] bg-black/50 p-8 mb-8 text-lg leading-relaxed">
        <p className="mb-4">
          Welcome to CYPHORA: Round 3. Before the round begins, please review these instructions carefully.
        </p>
        <p className="mb-4">
          This section is a placeholder for the round tutorial. The round will automatically start when the timer expires.
        </p>
        <p className="text-gray-400">
          (Tutorial content to be added here)
        </p>
      </div>

      <button
        onClick={onComplete}
        className="px-6 py-3 border border-[var(--border-gold)] bg-black text-[var(--accent-gold)] uppercase tracking-widest hover:bg-[var(--accent-gold)] hover:text-black transition-colors"
      >
        Force Skip Tutorial
      </button>
    </div>
  );
};

