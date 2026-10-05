import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StoryScene } from './StoryScene.jsx';
import { SpeechBubble } from './SpeechBubble.jsx';

const scenes = [
  {
    title: 'THE AWAKENING',
    location: 'UNKNOWN LOCATION · PRESENT DAY',
    narration: 'UNKNOWN LOCATION\nUNKNOWN TIME\nMEMORY STATUS: UNAVAILABLE\n\nA distant glowing monolith pierces the dark forest—the only visible landmark and possible way out.',
    speaker: 'Explorer',
    lines: ['Where... am I?', "I can't remember anything."],
    variant: 'forest',
    image: '/assets/prologue/scene1_awakening.png',
    alt: 'Explorer waking alone on wet forest floor looking towards distant glowing monolith',
    objectPosition: 'center',
    tagline: 'THE LIGHT IS THE ONLY VISIBLE WAY FORWARD'
  },
  {
    title: 'THE LOST GEAR',
    location: 'ABANDONED EXPEDITION FIELD MODULE (EFM) · PRESENT DAY',
    narration: 'EXPEDITION FIELD MODULE (EFM)\nField gear, computer terminals, and damaged instruments lie abandoned.\nThe field system is down.',
    speaker: 'Explorer',
    lines: [
      'This place was used by an expedition.',
      'The system is broken... but the light is still visible outside.'
    ],
    variant: 'gear',
    image: '/assets/prologue/scene2_gear.png',
    alt: 'Abandoned Expedition Field Module and equipment in forest',
    objectPosition: 'center',
    systemStatus: [
      { label: 'POWER', status: 'CRITICAL', type: 'crit' },
      { label: 'RADIO', status: 'OFFLINE', type: 'off' },
      { label: 'NAVIGATION', status: 'OFFLINE', type: 'off' },
      { label: 'MEMORY', status: 'CORRUPTED', type: 'crit' }
    ]
  },
  {
    title: 'THE LIGHT',
    location: 'MEMORY FRAGMENT · EXPEDITION PAST',
    narration: 'A fragment of memory returns.\nI was part of the expedition that came here to investigate the light.',
    speaker: 'Explorer',
    lines: ['That light...', "I've seen it before."],
    variant: 'memory',
    isMemory: true,
    image: '/assets/prologue/scene3_light.png',
    alt: 'Memory fragment of the expedition team observing the glowing monolith',
    objectPosition: 'center',
    memoryBadge: 'MEMORY FRAGMENT — EXPEDITION PAST'
  },
  {
    title: 'THE RADIO',
    location: 'EXPEDITION FIELD MODULE · PRESENT DAY',
    narration: 'STATIC · INCOMING TRANSMISSION\nThe old field radio suddenly crackles to life before dropping into silence.\nSomeone knew about this place.',
    speeches: [
      { speaker: 'Radio', lines: ['...do you copy...', '...if you can hear this...'], side: 'right' },
      { speaker: 'Explorer', lines: ['Someone knew about this place.'], side: 'left' }
    ],
    variant: 'radio',
    image: '/assets/prologue/scene4_radio.png',
    alt: 'Field radio hardware with active waveform transmission',
    objectPosition: 'center'
  },
  {
    title: 'SOMETHING IS WRONG',
    location: 'EXPEDITION LOGBOOK · PRESENT DAY',
    narration: 'A familiar symbol.\nA memory almost returns.',
    speaker: 'Explorer',
    lines: ["I've seen this before...", "But I don't remember being here."],
    variant: 'warning',
    showSymbol: true,
    image: '/assets/prologue/scene5_warning.png',
    alt: 'Explorer discovering the recurring keyhole emblem on the expedition logbook',
    objectPosition: 'center'
  },
  {
    title: 'THE DECISION',
    location: 'MAIN CONTROL CONSOLE · PRESENT DAY',
    narration: 'FIELD SYSTEM STATUS\nAll navigation and route calculation systems are offline.\nRestoring the station is the only way forward.',
    speaker: 'Explorer',
    lines: [
      "I don't know who I am.",
      "But I know I can't stay here.",
      "If I can get the field systems running... maybe I'll find my way out.",
      "And maybe... I can reach that light."
    ],
    variant: 'decision',
    image: '/assets/prologue/scene6_decision.png',
    alt: 'Explorer facing control console displaying system offline status',
    objectPosition: 'center',
    systemStatus: [
      { label: 'POWER', status: 'OFFLINE', type: 'off' },
      { label: 'RADIO', status: 'OFFLINE', type: 'off' },
      { label: 'NAVIGATION', status: 'OFFLINE', type: 'off' },
      { label: 'ARCHIVE', status: 'LOCKED', type: 'lock' }
    ],
    isFinalDecision: true
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
    }, 1500);
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
          transition={{ duration: 0.5 }}
        >
          <StoryScene
            title={scene.title}
            location={scene.location}
            narration={scene.narration}
            variant={scene.variant}
            image={scene.image}
            alt={scene.alt}
            objectPosition={scene.objectPosition}
            systemStatus={scene.systemStatus}
            isMemory={scene.isMemory}
            memoryBadge={scene.memoryBadge}
            showSymbol={scene.showSymbol}
            tagline={scene.tagline}
          >
            <SpeechBubble
              speaker={scene.speaker}
              lines={scene.lines}
              speeches={scene.speeches}
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

      <div className="scene-caption">
        FINAL STORY OBJECTIVE: RESTORE THE FIELD SYSTEM TO REACH THE LIGHT
      </div>

      {isBooting && (
        <motion.div
          className="prologue-boot-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div className="boot-terminal-box">
            <div className="boot-spinner" />
            <p className="boot-text">EFM SYSTEM INITIALIZING...</p>
            <div className="boot-lines">
              <div>POWER ........ <span className="boot-line-status">[RESTORING]</span></div>
              <div>RADIO ........ <span className="boot-line-status">[SEARCHING FREQUENCY]</span></div>
              <div>NAVIGATION ... <span className="boot-line-status">[OFFLINE]</span></div>
              <div>ARCHIVE ...... <span className="boot-line-status">[LOCKED]</span></div>
            </div>
            <p className="boot-subtext" style={{ marginTop: '1.2rem', marginBottom: 0 }}>
              &gt; LAUNCHING CYPHORA OS WORKSTATION...
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}


