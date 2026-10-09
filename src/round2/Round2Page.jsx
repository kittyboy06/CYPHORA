import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  ArrowLeft,
  Send,
  CheckCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Info,
  Clock,
  Trophy,
  Zap,
  Flame,
  Award,
  Check,
  ArrowRight,
  Maximize,
  Minimize,
  CheckCircle2,
  BookOpen
} from 'lucide-react';
import { ProtectedReferenceImage } from './components/ProtectedReferenceImage.jsx';
import { PromptSection } from './components/PromptSection.jsx';
import { ResultImageUpload } from './components/ResultImageUpload.jsx';
import { LeaderboardPanel } from './components/LeaderboardPanel.jsx';
import { RoundTimerLockScreen } from '../components/RoundTimerLockScreen.jsx';
import './Round2.css';
import './Round2Page.css';

const ROUND_2_DURATION_SECONDS = 30 * 60; // 30 minutes = 1800 seconds
const POINTS_PER_IMAGE = 50; // 50 points for 100% Accuracy, reduced proportionally
const MAX_ROUND_2_POINTS = 100; // 2 images * 50 points max

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
const API_BASE = isDevPort ? `http://${hostname}:8000` : '';

// --- Grand Dust Burst Effect (ancient door reveal, one-shot ~3s) ---
const DustParticles = ({ count = 400 }) => {
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const startTime = performance.now();
    const DURATION = 3000; // 3 seconds for a grander feel

    // Three layers of dust for depth
    const particles = Array.from({ length: count }, (_, i) => {
      // Layer 1 (0-30%): Heavy dust clumps — big, slow, bright
      // Layer 2 (30-70%): Medium motes — standard size, moderate speed
      // Layer 3 (70-100%): Tiny sparkle dust — small, fast, flickery
      const layer = i < count * 0.3 ? 'heavy' : i < count * 0.7 ? 'medium' : 'sparkle';

      const baseSize = layer === 'heavy' ? Math.random() * 4 + 2
                     : layer === 'medium' ? Math.random() * 2.5 + 0.8
                     : Math.random() * 1.2 + 0.3;

      const baseSpeed = layer === 'heavy' ? Math.random() * 0.8 + 0.2
                      : layer === 'medium' ? Math.random() * 1.5 + 0.5
                      : Math.random() * 2.5 + 1;

      const baseOpacity = layer === 'heavy' ? Math.random() * 0.3 + 0.5
                        : layer === 'medium' ? Math.random() * 0.4 + 0.3
                        : Math.random() * 0.5 + 0.2;

      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: baseSpeed + Math.random() * 0.5,
        size: baseSize,
        opacity: baseOpacity,
        hue: 30 + Math.random() * 20,            // warm amber-gold range
        sat: layer === 'sparkle' ? 50 + Math.random() * 30 : 25 + Math.random() * 35,
        light: layer === 'sparkle' ? 70 + Math.random() * 20 : 50 + Math.random() * 30,
        drag: 0.98 + Math.random() * 0.015,
        gravity: layer === 'heavy' ? Math.random() * 0.06 + 0.02
               : Math.random() * 0.03 + 0.005,
        wobbleFreq: Math.random() * 0.01 + 0.002,
        wobbleAmp: layer === 'heavy' ? Math.random() * 1.5 + 0.5
                 : Math.random() * 0.8 + 0.3,
        wobblePhase: Math.random() * Math.PI * 2,
        layer,
        trail: layer !== 'sparkle' ? Math.random() * 0.3 + 0.1 : 0, // motion blur for big/medium
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.05,
      };
    });

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / DURATION, 1);

      // Initial bright flash for first 200ms, then sustained, then fade
      let globalAlpha;
      if (progress < 0.07) {
        // Flash-in: ramp up fast
        globalAlpha = progress / 0.07;
      } else if (progress < 0.35) {
        globalAlpha = 1;
      } else {
        globalAlpha = 1 - ((progress - 0.35) / 0.65);
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (globalAlpha <= 0) {
        canvas.style.display = 'none';
        return;
      }

      // Atmospheric haze during first half — golden fog wash
      if (progress < 0.5) {
        const hazeAlpha = (progress < 0.1 ? progress / 0.1 : 1 - ((progress - 0.1) / 0.4)) * 0.06;
        ctx.save();
        ctx.globalAlpha = hazeAlpha * globalAlpha;
        const gradient = ctx.createRadialGradient(
          canvas.width / 2, canvas.height / 2, 0,
          canvas.width / 2, canvas.height / 2, canvas.width * 0.6
        );
        gradient.addColorStop(0, 'hsla(40, 60%, 50%, 1)');
        gradient.addColorStop(1, 'hsla(40, 60%, 50%, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
      }

      particles.forEach(p => {
        // Physics
        p.vx *= p.drag;
        p.vy *= p.drag;
        p.vy += p.gravity;
        p.rotation += p.rotSpeed;
        const wobble = Math.sin(now * p.wobbleFreq + p.wobblePhase) * p.wobbleAmp;
        p.x += p.vx + wobble;
        p.y += p.vy;

        const alpha = p.opacity * globalAlpha;
        if (alpha <= 0.005) return;

        ctx.save();

        // Motion trail for heavy/medium particles
        if (p.trail > 0 && alpha > 0.05) {
          ctx.globalAlpha = alpha * p.trail * 0.4;
          ctx.beginPath();
          ctx.moveTo(p.x - p.vx * 3, p.y - p.vy * 3);
          ctx.lineTo(p.x, p.y);
          ctx.strokeStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 1)`;
          ctx.lineWidth = p.size * 0.6;
          ctx.lineCap = 'round';
          ctx.stroke();
        }

        // Outer glow
        ctx.globalAlpha = alpha * 0.25;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (p.layer === 'heavy' ? 5 : 3.5), 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, 1)`;
        ctx.fill();

        // Core particle
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${Math.min(p.light + 15, 95)}%, 1)`;
        ctx.fill();

        // Hot center for sparkle particles
        if (p.layer === 'sparkle' && alpha > 0.15) {
          ctx.globalAlpha = alpha * 0.8;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size * 0.4, 0, Math.PI * 2);
          ctx.fillStyle = 'hsla(45, 100%, 90%, 1)';
          ctx.fill();
        }

        ctx.restore();
      });

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [count]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 10000,
      }}
    />
  );
};

// --- Prologue Component ---
const Prologue = ({ explorerId = "SFGHIOP", onStart, onReturnToHub }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      location: "SECTOR 4 — EXPEDITION SITE",
      title: "THE MISSING MEMORY",
      image: "/assets/prologue/scene1_awakening.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "This is the natural narrative continuation after the OS investigation.",
        "The first round establishes what was left behind.",
        "The next stage should establish what happened."
      ],
      speaker: "EXPLORER",
      speech1: "What... happened here?",
      speech2: "The memories aren't matching the surviving records.",
      metadata: [
        "LOCATION: SECTOR 4 — EXPEDITION SITE",
        "STATUS: MEMORY CORRUPTION DETECTED",
        "LOG SOURCE: OS INVESTIGATION RECOVERY"
      ]
    },
    {
      location: "RECOVERED LOGS",
      title: "CORRUPTED MEMORIES",
      image: "/assets/prologue/scene2_gear.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The recovered information from Round 1 points toward the missing expedition.",
        "The Explorer begins reconstructing events from damaged logs and system fragments."
      ],
      speaker: "EXPLORER",
      speech1: "Reconstructing records...",
      speech2: "Radio traces, system fragments, and the recurring symbol.",
      metadata: [
        "RECOVERED RECORDS: 7 DATA FRAGMENTS",
        "RADIO TRACES: INTERMITTENT",
        "CORRUPTION LEVEL: 84%"
      ]
    },
    {
      location: "DATA ARCHIVE",
      title: "THE CENTRAL MYSTERY",
      image: "/assets/prologue/scene3_light.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "A central contradiction emerges in the archives.",
        "Why does the Explorer remember things that appear nowhere in the surviving records?"
      ],
      speaker: "EXPLORER",
      speech1: "Why do I remember this?",
      speech2: "It appears nowhere in the surviving files.",
      metadata: [
        "ARCHIVED EVIDENCE: INCONSISTENT",
        "RECURRING SYMBOL: ACTIVE",
        "ANOMALY DETECTED: MEMORY MISMATCH"
      ]
    },
    {
      location: "EVIDENCE ANALYSIS",
      title: "CONTRADICTIONS",
      image: "/assets/prologue/scene4_radio.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The player starts discovering contradictions everywhere.",
        "Some files suggest one version of events. Other evidence suggests something completely different."
      ],
      speaker: "EXPLORER",
      speech1: "Two different stories...",
      speech2: "Which version of events actually occurred?",
      metadata: [
        "FILE VERSION A: OFFICIAL EXPEDITION LOG",
        "FILE VERSION B: CLASSIFIED FRAGMENT",
        "STATUS: DIVERGENT HISTORIES"
      ]
    },
    {
      location: "THE ANOMALY",
      title: "THE SPIRE INCIDENT",
      image: "/assets/prologue/scene5_warning.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "The glowing structure is no longer just a distant landmark.",
        "It appears to be directly connected to the incident."
      ],
      speaker: "EXPLORER",
      speech1: "The structure...",
      speech2: "It was at the center of the incident all along.",
      metadata: [
        "STRUCTURE DISTANCE: 0m",
        "FIELD ANOMALY: CRITICAL",
        "INCIDENT LINK: CONFIRMED"
      ]
    },
    {
      location: "EXPEDITION OBJECTIVE",
      title: "RECONSTRUCT THE EVENT",
      image: "/assets/prologue/scene6_decision.png",
      fallbackImage: "/assets/round2/reference.jpg",
      transcript: [
        "You will finish this round with more questions than answers.",
        "Possess enough information to understand that the original expedition was investigating something extraordinary."
      ],
      speaker: "SYSTEM",
      speech1: "Objective active.",
      speech2: "Reconstruct the lost event.",
      metadata: [
        "FINAL OBJECTIVE: RECONSTRUCT THE LOST EVENT",
        "TARGET: RESTORE FIELD DATA",
        "STATUS: READY FOR STAGE 2"
      ]
    }
  ];

  const slide = slides[currentSlide];

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      onStart();
    }
  };

  return (
    <div className="prologue-screen">
      <div className="story-card">
        <div className="card-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {onReturnToHub && (
              <button
                type="button"
                onClick={onReturnToHub}
                style={{
                  background: 'none',
                  border: '1px solid rgba(124, 103, 56, 0.4)',
                  color: '#d6b265',
                  padding: '4px 10px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <ArrowLeft size={13} /> Hub
              </button>
            )}
            <span className="location-tag">{slide.location}</span>
          </div>
          <h1 className="chapter-title">{slide.title}</h1>
        </div>

        <div
          className="card-image-area"
          style={{ backgroundImage: `url(${slide.image})` }}
        >
          <div className="transcript-box">
            {slide.transcript.map((line, idx) => (
              <p key={idx}>{line}</p>
            ))}
          </div>

          <div className="speech-bubbles-container">
            <div className="speaker-pill">
              <span className="speaker-name">{slide.speaker}:</span> {slide.speech1}
            </div>
            <div className="parchment-bubble">{slide.speech2}</div>
          </div>
        </div>

        <div className="card-footer">
          {slide.metadata.map((item, idx) => (
            <div key={idx} className="meta-line">{item}</div>
          ))}
        </div>
      </div>

      <div className="bottom-bar">
        <div className="explorer-id">
          {explorerId} &nbsp;&bull;&nbsp; {currentSlide + 1} / {slides.length}
        </div>

        <div className="center-controls">
          <div className="pagination-dots">
            {slides.map((_, i) => (
              <span
                key={i}
                className={`dot ${i === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(i)}
              />
            ))}
          </div>
          <div className="expedition-objective">
            EXPEDITION OBJECTIVE: RECONSTRUCT THE LOST EVENT
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            type="button"
            className="continue-btn"
            style={{ background: 'transparent', border: '1px solid rgba(201, 166, 83, 0.5)' }}
            onClick={onStart}
          >
            SKIP STORY
          </button>
          <button className="continue-btn" onClick={handleNext}>
            {currentSlide === slides.length - 1 ? 'ENTER STAGE 2' : 'CONTINUE'}
          </button>
        </div>
      </div>
    </div>
  );
};

