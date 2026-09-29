import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryScene } from './StoryScene.jsx';
import { SpeechBubble } from './SpeechBubble.jsx';

const scenes = [
  {
    title: 'THE AWAKENING',
    narration: 'UNKNOWN LOCATION\nUNKNOWN TIME\nMEMORY STATUS: UNAVAILABLE',
    speaker: 'Explorer',
    lines: ['Where... am I?', "I can't remember anything."],
    variant: 'forest',
    image: '/assets/prologue/scene1_awakening.png',
    alt: 'Explorer sitting on wet forest ground facing glowing distant monolith',
    objectPosition: 'center 40%'
  },
  {
    title: 'THE LOST GEAR',
    narration: 'FIELD EQUIPMENT\nPOWER ........ CRITICAL\nRADIO ........ OFFLINE\nNAVIGATION ... OFFLINE\nMEMORY ....... CORRUPTED',
    speaker: 'Explorer',
    lines: ['Nothing.', 'Not even a name.'],
    variant: 'gear',
    image: '/assets/prologue/scene2_gear.png',
    alt: 'Abandoned expedition equipment and terminal screen displaying NO SIGNAL',
    objectPosition: 'center'
  },
  {
    title: 'THE LIGHT',
    narration: 'The forest is black except for a single distant glow.',
    speaker: 'Explorer',
    lines: ["What's that?", 'A light...'],
    variant: 'light',
    image: '/assets/prologue/scene3_light.png',
    alt: 'Explorer looking through forest towards distant glowing monolith',
    objectPosition: 'center 30%'
  },
  {
    title: 'THE RADIO',
    narration: 'Static. A voice cuts through the mist.',
    speaker: 'Radio',
    lines: ['...do you copy...', '...if you can hear this...'],
    variant: 'radio',
    image: '/assets/prologue/scene4_radio.png',
    alt: 'Field radio communications terminal with active waveform display',
    objectPosition: 'center'
  },
  {
    title: 'SOMETHING IS WRONG',
    narration: 'A familiar symbol. A scratch in the bark. A memory almost returns.',
    speaker: 'Explorer',
    lines: ["I've seen this before...", "But I don't remember being here."],
    variant: 'warning',
    image: '/assets/prologue/scene5_warning.png',
    alt: 'Explorer inspecting expedition logbook with glowing enclave symbol',
    objectPosition: 'center'
  },
  {
    title: 'THE DECISION',
    narration: 'FIELD SYSTEM STATUS\nPOWER      OFFLINE\nRADIO      OFFLINE\nNAVIGATION OFFLINE\nARCHIVE    LOCKED',
    speaker: 'Explorer',
    lines: ["I don't know who I am.", "But I know I can't stay here.", 'If I can get the field systems running...', "...maybe I'll find my way out."],
    variant: 'decision',
    image: '/assets/prologue/scene6_decision.png',
    alt: 'Explorer facing control panel displaying system offline status',
    objectPosition: 'center'
  }
];

export function Prologue({ teamName = 'Explorer', onBeginExpedition }) {
  const [sceneIndex, setSceneIndex] = useState(0);
  const [isBooting, setIsBooting] = useState(false);
  const scene = scenes[sceneIndex];

  const isLastScene = sceneIndex === scenes.length - 1;
  const currentSceneCount = useMemo(() => `${sceneIndex + 1} / ${scenes.length}`, [sceneIndex]);

  const handleBeginExpeditionClick = () => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        const ctx = new AudioCtx();
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(80, ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(180, ctx.currentTime + 0.4);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.8);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.1);
        osc2.frequency.setValueAtTime(1760, ctx.currentTime + 0.3);
        gain2.gain.setValueAtTime(0.08, ctx.currentTime + 0.1);
        gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(ctx.currentTime + 0.1);
        osc2.stop(ctx.currentTime + 0.6);
      }
    } catch (e) {}

    setIsBooting(true);
    setTimeout(() => {
      if (onBeginExpedition) onBeginExpedition();
    }, 900);
  };

  return (
    <div className="prologue-shell">
      <div className="prologue-overlay" />
      <AnimatePresence mode="wait">
        <motion.div
          key={sceneIndex}
          className="prologue-scene-wrap"
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.6 }}
        >
          <StoryScene
            title={scene.title}
            narration={scene.narration}
            variant={scene.variant}
            image={scene.image}
            alt={scene.alt}
            objectPosition={scene.objectPosition}
          >
            <SpeechBubble
              speaker={scene.speaker}
              lines={scene.lines}
              side={scene.speaker === 'Explorer' ? 'left' : 'right'}
            />
          </StoryScene>
        </motion.div>
      </AnimatePresence>

      <div className="prologue-controls">
        <div className="story-progress">
          <span>{teamName}</span>
          <span>{currentSceneCount}</span>
        </div>

        <div className="progress-dots">
          {scenes.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === sceneIndex ? 'active' : ''}`}
              onClick={() => setSceneIndex(index)}
              aria-label={`Jump to scene ${index + 1}`}
            />
          ))}
        </div>

        <div className="prologue-actions">
          {sceneIndex < scenes.length - 1 ? (
            <button className="prologue-next-btn" onClick={() => setSceneIndex(sceneIndex + 1)}>
              Continue
            </button>
          ) : (
            <button className="prologue-next-btn primary" onClick={handleBeginExpeditionClick}>
              BEGIN EXPEDITION
            </button>
          )}
        </div>
      </div>

      {!isLastScene && (
        <div className="scene-caption">EXPEDITION OBJECTIVE: RESTORE THE FIELD SYSTEM</div>
      )}

      {isBooting && (
        <motion.div
          className="prologue-boot-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="boot-terminal-box">
            <div className="boot-spinner" />
            <p className="boot-text">RESTORING EXPEDITION FIELD SYSTEM...</p>
            <p className="boot-subtext">INITIALIZING OS NAVIGATOR</p>
          </div>
        </motion.div>
      )}
    </div>
  );
}

