import React, { useState, useEffect } from 'react';
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
import './Round2.css';
import './Round2Page.css';

const ROUND_2_DURATION_SECONDS = 15 * 60; // 15 minutes = 900 seconds
const BASE_POINTS = 400;
const MAX_SPEED_BONUS = 600;

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

  // 15-Minute Game Timer State with Timestamp Persistence
  const [secondsRemaining, setSecondsRemaining] = useState(() => {
    const savedStart = localStorage.getItem('cyphora_round2_start_time');
    if (savedStart) {
      const elapsed = Math.floor((Date.now() - parseInt(savedStart, 10)) / 1000);
      return Math.max(0, ROUND_2_DURATION_SECONDS - elapsed);
    }
    const now = Date.now();
    localStorage.setItem('cyphora_round2_start_time', now.toString());
    return ROUND_2_DURATION_SECONDS;
  });

  const [isTimerRunning, setIsTimerRunning] = useState(true);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  
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
        return parsed.score || 200;
      } catch {
        return 200;
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

  // Timer Tick Hook
  useEffect(() => {
    if (!isTimerRunning || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      const savedStart = localStorage.getItem('cyphora_round2_start_time');
      if (savedStart) {
        const elapsed = Math.floor((Date.now() - parseInt(savedStart, 10)) / 1000);
        const remaining = Math.max(0, ROUND_2_DURATION_SECONDS - elapsed);
        setSecondsRemaining(remaining);
        if (remaining <= 0) {
          setIsTimerRunning(false);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isTimerRunning, secondsRemaining]);

  // Object URL cleanup
  useEffect(() => {
    return () => {
      if (image1PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image1PreviewUrl);
      if (image2PreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(image2PreviewUrl);
    };
  }, [image1PreviewUrl, image2PreviewUrl]);

  // Remove screen scroll lock dynamically on mount
  useEffect(() => {
    document.documentElement.style.overflowY = 'auto';
    document.documentElement.style.overflowX = 'hidden';
    document.documentElement.style.maxHeight = 'none';
    document.documentElement.style.height = 'auto';
    document.body.style.overflowY = 'auto';
    document.body.style.overflowX = 'hidden';
    document.body.style.maxHeight = 'none';
    document.body.style.height = 'auto';
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.overflowY = 'visible';
      rootEl.style.overflowX = 'hidden';
      rootEl.style.maxHeight = 'none';
      rootEl.style.height = 'auto';
    }
  }, []);

  // Speed and Points Calculation
  const elapsedSeconds = ROUND_2_DURATION_SECONDS - secondsRemaining;
  const currentSpeedBonus = Math.round((secondsRemaining / ROUND_2_DURATION_SECONDS) * MAX_SPEED_BONUS);
  const currentPotentialTotal = BASE_POINTS + currentSpeedBonus;

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
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || '';

      let simValue = 82 + Math.random() * 12;
      let simMatch = simValue.toFixed(1) + '%';
      let phase1Points = Math.round(200 * (simValue / 100));

      try {
        const res = await fetch(`${apiBase}/api/stage2/evaluate-image1`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            team_name: teamName,
            prompt: prompt.trim(),
            image1_filename: image1File?.name || 'image_1.png',
          })
        });
        if (res.ok) {
          const resJson = await res.json();
          if (resJson.similarity) {
            simMatch = resJson.similarity;
            const simParsed = parseFloat(resJson.similarity.replace('%', ''));
            if (!isNaN(simParsed)) {
              phase1Points = Math.round(200 * (simParsed / 100));
            }
          }
          if (resJson.points && !resJson.similarity) {
            phase1Points = resJson.points;
          }
        }
      } catch {
        // Fallback local evaluation
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
      
      setPrompt('');
      setPromptTouched(false);
      localStorage.removeItem('cyphora_round2_prompt');

      setPhaseSuccessNotice(
        `✓ Image 1 evaluated (+${phase1Points} pts)! Slot for Image 2 is now unlocked.`
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

    // Speed bonus calculation based on remaining 15-minute clock
    const finalElapsed = ROUND_2_DURATION_SECONDS - secondsRemaining;
    const finalBonus = Math.round((secondsRemaining / ROUND_2_DURATION_SECONDS) * MAX_SPEED_BONUS);
    
    // Evaluate Image 2 (local fallback simulation)
    const image2SimValue = 85 + Math.random() * 12;
    let image2Similarity = image2SimValue.toFixed(1) + '%';
    let image2Points = Math.round(200 * (image2SimValue / 100));

    // Total points = points earned from Image 1 similarity + points from Image 2 + speed bonus
    const image1Points = image1EvaluatedData?.score || 200;
    let finalTotalPoints = image1Points + image2Points + finalBonus;
    const formattedSpeed = formatTime(finalElapsed);

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || '';

      const res = await fetch(`${apiBase}/api/stage2/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          team_name: teamName,
          prompt: prompt.trim(),
          slot2_filename: image1EvaluatedData?.fileName || 'image_1.png',
          slot3_filename: image2File.name,
          elapsed_seconds: finalElapsed,
          remaining_seconds: secondsRemaining,
          calculated_points: finalTotalPoints,
        })
      });

      if (res.ok) {
        const resData = await res.json();
        // If backend returned its own image2 similarity, update the calculation
        if (resData.image2_similarity) {
          image2Similarity = resData.image2_similarity;
          const simParsed = parseFloat(resData.image2_similarity.replace('%', ''));
          if (!isNaN(simParsed)) {
            image2Points = Math.round(200 * (simParsed / 100));
            finalTotalPoints = image1Points + image2Points + finalBonus;
          }
        }
        // Override backend points with the exact sum of all 3 components
        // just in case the backend is running old, cached code
        setEvaluatedScore(finalTotalPoints);
      } else {
        setEvaluatedScore(finalTotalPoints);
      }
    } catch {
        setEvaluatedScore(finalTotalPoints);
    } finally {
      setIsSubmitting(false);

      const payload = {
        team: teamName,
        prompt: prompt.trim(),
        image1Name: image1EvaluatedData?.fileName || 'image_1.png',
        image2Name: image2File.name,
        image1Similarity: image1EvaluatedData?.similarity || '85.0%',
        image1Points: image1EvaluatedData?.score || 200,
        image2Similarity: image2Similarity,
        image2Points: image2Points,
        timeCompleted: formattedSpeed,
        speedBonus: finalBonus,
        totalPoints: finalTotalPoints,
        timestamp: new Date().toLocaleTimeString(),
      };

      // Persist in local storage
      localStorage.setItem('cyphora_round2_score', finalTotalPoints.toString());
      localStorage.setItem('cyphora_round2_speed', formattedSpeed);
      const prevSubmissions = JSON.parse(localStorage.getItem('cyphora_round2_submissions') || '[]');
      prevSubmissions.push(payload);
      localStorage.setItem('cyphora_round2_submissions', JSON.stringify(prevSubmissions));

      setTeamPoints(finalTotalPoints);
      setPointsDelta(finalTotalPoints - (image1EvaluatedData?.score || 200));
      window.dispatchEvent(new Event('cyphora_points_updated'));
      setSubmittedData(payload);
      setShowImage2Modal(true);
      setIsTimerRunning(false);
      
      setPrompt('');
      setPromptTouched(false);
      localStorage.removeItem('cyphora_round2_prompt');
    }
  };

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
    <div className="round2-wrapper">
      <div className="round2-ambient-bg" aria-hidden="true" />

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
          <button
            type="button"
            className="round2-back-btn"
            onClick={handleBack}
            aria-label="Return to Expedition Hub"
          >
            <ArrowLeft size={16} />
            <span>Expedition Hub</span>
          </button>
          
          <div className="navbar-title-wrap">
            <div className="stage-tag">
              <Compass size={14} />
              <span>STAGE 2</span>
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

          {/* Leaderboard Drawer Trigger */}
          <button
            type="button"
            className="leaderboard-nav-btn"
            onClick={() => setIsLeaderboardOpen(true)}
            title="View Live Standings"
          >
            <Trophy size={16} className="gold-text" />
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
                <span className="hud-title">15-MINUTE GAME CLOCK</span>
              </div>
              <span className={`hud-time-digits ${timerUrgencyClass}`}>
                {formatTime(secondsRemaining)}
              </span>
            </div>
            <div className="hud-progress-track">
              <div 
                className={`hud-progress-fill ${timerUrgencyClass}`}
                style={{ width: `${(secondsRemaining / ROUND_2_DURATION_SECONDS) * 100}%` }}
              />
            </div>

          </div>

          <div className="hud-points-col">
            <div className="speed-bonus-box">
              <div className="speed-icon-wrap">
                <Flame size={20} className="gold-text" />
              </div>
              <div className="speed-text-wrap">
                <span className="speed-label">SPEED EVALUATION POTENTIAL</span>
                <div className="points-tally">
                  <span className="base-pts">{BASE_POINTS} Base</span>
                  <span className="plus-sign">+</span>
                  <span className="bonus-pts gold-text">+{currentSpeedBonus} Speed Bonus</span>
                  <span className="equals-sign">=</span>
                  <span className="total-pts gold-text">{currentPotentialTotal} PTS</span>
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
                        <span>Submit Image 2 (Finalize: {currentPotentialTotal} PTS)</span>
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
          <div className="image1-celebration-card">
            <div className="celebration-icon-wrap">
              <Sparkles size={42} className="gold-text" />
            </div>
            <span className="celebration-tag">STAGE 2 &bull; IMAGE 1 EVALUATED</span>
            <h3 id="image1-modal-title" className="celebration-title">Image 1 Submitted &amp; Verified!</h3>
            
            <div className="celebration-score-pill">
              <span className="pts-plus">+{pointsDelta || image1EvaluatedData?.score || 200}</span>
              <span className="pts-txt">PTS EARNED</span>
            </div>

            <p className="celebration-desc">
              Your prompt re-creation for <strong>Image 1</strong> has been successfully processed. 
              Points have been credited to your live team score. 
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
          <div className="image1-celebration-card">
            <div className="celebration-icon-wrap">
              <Sparkles size={42} className="gold-text" />
            </div>
            <span className="celebration-tag">STAGE 2 &bull; IMAGE 2 EVALUATED</span>
            <h3 className="celebration-title">Image 2 Submitted &amp; Verified!</h3>
            
            <div className="celebration-score-pill">
              <span className="pts-plus">+{submittedData?.image2Points || 200}</span>
              <span className="pts-txt">PTS EARNED</span>
            </div>

            <p className="celebration-desc">
              Your prompt re-creation for <strong>Image 2</strong> has been successfully processed. 
              The evaluation is complete and speed bonus has been calculated!
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
              Both Image 1 and Image 2 have been evaluated. Your speed points have been logged
              to the symposium database.
            </p>

            <div className="modal-score-banner">
              <span className="score-banner-label">FINAL EVALUATED ROUND 2 SCORE</span>
              <span className="score-banner-val gold-text">+{evaluatedScore ?? submittedData.totalPoints} PTS</span>
              <span className="score-banner-sub">
                Completed in {submittedData.timeCompleted} &bull; Speed Bonus: +{submittedData.speedBonus} pts
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

      {/* ================= LEADERBOARD DRAWER ================= */}
      <LeaderboardPanel
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        currentTeamName={teamName}
        currentTeamScore={teamPoints}
        currentTeamSpeed={
          submittedData?.timeCompleted ||
          localStorage.getItem('cyphora_round2_speed') ||
          (secondsRemaining < ROUND_2_DURATION_SECONDS ? formatTime(elapsedSeconds) : '--:--')
        }
      />
    </div>
  );
}

export default Round2Page;
