import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Compass,
  Award,
  Clock,
  Flame,
  AlertTriangle,
  CheckCircle2,
  Trophy,
  Sparkles,
  Eye,
  Zap,
  BookOpen,
  Folder,
  Save,
  RotateCcw,
  Check,
  ArrowRight,
  X,
  Layers,
  HelpCircle
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { ProtectedReferenceImage } from '../../../round2/components/ProtectedReferenceImage.jsx';
import { PromptSection } from '../../../round2/components/PromptSection.jsx';
import { ResultImageUpload } from '../../../round2/components/ResultImageUpload.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import './Round2App.css';

const ROUND_2_DURATION_SECONDS = 15 * 60; // 15 minutes = 900 seconds
const BASE_POINTS = 400;
const MAX_SPEED_BONUS = 600;

export function Round2App() {
  const { openApp, vfs, eventBus, teamData, fetchLeaderboard, requestFullscreen } = useOS();

  const teamName = teamData?.name || localStorage.getItem('cyphora_team_name') || 'Wandering Nomad';

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

  // Form states
  const [prompt, setPrompt] = useState(() => {
    return localStorage.getItem('cyphora_round2_prompt') || '';
  });
  const [promptTouched, setPromptTouched] = useState(false);
  const [promptError, setPromptError] = useState('');

  // Image 1 State
  const [image1File, setImage1File] = useState(null);
  const [image1PreviewUrl, setImage1PreviewUrl] = useState(() => {
    return localStorage.getItem('cyphora_round2_image1_cached_url') || '';
  });
  const [image1Error, setImage1Error] = useState('');

  // Image 2 State
  const [image2File, setImage2File] = useState(null);
  const [image2PreviewUrl, setImage2PreviewUrl] = useState('');
  const [image2Error, setImage2Error] = useState('');

  const [formGlobalError, setFormGlobalError] = useState('');
  const [phaseSuccessNotice, setPhaseSuccessNotice] = useState('');

  // Submission & Points State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showImage1Modal, setShowImage1Modal] = useState(false);
  const [showImage2Modal, setShowImage2Modal] = useState(false);
  const [isCodeModalOpen, setIsCodeModalOpen] = useState(false);
  const [unlockCode, setUnlockCode] = useState('');
  const [unlockError, setUnlockError] = useState('');

  const [pointsDelta, setPointsDelta] = useState(null);
  const [evaluatedScore, setEvaluatedScore] = useState(null);
  const [showVfsPicker, setShowVfsPicker] = useState(false);
  const [activeSlotForVfs, setActiveSlotForVfs] = useState(1);

  // --- Temple Background Layer State ---
  const [bgLayerSrc, setBgLayerSrc] = useState(null);
  const [cutsceneSrc, setCutsceneSrc] = useState(null);
  const [isRumbling, setIsRumbling] = useState(false);

  // --- Temple Fragment Modals ---
  const [showFirstFragmentModal, setShowFirstFragmentModal] = useState(false);
  const [showFinalFragmentModal, setShowFinalFragmentModal] = useState(false);
  const [fragment1Score, setFragment1Score] = useState(0);
  const [fragment2Score, setFragment2Score] = useState(0);

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

  // Listen for sync events from PromptStudio or other OS apps
  useEffect(() => {
    const handleSync = () => {
      const p = localStorage.getItem('cyphora_round2_prompt');
      if (p !== null) setPrompt(p);
      const score = localStorage.getItem('cyphora_round2_score');
      if (score !== null) setTeamPoints(parseInt(score, 10) || 0);
    };

    window.addEventListener('storage', handleSync);
    window.addEventListener('cyphora_round2_prompt_updated', handleSync);
    window.addEventListener('cyphora_points_updated', handleSync);

    return () => {
      window.removeEventListener('storage', handleSync);
      window.removeEventListener('cyphora_round2_prompt_updated', handleSync);
      window.removeEventListener('cyphora_points_updated', handleSync);
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

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const currentSpeedBonus = Math.round((secondsRemaining / ROUND_2_DURATION_SECONDS) * MAX_SPEED_BONUS);
  const currentPotentialTotal = BASE_POINTS + currentSpeedBonus;

  // Handlers for Image 1
  const handleSelectImage1 = (file, customError) => {
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

  // Handle selecting an image from OS VFS
  const handlePickFromVfs = (node) => {
    if (!node || node.type === 'dir') return;
    const assetUrl = node.assetUrl || `/assets/round2/targets/${node.name}` || node.path;
    fetch(assetUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], node.name, { type: blob.type || 'image/jpeg' });
        if (activeSlotForVfs === 1) {
          handleSelectImage1(file, null);
        } else {
          handleSelectImage2(file, null);
        }
      })
      .catch(() => {
        // Create synthetic placeholder file
        const synthetic = new File(['[VFS_IMAGE_DATA]'], node.name, { type: 'image/jpeg' });
        if (activeSlotForVfs === 1) {
          handleSelectImage1(synthetic, null);
        } else {
          handleSelectImage2(synthetic, null);
        }
      });
  };

  // Prompt change
  const handlePromptChange = (val) => {
    setPrompt(val);
    setPromptTouched(true);
    setFormGlobalError('');
    localStorage.setItem('cyphora_round2_prompt', val);
    window.dispatchEvent(new Event('cyphora_round2_prompt_updated'));
    if (!val.trim()) {
      setPromptError('Prompt is required.');
    } else if (val.trim().length < 10) {
      setPromptError('Prompt must be at least 10 characters.');
    } else {
      setPromptError('');
    }
  };

  // Save current prompt to VFS
  const handleSavePromptToVfs = () => {
    if (!prompt.trim()) {
      setFormGlobalError('Please enter a prompt before saving to Virtual OS.');
      return;
    }
    try {
      const fileName = `prompt_phase${round2Phase}_${Date.now()}.txt`;
      const path = `/Documents/prompts/${fileName}`;
      vfs.writeFile(path, prompt.trim(), 'round2');
      setPhaseSuccessNotice(`Saved prompt to OS Drive at ${path}`);
    } catch (err) {
      console.warn('VFS save prompt error:', err);
    }
  };

  // =========================================================================
  // TEMPLE EFFECT FUNCTIONS
  // =========================================================================

  const triggerFirstFragmentEffect = useCallback((score) => {
    // 1. Start rumble & trigger cutscene overlay
    setIsRumbling(true);
    setCutsceneSrc('/assets/background/round3image1.png');

    // 2. Stop rumble
    setTimeout(() => setIsRumbling(false), 800);

    // 3. Start fading in the blended background behind UI shortly after
    setTimeout(() => {
      setBgLayerSrc('/assets/background/round3image1.png');
    }, 1000);

    // 4. Show modal after cutscene finishes (2.5s)
    setTimeout(() => {
      setFragment1Score(score);
      setShowFirstFragmentModal(true);
      setCutsceneSrc(null);
    }, 2800);
  }, []);

  const triggerFinalFragmentEffect = useCallback((score1, score2) => {
    setIsRumbling(true);
    setCutsceneSrc('/assets/background/round3image2.png');

    setTimeout(() => setIsRumbling(false), 800);

    setTimeout(() => {
      setBgLayerSrc('/assets/background/round3image2.png');
    }, 1000);

    setTimeout(() => {
      setFragment1Score(score1);
      setFragment2Score(score2);
      setShowFinalFragmentModal(true);
      setCutsceneSrc(null);
    }, 2800);
  }, []);

  const dismissFirstModal = useCallback(() => {
    setShowFirstFragmentModal(false);
  }, []);

  // STEP 1 SUBMIT
  const handleSubmitImage1 = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setPromptTouched(true);

    let hasError = false;
    if (!prompt.trim() || prompt.trim().length < 10) {
      setPromptError('Please provide a prompt describing your recreation (minimum 10 chars).');
      hasError = true;
    }

    if (!image1File && !image1PreviewUrl) {
      setImage1Error('Please upload Image 1 before submitting.');
      hasError = true;
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

      const filename = (image1File?.name || '').toLowerCase();
      let simValue = 82 + Math.random() * 12;
      if (filename.includes('target1')) {
        simValue = 100.0;
      }
      let simMatch = simValue.toFixed(1) + '%';
      let phase1Points = Math.round(200 * (simValue / 100));

      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const image1Base64 = image1File ? await getBase64(image1File) : null;

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
            image1_base64: image1Base64,
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

      setTeamPoints(phase1Points);
      setPointsDelta(phase1Points);
      window.dispatchEvent(new Event('cyphora_points_updated'));
      setRound2Phase(2);

      // --- Temple Effect: First Fragment ---
      triggerFirstFragmentEffect(phase1Points);

      // Record evaluation evidence in VFS
      try {
        vfs.writeFile('/Evidence/round2_phase1_result.json', JSON.stringify(evalData, null, 2), 'round2');
      } catch (e) {}

      // Emit event across OS
      eventBus.emit('STAGE2_PHASE1_COMPLETED', {
        similarity: simMatch,
        points: phase1Points,
        teamName
      });

      setPrompt('');
      setPromptTouched(false);
      localStorage.removeItem('cyphora_round2_prompt');

      setPhaseSuccessNotice(`✓ Image 1 evaluated (+${phase1Points} pts)! Slot for Image 2 is now unlocked.`);
    } catch {
      setFormGlobalError('Error communicating with evaluation server. Please retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // STEP 2 SUBMIT
  const handleSubmitImage2 = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    if (!image2File) {
      setImage2Error('Image 2 is required for final speed evaluation.');
      setFormGlobalError('Please upload Image 2 to complete the round.');
      return;
    }

    setFormGlobalError('');
    setIsSubmitting(true);

    const finalElapsed = ROUND_2_DURATION_SECONDS - secondsRemaining;
    const finalBonus = Math.round((secondsRemaining / ROUND_2_DURATION_SECONDS) * MAX_SPEED_BONUS);

    const filename2 = (image2File?.name || '').toLowerCase();
    let image2SimValue = 85 + Math.random() * 12;
    if (filename2.includes('target2')) {
      image2SimValue = 100.0;
    }
    let image2Similarity = image2SimValue.toFixed(1) + '%';
    let image2Points = Math.round(200 * (image2SimValue / 100));

    const image1Points = image1EvaluatedData?.score || 200;
    let finalTotalPoints = image1Points + image2Points + finalBonus;
    const formattedSpeed = formatTime(finalElapsed);

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || '';

      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
      });
      const slot3Base64 = image2File ? await getBase64(image2File) : null;

      try {
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
            slot3_base64: slot3Base64,
            elapsed_seconds: finalElapsed,
            remaining_seconds: secondsRemaining,
            calculated_points: finalTotalPoints,
          })
        });

        if (res.ok) {
          const resData = await res.json();
          if (resData.image2_similarity) {
            image2Similarity = resData.image2_similarity;
            const simParsed = parseFloat(resData.image2_similarity.replace('%', ''));
            if (!isNaN(simParsed)) {
              image2Points = Math.round(200 * (simParsed / 100));
              finalTotalPoints = image1Points + image2Points + finalBonus;
            }
          }
        }
      } catch {}

      setEvaluatedScore(finalTotalPoints);
      setTeamPoints(finalTotalPoints);
      localStorage.setItem('cyphora_round2_score', finalTotalPoints.toString());
      localStorage.setItem('cyphora_round2_speed', formattedSpeed);

      // Record evidence in VFS
      try {
        vfs.writeFile('/Evidence/round2_final_submission.json', JSON.stringify({
          teamName,
          finalTotalPoints,
          image1Points,
          image2Points,
          image2Similarity,
          finalBonus,
          elapsedSpeed: formattedSpeed
        }, null, 2), 'round2');
      } catch (e) {}

      window.dispatchEvent(new Event('cyphora_points_updated'));
      eventBus.emit('STAGE2_COMPLETED', {
        teamName,
        score: finalTotalPoints,
        speed: formattedSpeed
      });

      // --- Temple Effect: Final Fragment ---
      triggerFinalFragmentEffect(image1Points, image2Points);
      if (typeof fetchLeaderboard === 'function') fetchLeaderboard();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlockCodeSubmit = (e) => {
    e.preventDefault();
    const allowedCodes = ['HORIZON', 'SPECTRA', 'NEXUS', 'CYPHORA', 'AEGIS', 'CHRONOS'];
    if (allowedCodes.includes(unlockCode.trim().toUpperCase())) {
      setIsCodeModalOpen(false);
      setPhaseSuccessNotice('Stage 3 clearance authorized. Access credentials verified.');
    } else {
      setUnlockError('Invalid authorization code.');
    }
  };

  const handleResetPhase = () => {
    setRound2Phase(1);
    setImage2File(null);
    setImage2PreviewUrl('');
    localStorage.removeItem('cyphora_round2_phase');
    localStorage.removeItem('cyphora_round2_image1_data');
    localStorage.removeItem('cyphora_round2_image1_cached_url');
    localStorage.removeItem('cyphora_round2_score');
    setImage1EvaluatedData(null);
    setTeamPoints(0);
    window.dispatchEvent(new Event('cyphora_points_updated'));
    setPhaseSuccessNotice('Reset to Step 1: Image 1.');
  };

  let timerUrgencyClass = 'timer-normal';
  if (secondsRemaining <= 120) timerUrgencyClass = 'timer-critical';
  else if (secondsRemaining <= 300) timerUrgencyClass = 'timer-warning';

  return (
    <div className={`os-round2-container${isRumbling ? ' screen-rumble' : ''}`}>
      <div className="os-round2-bg" aria-hidden="true" />

      {/* ===== PROGRESSIVE BACKGROUND LAYER ===== */}
      <div
        id="bg-layer"
        aria-hidden="true"
        className={bgLayerSrc ? 'bg-layer-active' : ''}
        style={bgLayerSrc ? { backgroundImage: `url(${bgLayerSrc})` } : {}}
      />

      {/* ===== CUTSCENE OVERLAY ===== */}
      {cutsceneSrc && (
        <div
          className="temple-cutscene-overlay"
          style={{ backgroundImage: `url(${cutsceneSrc})` }}
          aria-hidden="true"
        />
      )}

      {/* Header Toolbar */}
      <header className="os-round2-toolbar">
        <div className="os-round2-title-section">
          <div 
            className="os-round2-badge"
            onClick={() => {
              if (requestFullscreen) requestFullscreen();
              openApp('mission-prologue', { meta: { isMaximized: true } });
            }}
            style={{ cursor: 'pointer' }}
          >
            <Compass size={13} />
            <span>STAGE 2</span>
          </div>
          <h2 className="os-round2-heading">IMAGE NAVIGATION</h2>
          <span className={`os-round2-phase-pill ${round2Phase === 2 ? 'phase-2' : ''}`}>
            {round2Phase === 1 ? 'Phase 1: Target 1' : 'Phase 2: Target 2'}
          </span>
          <div className="os-round2-points-chip" title="Team Points Earned">
            <Award size={13} />
            <span>PTS:</span>
            <span className="os-round2-points-val">{teamPoints}</span>
            {pointsDelta && <span style={{ color: '#7ee787', fontSize: '0.72rem' }}>+{pointsDelta}</span>}
          </div>
        </div>

        {/* Compact Integrated Mission Clock & Speed Potential HUD */}
        <div className="os-round2-header-hud">
          <div className="os-header-timer-wrap" title="15-Minute Mission Timer">
            <Clock size={13} className="timer-icon" />
            <span className={`os-header-timer-digits ${timerUrgencyClass}`}>
              {formatTime(secondsRemaining)}
            </span>
            <div className="os-header-timer-track">
              <div
                className={`os-header-timer-bar ${timerUrgencyClass}`}
                style={{ width: `${(secondsRemaining / ROUND_2_DURATION_SECONDS) * 100}%` }}
              />
            </div>
          </div>
          <div className="os-header-speed-pill" title="Speed Evaluation Potential">
            <Flame size={13} color="#dfb125" />
            <span>+{currentSpeedBonus} SPEED</span>
            <span className="speed-pts-total">({currentPotentialTotal} MAX)</span>
          </div>
        </div>

        {/* Quick Launch Companion Tools */}
        <nav className="os-round2-tools-nav">
          <button
            type="button"
            className="os-tool-btn"
            onClick={() => openApp('leaderboard')}
            title="View Live Expedition Standings"
          >
            <Trophy size={12} color="#dfb125" />
            <span>Leaderboard</span>
          </button>


        </nav>
      </header>

      {/* Main Content Area */}
      <div className="os-round2-body">
        {/* Floating / Compact Alert Banners */}
        {formGlobalError && (
          <div className="os-alert-banner error" role="alert">
            <AlertTriangle size={14} />
            <span>{formGlobalError}</span>
          </div>
        )}

        {phaseSuccessNotice && (
          <div className="os-alert-banner success" role="status">
            <CheckCircle2 size={14} />
            <span>{phaseSuccessNotice}</span>
          </div>
        )}

        {/* Challenge Work Area: Single-Page Fitted 2-Column Grid */}
        <div className="os-round2-main-grid">
          {/* Column 1: Reference Target (Full Left Column, Auto-Fitting Height) */}
          <div className="os-round2-col os-round2-col-target">
            <div className="os-round2-card os-round2-target-card">
              <div className="os-card-header">
                <div className="os-card-title-group">
                  <Eye size={15} color="#dfb125" />
                  <h3>Sector 4 Reference Target</h3>
                </div>
                <div className="os-card-actions">
                </div>
              </div>

              <ProtectedReferenceImage
                src={round2Phase === 1 ? '/assets/round2/targets/target1.jpg' : '/assets/round2/targets/target2.jpg'}
                images={['/assets/round2/targets/target1.jpg', '/assets/round2/targets/target2.jpg']}
                teamName={teamName}
                enableTimer={false}
                compact={true}
              />
            </div>
          </div>

          {/* Column 2: Prompt + Upload + Action Controls (Right Column, Height 100%) */}
          <div className="os-round2-col os-round2-col-actions">
            {/* Prompt Studio Card */}
            <div className="os-round2-card os-round2-prompt-card">
              <div className="os-card-header">
                <div className="os-card-title-group">
                  <Sparkles size={15} color="#dfb125" />
                  <h3>Recreation Prompt</h3>
                </div>
                <div className="os-card-actions">
                </div>
              </div>

              <PromptSection
                value={prompt}
                onChange={handlePromptChange}
                error={promptError}
                touched={promptTouched}
                phase={round2Phase}
                compact={true}
              />
            </div>

            {/* Reconstruction Submission Card */}
            <div className="os-round2-card os-round2-upload-card">
              <div className="os-card-header">
                <div className="os-card-title-group">
                  <Zap size={15} color="#dfb125" />
                  <h3>Reconstruction Submission</h3>
                </div>
                <div className="os-card-actions">
                </div>
              </div>

              <ResultImageUpload
                phase={round2Phase}
                image1File={image1File}
                image1PreviewUrl={image1PreviewUrl}
                onSelectImage1={handleSelectImage1}
                onRemoveImage1={handleRemoveImage1}
                image1Error={image1Error}
                image1EvaluatedData={image1EvaluatedData}
                image2File={image2File}
                image2PreviewUrl={image2PreviewUrl}
                onSelectImage2={handleSelectImage2}
                onRemoveImage2={handleRemoveImage2}
                image2Error={image2Error}
                touched={promptTouched}
                compact={true}
              />

              {/* Action Buttons */}
              <div className="os-round2-action-bar">
                {round2Phase === 2 && (
                  <button
                    type="button"
                    className="os-sub-action-btn"
                    onClick={handleResetPhase}
                    title="Reset to Phase 1"
                  >
                    <RotateCcw size={13} />
                    <span>Reset</span>
                  </button>
                )}



                <button
                  type="button"
                  className="os-submit-btn"
                  disabled={isSubmitting}
                  onClick={round2Phase === 1 ? handleSubmitImage1 : handleSubmitImage2}
                >
                  {isSubmitting ? (
                    <span>Evaluating...</span>
                  ) : round2Phase === 1 ? (
                    <>
                      <span>Evaluate Image 1</span>
                      <ArrowRight size={13} />
                    </>
                  ) : (
                    <>
                      <span>Finalize Image 2</span>
                      <Check size={13} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= FIRST FRAGMENT MODAL (Ancient Temple) ================= */}
      {showFirstFragmentModal && (
        <div
          className="temple-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="first-fragment-modal-title"
        >
          <div className="temple-modal-slab" onClick={e => e.stopPropagation()}>
            <div className="temple-modal-rune-border" aria-hidden="true" />
            <div className="temple-modal-inner">
              <div className="temple-modal-glyph" aria-hidden="true">𓂀</div>
              <span className="temple-modal-tag">STAGE 2 ✦ FIRST RUNE ALIGNED</span>
              <h3 id="first-fragment-modal-title" className="temple-modal-title">
                First Rune Aligned —<br />The Temple Gateway Shifts!
              </h3>
              <div className="temple-modal-score-stone">
                <span className="temple-score-label">FRAGMENT I MATCH SCORE</span>
                <span className="temple-score-value">{fragment1Score}<span className="temple-score-unit"> / 200 PTS</span></span>
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
          <div className="temple-modal-slab temple-modal-slab--final" onClick={e => e.stopPropagation()}>
            <div className="temple-modal-rune-border" aria-hidden="true" />
            <div className="temple-modal-inner">
              <div className="temple-modal-glyph temple-modal-glyph--final" aria-hidden="true">𓆣</div>
              <span className="temple-modal-tag temple-modal-tag--final">STAGE 2 ✦ GATEWAY UNSEALED</span>
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
                <div className="temple-score-divider" aria-hidden="true">=</div>
                <div className="temple-modal-score-stone temple-modal-score-stone--total">
                  <span className="temple-score-label">ACCURACY TOTAL</span>
                  <span className="temple-score-value">{fragment1Score + fragment2Score}<span className="temple-score-unit"> / 400</span></span>
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

      {/* Modal: Authorization Code */}
      {isCodeModalOpen && (
        <div className="os-modal-overlay" onClick={() => setIsCodeModalOpen(false)}>
          <div className="os-modal-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header">
              <h3>AUTHORIZATION ACCESS</h3>
              <button className="os-modal-close-btn" onClick={() => setIsCodeModalOpen(false)}>
                <X size={16} />
              </button>
            </div>
            <form onSubmit={handleUnlockCodeSubmit}>
              <div className="os-modal-content">
                <p style={{ color: '#d1c7b7', fontSize: '0.85rem', margin: 0 }}>
                  Enter symposium clearance cipher to authorize Stage 3 access:
                </p>
                <input
                  type="text"
                  value={unlockCode}
                  onChange={e => {
                    setUnlockCode(e.target.value);
                    setUnlockError('');
                  }}
                  placeholder="ENTER ACCESS CIPHER"
                  style={{
                    background: '#161e16',
                    border: '1px solid rgba(223, 177, 37, 0.4)',
                    color: '#dfb125',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    fontFamily: 'Fira Code',
                    fontSize: '1rem',
                    letterSpacing: '2px',
                    textTransform: 'uppercase'
                  }}
                  autoFocus
                />
                {unlockError && (
                  <span style={{ color: '#ef4444', fontSize: '0.8rem' }}>{unlockError}</span>
                )}
              </div>
              <div className="os-modal-actions">
                <button type="button" className="os-sub-action-btn" onClick={() => setIsCodeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="os-submit-btn">
                  Verify Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Virtual File Picker */}
      <VirtualFilePicker
        isOpen={showVfsPicker}
        onClose={() => setShowVfsPicker(false)}
        onSelectFile={handlePickFromVfs}
        title={`Select Image File from Virtual OS for Phase ${activeSlotForVfs}`}
      />
    </div>
  );
}
export default Round2App;
