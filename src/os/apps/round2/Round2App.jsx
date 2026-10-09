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
  HelpCircle,
  Lock,
  Shield,
  Key
} from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';
import { ProtectedReferenceImage } from '../../../round2/components/ProtectedReferenceImage.jsx';
import { PromptSection } from '../../../round2/components/PromptSection.jsx';
import { ResultImageUpload } from '../../../round2/components/ResultImageUpload.jsx';
import { VirtualFilePicker } from '../../components/VirtualFilePicker.jsx';
import { RoundTimerLockScreen } from '../../../components/RoundTimerLockScreen.jsx';
import './Round2App.css';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
const API_BASE = isDevPort ? `http://${hostname}:8000` : '';

const ROUND_2_DURATION_SECONDS = 15 * 60; // 15 minutes = 900 seconds
const MAX_IMAGE_POINTS = 50; // 50 points max per image for 100% accuracy

export function Round2App({ windowId }) {
  const { openApp, closeWindow, vfs, eventBus, teamData, fetchLeaderboard, requestFullscreen, round1State } = useOS();

  const completedTasksCount = Array.isArray(round1State?.tasks)
    ? round1State.tasks.filter(t => t.status === 'COMPLETED').length
    : (Array.isArray(round1State?.completedTaskIds) ? round1State.completedTaskIds.length : 0);
  const isRound1Completed = Boolean(
    round1State?.round1Status === 'COMPLETED' ||
    completedTasksCount >= 12 ||
    (Array.isArray(round1State?.completedTaskIds) && round1State.completedTaskIds.length >= 12)
  );

  const teamId = teamData?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : null);

  const [isSupervisorOverridden, setIsSupervisorOverridden] = useState(() => {
    if (typeof sessionStorage === 'undefined') return false;
    return Boolean(
      (teamId && sessionStorage.getItem(`cyphora_round2_override_${teamId}`) === 'true') ||
      sessionStorage.getItem('cyphora_round2_supervisor_override') === 'true'
    );
  });

  const [isRound2Authorized, setIsRound2Authorized] = useState(() => {
    if (teamData?.round2Unlocked || teamData?.round2_unlocked) return true;
    if (typeof sessionStorage !== 'undefined') {
      if (teamId && sessionStorage.getItem(`cyphora_round2_override_${teamId}`) === 'true') return true;
      if (sessionStorage.getItem('cyphora_round2_supervisor_override') === 'true') return true;
    }
    // Only allow persistent storage if Round 1 is verified complete
    if (isRound1Completed) {
      if (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_round2_unlocked') === 'true') return true;
    }
    return false;
  });

  const [adminAuthCode, setAdminAuthCode] = useState('');
  const [adminAuthError, setAdminAuthError] = useState('');
  const [isVerifyingAdmin, setIsVerifyingAdmin] = useState(false);

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

  // Synchronize access status with backend & listen for real-time WebSocket clearance
  useEffect(() => {
    const checkAccess = async () => {
      try {
        const teamId = teamData?.id || localStorage.getItem('cyphora_team_id');
        const tName = teamData?.name || localStorage.getItem('cyphora_team_name');
        const headers = {};
        if (teamId) headers['X-Team-Id'] = String(teamId);
        if (tName) headers['X-Team-Name'] = tName;
        const res = await fetch(`${API_BASE}/api/stage2/access-status`, { headers });
        if (res.ok) {
          const data = await res.json();
          if (data.unlocked) {
            setIsRound2Authorized(true);
            localStorage.setItem('cyphora_round2_unlocked', 'true');
            sessionStorage.setItem('cyphora_round2_unlocked', 'true');
          }
        }
      } catch (err) {}
    };
    checkAccess();

    const handleAccessChange = (e) => {
      const detail = e.detail || {};
      const myId = teamData?.id || parseInt(localStorage.getItem('cyphora_team_id'), 10);
      const myName = (teamData?.name || localStorage.getItem('cyphora_team_name') || '').toLowerCase();
      if (detail.unlocked !== undefined) {
        const matches = (!detail.team_id && !detail.team_name) ||
          ((detail.team_id && detail.team_id === myId) || (detail.team_name && detail.team_name.toLowerCase() === myName));
        if (matches) {
          setIsRound2Authorized(Boolean(detail.unlocked));
          if (detail.unlocked) {
            localStorage.setItem('cyphora_round2_unlocked', 'true');
            sessionStorage.setItem('cyphora_round2_unlocked', 'true');
          } else {
            setIsSupervisorOverridden(false);
            if (teamId) {
              try { sessionStorage.removeItem(`cyphora_round2_override_${teamId}`); } catch (_) {}
            }
            try {
              localStorage.removeItem('cyphora_round2_unlocked');
              sessionStorage.removeItem('cyphora_round2_unlocked');
              localStorage.removeItem('cyphora_round2_supervisor_override');
              sessionStorage.removeItem('cyphora_round2_supervisor_override');
            } catch (_) {}
          }
        }
      }
    };

    window.addEventListener('cyphora_round2_access_changed', handleAccessChange);
    return () => window.removeEventListener('cyphora_round2_access_changed', handleAccessChange);
  }, [teamData?.id, teamData?.name]);

  const handleAdminSupervisorLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setAdminAuthError('');
    const inputPassword = adminAuthCode.trim();
    if (!inputPassword) {
      setAdminAuthError('Please enter administrator password.');
      return;
    }

    setIsVerifyingAdmin(true);
    let isAuthed = false;

    // Fast check for standard administrator credentials (case-insensitive)
    if (
      inputPassword.toUpperCase() === 'JCEAIML' ||
      inputPassword.toLowerCase() === 'admin'
    ) {
      isAuthed = true;
    } else {
      // Validate against backend /api/admin/login in case backend has a customized password
      try {
        const checkRes = await fetch(`${API_BASE}/api/admin/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password: inputPassword })
        });
        if (checkRes.ok) {
          isAuthed = true;
        }
      } catch (err) {}
    }

    if (!isAuthed) {
      setIsVerifyingAdmin(false);
      setAdminAuthError('Invalid administrator credentials.');
      return;
    }

    const teamId = teamData?.id || localStorage.getItem('cyphora_team_id');
    try {
      if (teamId) {
        await fetch(`${API_BASE}/api/admin/teams/${teamId}/round2-access`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Admin-Password': 'JCEAIML'
          },
          body: JSON.stringify({ unlocked: true })
        });
      }
    } catch (err) {}

    setIsSupervisorOverridden(true);
    setIsRound2Authorized(true);
    localStorage.setItem('cyphora_round2_supervisor_override', 'true');
    sessionStorage.setItem('cyphora_round2_supervisor_override', 'true');
    localStorage.setItem('cyphora_round2_unlocked', 'true');
    sessionStorage.setItem('cyphora_round2_unlocked', 'true');
    setAdminAuthCode('');
    setAdminAuthError('');
    setIsVerifyingAdmin(false);

    try {
      window.dispatchEvent(new CustomEvent('cyphora_round2_access_changed', {
        detail: { unlocked: true, team_id: teamId }
      }));
    } catch (e) {}
  };

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
  const [isRound2Completed, setIsRound2Completed] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      return localStorage.getItem('cyphora_round2_completed') === 'true' ||
             localStorage.getItem('cyphora_round3_unlocked') === 'true';
    }
    return false;
  });

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

  // Individual Workstation Countdown for Round 2 - starts ONLY after entering Round 2 app
  useEffect(() => {
    if (!isRound2Authorized) return;

    const currentTeamId = teamData?.id || (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_id') : null) || 'team';
    const teamSpecificKey = `cyphora_round2_started_at_${currentTeamId}`;

    let storedStart = null;
    if (teamData?.round2_started_at) {
      storedStart = String(new Date(teamData.round2_started_at).getTime());
      try { localStorage.setItem(teamSpecificKey, storedStart); } catch (_) {}
    } else {
      storedStart = localStorage.getItem(teamSpecificKey);
    }

    const isNewStart = !storedStart;
    if (!storedStart) {
      storedStart = String(Date.now());
      try {
        localStorage.setItem(teamSpecificKey, storedStart);
        localStorage.setItem('cyphora_round2_started_at', storedStart);
      } catch (_) {}
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
    const configuredMins = backendRound2Timer?.duration_minutes || 15;
    const totalSec = configuredMins * 60;

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
  }, [isRound2Authorized, backendRound2Timer?.duration_minutes, backendRound2Timer?.action, proctorUnlockedRound2, teamData?.id, teamData?.round2_started_at]);

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const maxTotalRound2Points = MAX_IMAGE_POINTS * 2;

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
    setFragment1Score(score);
    setIsRumbling(true);
    setCutsceneSrc('/assets/background/round3image1.png');

    // Quick rumble
    setTimeout(() => setIsRumbling(false), 500);

    // Fade in background layer
    setTimeout(() => {
      setBgLayerSrc('/assets/background/round3image1.png');
    }, 300);

    // Show popup with score immediately so participants don't wait
    setTimeout(() => {
      setShowFirstFragmentModal(true);
      setCutsceneSrc(null);
    }, 350);
  }, []);

  const triggerFinalFragmentEffect = useCallback((score1, score2) => {
    setFragment1Score(score1);
    setFragment2Score(score2);
    setIsRumbling(true);
    setCutsceneSrc('/assets/background/round3image2.png');

    // Quick rumble
    setTimeout(() => setIsRumbling(false), 500);

    // Fade in background layer
    setTimeout(() => {
      setBgLayerSrc('/assets/background/round3image2.png');
    }, 300);

    // Show popup with score & Round 3 transition immediately
    setTimeout(() => {
      setShowFinalFragmentModal(true);
      setCutsceneSrc(null);
    }, 350);
  }, []);

  const dismissFirstModal = useCallback(() => {
    setShowFirstFragmentModal(false);
    setRound2Phase(2);
    localStorage.setItem('cyphora_round2_phase', '2');
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
      const teamId = localStorage.getItem('cyphora_team_id') || '';
      const storedTeamName = localStorage.getItem('cyphora_team_name') || teamName || '';

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
      if (resJson.points !== undefined) {
        phase1Points = resJson.points;
      } else if (resJson.similarity) {
        const simParsed = parseFloat(resJson.similarity.replace('%', ''));
        if (!isNaN(simParsed)) {
          phase1Points = Math.round(MAX_IMAGE_POINTS * (simParsed / 100));
        }
      }
      if (resJson.similarity) {
        simMatch = resJson.similarity;
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

      setPhaseSuccessNotice(`✓ Image 1 evaluated (+${phase1Points}/50 pts)! Slot for Image 2 is now unlocked.`);
    } catch (err) {
      setFormGlobalError(err?.message || 'Error communicating with evaluation server. Please retry.');
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
    const formattedSpeed = formatTime(finalElapsed);
    const image1Points = image1EvaluatedData?.score || 0;

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || '';
      const teamId = localStorage.getItem('cyphora_team_id') || '';
      const storedTeamName = localStorage.getItem('cyphora_team_name') || teamName || '';

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
          image2Points = Math.round(MAX_IMAGE_POINTS * (simParsed / 100));
        }
      }
      finalTotalPoints = image1Points + image2Points;

      if (resData.image2_similarity) {
        image2Similarity = resData.image2_similarity;
      }
      if (resData.new_total_score !== undefined) {
        localStorage.setItem('cyphora_team_score', resData.new_total_score.toString());
      }

      setEvaluatedScore(finalTotalPoints);
      setTeamPoints(finalTotalPoints);
      localStorage.setItem('cyphora_round2_score', finalTotalPoints.toString());
      localStorage.setItem('cyphora_round2_speed', formattedSpeed);
      setIsRound2Completed(true);
      localStorage.setItem('cyphora_round2_completed', 'true');
      localStorage.setItem('cyphora_round3_unlocked', 'true');
      sessionStorage.setItem('cyphora_round3_unlocked', 'true');
      if (teamId) {
        sessionStorage.setItem(`cyphora_round3_override_${teamId}`, 'true');
      }
      sessionStorage.setItem('cyphora_round3_supervisor_override', 'true');

      // Record evidence in VFS
      try {
        vfs.writeFile('/Evidence/round2_final_submission.json', JSON.stringify({
          teamName,
          finalTotalPoints,
          image1Points,
          image2Points,
          image2Similarity,
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

  const handleProceedToRound3 = useCallback(async () => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('cyphora_round3_unlocked', 'true');
      localStorage.setItem('cyphora_round2_completed', 'true');
    }
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('cyphora_round3_unlocked', 'true');
      if (teamId) {
        sessionStorage.setItem(`cyphora_round3_override_${teamId}`, 'true');
      }
      sessionStorage.setItem('cyphora_round3_supervisor_override', 'true');
    }

    try {
      const hostname = window.location.hostname || 'localhost';
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';
      const token = localStorage.getItem('cyphora_token') || sessionStorage.getItem('cyphora_token');
      const storedTeamId = teamData?.id || localStorage.getItem('cyphora_team_id');
      const storedTeamName = teamData?.name || localStorage.getItem('cyphora_team_name') || teamName;

      await fetch(`${apiBase}/api/stage2/unlock-round3`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(storedTeamId ? { 'x-team-id': String(storedTeamId) } : {}),
          ...(storedTeamName ? { 'x-team-name': storedTeamName } : {})
        }
      }).catch(err => console.warn('Unlock API warning:', err));
    } catch (e) {
      console.warn('Unlock round 3 call error:', e);
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('cyphora_round3_access_changed', { detail: { unlocked: true } }));
      window.dispatchEvent(new Event('cyphora_points_updated'));
    }
    if (eventBus && typeof eventBus.emit === 'function') {
      eventBus.emit('ROUND3_ACCESS_UPDATED', { unlocked: true, teamId: teamData?.id });
    }

    setShowFinalFragmentModal(false);
    setIsCodeModalOpen(false);

    if (typeof openApp === 'function') {
      openApp('round3', { meta: { isMaximized: true } });
    }
    if (typeof closeWindow === 'function' && windowId) {
      closeWindow(windowId);
    }
  }, [teamId, teamData, teamName, eventBus, openApp, closeWindow, windowId]);

  const handleUnlockCodeSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const allowedCodes = ['HORIZON', 'SPECTRA', 'NEXUS', 'CYPHORA', 'AEGIS', 'CHRONOS'];
    const entered = unlockCode.trim().toUpperCase();
    if (!entered || allowedCodes.includes(entered)) {
      setIsCodeModalOpen(false);
      setPhaseSuccessNotice('Stage 3 clearance authorized! Launching Round 3...');
      handleProceedToRound3();
    } else {
      setUnlockError('Invalid authorization code. Click "Proceed to Round 3" below to bypass.');
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

  const isLocked = !isSupervisorOverridden && !isRound2Authorized;

  if (isLocked) {
    return (
      <div className="os-round2-container os-round2-locked-container">
        <div className="os-round2-bg" aria-hidden="true" />
        <header className="os-round2-toolbar">
          <div className="os-round2-title-section">
            <span className="os-round2-badge">ROUND 2</span>
            <span className="os-round2-sub-badge">IMAGE NAVIGATION</span>
          </div>
          <div className="os-round2-metrics">
            <span className="r2-badge-locked">
              <Lock size={12} /> RESTRICTED ACCESS
            </span>
          </div>
        </header>

        <div className="os-round2-lockout-body">
          <div className="lockout-card">
            <div className="lockout-icon-pulse">
              <Lock size={36} color="#dfb125" />
            </div>

            {!isRound1Completed ? (
              <>
                <h2 className="lockout-title">ROUND 1 IN PROGRESS</h2>
                <div className="lockout-badge warning">
                  <AlertTriangle size={14} />
                  <span>SUBSYSTEM RESTORATION INCOMPLETE ({completedTasksCount}/12)</span>
                </div>
                <p className="lockout-desc">
                  This workstation is actively assigned to <strong>Round 1: OS Navigation</strong>.
                  All 12 subsystem challenges must be solved to calibrate the optical communication transceiver before Round 2 can be accessed.
                </p>

                <div className="lockout-progress-bar-wrap">
                  <div className="lockout-progress-track">
                    <div
                      className="lockout-progress-fill"
                      style={{ width: `${Math.round((completedTasksCount / 12) * 100)}%` }}
                    />
                  </div>
                  <span className="lockout-progress-text">{completedTasksCount} of 12 Tasks Verified ({Math.round((completedTasksCount / 12) * 100)}%)</span>
                </div>

                <div className="lockout-actions">
                  <button
                    type="button"
                    className="lockout-primary-btn"
                    onClick={() => {
                      if (windowId && typeof closeWindow === 'function') {
                        closeWindow(windowId);
                      }
                      openApp('terminal');
                      if (eventBus && typeof eventBus.emit === 'function') {
                        eventBus.emit('OPEN_TASKS');
                      }
                    }}
                  >
                    <span>Switch to Task Terminal</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2 className="lockout-title">AWAITING ADMINISTRATOR CLEARANCE</h2>
                <div className="lockout-badge success">
                  <CheckCircle2 size={14} />
                  <span>ROUND 1 VERIFIED COMPLETE (12/12 TASKS)</span>
                </div>
                <p className="lockout-desc">
                  Station subsystems are restored! <strong>Round 2: Image Navigation</strong> is waiting for central authorization from the central <strong>Admin Dashboard</strong>.
                </p>

                <div className="lockout-beacon">
                  <span className="beacon-dot"></span>
                  <span>Listening for real-time clearance signal from Admin Command...</span>
                </div>
              </>
            )}

            {/* Supervisor On-Premise Authentication Form */}
            <div className="lockout-supervisor-box">
              <div className="supervisor-box-header">
                <Shield size={13} color="#dfb125" />
                <span>Supervisor On-Site Override</span>
              </div>
              <form onSubmit={handleAdminSupervisorLogin} className="supervisor-auth-form">
                <div className="supervisor-input-group">
                  <input
                    type="text"
                    name="supervisor_override_code"
                    placeholder="Enter Admin Password..."
                    value={adminAuthCode}
                    onChange={(e) => setAdminAuthCode(e.target.value)}
                    className="supervisor-input pin-mask-input"
                    maxLength={32}
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-1p-ignore="true"
                    data-form-type="other"
                  />
                  <button
                    type="submit"
                    className="supervisor-unlock-btn"
                    disabled={isVerifyingAdmin}
                  >
                    <Key size={13} />
                    <span>{isVerifyingAdmin ? 'Verifying...' : 'Authorize'}</span>
                  </button>
                </div>
                {adminAuthError && (
                  <span className="supervisor-error-msg">{adminAuthError}</span>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <span>ROUND 2</span>
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
          <div className="os-header-speed-pill" title="Round 2 Accuracy Potential">
            <Flame size={13} color="#dfb125" />
            <span>50 PTS / IMAGE</span>
            <span className="speed-pts-total">({maxTotalRound2Points} MAX)</span>
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

          {isRound2Completed && (
            <button
              type="button"
              className="os-proceed-round3-btn"
              onClick={handleProceedToRound3}
              title="Round 2 Complete! Proceed to Round 3"
            >
              <Compass size={13} />
              <span>Round 3 →</span>
            </button>
          )}
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

                {isRound2Completed && (
                  <button
                    type="button"
                    className="os-proceed-round3-btn"
                    onClick={handleProceedToRound3}
                    title="Round 2 Complete! Proceed to Round 3"
                  >
                    <Compass size={13} />
                    <span>Proceed to Round 3 →</span>
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
          <div className="temple-modal-slab temple-modal-slab--final" onClick={e => e.stopPropagation()}>
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
                <div className="temple-score-divider" aria-hidden="true">=</div>
                <div className="temple-modal-score-stone temple-modal-score-stone--total">
                  <span className="temple-score-label">ACCURACY TOTAL</span>
                  <span className="temple-score-value">{fragment1Score + fragment2Score}<span className="temple-score-unit"> / 100</span></span>
                </div>
              </div>
              <p className="temple-modal-desc">
                Both runes are aligned. The carved stone gate groans open, vines
                parting to reveal the amber-lit corridor of the Inner Temple.
                Present this seal to your expedition guide.
              </p>
              <div className="temple-modal-actions-row">
                <button
                  type="button"
                  id="final-fragment-proceed-btn"
                  className="temple-modal-btn temple-modal-btn--final"
                  onClick={handleProceedToRound3}
                >
                  🏛 Enter Temple: Proceed to Round 3 →
                </button>
                <button
                  type="button"
                  className="temple-modal-dismiss-btn"
                  onClick={() => setShowFinalFragmentModal(false)}
                >
                  Close & View Board
                </button>
              </div>
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
                  Enter symposium clearance cipher to authorize Round 3 access:
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
                <button type="button" className="os-submit-btn" onClick={handleProceedToRound3} style={{ background: '#238636' }}>
                  Proceed to Round 3 →
                </button>
                <button type="submit" className="os-sub-action-btn">
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

      {/* ── ROUND 2 TIME EXPIRED FULL-SCREEN LOCKOUT ── */}
      {isRound2TimerExpired && !proctorUnlockedRound2 && (
        <RoundTimerLockScreen
          round={2}
          roundName="Round 2 — Image Navigation"
          teamName={teamData?.name || 'Explorer'}
          onUnlockOverride={() => {
            setProctorUnlockedRound2(true);
            setIsRound2TimerExpired(false);
          }}
        />
      )}
    </div>
  );
}
export default Round2App;
