import React from 'react';

export function SpeechBubble({ speaker, lines = [], side = 'left' }) {
  return (
    <div className={`story-speech ${side}`}>
      <div className="speech-bubble">
        {lines.map((line, index) => (
          <p key={`${speaker}-${index}`}>{line}</p>
        ))}
      </div>
      {speaker && <div className="speech-speaker">{speaker}</div>}
    </div>
  );
}
