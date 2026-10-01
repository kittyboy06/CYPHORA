import React from 'react';

export function SpeechBubble({ speaker, lines = [], side = 'left', speeches = null }) {
  if (speeches && Array.isArray(speeches) && speeches.length > 0) {
    return (
      <div className="story-speeches-container">
        {speeches.map((item, idx) => (
          <div key={idx} className={`story-speech ${item.side || (item.speaker === 'Explorer' ? 'left' : 'right')}`}>
            <div className="speech-bubble">
              {(item.lines || []).map((line, lineIdx) => (
                <p key={`${item.speaker || idx}-${lineIdx}`}>{line}</p>
              ))}
            </div>
            {item.speaker && <div className="speech-speaker">{item.speaker}</div>}
          </div>
        ))}
      </div>
    );
  }

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

