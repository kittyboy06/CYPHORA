import React, { useState, useEffect } from 'react';
import './Round2Page.css';

// --- Protected Image Component for Challenge ---
const ProtectedImage = ({ src, alt, watermarkText }) => {
  const [isFocused, setIsFocused] = useState(true);
  const [imgError, setImgError] = useState(false);

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
      <div className="warning-text">
        <p className="warning-heading">⚠️ <strong>Protected Content:</strong> Please do not attempt to copy, save, or screenshot this evidence.</p>
        <p className="browser-limitation-note">Note: Browser limitations prevent full screenshot blocking. We rely on your integrity.</p>
      </div>
      
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
            <p>📷 Reference Image Placeholder</p>
            <span>(Place image at: <code>{src}</code>)</span>
          </div>
        )}
        <div className="watermark-overlay">{watermarkText}</div>
        <div className="interaction-blocker"></div>
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

// --- Main Round 2 Challenge Component ---
export default function Round2Page() {
  const [hasStarted, setHasStarted] = useState(false);
  const [prompt, setPrompt] = useState('');
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
    if (!prompt.trim()) newErrors.prompt = 'Prompt is required.';
    if (!resultImage) newErrors.resultImage = 'Result image is required.';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    alert('Reconstruction entry submitted successfully!');
  };

  if (!hasStarted) {
    return <Prologue onStart={() => setHasStarted(true)} />;
  }

  return (
    <main className="round2-page fade-in">
      <header className="page-header">
        <h1 className="main-title">Round 2: The Missing Memory</h1>
        <p className="main-subtitle">Analyze the recovered visual evidence and reconstruct the exact prompt used to generate it.</p>
      </header>

      <div className="content-grid">
        {/* Left Column */}
        <section className="reference-section">
          <h2 className="section-title">Recovered Evidence</h2>
          <ProtectedImage 
            src="/images/round2-reference.jpg" 
            alt="Round 2 Reference"
            watermarkText="RESTRICTED FILE"
          />
        </section>

        {/* Right Column */}
        <section className="submission-section">
          <h2 className="section-title">Reconstruction Entry</h2>
          <form onSubmit={handleSubmit} className="submission-form" noValidate>
            
            <div className="form-group">
              <label htmlFor="promptInput" className="form-label">
                Enter your reconstructed prompt <span className="required">*</span>
              </label>
              <textarea 
                id="promptInput"
                value={prompt}
                onChange={(e) => {
                  setPrompt(e.target.value);
                  if (e.target.value.trim()) setErrors({ ...errors, prompt: null });
                }}
                placeholder="Type the exact prompt you believe was used..."
                rows={6}
                aria-invalid={errors.prompt ? "true" : "false"}
              />
              {errors.prompt && <span className="error-message">{errors.prompt}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="resultUpload" className="form-label">
                Upload your generated result image <span className="required">*</span>
              </label>
              
              <div className="custom-upload-box">
                <input 
                  type="file" 
                  id="resultUpload"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden-file-input"
                  aria-invalid={errors.resultImage ? "true" : "false"}
                />
                
                <label htmlFor="resultUpload" className="file-upload-btn">
                  Choose File
                </label>
                
                <span className="file-status">
                  {resultImage ? resultImage.name : 'No file chosen'}
                </span>
              </div>

              {previewUrl && (
                <div className="upload-preview-container">
                  <img src={previewUrl} alt="Upload preview" />
                  <button type="button" className="remove-preview-btn" onClick={() => {
                    setResultImage(null);
                    setPreviewUrl(null);
                    document.getElementById('resultUpload').value = '';
                  }}>✕ Remove</button>
                </div>
              )}

              {errors.resultImage && <span className="error-message">{errors.resultImage}</span>}
            </div>

            <button type="submit" className="submit-button">
              Submit Reconstruction
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
