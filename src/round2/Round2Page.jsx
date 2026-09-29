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
  CheckCircle2
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

  // Clean up object URL on unmount
  useEffect(() => {
    return () => {
      if (resultPreviewUrl && resultPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultPreviewUrl);
      }
    };
  }, [resultPreviewUrl]);

  // Handle return to hub
  const handleBack = () => {
    if (onReturnToHub) {
      onReturnToHub();
    } else {
      window.location.href = '/';
    }
  };

  // Prompt change handler
  const handlePromptChange = (val) => {
    setPrompt(val);
    setPromptTouched(true);
    setFormGlobalError('');
    if (!val.trim()) {
      setPromptError('Prompt is required.');
    } else if (val.trim().length < 10) {
      setPromptError('Prompt must be at least 10 characters.');
    } else {
      setPromptError('');
    }
  };

  // Image select handler
  const handleFileSelect = (file, customError) => {
    setUploadTouched(true);
    setFormGlobalError('');

    if (customError) {
      setUploadError(customError);
      setResultFile(null);
      if (resultPreviewUrl && resultPreviewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(resultPreviewUrl);
      }
      setResultPreviewUrl('');
      return;
    }

    if (!file) {
      setUploadError('Result image is required.');
      setResultFile(null);
      setResultPreviewUrl('');
      return;
    }

    setUploadError('');
    setResultFile(file);
    const newUrl = URL.createObjectURL(file);
    setResultPreviewUrl(newUrl);
  };

  // Image remove handler
  const handleFileRemove = () => {
    if (resultPreviewUrl && resultPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(resultPreviewUrl);
    }
    setResultFile(null);
    setResultPreviewUrl('');
    setUploadTouched(true);
    setUploadError('Result image is required.');
  };

  // Submission handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setPromptTouched(true);
    setUploadTouched(true);

    let hasError = false;

    // Validate prompt
    if (!prompt.trim()) {
      setPromptError('Prompt is required.');
      hasError = true;
    } else if (prompt.trim().length < 10) {
      setPromptError('Prompt must be at least 10 characters.');
      hasError = true;
    } else {
      setPromptError('');
    }

    // Validate image
    if (!resultFile) {
      setUploadError('Please upload your generated result image.');
      hasError = true;
    } else {
      setUploadError('');
    }

    if (hasError) {
      setFormGlobalError('Please resolve the highlighted validation errors above.');
      return;
    }

    setFormGlobalError('');
    setIsSubmitting(true);

    try {
      // Simulate submission network request / evaluation pipeline
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const payload = {
        team: teamName,
        prompt: prompt.trim(),
        fileName: resultFile.name,
        fileSize: resultFile.size,
        timestamp: new Date().toLocaleTimeString(),
        date: new Date().toLocaleDateString(),
      };

      // Store in localStorage for persistence
      const history = JSON.parse(localStorage.getItem('cyphora_round2_submissions') || '[]');
      history.push(payload);
      localStorage.setItem('cyphora_round2_submissions', JSON.stringify(history));

      setSubmittedData(payload);
      setSubmissionSuccess(true);
    } catch (err) {
      setFormGlobalError('Network error submitting to evaluation portal. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setPrompt('');
    setPromptTouched(false);
    setPromptError('');
    handleFileRemove();
    setUploadTouched(false);
    setUploadError('');
    setSubmissionSuccess(false);
    setSubmittedData(null);
    setFormGlobalError('');
  };

  return (
    <div className="round2-wrapper">
      {/* Background ambient container */}
      <div className="round2-ambient-bg" aria-hidden="true" />

      {/* Screen reader skip link */}
      <a href="#round2-main-content" className="sr-skip-link">
        Skip to main content
      </a>

      {/* Printable Warning Notice for @media print */}
      <div className="print-restricted-notice" aria-hidden="true">
        <h2>CYPHORA SECURITY RESTRICTION</h2>
        <p>Printing this evaluation target or prompt assessment sheet is prohibited by symposium protocol.</p>
        <p>Asset ID: ROUND-2-TARGET &bull; Team: {teamName}</p>
      </div>

      {/* Navigation Header */}
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
          </div>
        </div>

        <div className="navbar-right">
          <div className="team-status-chip">
            <span className="chip-label">Explorer</span>
            <span className="chip-name">{teamName}</span>
          </div>
        </div>
      </header>

      {/* Main Content Arena */}
      <main id="round2-main-content" className="round2-main" role="main">
        {/* Banner introduction */}
        <section className="round2-intro-banner" aria-label="Mission Briefing">
          <div className="intro-badge">
            <Sparkles size={16} />
            <span>MISSION OBJECTIVE</span>
          </div>
          <h2>Inverse Image Synthesis & Cosine Similarity</h2>
          <p>
            Study the protected reference target provided by event organizers. Formulate a prompt capable of generating
            an identical visual recreation, then submit your prompt and rendered image for cosine similarity scoring.
          </p>
        </section>

        {/* Global validation error banner if triggered */}
        {formGlobalError && (
          <div className="global-error-banner" role="alert">
            <AlertTriangle size={18} />
            <span>{formGlobalError}</span>
          </div>
        )}

        {/* Challenge Interactive Grid */}
        <form onSubmit={handleSubmit} noValidate className="round2-grid-layout">
          {/* Column 1: Protected Organizer Target Image */}
          <div className="grid-col target-col">
            <ProtectedReferenceImage
              src="/assets/round2/reference.jpg"
              alt="Organizer Target Reference Image"
              teamName={teamName}
              initialTimerSeconds={15}
              enableTimer={false}
            />
          </div>

          {/* Column 2: Prompt and Result Image Upload */}
          <div className="grid-col submission-col">
            {/* 1. Prompt Textarea */}
            <PromptSection
              value={prompt}
              onChange={handlePromptChange}
              error={promptError}
              touched={promptTouched}
              minLength={10}
              maxLength={1500}
            />

            {/* 2. Result Image Upload Section */}
            <ResultImageUpload
              file={resultFile}
              previewUrl={resultPreviewUrl}
              onFileSelect={handleFileSelect}
              onFileRemove={handleFileRemove}
              error={uploadError}
              touched={uploadTouched}
              maxSizeBytes={10 * 1024 * 1024}
              allowedTypes={['image/png', 'image/jpeg', 'image/webp']}
            />

            {/* 3. Action Submittal Bar */}
            <div className="form-submit-panel">
              <div className="submit-info-text">
                <Info size={15} />
                <span>Ensure prompt matches the generation parameters used for the uploaded image.</span>
              </div>

              <div className="submit-buttons-row">
                <button
                  type="button"
                  className="round2-clear-btn"
                  onClick={handleResetForm}
                  disabled={isSubmitting}
                >
                  <RotateCcw size={15} />
                  <span>Reset</span>
                </button>

                <button
                  type="submit"
                  className={`round2-submit-btn ${isSubmitting ? 'submitting' : ''}`}
                  disabled={isSubmitting}
                  aria-busy={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="spinner-dot" aria-hidden="true" />
                      <span>Transmitting Entry...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit Entry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>

      {/* Successful Submission Modal Dialog */}
      {submissionSuccess && submittedData && (
        <div 
          className="submission-modal-backdrop" 
          role="dialog" 
          aria-modal="true" 
          aria-labelledby="modal-success-title"
        >
          <div className="submission-modal-card">
            <div className="modal-icon-badge">
              <CheckCircle size={44} />
            </div>

            <h3 id="modal-success-title">Submission Successfully Received!</h3>
            <p className="modal-description">
              Your prompt and re-created image have been logged into the CYPHORA evaluation portal for similarity scoring.
            </p>

            <div className="modal-summary-box">
              <div className="summary-field">
                <span className="summary-label">Explorer Team:</span>
                <span className="summary-value gold-text">{submittedData.team}</span>
              </div>
              <div className="summary-field">
                <span className="summary-label">Timestamp:</span>
                <span className="summary-value">{submittedData.date} at {submittedData.timestamp}</span>
              </div>
              <div className="summary-field">
                <span className="summary-label">File Submitted:</span>
                <span className="summary-value">{submittedData.fileName}</span>
              </div>
              <div className="summary-prompt-preview">
                <span className="summary-label">Recorded Prompt:</span>
                <p className="prompt-quote">&ldquo;{submittedData.prompt}&rdquo;</p>
              </div>

              {resultPreviewUrl && (
                <div className="modal-img-preview">
                  <img src={resultPreviewUrl} alt="Submitted recreation output" />
                </div>
              )}
            </div>

            <div className="modal-actions-bar">
              <button
                type="button"
                className="modal-primary-btn"
                onClick={handleResetForm}
              >
                Submit Another Entry
              </button>
              <button
                type="button"
                className="modal-secondary-btn"
                onClick={handleBack}
              >
                Return to Expedition Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Round2Page;
