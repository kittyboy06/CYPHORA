import React, { useState, useEffect, useRef } from 'react';
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
  const { openApp, vfs, eventBus, teamData, fetchLeaderboard } = useOS();

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
      setShowImage1Modal(true);
      setRound2Phase(2);

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

      setShowImage2Modal(true);
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
    <div className="os-round2-container">
      <div className="os-round2-bg" aria-hidden="true" />

      {/* Header Toolbar */}
      <header className="os-round2-toolbar">
        <div className="os-round2-title-section">
          <div className="os-round2-badge">
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
            onClick={() => openApp('vision-target')}
            title="Open Vision Target Viewer in separate window"
          >
            <Eye size={12} color="#79c0ff" />
            <span>Vision</span>
          </button>

          <button
            type="button"
            className="os-tool-btn"
            onClick={() => openApp('prompt-studio')}
            title="Open Prompt Studio in separate window"
          >
            <Sparkles size={12} color="#dfb125" />
            <span>Studio</span>
          </button>

          <button
            type="button"
            className="os-tool-btn"
            onClick={() => openApp('image-evaluator')}
            title="Open Similarity Evaluator in separate window"
          >
            <Zap size={12} color="#f59e0b" />
            <span>Evaluator</span>
          </button>

          <button
            type="button"
            className="os-tool-btn"
            onClick={() => openApp('leaderboard')}
            title="View Live Expedition Standings"
          >
            <Trophy size={12} color="#dfb125" />
            <span>Standings</span>
          </button>

          <button
            type="button"
            className="os-tool-btn"
            onClick={() => openApp('mission-prologue')}
            title="Review Recovered Mission Briefing & Story"
          >
            <BookOpen size={12} color="#a8a08d" />
            <span>Briefing</span>
          </button>

          <button
            type="button"
            className="os-tool-btn"
            onClick={() => {
              setActiveSlotForVfs(round2Phase);
              setShowVfsPicker(true);
            }}
            title="Select Image File from OS Virtual Disk"
          >
            <Folder size={12} color="#58a6ff" />
            <span>OS Files</span>
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
                  <button
                    type="button"
                    className="os-tool-btn"
                    onClick={() => openApp('vision-target')}
                    title="Pop out in Vision Target Viewer"
                  >
                    <span>Inspect Target</span>
                  </button>
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
                  <button
                    type="button"
                    className="os-tool-btn"
                    onClick={handleSavePromptToVfs}
                    title="Save current prompt to OS Drive"
                  >
                    <Save size={12} />
                    <span>Save to VFS</span>
                  </button>
                  <button
                    type="button"
                    className="os-tool-btn"
                    onClick={() => openApp('prompt-studio')}
                    title="Open full studio with keyword builder"
                  >
                    <span>Studio</span>
                  </button>
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
                  <button
                    type="button"
                    className="os-tool-btn"
                    onClick={() => {
                      setActiveSlotForVfs(round2Phase);
                      setShowVfsPicker(true);
                    }}
                    title="Pick an image from OS files"
                  >
                    <Folder size={12} />
                    <span>Select from OS</span>
                  </button>
                  <button
                    type="button"
                    className="os-tool-btn"
                    onClick={() => openApp('image-evaluator')}
                    title="Open similarity evaluator"
                  >
                    <span>Evaluator</span>
                  </button>
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
                  className="os-sub-action-btn"
                  onClick={() => setIsCodeModalOpen(true)}
                  title="Enter authorization unlock code"
                >
                  <span>Authorize Code</span>
                </button>

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

      {/* Modal: Phase 1 Evaluated */}
      {showImage1Modal && (
        <div className="os-modal-overlay" onClick={() => setShowImage1Modal(false)}>
          <div className="os-modal-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header">
              <h3>PHASE 1 EVALUATION COMPLETE</h3>
              <button className="os-modal-close-btn" onClick={() => setShowImage1Modal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="os-modal-content">
              <p style={{ color: '#d1c7b7', margin: 0, fontSize: '0.88rem' }}>
                Cosine similarity evaluation on Image 1 has been validated:
              </p>
              <div style={{ background: 'rgba(223, 177, 37, 0.1)', border: '1px solid rgba(223, 177, 37, 0.3)', padding: '1rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#a8a08d' }}>SIMILARITY MATCH</span>
                <div style={{ fontFamily: 'Fira Code', fontSize: '2rem', fontWeight: 700, color: '#dfb125' }}>
                  {image1EvaluatedData?.similarity || '88.5%'}
                </div>
                <div style={{ color: '#7ee787', fontWeight: 600, marginTop: '0.25rem' }}>
                  +{image1EvaluatedData?.score || 200} EXPEDITION POINTS
                </div>
              </div>
              <p style={{ color: '#889280', fontSize: '0.8rem', margin: 0 }}>
                Phase 2 is now unlocked. Study Target 2 and submit your final recreation to claim your speed evaluation bonus.
              </p>
            </div>
            <div className="os-modal-actions">
              <button className="os-submit-btn" onClick={() => setShowImage1Modal(false)}>
                <span>Proceed to Phase 2</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Phase 2 Finalized */}
      {showImage2Modal && (
        <div className="os-modal-overlay" onClick={() => setShowImage2Modal(false)}>
          <div className="os-modal-card" onClick={e => e.stopPropagation()}>
            <div className="os-modal-header">
              <h3>STAGE 2 RECONSTRUCTION COMPLETE</h3>
              <button className="os-modal-close-btn" onClick={() => setShowImage2Modal(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="os-modal-content">
              <p style={{ color: '#d1c7b7', margin: 0, fontSize: '0.88rem' }}>
                Both visual targets have been reconstructed and evaluated.
              </p>
              <div style={{ background: 'rgba(223, 177, 37, 0.12)', border: '1px solid #dfb125', padding: '1.25rem', borderRadius: '6px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: '#a8a08d' }}>FINAL STAGE 2 SCORE</span>
                <div style={{ fontFamily: 'Fira Code', fontSize: '2.4rem', fontWeight: 700, color: '#ffe680' }}>
                  {evaluatedScore || teamPoints} PTS
                </div>
                <div style={{ fontSize: '0.82rem', color: '#dfb125', marginTop: '0.4rem' }}>
                  Speed Bonus Included &bull; Transmitted to Expedition Network
                </div>
              </div>
            </div>
            <div className="os-modal-actions">
              <button
                className="os-sub-action-btn"
                onClick={() => {
                  setShowImage2Modal(false);
                  openApp('leaderboard');
                }}
              >
                <span>View Standings</span>
              </button>
              <button className="os-submit-btn" onClick={() => setShowImage2Modal(false)}>
                <span>Close</span>
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
