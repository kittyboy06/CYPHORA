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
  CheckCircle2,
  Maximize,
  Minimize
} from 'lucide-react';
import { ProtectedReferenceImage } from './components/ProtectedReferenceImage.jsx';
import { PromptSection } from './components/PromptSection.jsx';
import { ResultImageUpload } from './components/ResultImageUpload.jsx';
import './Round2.css';

/**
 * Round2Page Component
 * 
 * Main container for Stage 2: Image Navigation.
 * Orchestrates the protected target observation, participant prompt generation,
 * output image submission, and validation pipeline.
 */
export function Round2Page({ onReturnToHub }) {
  // Team state retrieved from local storage or default
  const [teamName, setTeamName] = useState(() => {
    return localStorage.getItem('cyphora_team_name') || 'Wandering Nomad';
  });

  // Form states
  const [prompt, setPrompt] = useState('');
  const [promptTouched, setPromptTouched] = useState(false);
  const [promptError, setPromptError] = useState('');

  const [resultFile, setResultFile] = useState(null);
  const [resultPreviewUrl, setResultPreviewUrl] = useState('');
  const [uploadTouched, setUploadTouched] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Submission lifecycle states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const [formGlobalError, setFormGlobalError] = useState('');

  // Fullscreen state tracking (Allowed and unrestricted in Round 2)
  const [isFullscreen, setIsFullscreen] = useState(() => {
    return typeof document !== 'undefined' ? !!document.fullscreenElement : false;
  });

  useEffect(() => {
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return (
    <div className="protected-image-container">
      <div
        className={`image-wrapper ${!isFocused ? 'blurred' : ''}`}
        onContextMenu={(e) => e.preventDefault()}
      >
        {!imgError ? (
          <img
            src={src}
            alt={alt}
            className="reference-image"
            draggable="false"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="image-placeholder">
            <p>📷 Target Reference Image</p>
            <span>(Place image at: <code>{src}</code>)</span>
          </div>
        )}
        <div className="watermark-overlay">{watermarkText}</div>
        <div className="interaction-blocker"></div>
      </div>

      <div className="asset-protection-box">
        <div className="protection-title">
          <span>🛡</span> <strong>Best-Effort Asset Protection Active</strong>
        </div>
        <p className="protection-subtext">
          Right-click, dragging, and printing are disabled. Dynamic forensic watermark is embedded. <em>(Note: Browser sandboxes cannot prevent external OS-level clipping or cameras).</em>
        </p>
      </div>
    </div>
  );
};

// --- Prologue Component (100% UNTOUCHED) ---
const Prologue = ({ explorerId = "SFGHIOP", onStart }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      location: "SECTOR 4 — EXPEDITION SITE",
      title: "THE MISSING MEMORY",
      image: "/images/prologue-1.jpg",
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
      image: "/images/prologue-2.jpg",
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
      image: "/images/prologue-3.jpg",
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
      image: "/images/prologue-4.jpg",
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
      image: "/images/prologue-5.jpg",
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
      image: "/images/prologue-6.jpg",
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
          <span className="location-tag">{slide.location}</span>
          <h1 className="chapter-title">{slide.title}</h1>
        </div>

        <div className="card-image-area" style={{ backgroundImage: `url(${slide.image})` }}>
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
          {explorerId} &nbsp;&nbsp; {currentSlide + 1} / {slides.length}
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

        <button className="continue-btn" onClick={handleNext}>
          {currentSlide === slides.length - 1 ? 'ENTER STAGE 2' : 'CONTINUE'}
        </button>
      </div>
    </div>
  );
};

// --- Main Stage 2 Image Navigation Challenge Component ---
export default function Round2Page() {
  const [hasStarted, setHasStarted] = useState(false);
  const [prompt, setPrompt] = useState('forest adventure theme');
  const [resultImage, setResultImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, resultImage: 'Please upload a valid image file.' });
        return;
      }
      setResultImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrors({ ...errors, resultImage: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!prompt.trim() || prompt.trim().length < 10) {
      newErrors.prompt = 'Minimum 10 characters required for evaluation model.';
    }
    if (!resultImage) {
      newErrors.resultImage = 'Please upload Image 1 before submitting.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    alert('Image 1 submitted for evaluation!');
  };

  if (!hasStarted) {
    return <Prologue onStart={() => setHasStarted(true)} />;
  }

  return (
    <main className="stage2-page fade-in">
      {/* Top Navigation Bar */}
      <header className="stage2-nav-header">
        <div className="nav-left">
          <button className="nav-hub-btn" onClick={() => window.history.back()}>
            ← EXPEDITION HUB
          </button>
          <div className="nav-title-group">
            <span className="stage-badge">🧭 STAGE 2</span>
            <h1 className="nav-main-title">IMAGE NAVIGATION</h1>
          </div>
        </div>

        <div className="navbar-right">
          <button
            type="button"
            className="round2-fullscreen-btn"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
            title="Toggle Fullscreen (Freely permitted in Round 2)"
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
          </button>

          <div className="team-status-chip">
            <span className="chip-label">Explorer</span>
            <span className="chip-name">{teamName}</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="stage2-container">

        {/* Game Clock & Speed Evaluation Widget */}
        <section className="game-status-bar">
          <div className="status-clock-panel">
            <div className="status-header">
              <span className="status-icon">⏱</span>
              <span className="status-label">15-MINUTE GAME CLOCK</span>
            </div>
            <div className="timer-display">
              <div className="timer-bar-track">
                <div className="timer-bar-fill" style={{ width: '100%' }}></div>
              </div>
              <span className="timer-digits">00:00</span>
            </div>
            <p className="timer-subtext">TIME EXPIRED &bull; Complete submission immediately</p>
          </div>

          <div className="status-speed-panel">
            <div className="status-header">
              <span className="status-icon">🔥</span>
              <span className="status-label">SPEED EVALUATION POTENTIAL</span>
            </div>
            <div className="speed-calc">
              <span>400 Base + +0 Speed Bonus = </span>
              <span className="pts-highlight-box">400 PTS</span>
            </div>
          </div>
        </section>

        {/* Content Columns: Left (Target Reference) & Right (Form & Upload) */}
        <div className="stage2-grid">

          {/* Left Column: Target Reference Image */}
          <div className="left-column">
            <div className="category-tags">
              <span className="tag gold-tag">ORGANIZER TARGET</span>
              <span className="tag dark-tag">Protected Evaluation Goal</span>
            </div>

            <div className="card-box">
              <h2 className="card-title">
                <span className="title-icon">🛡</span> TARGET REFERENCE IMAGE
              </h2>
              <p className="card-description">
                Observe this target image carefully. Generate your recreated prompt and upload your resulting image below.
              </p>

              <ProtectedImage
                src="/images/round2-reference.jpg"
                alt="Target Reference Image"
                watermarkText="ROUND 2 CYPHORA EVALUATION [SPARTANS]"
              />
            </div>
          </div>

          {/* Right Column: Prompt & Upload */}
          <div className="right-column">

            {/* Recreation Prompt Box */}
            <div className="card-box">
              <div className="card-header-row">
                <h2 className="card-title">
                  <span className="title-icon">✨</span> RECREATION PROMPT
                </h2>
                <span className="char-count">{prompt.length} / 1500 chars</span>
              </div>

              <div className="form-group">
                <label className="field-label">ENTER YOUR PROMPT <span className="req">*</span></label>
                <span className="field-sublabel">Describe the image composition, subject, style, lighting & details</span>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={5}
                  placeholder="Type your prompt here..."
                />
                <span className="field-footer-note">Minimum 10 characters required for evaluation model.</span>
                {errors.prompt && <p className="field-error">{errors.prompt}</p>}
              </div>
            </div>

            {/* Step 1: Upload Image Box */}
            <div className="card-box">
              <div className="card-header-row">
                <h2 className="card-title">
                  <span className="title-icon">📚</span> STEP 1: UPLOAD IMAGE 1
                </h2>
                <span className="phase-badge">Phase 1 of 2 • Max 10MB</span>
              </div>

              <p className="card-description">Upload your initial re-creation below as <strong>Image 1</strong>.</p>

              <div className="dropzone-outer">
                <div className="dropzone-header">
                  <span>✨ <strong>IMAGE 1</strong></span>
                  <span className="draft-label">Initial Synthesis Draft</span>
                </div>

                <div className="dropzone-box">
                  <input
                    type="file"
                    id="stage2Upload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden-file-input"
                  />
                  <label htmlFor="stage2Upload" className="dropzone-content">
                    <div className="upload-icon-circle">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>

                    {resultImage ? (
                      <div className="file-info">
                        <span className="file-name">{resultImage.name}</span>
                        <span className="file-action">Click to change file</span>
                      </div>
                    ) : (
                      <div className="file-prompt">
                        <span className="main-prompt">Upload Image 1</span>
                        <span className="sub-prompt">Click to browse or drag & drop</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {previewUrl && (
                <div className="image-preview-wrapper">
                  <img src={previewUrl} alt="Preview" />
                  <button type="button" className="remove-btn" onClick={() => {
                    setResultImage(null);
                    setPreviewUrl(null);
                  }}>Remove File</button>
                </div>
              )}

              {errors.resultImage && <p className="field-error">{errors.resultImage}</p>}
            </div>

            {/* Large Yellow Submit Button */}
            <button className="submit-challenge-btn" onClick={handleSubmit}>
              <span>✈</span> SUBMIT IMAGE 1 FOR EVALUATION &rarr;
            </button>

          </div>
        </div>
      </div>
    </main>
  );
}