export function Round2Page({ onReturnToHub }) {
  // Team state retrieved from local storage or fallback
  const [teamName] = useState(() => {
    return localStorage.getItem('cyphora_team_name') || 'Wandering Nomad';
  });

  // Story prologue state: remembers if user has entered stage 2
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('cyphora_round2_started') === 'true';
  });

  // Fullscreen state tracking
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  // Sequential progression: Phase 1 (Image 1) -> Phase 2 (Image 2)
  const [round2Phase, setRound2Phase] = useState(() => {
    const saved = localStorage.getItem('cyphora_round2_phase');
    return saved === '2' ? 2 : 1;
  });

  const [image1EvaluatedData, setImage1EvaluatedData] = useState(() => {
    try {
      const saved = localStorage.getItem('cyphora_round2_image1_data');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Synchronized Round 2 Timer State from Backend
  const [backendRound2Timer, setBackendRound2Timer] = useState(null);
  const [isRound2TimerExpired, setIsRound2TimerExpired] = useState(false);
  const [proctorUnlockedRound2, setProctorUnlockedRound2] = useState(false);

  const [secondsRemaining, setSecondsRemaining] = useState(1800);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Fetch backend Round 2 timer on mount & listen to WebSocket timer sync
  useEffect(() => {
    const fetchR2Timer = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/teams/timer?round=2`);
        if (res.ok) {
          const d = await res.json();
          const r2 = d.round2 || d;
          setBackendRound2Timer(r2);
        }
      } catch (e) {}
    };
    fetchR2Timer();

    const handleTimerSync = (e) => {
      const d = e.detail;
      if (!d) return;
      if (d.all_timers?.round2) {
        setBackendRound2Timer(d.all_timers.round2);
      } else if (d.round === 2) {
        setBackendRound2Timer(d);
      }
    };
    window.addEventListener('cyphora_timer_sync', handleTimerSync);
    return () => window.removeEventListener('cyphora_timer_sync', handleTimerSync);
  }, []);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  // --- Temple Background Layer State ---
  // null = default jungle/dark bg, 'half' = round3image1, 'full' = round3image2
  const [bgLayerSrc, setBgLayerSrc] = useState(null);
  const [isRumbling, setIsRumbling] = useState(false);

  // --- Temple Fragment Modals ---
  const [showFirstFragmentModal, setShowFirstFragmentModal] = useState(false);
  const [showFinalFragmentModal, setShowFinalFragmentModal] = useState(false);
  const [fragment1Score, setFragment1Score] = useState(0);
  const [fragment2Score, setFragment2Score] = useState(0);
  const [timeScore, setTimeScore] = useState(0);

  // Final Round Unlock Code State
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockError, setUnlockError] = useState('');

  // Form states
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('cyphora_round2_prompt') || '';
  });
  const [promptTouched, setPromptTouched] = useState(false);
  const [promptError, setPromptError] = useState('');

  // Image 1 State (Slot 1 of participant uploads)
  const [image1File, setImage1File] = useState(null);
  const [image1PreviewUrl, setImage1PreviewUrl] = useState(() => {
    return localStorage.getItem('cyphora_round2_image1_cached_url') || '';
  });
  const [image1Error, setImage1Error] = useState('');

  // Image 2 State (Slot 2 of participant uploads — shown only in Phase 2)
  const [image2File, setImage2File] = useState(null);
  const [image2PreviewUrl, setImage2PreviewUrl] = useState('');
  const [image2Error, setImage2Error] = useState('');

  const [formTouched, setFormTouched] = useState(false);
  const [formGlobalError, setFormGlobalError] = useState('');
  const [phaseSuccessNotice, setPhaseSuccessNotice] = useState('');

  // Submission & Points State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [showImage1Modal, setShowImage1Modal] = useState(false);
  const [showImage2Modal, setShowImage2Modal] = useState(false);
  const [pointsDelta, setPointsDelta] = useState(null);
  const [evaluatedScore, setEvaluatedScore] = useState(null);
  const [submittedData, setSubmittedData] = useState(null);

  // Live points tracking for current team playing
  const [teamPoints, setTeamPoints] = useState(() => {
    const saved = localStorage.getItem('cyphora_round2_score');
    if (saved) return parseInt(saved, 10);
    const img1 = localStorage.getItem('cyphora_round2_image1_data');
    if (img1) {
      try {
        const parsed = JSON.parse(img1);
        return parsed.score || 50;
      } catch {
        return 50;
      }
    }
    return 0;
  });

  // Track fullscreen changes and enable scrolling for Round 2
  useEffect(() => {
    document.documentElement.classList.add('round2-scroll-active');
    document.body.classList.add('round2-scroll-active');

    try {
      sessionStorage.removeItem('cyphora_os_locked');
      sessionStorage.removeItem('cyphora_os_lock_reason');
    } catch {
      // ignore
    }

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.documentElement.classList.remove('round2-scroll-active');
      document.body.classList.remove('round2-scroll-active');
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
      }
    } catch (err) {
      console.warn('Fullscreen toggle failed:', err);
    }
  };

  // Automatically sync teamPoints whenever updated by team submissions or events
  useEffect(() => {
    const handlePointsSync = () => {
      const savedScore = localStorage.getItem('cyphora_round2_score');
      if (savedScore !== null) {
        const num = parseInt(savedScore, 10);
        if (!isNaN(num)) {
          setTeamPoints(num);
        }
      }
    };
    window.addEventListener('storage', handlePointsSync);
    window.addEventListener('cyphora_points_updated', handlePointsSync);
    return () => {
      window.removeEventListener('storage', handlePointsSync);
      window.removeEventListener('cyphora_points_updated', handlePointsSync);
    };
  }, []);

  // Synchronized Round 2 Countdown Tick Hook — starts ONLY after enters Round 2 app
  useEffect(() => {
    let storedStart = localStorage.getItem('cyphora_round2_started_at');
    const isNewStart = !storedStart;
    if (!storedStart) {
      storedStart = String(Date.now());
      localStorage.setItem('cyphora_round2_started_at', storedStart);
    }

    if (isNewStart) {
      const token = localStorage.getItem('cyphora_token') || sessionStorage.getItem('cyphora_token');
      fetch(`${API_BASE}/api/teams/timer/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ round: 2 })
      }).catch(() => {});
    }

    const startedAtMs = parseInt(storedStart, 10);
    const durMinutes = backendRound2Timer?.duration_minutes || 30;
    const totalSec = durMinutes * 60;

    const tick = () => {
      if (backendRound2Timer?.action === 'pause') {
        setIsTimerRunning(false);
        return;
      }
      const elapsed = Math.max(0, Math.floor((Date.now() - startedAtMs) / 1000));
      const rem = Math.max(0, totalSec - elapsed);
      setSecondsRemaining(rem);
      setIsTimerRunning(rem > 0);
      if (rem <= 0 && !proctorUnlockedRound2) {
        setIsRound2TimerExpired(true);
      } else if (rem > 0) {
        setIsRound2TimerExpired(false);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [backendRound2Timer?.duration_minutes, backendRound2Timer?.action, proctorUnlockedRound2]);

  // Object URL cleanup
  useEffect(() => {
    return () => {
      if (image1PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image1PreviewUrl);
      if (image2PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image2PreviewUrl);
    };
  }, [image1PreviewUrl, image2PreviewUrl]);

  // Remove screen scroll lock dynamically on mount
  useEffect(() => {
    document.documentElement.style.setProperty('overflow-y', 'auto', 'important');
    document.documentElement.style.setProperty('overflow-x', 'hidden', 'important');
    document.documentElement.style.setProperty('max-height', 'none', 'important');
    document.documentElement.style.setProperty('height', 'auto', 'important');

    document.body.style.setProperty('overflow-y', 'auto', 'important');
    document.body.style.setProperty('overflow-x', 'hidden', 'important');
    document.body.style.setProperty('max-height', 'none', 'important');
    document.body.style.setProperty('height', 'auto', 'important');

    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.setProperty('overflow-y', 'visible', 'important');
      rootEl.style.setProperty('overflow-x', 'hidden', 'important');
      rootEl.style.setProperty('max-height', 'none', 'important');
      rootEl.style.setProperty('height', 'auto', 'important');
    }

    return () => {
      document.documentElement.style.removeProperty('overflow-y');
      document.documentElement.style.removeProperty('overflow-x');
      document.documentElement.style.removeProperty('max-height');
      document.documentElement.style.removeProperty('height');

      document.body.style.removeProperty('overflow-y');
      document.body.style.removeProperty('overflow-x');
      document.body.style.removeProperty('max-height');
      document.body.style.removeProperty('height');

      if (rootEl) {
        rootEl.style.removeProperty('overflow-y');
        rootEl.style.removeProperty('overflow-x');
        rootEl.style.removeProperty('max-height');
        rootEl.style.removeProperty('height');
      }
    };
  }, []);

  // Accuracy-Based Points Calculation (50 PTS per Image, Max 100 PTS)
  const totalRound2Seconds = backendRound2Timer?.duration_minutes
    ? backendRound2Timer.duration_minutes * 60
    : ROUND_2_DURATION_SECONDS;
  const elapsedSeconds = Math.max(0, totalRound2Seconds - secondsRemaining);
  const currentPotentialTotal = MAX_ROUND_2_POINTS;

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleBack = () => {
    setIsCodeModalOpen(true);
  };

  const handleVerifyUnlockCode = () => {
    const allowedCodes = ['4815', '1623', '4242', '0000']; 
    if (allowedCodes.includes(unlockCode.trim())) {
      // Clear all Round 2 session state so a new team starts fresh
      const keysToRemove = [
        'cyphora_round2_started',
        'cyphora_round2_phase',
        'cyphora_round2_score',
        'cyphora_round2_start_time',
        'cyphora_round2_started_at',
        'cyphora_round2_prompt',
        'cyphora_round2_image1_cached_url',
        'cyphora_round2_image1_data',
        'cyphora_round2_speed'
      ];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Redirect to round 3
      window.location.href = '/round3/index.html';
    } else {
      setUnlockError('Invalid authorization code.');
    }
  };

  // Handlers for Image 1
  const handleSelectImage1 = (file, customError) => {
    setFormTouched(true);
    setFormGlobalError('');
    if (customError) {
      setImage1Error(customError);
      setImage1File(null);
      if (image1PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image1PreviewUrl);
      setImage1PreviewUrl('');
      return;
    }
    if (!file) {
      setImage1Error('Image 1 is required.');
      setImage1File(null);
      setImage1PreviewUrl('');
      return;
    }
    setImage1Error('');
    setImage1File(file);
    const url = URL.createObjectURL(file);
    setImage1PreviewUrl(url);
    localStorage.setItem('cyphora_round2_image1_cached_url', url);
  };

  const handleRemoveImage1 = () => {
    if (image1PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image1PreviewUrl);
    setImage1File(null);
    setImage1PreviewUrl('');
    localStorage.removeItem('cyphora_round2_image1_cached_url');
    setImage1Error('Image 1 is required.');
  };

  // Handlers for Image 2
  const handleSelectImage2 = (file, customError) => {
    setFormTouched(true);
    setFormGlobalError('');
    if (customError) {
      setImage2Error(customError);
      setImage2File(null);
      if (image2PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image2PreviewUrl);
      setImage2PreviewUrl('');
      return;
    }
    if (!file) {
      setImage2Error('Image 2 is required.');
      setImage2File(null);
      setImage2PreviewUrl('');
      return;
    }
    setImage2Error('');
    setImage2File(file);
    setImage2PreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveImage2 = () => {
    if (image2PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image2PreviewUrl);
    setImage2File(null);
    setImage2PreviewUrl('');
    setImage2Error('Image 2 is required.');
  };

  // Prompt change
  const handlePromptChange = (val) => {
    setPrompt(val);
    setPromptTouched(true);
    setFormGlobalError('');
    localStorage.setItem('cyphora_round2_prompt', val);
    if (!val.trim()) {
      setPromptError('Prompt is required.');
    } else if (val.trim().length < 10) {
      setPromptError('Prompt must be at least 10 characters.');
    } else {
      setPromptError('');
    }
  };

  // =========================================================================
  // STEP 1 SUBMIT: Evaluate Image 1 and unlock Image 2 slot
  // =========================================================================
  const handleSubmitImage1 = async (e) => {
    e.preventDefault();
    setFormTouched(true);
    setPromptTouched(true);

    let hasError = false;
    if (!prompt.trim() || prompt.trim().length < 10) {
      setPromptError('Please provide a prompt describing your recreation (minimum 10 chars).');
      hasError = true;
    } else {
      setPromptError('');
    }

    if (!image1File && !image1PreviewUrl) {
      setImage1Error('Please upload Image 1 before submitting.');
      hasError = true;
    } else {
      setImage1Error('');
    }

    if (hasError) {
      setFormGlobalError('Please resolve the highlighted errors before submitting Image 1.');
      return;
    }

    setFormGlobalError('');
    setIsSubmitting(true);

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDevPort = window.location.port && window.location.port !== '8000';
      const apiBase = isDevPort ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || sessionStorage.getItem('cyphora_token') || '';
      const teamId = localStorage.getItem('cyphora_team_id') || sessionStorage.getItem('cyphora_team_id') || '';
      const storedTeamName = localStorage.getItem('cyphora_team_name') || sessionStorage.getItem('cyphora_team_name') || teamName || '';

      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const image1Base64 = image1File ? await getBase64(image1File) : null;

      let simMatch = '0%';
      let phase1Points = 0;

      const res = await fetch(`${apiBase}/api/stage2/evaluate-image1`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(teamId ? { 'X-Team-Id': String(teamId) } : {}),
          ...(storedTeamName ? { 'X-Team-Name': storedTeamName } : {})
        },
        body: JSON.stringify({
          team_name: storedTeamName || teamName,
          prompt: prompt.trim(),
          image1_filename: image1File?.name || 'image_1.png',
          image1_base64: image1Base64,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Evaluation server responded with error ${res.status}`);
      }

      const resJson = await res.json();
      if (resJson.similarity) {
        simMatch = resJson.similarity;
        const simParsed = parseFloat(resJson.similarity.replace('%', ''));
        if (!isNaN(simParsed)) {
          phase1Points = Math.round(50 * (simParsed / 100));
        }
      }
      if (resJson.points !== undefined) {
        phase1Points = resJson.points;
      }
      if (resJson.new_total_score !== undefined) {
        localStorage.setItem('cyphora_team_score', resJson.new_total_score.toString());
      }

      const evalData = {
        fileName: image1File?.name || 'image_1.png',
        similarity: simMatch,
        score: phase1Points,
        prompt: prompt.trim(),
        submittedAt: new Date().toLocaleTimeString(),
      };

      setImage1EvaluatedData(evalData);
      localStorage.setItem('cyphora_round2_image1_data', JSON.stringify(evalData));
      localStorage.setItem('cyphora_round2_phase', '2');
      localStorage.setItem('cyphora_round2_score', phase1Points.toString());

      // Update live points bar & trigger celebration modal
      setTeamPoints(phase1Points);
      setPointsDelta(phase1Points);
      window.dispatchEvent(new Event('cyphora_points_updated'));
      setShowImage1Modal(true);
      setRound2Phase(2);

      // --- Temple Effect: First Fragment ---
      triggerFirstFragmentEffect(phase1Points);
      
      setPrompt('');
      setPromptTouched(false);
      localStorage.removeItem('cyphora_round2_prompt');

      setPhaseSuccessNotice(
        `✓ Image 1 evaluated (+${phase1Points} pts out of 50 max)! Slot for Image 2 is now unlocked.`
      );
    } catch {
      setFormGlobalError('Error communicating with evaluation server. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // STEP 2 SUBMIT: Evaluate Image 2 with final Speed Bonus
  // =========================================================================
  const handleSubmitImage2 = async (e) => {
    e.preventDefault();
    setFormTouched(true);

    if (!image2File) {
      setImage2Error('Image 2 is required for final speed evaluation.');
      setFormGlobalError('Please upload Image 2 to complete the round.');
      return;
    }

    setFormGlobalError('');
    setIsSubmitting(true);

    const finalElapsed = Math.max(0, totalRound2Seconds - secondsRemaining);
    const formattedSpeed = formatTime(finalElapsed);
    const image1Points = image1EvaluatedData?.score || 0;

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDevPort = window.location.port && window.location.port !== '8000';
      const apiBase = isDevPort ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || sessionStorage.getItem('cyphora_token') || '';
      const teamId = localStorage.getItem('cyphora_team_id') || sessionStorage.getItem('cyphora_team_id') || '';
      const storedTeamName = localStorage.getItem('cyphora_team_name') || sessionStorage.getItem('cyphora_team_name') || teamName || '';

      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const slot3Base64 = image2File ? await getBase64(image2File) : null;

      let image2Points = 0;
      let image2Similarity = '0%';
      let finalTotalPoints = image1Points;

      const res = await fetch(`${apiBase}/api/stage2/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(teamId ? { 'X-Team-Id': String(teamId) } : {}),
          ...(storedTeamName ? { 'X-Team-Name': storedTeamName } : {})
        },
        body: JSON.stringify({
          team_name: storedTeamName || teamName,
          prompt: prompt.trim(),
          slot2_filename: image1EvaluatedData?.fileName || 'image_1.png',
          slot3_filename: image2File.name,
          slot3_base64: slot3Base64,
          elapsed_seconds: finalElapsed,
          remaining_seconds: secondsRemaining,
          calculated_points: 0,
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `Evaluation server responded with error ${res.status}`);
      }

      const resData = await res.json();
      if (resData.image2_points !== undefined) {
        image2Points = resData.image2_points;
      } else if (resData.points_awarded !== undefined) {
        image2Points = resData.points_awarded;
      } else if (resData.image2_similarity) {
        const simParsed = parseFloat(resData.image2_similarity.replace('%', ''));
        if (!isNaN(simParsed)) {
          image2Points = Math.round(50 * (simParsed / 100));
        }
      }

      // Time taken score evaluation (max 50 points based on speed efficiency)
      let timeBonus = 0;
      if (resData.time_score !== undefined) {
        timeBonus = resData.time_score;
      } else if (secondsRemaining > 0) {
        const speedFactor = Math.min(1, Math.max(0, secondsRemaining / totalRound2Seconds));
        timeBonus = Math.max(5, Math.round(50 * speedFactor));
      }

      finalTotalPoints = image1Points + image2Points + timeBonus;
      if (resData.round2_score !== undefined) {
        finalTotalPoints = resData.round2_score;
      }

      if (resData.image2_similarity) {
        image2Similarity = resData.image2_similarity;
      }
      if (resData.new_total_score !== undefined) {
        localStorage.setItem('cyphora_team_score', resData.new_total_score.toString());
      }
      setEvaluatedScore(finalTotalPoints);

      const payload = {
        team: teamName,
        prompt: prompt.trim(),
        image1Name: image1EvaluatedData?.fileName || 'image_1.png',
        image2Name: image2File.name,
        image1Similarity: image1EvaluatedData?.similarity || '0.0%',
        image1Points: image1Points,
        image2Similarity: image2Similarity,
        image2Points: image2Points,
        timeCompleted: formattedSpeed,
        speedBonus: timeBonus,
        timeScore: timeBonus,
        totalPoints: finalTotalPoints,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Persist in local storage
      localStorage.setItem('cyphora_round2_score', finalTotalPoints.toString());
      localStorage.setItem('cyphora_round2_speed', formattedSpeed);
      localStorage.setItem('cyphora_round2_time_score', timeBonus.toString());
      const prevSubmissions = JSON.parse(localStorage.getItem('cyphora_round2_submissions') || '[]');
      prevSubmissions.push(payload);
      localStorage.setItem('cyphora_round2_submissions', JSON.stringify(prevSubmissions));

      setTeamPoints(finalTotalPoints);
      setTimeScore(timeBonus);
      setPointsDelta(image2Points + timeBonus);
      window.dispatchEvent(new Event('cyphora_points_updated'));
      setSubmittedData(payload);
      setShowImage2Modal(true);
      setIsTimerRunning(false);

      // --- Temple Effect: Final Fragment with Time Score ---
      triggerFinalFragmentEffect(image1Points, image2Points, timeBonus);
      
      setPrompt('');
      setPromptTouched(false);
      localStorage.removeItem('cyphora_round2_prompt');
    } catch (err) {
      setFormGlobalError(err?.message || 'Error communicating with evaluation server. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================================================================
  // TEMPLE EFFECT FUNCTIONS
  // =========================================================================

  /**
   * triggerFirstFragmentEffect(score)
   * Rumbles the screen, swaps background to the half-visible temple image,
   * and reveals the First Fragment Modal after a 1-second delay.
   */
  const triggerFirstFragmentEffect = useCallback((score) => {
    // 1. Screen rumble
    setIsRumbling(true);
    setTimeout(() => setIsRumbling(false), 1200);

    // 2. Swap bg to half-visible temple (round3image1)
    setBgLayerSrc('/assets/background/round3image1.png');

    // 3. Show First Fragment Modal after 1.8 seconds cutscene
    setFragment1Score(score);
    setTimeout(() => {
      setShowFirstFragmentModal(true);
    }, 1800);
  }, []);

  /**
   * triggerFinalFragmentEffect(score1, score2)
   * Rumbles the screen, swaps background to the fully-visible temple image,
   * and reveals the Final Fragment Modal after a 1.8-second delay.
   */
  const triggerFinalFragmentEffect = useCallback((score1, score2, timeSc = 0) => {
    // 1. Screen rumble
    setIsRumbling(true);
    setTimeout(() => setIsRumbling(false), 1200);

    // 2. Swap bg to fully-visible temple (round3image2)
    setBgLayerSrc('/assets/background/round3image2.png');

    // 3. Show Final Fragment Modal after 1.8 seconds cutscene
    setFragment1Score(score1);
    setFragment2Score(score2);
    setTimeScore(timeSc);
    setTimeout(() => {
      setShowFinalFragmentModal(true);
    }, 1800);
  }, []);

  /**
   * dismissFirstModal()
   * Hides the First Fragment Modal and transitions the UI to Phase 2.
   */
  const dismissFirstModal = useCallback(() => {
    setShowFirstFragmentModal(false);
    // setRound2Phase(2) is already called in handleSubmitImage1;
    // this dismiss simply closes the modal so the user sees the Phase 2 form.
  }, []);

  const handleResetToStep1 = () => {
    if (window.confirm('Reset Round 2 back to Image 1? Current Image 1 evaluation will be cleared.')) {
      setRound2Phase(1);
      setImage1EvaluatedData(null);
      handleRemoveImage1();
      handleRemoveImage2();
      setPhaseSuccessNotice('');
      setFormGlobalError('');
      setTeamPoints(0);
      setPointsDelta(null);
      localStorage.removeItem('cyphora_round2_phase');
      localStorage.removeItem('cyphora_round2_image1_data');
      localStorage.removeItem('cyphora_round2_image1_cached_url');
      localStorage.removeItem('cyphora_round2_score');
      window.dispatchEvent(new Event('cyphora_points_updated'));
    }
  };

  // If user hasn't started yet, display the story prologue
  if (!hasStarted) {
    return (
      <Prologue
        explorerId={teamName}
        onStart={() => {
          localStorage.setItem('cyphora_round2_started', 'true');
          setHasStarted(true);
        }}
        onReturnToHub={handleBack}
      />
    );
  }

  // Urgency color helper
  let timerUrgencyClass = 'timer-normal';
  if (secondsRemaining <= 120) timerUrgencyClass = 'timer-critical';
  else if (secondsRemaining <= 300) timerUrgencyClass = 'timer-warning';

  return (
    <div className={`round2-wrapper${isRumbling ? ' screen-rumble' : ''}`}>
      <div className="round2-ambient-bg" aria-hidden="true" />

      {/* ===== PROGRESSIVE BACKGROUND LAYER ===== */}
      <div
        id="bg-layer"
        aria-hidden="true"
        className={bgLayerSrc ? 'bg-layer-active' : ''}
        style={bgLayerSrc ? { backgroundImage: `url(${bgLayerSrc})` } : {}}
      />

      {/* Screen Reader Skip Link */}
      <a href="#round2-main-content" className="sr-skip-link">
        Skip to main content
      </a>

      {/* Printable Warning */}
      <div className="print-restricted-notice" aria-hidden="true">
        <h2>CYPHORA SECURITY RESTRICTION</h2>
        <p>Printing this evaluation target or prompt assessment sheet is prohibited by symposium protocol.</p>
        <p>Asset ID: ROUND-2-TARGET &bull; Team: {teamName}</p>
      </div>

      {/* Top Navigation Bar */}
      <header className="round2-navbar" role="banner">
        <div className="navbar-left">
          <div className="navbar-title-wrap">
            <div className="stage-tag">
              <Compass size={14} />
              <span>ROUND 2</span>
            </div>
            <h1 className="page-heading">IMAGE NAVIGATION</h1>

            {/* Points bar for current team playing */}
            <div className="current-team-pts-bar" title="Points Earned by Current Team">
              <Award size={15} className="gold-text" />
              <span className="pts-bar-label">PTS:</span>
              <span className="pts-bar-number gold-text">{teamPoints}</span>
              {pointsDelta && (
                <span className="pts-delta-badge">+{pointsDelta}</span>
              )}
            </div>
          </div>
        </div>

        <div className="navbar-right">

          {/* Fullscreen Button */}
          <button
            type="button"
            className="round2-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title="Toggle Fullscreen"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#d1c7b7',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem'
            }}
          >
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          {/* Phase Badge */}
          <div className="phase-pill-badge">
            {round2Phase === 1 ? 'Step 1: Image 1' : 'Step 2: Image 2'}
          </div>

          <button
            type="button"
            className="leaderboard-nav-btn"
            onClick={() => setIsLeaderboardOpen(true)}
            title="View Live Standings"
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#d1c7b7',
              padding: '6px 12px',
              borderRadius: '6px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.8rem'
            }}
          >
            <Trophy size={14} className="gold-text" />
            <span>Standings</span>
          </button>

          {/* Current Team Chip */}
          <div className="team-status-chip">
            <span className="chip-label">Workstation</span>
            <span className="chip-name">{teamName}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main id="round2-main-content" className="round2-main" role="main">
        {/* ================= 15-MINUTE GAME HUD & SPEED BONUS METER ================= */}
        <section className="round2-hud-banner" aria-label="Round 2 Live Status and Speed Clock">
          <div className="hud-timer-col">
            <div className="hud-label-row">
              <div className="hud-title-wrap">
                <Clock size={16} className="gold-text" />
                <span className="hud-title">{Math.round(totalRound2Seconds / 60)}-MINUTE GAME CLOCK</span>
              </div>
              <span className={`hud-time-digits ${timerUrgencyClass}`}>
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <div className="hud-progress-track">
              <div 
                className={`hud-progress-fill ${timerUrgencyClass}`}
                style={{ width: `${Math.min(100, Math.max(0, (secondsRemaining / totalRound2Seconds) * 100))}%` }}
              />
            </div>

          </div>

          <div className="hud-points-col">
            <div className="speed-bonus-box">
              <div className="speed-icon-wrap">
                <Flame size={20} className="gold-text" />
              </div>
              <div className="speed-text-wrap">
                <span className="speed-label">ACCURACY & SPEED SCORING</span>
                <div className="points-tally">
                  <span className="base-pts">50 PTS / Image</span>
                  <span className="plus-sign">+</span>
                  <span className="bonus-pts gold-text">Speed Bonus</span>
                  <span className="equals-sign">=</span>
                  <span className="total-pts gold-text">Max 150 PTS</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Global validation error if triggered */}
        {formGlobalError && (
          <div className="global-error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{formGlobalError}</span>
          </div>
        )}

        {/* Phase transition alert notice */}
        {phaseSuccessNotice && (
          <div className="phase-success-banner" role="status">
            <CheckCircle2 size={18} className="gold-text" />
            <span>{phaseSuccessNotice}</span>
          </div>
        )}

        {/* ================= 2-COLUMN INTERACTIVE ARENA ================= */}
        <form onSubmit={round2Phase === 1 ? handleSubmitImage1 : handleSubmitImage2} noValidate style={{ width: '100%' }}>
          <div className="round2-grid-layout">
            {/* Target Reference Column */}
            <div className="grid-col target-col">

              <ProtectedReferenceImage
                images={['/assets/round2/targets/target1.jpg', '/assets/round2/targets/target2.jpg']}
                alt="Organizer Target Reference Image"
                teamName={teamName}
                initialTimerSeconds={15}
                enableTimer={false}
              />

              {/* Action Submittal Bar — sits under the target image */}
              <div className="form-submit-panel">
                <div className="submit-buttons-row">
                  {round2Phase === 2 && (
                    <button
                      type="button"
                      className="round2-clear-btn"
                      onClick={handleResetToStep1}
                      disabled={isSubmitting}
                      title="Return to Step 1"
                    >
                      <RotateCcw size={15} />
                      <span>Redo Image 1</span>
                    </button>
                  )}
                  <button
                    type="submit"
                    className={`round2-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                    disabled={isSubmitting}
                    aria-busy={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="spinner-dot" aria-hidden="true" />
                        <span>
                          {round2Phase === 1 ? 'Evaluating Image 1...' : 'Transmitting & Finalizing...'}
                        </span>
                      </>
                    ) : round2Phase === 1 ? (
                      <>
                        <Send size={16} />
                        <span>Submit Image 1 for Evaluation</span>
                        <ArrowRight size={15} />
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Image 2 (Finalize Round 2)</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Submission Column: Prompt & Sequential Slots */}
            <div className="grid-col submission-col">
              {/* 1. Prompt Textarea */}
              <PromptSection
                value={prompt}
                onChange={handlePromptChange}
                error={promptError}
                touched={promptTouched}
                minLength={10}
                maxLength={1500}
                phase={round2Phase}
              />

              {/* 2. Sequential Image Upload Component */}
              <ResultImageUpload
                phase={round2Phase}

                // Image 1 props
                image1File={image1File}
                image1PreviewUrl={image1PreviewUrl}
                onSelectImage1={handleSelectImage1}
                onRemoveImage1={handleRemoveImage1}
                image1Error={image1Error}
                image1EvaluatedData={image1EvaluatedData}

                // Image 2 props
                image2File={image2File}
                image2PreviewUrl={image2PreviewUrl}
                onSelectImage2={handleSelectImage2}
                onRemoveImage2={handleRemoveImage2}
                image2Error={image2Error}

                touched={formTouched}
                maxSizeBytes={10 * 1024 * 1024}
                allowedTypes={['image/png', 'image/jpeg', 'image/webp']}
              />
            </div>
          </div>
        </form>

      </main>

      {/* ================= IMAGE 1 EVALUATED CELEBRATION POPUP ================= */}
      {showImage1Modal && (
        <div
          className="submission-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="image1-modal-title"
        >
          <DustParticles count={60} />
          <div className="image1-celebration-card">
            <div className="celebration-icon-wrap">
              <Sparkles size={42} className="gold-text" />
            </div>
            <span className="celebration-tag">ROUND 2 &bull; IMAGE 1 EVALUATED</span>
            <h3 id="image1-modal-title" className="celebration-title">Image 1 Submitted &amp; Verified!</h3>
            
            <div className="celebration-score-pill">
              <span className="pts-plus">+{pointsDelta || image1EvaluatedData?.score || 50}</span>
              <span className="pts-txt">PTS EARNED</span>
            </div>

            <p className="celebration-desc">
              Your prompt re-creation for <strong>Image 1</strong> has been successfully processed. 
              Points ({pointsDelta || image1EvaluatedData?.score || 50}/50 PTS) have been synced with the database and admin panel. 
              The slot for <strong>Image 2</strong> is now unlocked!
            </p>

            <button
              type="button"
              className="celebration-continue-btn"
              onClick={() => setShowImage1Modal(false)}
            >
              <span>Continue to Image 2</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= IMAGE 2 EVALUATED CELEBRATION POPUP ================= */}
      {showImage2Modal && (
        <div
          className="submission-modal-backdrop"
          role="dialog"
          aria-modal="true"
        >
          <DustParticles count={60} />
          <div className="image1-celebration-card">
            <div className="celebration-icon-wrap">
              <Sparkles size={42} className="gold-text" />
            </div>
            <span className="celebration-tag">ROUND 2 &bull; IMAGE 2 EVALUATED</span>
            <h3 className="celebration-title">Image 2 Submitted &amp; Verified!</h3>
            
            <div className="celebration-score-pill">
              <span className="pts-plus">+{submittedData?.image2Points || 50}</span>
              <span className="pts-txt">PTS EARNED</span>
            </div>

            <p className="celebration-desc">
              Your prompt re-creation for <strong>Image 2</strong> has been successfully processed. 
              Points ({submittedData?.image2Points || 50}/50 PTS) have been synced with the database and admin panel!
            </p>

            <button
              type="button"
              className="celebration-continue-btn"
              onClick={() => {
                setShowImage2Modal(false);
                setSubmissionSuccess(true);
              }}
            >
              <span>View Final Results</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* ================= SUCCESS SUBMISSION & SCORING MODAL ================= */}
      {submissionSuccess && submittedData && (
        <div 
          className="submission-modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-success-title"
        >
          <div className="submission-modal-card">
            <div className="modal-icon-badge">
              <Award size={46} className="gold-text" />
            </div>

            <h3 id="modal-success-title">Round 2 Successfully Completed!</h3>
            <p className="modal-description">
              Both Image 1 and Image 2 have been evaluated against their target references.
              Every point scored has been synced in real time with the database and admin panel.
            </p>

            <div className="modal-score-banner">
              <span className="score-banner-label">FINAL EVALUATED ROUND 2 SCORE</span>
              <span className="score-banner-val gold-text">+{evaluatedScore ?? submittedData.totalPoints} / 150 PTS</span>
              <span className="score-banner-sub">
                Completed in {submittedData.timeCompleted} &bull; Image 1: +{submittedData.image1Points} pts &bull; Image 2: +{submittedData.image2Points} pts &bull; Speed Bonus: +{submittedData.speedBonus ?? submittedData.timeScore ?? 0} pts
              </span>
            </div>

            <div className="modal-summary-box">
              <div className="summary-field">
                <span className="summary-label">Explorer Team:</span>
                <span className="summary-value gold-text">{submittedData.team}</span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Image 1 Evaluation:</span>
                <span className="summary-value">
                  +{submittedData.image1Points} pts <span className="gold-text">({submittedData.image1Similarity} match)</span>
                </span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Image 2 (Final Target):</span>
                <span className="summary-value">
                  +{submittedData.image2Points} pts <span className="gold-text">({submittedData.image2Similarity} match)</span>
                </span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Speed / Time Score:</span>
                <span className="summary-value">
                  +{submittedData.speedBonus ?? submittedData.timeScore ?? 0} pts <span className="gold-text">({submittedData.timeCompleted} elapsed)</span>
                </span>
              </div>
              <div className="summary-prompt-preview">
                <span className="summary-label">Logged Prompts:</span>
                {image1EvaluatedData?.prompt && (
                  <div style={{ marginBottom: '8px' }}>
                    <span className="summary-value" style={{ fontSize: '13px', color: '#c9a653' }}>Image 1 Prompt:</span>
                    <p className="prompt-quote">&ldquo;{image1EvaluatedData.prompt}&rdquo;</p>
                  </div>
                )}
                <div>
                  <span className="summary-value" style={{ fontSize: '13px', color: '#c9a653' }}>Image 2 Prompt:</span>
                  <p className="prompt-quote">&ldquo;{submittedData.prompt}&rdquo;</p>
                </div>
              </div>
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                className="modal-primary-btn"
                onClick={() => {
                  // Keep the success modal open underneath the drawer
                  // so that when the user closes the leaderboard, they return here.
                  setIsLeaderboardOpen(true);
                }}
              >
                <Trophy size={16} /> View Live Standings
              </button>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={handleBack}
              >
                Unlock the Final Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FINAL ROUND UNLOCK MODAL ================= */}
      {isCodeModalOpen && (
        <div 
          className="submission-modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
        >
          <div className="submission-modal-card" style={{ maxWidth: '400px', alignItems: 'center' }}>
            <div className="modal-icon-badge" style={{ marginBottom: '1rem' }}>
              <CheckCircle size={36} className="gold-text" />
            </div>
            
            <h3 style={{ color: '#c9a653', marginTop: '0', marginBottom: '0.5rem', fontSize: '1.25rem', letterSpacing: '2px', textTransform: 'uppercase' }}>Authorize Access</h3>
            <p style={{ color: '#d1c7b7', fontSize: '0.9rem', marginBottom: '1.5rem', textAlign: 'center', lineHeight: '1.4' }}>
              Enter your 4-digit expedition code to unlock Round 3.
            </p>
            
            <input 
              type="text" 
              maxLength="4"
              value={unlockCode}
              onChange={(e) => {
                setUnlockCode(e.target.value);
                setUnlockError('');
              }}
              placeholder="XXXX"
              style={{
                width: '140px',
                textAlign: 'center',
                letterSpacing: '8px',
                fontSize: '1.5rem',
                padding: '12px 10px',
                background: 'rgba(0, 0, 0, 0.5)',
                border: '1px solid rgba(201, 166, 83, 0.4)',
                color: '#fff',
                borderRadius: '6px',
                outline: 'none',
                marginBottom: '1rem'
              }}
            />

            {unlockError && (
              <div style={{ color: '#ff6b6b', fontSize: '0.8rem', marginBottom: '1rem' }}>
                <AlertTriangle size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '4px' }} />
                {unlockError}
              </div>
            )}

            <div className="modal-actions-bar" style={{ marginTop: '1rem', width: '100%' }}>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={() => {
                  setIsCodeModalOpen(false);
                  setUnlockCode('');
                  setUnlockError('');
                }}
                style={{ flex: 1, padding: '10px 0' }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="modal-primary-btn"
                onClick={handleVerifyUnlockCode}
                style={{ flex: 1, padding: '10px 0' }}
              >
                Verify & Unlock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FIRST FRAGMENT MODAL (Ancient Temple) ================= */}
      {showFirstFragmentModal && (
        <div
          className="temple-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-fragment-modal-title"
        >
          <div className="temple-modal-slab">
            <div className="temple-modal-rune-border" aria-hidden="true" />
            <div className="temple-modal-inner">
              <div className="temple-modal-glyph" aria-hidden="true">𓂀</div>
              <span className="temple-modal-tag">ROUND 2 ✦ FIRST RUNE ALIGNED</span>
              <h3 id="first-fragment-modal-title" className="temple-modal-title">
                First Rune Aligned —<br />The Temple Gateway Shifts!
              </h3>
              <div className="temple-modal-score-stone">
                <span className="temple-score-label">FRAGMENT I MATCH SCORE</span>
                <span className="temple-score-value">{fragment1Score}<span className="temple-score-unit"> / 50 PTS</span></span>
              </div>
              <p className="temple-modal-desc">
                The ancient runes stir. Stone grinds against stone as the gateway
                begins to reveal itself from centuries of overgrowth.
                The second fragment awaits alignment.
              </p>
              <button
                type="button"
                id="first-fragment-proceed-btn"
                className="temple-modal-btn"
                onClick={dismissFirstModal}
              >
                ✦ Proceed to Final Fragment ✦
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FINAL FRAGMENT MODAL (Ancient Temple) ================= */}
      {showFinalFragmentModal && (
        <div
          className="temple-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="final-fragment-modal-title"
        >
          <div className="temple-modal-slab temple-modal-slab--final">
            <div className="temple-modal-rune-border" aria-hidden="true" />
            <div className="temple-modal-inner">
              <div className="temple-modal-glyph temple-modal-glyph--final" aria-hidden="true">𓆣</div>
              <span className="temple-modal-tag temple-modal-tag--final">ROUND 2 ✦ GATEWAY UNSEALED</span>
              <h3 id="final-fragment-modal-title" className="temple-modal-title temple-modal-title--final">
                Gateway Unsealed!<br />The Path to the Inner Temple is Open.
              </h3>
              <div className="temple-modal-score-row">
                <div className="temple-modal-score-stone">
                  <span className="temple-score-label">FRAGMENT I</span>
                  <span className="temple-score-value">{fragment1Score}<span className="temple-score-unit"> PTS</span></span>
                </div>
                <div className="temple-score-divider" aria-hidden="true">+</div>
                <div className="temple-modal-score-stone">
                  <span className="temple-score-label">FRAGMENT II</span>
                  <span className="temple-score-value">{fragment2Score}<span className="temple-score-unit"> PTS</span></span>
                </div>
                <div className="temple-score-divider" aria-hidden="true">+</div>
                <div className="temple-modal-score-stone">
                  <span className="temple-score-label">SPEED BONUS</span>
                  <span className="temple-score-value">{timeScore}<span className="temple-score-unit"> PTS</span></span>
                </div>
                <div className="temple-score-divider" aria-hidden="true">=</div>
                <div className="temple-modal-score-stone temple-modal-score-stone--total">
                  <span className="temple-score-label">TOTAL ROUND 2</span>
                  <span className="temple-score-value">{fragment1Score + fragment2Score + timeScore}<span className="temple-score-unit"> / 150</span></span>
                </div>
              </div>
              <p className="temple-modal-desc">
                Both runes are aligned. The carved stone gate groans open, vines
                parting to reveal the amber-lit corridor of the Inner Temple.
                Present this seal to your expedition guide.
              </p>
              <button
                type="button"
                id="final-fragment-proceed-btn"
                className="temple-modal-btn temple-modal-btn--final"
                onClick={() => {
                  setShowFinalFragmentModal(false);
                  setIsCodeModalOpen(true);
                }}
              >
                🏛 Enter Temple: Proceed to Round 3
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= LEADERBOARD DRAWER ================= */}
      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentTeamName={teamName}
        currentTeamScore={teamPoints}
        currentTeamSpeed={
          submittedData?.timeCompleted ||
          localStorage.getItem('cyphora_round2_speed') ||
          (secondsRemaining < totalRound2Seconds ? formatTime(elapsedSeconds) : '--:--')
        }
      />

      {/* ── ROUND 2 TIME EXPIRED FULL-SCREEN LOCKOUT ── */}
      {isRound2TimerExpired && !proctorUnlockedRound2 && (
        <RoundTimerLockScreen
          round={2}
          roundName="Round 2 — Image Navigation"
          teamName={teamName}
          onUnlockOverride={() => {
            setProctorUnlockedRound2(true);
            setIsRound2TimerExpired(false);
          }}
        />
      )}
    </div>
  );
}

export default Round2Page;
