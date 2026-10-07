import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Lock,
  Users,
  Activity,
  Award,
  Clock,
  Search,
  Download,
  Database,
  Edit2,
  Trash2,
  FileText,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Tag,
  ExternalLink,
  Key,
  Compass,
  Trophy,
  History,
  Layers,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Eye,
  Check
} from 'lucide-react';
import './AdminPortal.css';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
const API_BASE = isDevPort ? `http://${hostname}:8000` : '';
const WS_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_HOST = isDevPort ? `${hostname}:8000` : (typeof window !== 'undefined' ? window.location.host : 'localhost:8000');
const WS_URL = `${WS_PROTOCOL}//${WS_HOST}/ws/live`;

const HARDCODED_ADMIN_PASS = "JCEAIML";

export function AdminPortal() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [adminToken, setAdminToken] = useState('');

  // Telemetry & Data
  const [teams, setTeams] = useState([]);
  const [systemStatus, setSystemStatus] = useState(null);
  const [isWsConnected, setIsWsConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  const [globalTimer, setGlobalTimer] = useState(null);
  const [timers, setTimers] = useState({
    round1: { round: 1, action: 'reset', duration_minutes: 60, remaining_seconds: 3600 },
    round2: { round: 2, action: 'reset', duration_minutes: 30, remaining_seconds: 1800 },
    round3: { round: 3, action: 'reset', duration_minutes: 30, remaining_seconds: 1800 }
  });
  const [activeTimerTab, setActiveTimerTab] = useState(1); // 1 | 2 | 3

  // Search & Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'idle' | 'noted'
  const [sortField, setSortField] = useState('final_score'); // default sort by Final Winner Score (R2 + R3)
  const [sortAsc, setSortAsc] = useState(false);

  // Score Audit Modal & Live Feed
  const [auditModal, setAuditModal] = useState({ open: false, team: null, submissions: [], loading: false });
  const [showGlobalAuditFeed, setShowGlobalAuditFeed] = useState(false);
  const [globalFeed, setGlobalFeed] = useState([]);
  const [loadingFeed, setLoadingFeed] = useState(false);
  const [feedFilterStage, setFeedFilterStage] = useState('all');
  const [feedSearch, setFeedSearch] = useState('');

  // Modals
  const [scoreModal, setScoreModal] = useState({ open: false, team: null, delta: 0, reason: '', exactScore: '' });
  const [editModal, setEditModal] = useState({ open: false, team: null, name: '', member1: '', member2: '', current_stage: 1, notes: '' });
  const [noteModal, setNoteModal] = useState({ open: false, team: null, notes: '' });
  const [pinModal, setPinModal] = useState({ open: false, team: null, newPin: '' });
  const [timerModal, setTimerModal] = useState({ open: false, round: 1, durationMinutes: 60 });

  // Live timer tick
  const [currentTime, setCurrentTime] = useState(new Date());

  const socketRef = useRef(null);

  // Unlock scrolling exclusively for the Admin Portal
  useEffect(() => {
    document.documentElement.classList.add('admin-scroll-active');
    document.body.classList.add('admin-scroll-active');
    const rootEl = document.getElementById('root');
    if (rootEl) rootEl.classList.add('admin-scroll-active');

    // Clear any lingering inline overflow styles set by participant views
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
    if (rootEl) rootEl.style.overflow = '';

    return () => {
      document.documentElement.classList.remove('admin-scroll-active');
      document.body.classList.remove('admin-scroll-active');
      if (rootEl) rootEl.classList.remove('admin-scroll-active');
    };
  }, []);

  // Check saved session on mount
  useEffect(() => {
    const savedToken = sessionStorage.getItem('cyphora_admin_token') || localStorage.getItem('cyphora_admin_token');
    if (savedToken) {
      setAdminToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  // Timer interval for relative time calculations
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch telemetry from server
  const fetchTeams = async (token = adminToken) => {
    if (!token && !isAuthenticated) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/teams`, {
        headers: {
          'Authorization': `Bearer ${token || HARDCODED_ADMIN_PASS}`,
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        }
      });
      if (res.ok) {
        const data = await res.json();
        setTeams(data.teams || []);
      }
    } catch (err) {
      console.warn('Failed to fetch admin teams', err);
    }
  };

  const fetchStatus = async (token = adminToken) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/status`, {
        headers: {
          'Authorization': `Bearer ${token || HARDCODED_ADMIN_PASS}`,
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSystemStatus(data);
      }
    } catch (err) {}
  };

  const fetchTimer = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/timer`, {
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalTimer(data.round1 || data);
        if (data.all_timers) {
          setTimers(data.all_timers);
        } else {
          setTimers(prev => ({
            round1: data.round1 || prev.round1,
            round2: data.round2 || prev.round2,
            round3: data.round3 || prev.round3
          }));
        }
      }
    } catch (err) {}
  };

  const fetchGlobalFeed = async () => {
    setLoadingFeed(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/submissions/feed?limit=200`, {
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      if (res.ok) {
        const data = await res.json();
        setGlobalFeed(data.feed || []);
      }
    } catch (err) {
    } finally {
      setLoadingFeed(false);
    }
  };

  const openTeamScoreAudit = async (team) => {
    setAuditModal({ open: true, team, submissions: [], loading: true });
    try {
      const res = await fetch(`${API_BASE}/api/admin/teams/${team.id}/submissions`, {
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      if (res.ok) {
        const data = await res.json();
        setAuditModal({ open: true, team, submissions: data.submissions || [], loading: false });
      } else {
        setAuditModal(prev => ({ ...prev, loading: false }));
      }
    } catch (e) {
      setAuditModal(prev => ({ ...prev, loading: false }));
    }
  };

  // Timer configuration for Round 1, 2, or 3 (Timers start dynamically per workstation upon entry)
  const handleControlTimer = async (roundNum, action, durationMinutes = null) => {
    try {
      const rKey = `round${roundNum}`;
      const curTimer = timers[rKey] || { duration_minutes: roundNum === 1 ? 60 : 30 };
      const dur = durationMinutes !== null ? durationMinutes : (curTimer.duration_minutes || (roundNum === 1 ? 60 : 30));

      const res = await fetch(`${API_BASE}/api/admin/timer?round=${roundNum}&duration_minutes=${dur}&action=${action}`, {
        method: 'POST',
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      if (res.ok) {
        const data = await res.json();
        if (data.all_timers) {
          setTimers(data.all_timers);
        } else if (data.timer) {
          setTimers(prev => ({ ...prev, [rKey]: data.timer }));
        }
        if (roundNum === 1 && data.timer) {
          setGlobalTimer(data.timer);
        }
      }
    } catch (e) {
      alert(`Error updating Round ${roundNum} duration`);
    }
  };

  const getRemainingTimeString = (t) => {
    if (!t) return '60:00';
    const mins = t.duration_minutes || (t.round === 1 ? 60 : 30);
    return `${mins.toString().padStart(2, '0')}:00`;
  };

  const getTimerStatus = (t) => {
    return 'configured';
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
      fetchStatus();
      fetchTimer();
      const statusInterval = setInterval(() => {
        fetchStatus();
        fetchTimer();
      }, 15000);
      return () => clearInterval(statusInterval);
    }
  }, [isAuthenticated]);

  // Real-Time WebSocket live stream for instant 100-workstation telemetry
  useEffect(() => {
    if (!isAuthenticated) return;

    let reconnectTimeout;
    const connectWs = () => {
      try {
        const socket = new WebSocket(WS_URL);
        socketRef.current = socket;

        socket.onopen = () => {
          setIsWsConnected(true);
        };

        socket.onmessage = (event) => {
          try {
            const payload = JSON.parse(event.data);
            if (payload.event === 'LEADERBOARD_UPDATE' || payload.event === 'INITIAL_STATE') {
              if (Array.isArray(payload.data)) {
                setTeams(payload.data);
                fetchStatus();
              }
              if (payload.timers) {
                setTimers(payload.timers);
              }
              if (payload.timer) {
                setGlobalTimer(payload.timer);
              }
            } else if (payload.event === 'EVENT_TIMER_SYNC') {
              if (payload.data?.all_timers) {
                setTimers(payload.data.all_timers);
                if (payload.data.all_timers.round1) {
                  setGlobalTimer(payload.data.all_timers.round1);
                }
              } else if (payload.data?.round) {
                const rKey = `round${payload.data.round}`;
                setTimers(prev => ({ ...prev, [rKey]: payload.data }));
                if (payload.data.round === 1) {
                  setGlobalTimer(payload.data);
                }
              }
            }
          } catch (e) {}
        };

        socket.onclose = () => {
          setIsWsConnected(false);
          reconnectTimeout = setTimeout(connectWs, 3000);
        };
      } catch (err) {
        reconnectTimeout = setTimeout(connectWs, 5000);
      }
    };

    connectWs();

    return () => {
      if (socketRef.current) socketRef.current.close();
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
    };
  }, [isAuthenticated]);

  // Handle Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    const pass = passwordInput.trim();

    if (pass === HARDCODED_ADMIN_PASS) {
      sessionStorage.setItem('cyphora_admin_token', HARDCODED_ADMIN_PASS);
      setAdminToken(HARDCODED_ADMIN_PASS);
      setIsAuthenticated(true);
      fetchTeams(HARDCODED_ADMIN_PASS);
      fetchStatus(HARDCODED_ADMIN_PASS);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pass })
      });
      if (res.ok) {
        const data = await res.json();
        sessionStorage.setItem('cyphora_admin_token', data.token);
        setAdminToken(data.token);
        setIsAuthenticated(true);
        fetchTeams(data.token);
        fetchStatus(data.token);
      } else {
        setLoginError('Invalid Administrator Password.');
      }
    } catch (err) {
      setLoginError('Could not connect to backend server. Verify run_server.py is running.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('cyphora_admin_token');
    localStorage.removeItem('cyphora_admin_token');
    setIsAuthenticated(false);
    setAdminToken('');
  };

  // Quick Score Update
  const handleQuickScore = async (teamId, delta) => {
    try {
      const reasonTag = delta === 20 ? 'Round 1 Task (+20 pts)'
        : delta === 50 ? 'Round 2 Image (+50 pts)'
        : delta === -5 ? 'Hint 1 deduction (-5 pts)'
        : delta === -10 ? 'Hints 1 & 2 deduction (-10 pts)'
        : `Score adjustment (${delta > 0 ? '+' : ''}${delta} pts)`;

      await fetch(`${API_BASE}/api/admin/teams/${teamId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ points_delta: delta, reason: reasonTag })
      });
      fetchTeams();
    } catch (e) {
      alert('Error adjusting score');
    }
  };

  // Save Modal Score
  const handleSaveModalScore = async () => {
    if (!scoreModal.team) return;
    try {
      const body = scoreModal.exactScore !== ''
        ? { new_score: parseInt(scoreModal.exactScore, 10), reason: scoreModal.reason }
        : { points_delta: parseInt(scoreModal.delta, 10), reason: scoreModal.reason };

      await fetch(`${API_BASE}/api/admin/teams/${scoreModal.team.id}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify(body)
      });
      setScoreModal({ open: false, team: null, delta: 0, reason: '', exactScore: '' });
      fetchTeams();
    } catch (e) {
      alert('Error updating score');
    }
  };

  // Save Edit Team
  const handleSaveEditTeam = async () => {
    if (!editModal.team) return;
    try {
      await fetch(`${API_BASE}/api/admin/teams/${editModal.team.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({
          name: editModal.name,
          member1: editModal.member1,
          member2: editModal.member2,
          current_stage: parseInt(editModal.current_stage, 10),
          notes: editModal.notes
        })
      });
      setEditModal({ open: false, team: null, name: '', member1: '', member2: '', current_stage: 1, notes: '' });
      fetchTeams();
    } catch (e) {
      alert('Error saving team updates');
    }
  };

  // Save Note
  const handleSaveNote = async () => {
    if (!noteModal.team) return;
    try {
      await fetch(`${API_BASE}/api/admin/teams/${noteModal.team.id}/note`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ notes: noteModal.notes })
      });
      setNoteModal({ open: false, team: null, notes: '' });
      fetchTeams();
    } catch (e) {
      alert('Error updating team note');
    }
  };

  // Delete Team
  const handleDeleteTeam = async (team) => {
    if (!window.confirm(`Are you sure you want to disqualify/delete '${team.name}'?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/teams/${team.id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      fetchTeams();
    } catch (e) {
      alert('Error deleting team');
    }
  };

  // Toggle Round 2 Access for single team
  const handleToggleRound2Access = async (team, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/teams/${team.id}/round2-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ unlocked: newStatus })
      });
      if (res.ok) {
        fetchTeams();
      } else {
        alert('Failed to update Round 2 access');
      }
    } catch (e) {
      alert('Network error updating Round 2 access');
    }
  };

  // Bulk authorize or revoke Round 2 Access for all teams
  const handleBulkRound2Access = async (unlocked) => {
    const actionText = unlocked ? 'AUTHORIZE all teams for Round 2' : 'LOCK Round 2 for all teams';
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/round2/authorize-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ unlocked })
      });
      if (res.ok) {
        fetchTeams();
      } else {
        alert('Failed to execute bulk Round 2 access update');
      }
    } catch (e) {
      alert('Network error updating bulk Round 2 access');
    }
  };

  // Toggle Round 3 Access for single team
  const handleToggleRound3Access = async (team, newStatus) => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/teams/${team.id}/round3-access`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ unlocked: newStatus })
      });
      if (res.ok) {
        fetchTeams();
      } else {
        alert('Failed to update Round 3 access');
      }
    } catch (e) {
      alert('Network error updating Round 3 access');
    }
  };

  // Bulk authorize or revoke Round 3 Access for all teams
  const handleBulkRound3Access = async (unlocked) => {
    const actionText = unlocked ? 'AUTHORIZE all teams for Round 3' : 'LOCK Round 3 for all teams';
    if (!window.confirm(`Are you sure you want to ${actionText}?`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/round3/authorize-all`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ unlocked })
      });
      if (res.ok) {
        fetchTeams();
      } else {
        alert('Failed to execute bulk Round 3 access update');
      }
    } catch (e) {
      alert('Network error updating bulk Round 3 access');
    }
  };

  // Reset or update team secret PIN
  const handleSaveModalPin = async () => {
    if (!pinModal.team) return;
    const cleanPin = (pinModal.newPin || '').trim();
    if (!cleanPin || cleanPin.length < 4) {
      alert('PIN must be at least 4 digits/characters.');
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/api/admin/teams/${pinModal.team.id}/pin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken || HARDCODED_ADMIN_PASS}`,
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ new_pin: cleanPin })
      });
      if (res.ok) {
        setPinModal({ open: false, team: null, newPin: '' });
        fetchTeams();
      } else {
        const err = await res.json();
        alert(err.detail || 'Failed to update team PIN');
      }
    } catch (err) {
      alert('Network error updating team PIN');
    }
  };

  // Reset / Clear all mock or test data
  const handleResetLeaderboard = async () => {
    if (!window.confirm("WARNING: This will permanently purge all mock and test team data, resetting to 0 real participants. Are you sure?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/admin/reset-leaderboard`, {
        method: 'POST',
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      if (res.ok) {
        alert('Leaderboard reset. All mock data cleared.');
        fetchTeams();
        fetchStatus();
      } else {
        alert('Failed to reset leaderboard');
      }
    } catch (e) {
      alert('Error communicating with backend');
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    window.open(`${API_BASE}/api/admin/export/csv?auth=${HARDCODED_ADMIN_PASS}`, '_blank');
  };

  // Export JSON
  const handleExportJSON = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/export/json`, {
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      const data = await res.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cyphora_leaderboard_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
    } catch (e) {
      alert('Export failed');
    }
  };

  // Snapshot Backup
  const handleTriggerBackup = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/admin/backup`, {
        method: 'POST',
        headers: { 'X-Admin-Password': HARDCODED_ADMIN_PASS }
      });
      const data = await res.json();
      alert(`ACID Backup snapshot created successfully:\n${data.backup_file}`);
      fetchStatus();
    } catch (e) {
      alert('Backup snapshot failed');
    }
  };

  // Time formatters
  const formatTimeSince = (dateStr) => {
    if (!dateStr) return '—';
    const date = new Date(dateStr);
    const diffSec = Math.floor((currentTime - date) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    return `${diffHr}h ${diffMin % 60}m ago`;
  };

  const formatElapsed = (dateStr) => {
    if (!dateStr) return '00:00';
    const date = new Date(dateStr);
    const diffSec = Math.max(0, Math.floor((currentTime - date) / 1000));
    const h = Math.floor(diffSec / 3600);
    const m = Math.floor((diffSec % 3600) / 60);
    const s = diffSec % 60;
    if (h > 0) return `${h}h ${m < 10 ? '0' : ''}${m}m`;
    return `${m < 10 ? '0' : ''}${m}m ${s < 10 ? '0' : ''}${s}s`;
  };

  // Sorting and Filtering
  const filteredTeams = teams.filter(t => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      t.name.toLowerCase().includes(q) ||
      (t.member1 && t.member1.toLowerCase().includes(q)) ||
      (t.member2 && t.member2.toLowerCase().includes(q)) ||
      (t.notes && t.notes.toLowerCase().includes(q)) ||
      (t.last_ip && t.last_ip.toLowerCase().includes(q));

    if (!matchesSearch) return false;
    if (statusFilter === 'active') return t.status === 'active';
    if (statusFilter === 'idle') return t.status === 'idle';
    if (statusFilter === 'noted') return Boolean(t.notes);
    return true;
  });

  // Calculate Championship Winner Ranking based on Round 2 + Round 3 score
  const championshipRankedTeams = [...teams].sort((a, b) => {
    const fA = (a.round2_score || 0) + (a.round3_score || 0);
    const fB = (b.round2_score || 0) + (b.round3_score || 0);
    if (fB !== fA) return fB - fA;
    return (b.score || 0) - (a.score || 0);
  });

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let cmp = 0;
    const finalA = (a.round2_score || 0) + (a.round3_score || 0);
    const finalB = (b.round2_score || 0) + (b.round3_score || 0);

    if (sortField === 'final_score') cmp = finalB - finalA;
    else if (sortField === 'score') cmp = (b.score || 0) - (a.score || 0);
    else if (sortField === 'round1_score') cmp = (b.round1_score || 0) - (a.round1_score || 0);
    else if (sortField === 'round2_score') cmp = (b.round2_score || 0) - (a.round2_score || 0);
    else if (sortField === 'round3_score') cmp = (b.round3_score || 0) - (a.round3_score || 0);
    else if (sortField === 'rank') cmp = a.rank - b.rank;
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortField === 'stage') cmp = (a.current_stage || 1) - (b.current_stage || 1);
    else if (sortField === 'updated_at') cmp = new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
    return sortAsc ? cmp : -cmp;
  });

  const handleSortClick = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // ── Render Login Screen if not authenticated ──
  if (!isAuthenticated) {
    return (
      <div className="cyphora-admin-root">
        <div className="admin-login-screen">
          <div className="admin-login-card">
            <span className="admin-login-badge">
              <Lock size={12} /> Restricted Access
            </span>
            <h1>EXPEDITION CONTROL</h1>
            <p>Enter Master Administrator Password to access CYPHORA Command.</p>
            <form onSubmit={handleLoginSubmit} autoComplete="off" data-lpignore="true" data-form-type="other">
              <div className="admin-input-group">
                <Lock size={18} color="#dfb125" />
                <input
                  type="text"
                  name="master_admin_token"
                  className="pin-mask-input"
                  placeholder="Master Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoComplete="off"
                  autoCorrect="off"
                  autoCapitalize="off"
                  spellCheck="false"
                  data-lpignore="true"
                  data-1p-ignore="true"
                  data-form-type="other"
                  autoFocus
                />
              </div>
              {loginError && <div className="admin-login-error">{loginError}</div>}
              <button type="submit" className="admin-login-btn">
                <span>Unlock Control Center</span>
              </button>
            </form>
            <div style={{ marginTop: '1.5rem' }}>
              <a href="/" style={{ color: '#8c8268', fontSize: '0.8rem', textDecoration: 'none' }}>
                &larr; Return to Expedition Hub
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Render Full Admin Command Center ──
  return (
    <div className="cyphora-admin-root">
      {/* ── Top Navigation Bar ── */}
      <header className="admin-navbar">
        <div className="admin-nav-left">
          <div className="admin-brand">
            <Shield size={20} color="#dfb125" />
            <span>CYPHORA // ADMIN COMMAND</span>
          </div>
          <span className={`admin-live-chip ${isWsConnected ? 'connected' : 'disconnected'}`}>
            <span className="admin-pulse-dot"></span>
            {isWsConnected ? 'REAL-TIME DB SYNCED' : 'RECONNECTING DB...'}
          </span>
        </div>

        <div className="admin-nav-right">
          <button className="admin-btn" onClick={() => fetchTeams()} title="Refresh Data">
            <RefreshCw size={14} />
            <span>Sync</span>
          </button>
          <button className="admin-btn" onClick={handleExportCSV}>
            <Download size={14} />
            <span>Export CSV</span>
          </button>
          <button className="admin-btn" onClick={handleTriggerBackup} title="Trigger ACID backup snapshot">
            <Database size={14} />
            <span>Backup Snapshot</span>
          </button>
          <button className="admin-btn danger" onClick={handleResetLeaderboard} title="Purge mock and test data so only real workstations appear">
            <Trash2 size={14} />
            <span>Clear Mock Data</span>
          </button>
          <a href="/" className="admin-btn" style={{ textDecoration: 'none' }} target="_blank" rel="noreferrer">
            <ExternalLink size={14} />
            <span>Participant Hub</span>
          </a>
          <button className="admin-btn danger" onClick={handleLogout} title="Lock Admin Portal">
            <LogOut size={14} />
            <span>Lock</span>
          </button>
        </div>
      </header>

      {/* ── Main Container ── */}
      <main className="admin-container">
        {/* ── Telemetry Stats Cards (Scale of 100 Workstations) ── */}
        <section className="admin-metrics-grid">
          <div className="admin-metric-card">
            <div className="metric-icon-wrap"><Users size={22} /></div>
            <div className="metric-data">
              <span className="metric-label">Registered Teams</span>
              <span className="metric-val">{teams.length} / 100</span>
              <span className="metric-sub">{100 - teams.length} workstations open</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap" style={{ color: '#98c379', background: 'rgba(152,195,121,0.1)', borderColor: 'rgba(152,195,121,0.3)' }}>
              <Activity size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-label">Online Stations</span>
              <span className="metric-val" style={{ color: '#98c379' }}>
                {teams.filter(t => t.status === 'active').length}
              </span>
              <span className="metric-sub">{teams.filter(t => t.status === 'idle').length} idle / standby</span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap"><Award size={22} /></div>
            <div className="metric-data">
              <span className="metric-label">Top Total Score</span>
              <span className="metric-val">
                {teams.length > 0 ? Math.max(...teams.map(t => t.score || 0)) : 0} pts
              </span>
              <span className="metric-sub">
                Overall: {teams[0]?.name || 'None'}
              </span>
            </div>
          </div>

          <div className="admin-metric-card" style={{ borderColor: 'rgba(223, 177, 37, 0.45)' }}>
            <div className="metric-icon-wrap" style={{ color: '#dfb125', background: 'rgba(223,177,37,0.12)' }}>
              <Trophy size={22} />
            </div>
            <div className="metric-data">
              <span className="metric-label">Top Final (R2+R3)</span>
              <span className="metric-val">
                {championshipRankedTeams.length > 0 ? ((championshipRankedTeams[0]?.round2_score || 0) + (championshipRankedTeams[0]?.round3_score || 0)) : 0} pts
              </span>
              <span className="metric-sub">
                Champion: {championshipRankedTeams[0]?.name || 'None'}
              </span>
            </div>
          </div>

          <div className="admin-metric-card">
            <div className="metric-icon-wrap"><Database size={22} /></div>
            <div className="metric-data">
              <span className="metric-label">Database Engine</span>
              <span className="metric-val" style={{ fontSize: '1.05rem', marginTop: '0.2rem' }}>SQLite WAL</span>
              <span className="metric-sub">
                {systemStatus ? `${systemStatus.database_size_kb} KB | WAL ${systemStatus.wal_journal_size_kb} KB` : 'Active'}
              </span>
            </div>
          </div>
        </section>


        {/* ── Unified Timer Hub: Round 1, 2, 3 in Single Tabbed Container ── */}
        <section className="timer-hub-card">
          <div className="timer-hub-header">
            <div className="timer-hub-title">
              <Clock size={20} color="#dfb125" />
              <span>ROUND DURATION CONFIGURATION</span>
            </div>

            <div className="timer-hub-tabs">
              {[
                { round: 1, label: 'Round 1: Virtual OS', timer: timers.round1 },
                { round: 2, label: 'Round 2: Image Recon', timer: timers.round2 },
                { round: 3, label: 'Round 3: Blockly Forest', timer: timers.round3 }
              ].map(tab => {
                return (
                  <button
                    key={tab.round}
                    className={`timer-tab-btn ${activeTimerTab === tab.round ? 'active' : ''}`}
                    onClick={() => setActiveTimerTab(tab.round)}
                  >
                    <span className="timer-tab-dot running"></span>
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {(() => {
            const currentTimerObj = timers[`round${activeTimerTab}`] || {
              round: activeTimerTab,
              action: 'configured',
              duration_minutes: activeTimerTab === 1 ? 60 : 30,
              remaining_seconds: (activeTimerTab === 1 ? 60 : 30) * 60
            };
            const timeStr = getRemainingTimeString(currentTimerObj);
            const milestoneHint =
              activeTimerTab === 1
                ? 'Countdown starts dynamically after team enters into OS'
                : activeTimerTab === 2
                ? 'Countdown starts dynamically after team enters Round 2 app'
                : 'Countdown starts dynamically after finishing the beginning story';

            return (
              <div className="timer-hub-body">
                {/* Clock Display */}
                <div className="timer-clock-display">
                  <div className="timer-digits">{timeStr}</div>
                  <span className="timer-status-badge running" style={{ color: '#dfb125', borderColor: '#dfb125' }}>
                    CONFIGURED
                  </span>
                </div>

                {/* Presets */}
                <div className="timer-presets-wrap">
                  <span className="timer-presets-label">
                    Quick Duration Presets ({currentTimerObj.duration_minutes || (activeTimerTab === 1 ? 60 : 30)} min active)
                  </span>
                  <div className="timer-presets-row">
                    {[10, 15, 20, 30, 45, 60, 90].map(mins => (
                      <button
                        key={mins}
                        className={`timer-preset-chip ${currentTimerObj.duration_minutes === mins ? 'active' : ''}`}
                        onClick={() => handleControlTimer(activeTimerTab, 'set', mins)}
                        title={`Set Round ${activeTimerTab} duration to ${mins} minutes`}
                      >
                        {mins}m
                      </button>
                    ))}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#dfb125', marginTop: '0.35rem', fontStyle: 'italic' }}>
                    ⚡ {milestoneHint}
                  </div>
                </div>

                {/* Actions */}
                <div className="timer-hub-controls">
                  <button
                    className="timer-ctrl-btn primary"
                    onClick={() => setTimerModal({ open: true, round: activeTimerTab, durationMinutes: currentTimerObj.duration_minutes || (activeTimerTab === 1 ? 60 : 30) })}
                    title="Configure Custom Duration"
                  >
                    <Clock size={14} /> Custom Duration
                  </button>

                  <button
                    className="timer-ctrl-btn reset"
                    onClick={() => handleControlTimer(activeTimerTab, 'reset')}
                    title="Reset to default duration"
                  >
                    <RotateCcw size={14} /> Reset Default
                  </button>
                </div>
              </div>
            );
          })()}
        </section>

        {/* ── Global Score Audit & Stream Toggle ── */}
        <section className="global-feed-banner">
          <div
            className="global-feed-toggle-row"
            onClick={() => {
              if (!showGlobalAuditFeed && globalFeed.length === 0) {
                fetchGlobalFeed();
              }
              setShowGlobalAuditFeed(!showGlobalAuditFeed);
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <History size={18} color="#dfb125" />
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#eae0c8' }}>
                TOURNAMENT SCORE AUDIT & LIVE ACTIVITY STREAM
              </span>
              <span style={{ fontSize: '0.72rem', color: '#8c8268', background: 'rgba(0,0,0,0.5)', padding: '0.15rem 0.5rem', borderRadius: '3px' }}>
                {globalFeed.length > 0 ? `${globalFeed.length} audit records loaded` : 'Click to inspect how all teams got points'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              {showGlobalAuditFeed ? <ChevronUp size={16} color="#dfb125" /> : <ChevronDown size={16} color="#dfb125" />}
            </div>
          </div>

          {showGlobalAuditFeed && (
            <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(223, 177, 37, 0.2)', paddingTop: '0.9rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.6rem', marginBottom: '0.9rem' }}>
                <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                  {['all', '1', '2', '3'].map(stg => (
                    <button
                      key={stg}
                      className={`filter-pill ${feedFilterStage === stg ? 'active' : ''}`}
                      onClick={() => setFeedFilterStage(stg)}
                    >
                      {stg === 'all' ? 'All Rounds' : `Stage ${stg}`}
                    </button>
                  ))}
                  <button
                    className={`filter-pill ${feedFilterStage === 'admin' ? 'active' : ''}`}
                    onClick={() => setFeedFilterStage('admin')}
                  >
                    Admin Adjustments
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Search by team or task..."
                    value={feedSearch}
                    onChange={e => setFeedSearch(e.target.value)}
                    style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(223,177,37,0.3)', borderRadius: 4, padding: '0.35rem 0.6rem', color: '#eae0c8', fontSize: '0.8rem' }}
                  />
                  <button className="admin-btn" onClick={fetchGlobalFeed} title="Refresh Feed">
                    <RefreshCw size={12} /> Sync Feed
                  </button>
                </div>
              </div>

              {loadingFeed ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: '#8c8268' }}>Loading activity stream...</div>
              ) : (
                <div className="audit-scroll-container" style={{ maxHeight: '350px' }}>
                  {globalFeed
                    .filter(item => {
                      if (feedFilterStage !== 'all') {
                        if (feedFilterStage === 'admin') {
                          if (!item.task_key.startsWith('admin_adjust')) return false;
                        } else if (String(item.stage) !== feedFilterStage) {
                          return false;
                        }
                      }
                      if (feedSearch) {
                        const q = feedSearch.toLowerCase();
                        return (
                          item.team_name.toLowerCase().includes(q) ||
                          item.task_key.toLowerCase().includes(q) ||
                          JSON.stringify(item.metadata || {}).toLowerCase().includes(q)
                        );
                      }
                      return true;
                    })
                    .map(item => (
                      <div key={item.id} className="audit-entry-card">
                        <div className="audit-entry-left">
                          <div className="audit-entry-title-row">
                            <span style={{ fontWeight: 700, color: '#dfb125' }}>{item.team_name}</span>
                            <span className={`stage-pill stage-${item.stage || 1}`}>
                              {item.task_key.startsWith('admin_adjust') ? 'ADMIN' : `STAGE ${item.stage}`}
                            </span>
                            <span className="audit-entry-task">{item.task_key}</span>
                          </div>
                          <div className="audit-entry-detail">
                            {item.metadata?.proof && <span>Proof: <code>{item.metadata.proof}</code> | </span>}
                            {item.metadata?.hints_used !== undefined && (
                              <span>Hints: {item.metadata.hints_used} (-{item.metadata.hint_penalty || 0} penalty) | </span>
                            )}
                            {item.metadata?.similarity !== undefined && (
                              <span>Accuracy: <strong>{Number(item.metadata.similarity).toFixed(1)}%</strong> | </span>
                            )}
                            {item.metadata?.blocks_used !== undefined && (
                              <span>
                                Blocks: <strong>{item.metadata.blocks_used}</strong>
                                {item.metadata.block_score !== undefined && ` (+${item.metadata.block_score}b)`} | 
                              </span>
                            )}
                            {item.metadata?.time_used_seconds !== undefined && (
                              <span>
                                Time: <strong>{Math.floor(item.metadata.time_used_seconds / 60)}m {item.metadata.time_used_seconds % 60}s</strong>
                                {item.metadata.time_score !== undefined && ` (+${item.metadata.time_score}t)`} | 
                              </span>
                            )}
                            {item.metadata?.reason && (
                              <span style={{ color: '#eed56a' }}>Reason: "{item.metadata.reason}"</span>
                            )}
                          </div>
                          <span className="audit-entry-time">
                            {item.submitted_at ? `${new Date(item.submitted_at).toLocaleTimeString()} (${formatTimeSince(item.submitted_at)})` : '—'}
                          </span>
                        </div>
                        <div className={`audit-entry-points ${item.points_awarded >= 0 ? 'positive' : 'negative'}`}>
                          {item.points_awarded >= 0 ? `+${item.points_awarded}` : item.points_awarded} pts
                        </div>
                      </div>
                    ))}
                  {globalFeed.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1.5rem', color: '#666' }}>No submission events recorded yet.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── Toolbar: Search, Filters, Stats ── */}
        <section className="admin-toolbar">
          <div className="toolbar-left">
            <div className="admin-search-input">
              <Search size={15} color="#8c8268" />
              <input
                type="text"
                placeholder="Search team, crew member, IP, or notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="filter-pills">
              <button
                className={`filter-pill ${statusFilter === 'all' ? 'active' : ''}`}
                onClick={() => setStatusFilter('all')}
              >
                All ({teams.length})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'active' ? 'active' : ''}`}
                onClick={() => setStatusFilter('active')}
              >
                Online ({teams.filter(t => t.status === 'active').length})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'idle' ? 'active' : ''}`}
                onClick={() => setStatusFilter('idle')}
              >
                Idle ({teams.filter(t => t.status === 'idle').length})
              </button>
              <button
                className={`filter-pill ${statusFilter === 'noted' ? 'active' : ''}`}
                onClick={() => setStatusFilter('noted')}
              >
                Flagged / Notes ({teams.filter(t => Boolean(t.notes)).length})
              </button>
            </div>
          </div>

          <div className="toolbar-right">
            <span style={{ fontSize: '0.8rem', color: '#8c8268' }}>
              Showing {sortedTeams.length} of {teams.length} teams
            </span>
            <button
              className="admin-btn r2-bulk-btn"
              onClick={() => handleBulkRound2Access(true)}
              title="Authorize all connected workstations to enter Round 2"
            >
              <CheckCircle2 size={13} color="#2ed573" />
              <span>Authorize All R2</span>
            </button>
            <button
              className="admin-btn"
              style={{ borderColor: 'rgba(235, 77, 75, 0.4)', color: '#ff7979' }}
              onClick={() => handleBulkRound2Access(false)}
              title="Lock Round 2 for all teams"
            >
              <Lock size={13} color="#ff7979" />
              <span>Lock All R2</span>
            </button>
            <button
              className="admin-btn r3-bulk-btn"
              onClick={() => handleBulkRound3Access(true)}
              title="Authorize all connected workstations to enter Round 3"
            >
              <CheckCircle2 size={13} color="#dfb125" />
              <span>Authorize All R3</span>
            </button>
            <button
              className="admin-btn"
              style={{ borderColor: 'rgba(235, 77, 75, 0.4)', color: '#ff7979' }}
              onClick={() => handleBulkRound3Access(false)}
              title="Lock Round 3 for all teams"
            >
              <Lock size={13} color="#ff7979" />
              <span>Lock All R3</span>
            </button>
            <button className="admin-btn" onClick={handleExportJSON}>
              <Download size={14} />
              <span>JSON Dump</span>
            </button>
          </div>
        </section>

        {/* ── Main Explanatory Leaderboard Table ── */}
        <section className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table" style={{ minWidth: '1350px' }}>
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSortClick('rank')} style={{ width: '55px' }}>
                    Rank {sortField === 'rank' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('name')}>
                    Team Name & Workstation {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th>Crew</th>
                  <th style={{ textAlign: 'center', width: '115px' }}>
                    Round 2 Access
                  </th>
                  <th style={{ textAlign: 'center', width: '115px' }}>
                    Round 3 Access
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('stage')} style={{ textAlign: 'center', width: '85px' }}>
                    Stage {sortField === 'stage' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('round1_score')} style={{ textAlign: 'right', width: '65px' }}>
                    R1 {sortField === 'round1_score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('round2_score')} style={{ textAlign: 'right', width: '65px' }}>
                    R2 {sortField === 'round2_score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('round3_score')} style={{ textAlign: 'right', width: '65px' }}>
                    R3 {sortField === 'round3_score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('final_score')} style={{ textAlign: 'center', width: '130px', color: '#eed56a' }}>
                    Final (R2+R3) 🏆 {sortField === 'final_score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('score')}>
                    Total Score & Controls {sortField === 'score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th style={{ textAlign: 'center', width: '85px' }}>Score Audit</th>
                  <th style={{ textAlign: 'center', width: '90px' }}>PIN</th>
                  <th className="sortable" onClick={() => handleSortClick('updated_at')}>
                    Live Timers {sortField === 'updated_at' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t) => {
                  const rankClass = t.rank === 1 ? 'gold' : t.rank === 2 ? 'silver' : t.rank === 3 ? 'bronze' : '';
                  const finalScore = (t.round2_score || 0) + (t.round3_score || 0);

                  return (
                    <tr key={t.id || t.name}>
                      {/* Rank */}
                      <td>
                        <span className={`rank-badge ${rankClass}`}>{t.rank}</span>
                      </td>

                      {/* Team Name + IP */}
                      <td>
                        <div className="team-name-cell">
                          <span className={`status-dot ${t.status || 'idle'}`}></span>
                          <div>
                            <span className="team-primary">{t.name}</span>
                            <span className="team-ip-tag">
                              IP: {t.last_ip || '127.0.0.1'} | {t.status === 'active' ? 'CONNECTED' : 'STANDBY'}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 2 Members */}
                      <td>
                        <div className="crew-cell">
                          {t.member1 || t.member2 ? (
                            <>
                              <span className="crew-member">
                                <strong>M1:</strong> {t.member1 || 'Unassigned'}
                              </span>
                              <span className="crew-member">
                                <strong>M2:</strong> {t.member2 || 'Unassigned'}
                              </span>
                            </>
                          ) : (
                            <span className="crew-empty">None declared</span>
                          )}
                        </div>
                      </td>

                      {/* Round 2 Access Authorization */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          {t.round2_unlocked || t.current_stage >= 2 ? (
                            <>
                              <span className="r2-status-badge authorized" title="Team is authorized for Round 2">
                                <CheckCircle2 size={11} /> AUTHORIZED
                              </span>
                              <button
                                className="r2-toggle-btn revoke"
                                onClick={() => handleToggleRound2Access(t, false)}
                                title="Revoke Round 2 access"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="r2-status-badge locked" title="Team is locked out of Round 2">
                                <Lock size={11} /> LOCKED
                              </span>
                              <button
                                className="r2-toggle-btn grant"
                                onClick={() => handleToggleRound2Access(t, true)}
                                title="Authorize Round 2 access"
                              >
                                Authorize
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Round 3 Access Authorization */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                          {t.round3_unlocked || t.current_stage >= 3 ? (
                            <>
                              <span className="r3-status-badge authorized" title="Team is authorized for Round 3">
                                <CheckCircle2 size={11} /> AUTHORIZED
                              </span>
                              <button
                                className="r3-toggle-btn revoke"
                                onClick={() => handleToggleRound3Access(t, false)}
                                title="Revoke Round 3 access"
                              >
                                Revoke
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="r3-status-badge locked" title="Team is locked out of Round 3">
                                <Lock size={11} /> LOCKED
                              </span>
                              <button
                                className="r3-toggle-btn grant"
                                onClick={() => handleToggleRound3Access(t, true)}
                                title="Authorize Round 3 access"
                              >
                                Authorize
                              </button>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Current Stage: crisp single-line pill */}
                      <td style={{ textAlign: 'center' }}>
                        <span className={`stage-pill stage-${t.current_stage || 1}`}>
                          STAGE {t.current_stage || 1}
                        </span>
                      </td>

                      {/* R1 Score */}
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#00f0ff', fontWeight: 600 }}>
                        {t.round1_score || 0}
                      </td>

                      {/* R2 Score */}
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#bb86fc', fontWeight: 600 }}>
                        {t.round2_score || 0}
                      </td>

                      {/* R3 Score */}
                      <td style={{ textAlign: 'right', fontFamily: 'monospace', color: '#dfb125', fontWeight: 600 }}>
                        {t.round3_score || 0}
                      </td>

                      {/* Final Championship Score (R2 + R3) */}
                      <td style={{ textAlign: 'center' }}>
                        <span style={{
                          fontFamily: 'monospace',
                          fontWeight: 'bold',
                          fontSize: '0.98rem',
                          color: '#dfb125',
                          background: 'rgba(223, 177, 37, 0.12)',
                          border: '1px solid rgba(223, 177, 37, 0.35)',
                          padding: '0.2rem 0.55rem',
                          borderRadius: '4px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem'
                        }}>
                          <Trophy size={11} color="#dfb125" />
                          {finalScore} pts
                        </span>
                      </td>

                      {/* Total Score with Quick Point Adjustment Controls */}
                      <td>
                        <div className="score-cell-wrap">
                          <span className="score-num">{t.score ?? 0} pts</span>
                          <div className="quick-pts-btns">
                            <button
                              className="quick-pt-btn"
                              onClick={() => handleQuickScore(t.id, 20)}
                              title="Award +20 points (Round 1 Task)"
                            >
                              +20
                            </button>
                            <button
                              className="quick-pt-btn"
                              onClick={() => handleQuickScore(t.id, 50)}
                              title="Award +50 points (Round 2 Image 100%)"
                            >
                              +50
                            </button>
                            <button
                              className="quick-pt-btn minus"
                              onClick={() => handleQuickScore(t.id, -5)}
                              title="Deduct -5 points (1 Hint)"
                            >
                              -5
                            </button>
                            <button
                              className="quick-pt-btn minus"
                              onClick={() => handleQuickScore(t.id, -10)}
                              title="Deduct -10 points (2 Hints)"
                            >
                              -10
                            </button>
                            <button
                              className="quick-pt-btn"
                              style={{ background: 'rgba(255,255,255,0.1)', color: '#eae0c8' }}
                              onClick={() => setScoreModal({ open: true, team: t, delta: 0, reason: '', exactScore: `${t.score}` })}
                              title="Custom Score / Points Override"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Detailed Score Audit Button */}
                      <td style={{ textAlign: 'center' }}>
                        <button
                          className="score-audit-btn"
                          onClick={() => openTeamScoreAudit(t)}
                          title="View complete points breakdown and submission audit trail"
                        >
                          <History size={11} /> Audit
                        </button>
                      </td>

                      {/* Team Secret PIN */}
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
                          <span style={{
                            fontFamily: 'monospace',
                            background: 'rgba(223, 177, 37, 0.12)',
                            border: '1px solid rgba(223, 177, 37, 0.35)',
                            padding: '0.2rem 0.45rem',
                            borderRadius: '3px',
                            fontSize: '0.82rem',
                            fontWeight: 'bold',
                            color: '#dfb125',
                            letterSpacing: '1px'
                          }}>
                            {t.pin || '—'}
                          </span>
                          <button
                            className="icon-btn"
                            title="Reset / Update Team PIN"
                            onClick={() => setPinModal({ open: true, team: t, newPin: t.pin && t.pin !== '—' ? t.pin : '' })}
                            style={{ padding: '0.2rem', color: '#8c8268' }}
                          >
                            <Key size={12} />
                          </button>
                        </div>
                      </td>

                      {/* Live Timers */}
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.78rem', color: '#cac0a8' }}>
                            <Clock size={11} style={{ display: 'inline', marginRight: '3px' }} />
                            Run: {formatElapsed(t.started_at || t.created_at)}
                          </span>
                          <span style={{ fontSize: '0.7rem', color: '#777' }}>
                            Last active: {formatTimeSince(t.updated_at)}
                          </span>
                        </div>
                      </td>

                      {/* Admin Notes */}
                      <td>
                        {t.notes ? (
                          <span
                            className="team-note-tag"
                            onClick={() => setNoteModal({ open: true, team: t, notes: t.notes || '' })}
                            style={{ cursor: 'pointer' }}
                            title="Click to edit note"
                          >
                            <Tag size={10} />
                            {t.notes}
                          </span>
                        ) : (
                          <button
                            className="empty-note-btn"
                            onClick={() => setNoteModal({ open: true, team: t, notes: '' })}
                          >
                            + Add Note
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={{ textAlign: 'right' }}>
                        <div className="row-actions" style={{ justifyContent: 'flex-end' }}>
                          <button
                            className="icon-btn"
                            title="Edit Team & Members"
                            onClick={() => setEditModal({
                              open: true,
                              team: t,
                              name: t.name,
                              member1: t.member1 || '',
                              member2: t.member2 || '',
                              current_stage: t.current_stage || 1,
                              notes: t.notes || ''
                            })}
                          >
                            <Edit2 size={13} />
                          </button>

                          <button
                            className="icon-btn danger"
                            title="Disqualify / Delete Team"
                            onClick={() => handleDeleteTeam(t)}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}

                {sortedTeams.length === 0 && (
                  <tr>
                    <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: '#777' }}>
                      No teams match current search or filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>

      {/* ── MODAL: Control Points ── */}
      {scoreModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setScoreModal({ open: false, team: null, delta: 0, reason: '', exactScore: '' })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Control Points — {scoreModal.team?.name}</h3>
            </div>
            <div className="admin-field">
              <label>Current Score</label>
              <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: '#dfb125', fontFamily: 'monospace' }}>
                {scoreModal.team?.score} pts
              </div>
            </div>
            <div className="admin-field">
              <label>Set Exact Score (Overrides Current)</label>
              <input
                type="number"
                value={scoreModal.exactScore}
                onChange={e => setScoreModal(prev => ({ ...prev, exactScore: e.target.value }))}
                placeholder="Leave blank to use Delta adjustment..."
              />
            </div>
            <div className="admin-field">
              <label>Or Add/Deduct Points Delta</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                {[-100, -50, +50, +100, +200].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    className="filter-pill"
                    style={{ flex: 1 }}
                    onClick={() => setScoreModal(prev => ({ ...prev, delta: amt, exactScore: '' }))}
                  >
                    {amt > 0 ? `+${amt}` : amt}
                  </button>
                ))}
              </div>
              <input
                type="number"
                value={scoreModal.delta}
                onChange={e => setScoreModal(prev => ({ ...prev, delta: parseInt(e.target.value, 10) || 0 }))}
                disabled={scoreModal.exactScore !== ''}
              />
            </div>
            <div className="admin-field">
              <label>Audit Reason (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Stage 1 bonus flag, penalty for hint..."
                value={scoreModal.reason}
                onChange={e => setScoreModal(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
            <div className="modal-btns">
              <button
                className="admin-btn"
                style={{ background: 'transparent' }}
                onClick={() => setScoreModal({ open: false, team: null, delta: 0, reason: '', exactScore: '' })}
              >
                Cancel
              </button>
              <button className="admin-btn" style={{ background: '#dfb125', color: '#000', fontWeight: 'bold' }} onClick={handleSaveModalScore}>
                Confirm Points
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Reset / Update Team PIN ── */}
      {pinModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setPinModal({ open: false, team: null, newPin: '' })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Team Secret PIN — {pinModal.team?.name}</h3>
            </div>
            <div className="admin-field">
              <label>Current Registered PIN</label>
              <div style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#dfb125', fontFamily: 'monospace', letterSpacing: '2px', background: 'rgba(0,0,0,0.5)', padding: '0.4rem 0.8rem', borderRadius: '4px' }}>
                {pinModal.team?.pin || 'None recorded'}
              </div>
            </div>
            <div className="admin-field">
              <label>Set New PIN (4-16 digits/characters)</label>
              <input
                type="text"
                value={pinModal.newPin}
                onChange={e => setPinModal(prev => ({ ...prev, newPin: e.target.value }))}
                placeholder="Enter new 4-digit PIN..."
                maxLength={16}
                autoFocus
              />
              <span style={{ fontSize: '0.75rem', color: '#8c8268', marginTop: '0.3rem', display: 'block' }}>
                Participants use this PIN to resume their session or log in when returning for Round 2.
              </span>
            </div>
            <div className="modal-btns">
              <button
                className="admin-btn"
                style={{ background: 'transparent' }}
                onClick={() => setPinModal({ open: false, team: null, newPin: '' })}
              >
                Cancel
              </button>
              <button
                className="admin-btn"
                style={{ background: '#dfb125', color: '#000', fontWeight: 'bold' }}
                onClick={handleSaveModalPin}
              >
                Save New PIN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Edit Team & Members ── */}
      {editModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setEditModal({ open: false, team: null, name: '', member1: '', member2: '', current_stage: 1, notes: '' })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Edit Workstation Team</h3>
            </div>
            <div className="admin-field">
              <label>Team Name</label>
              <input
                type="text"
                value={editModal.name}
                onChange={e => setEditModal(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label>Member 1 Name</label>
              <input
                type="text"
                placeholder="e.g. Alex"
                value={editModal.member1}
                onChange={e => setEditModal(prev => ({ ...prev, member1: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label>Member 2 Name</label>
              <input
                type="text"
                placeholder="e.g. Blake"
                value={editModal.member2}
                onChange={e => setEditModal(prev => ({ ...prev, member2: e.target.value }))}
              />
            </div>
            <div className="admin-field">
              <label>Competition Stage</label>
              <select
                value={editModal.current_stage}
                onChange={e => setEditModal(prev => ({ ...prev, current_stage: parseInt(e.target.value, 10) }))}
              >
                <option value={1}>Round 1 — Virtual OS Navigation</option>
                <option value={2}>Round 2 — Image Reconstruction</option>
                <option value={3}>Round 3 — Blockly Code Trial</option>
              </select>
            </div>
            <div className="admin-field">
              <label>Admin Notes</label>
              <textarea
                rows={2}
                placeholder="Custom organizer note..."
                value={editModal.notes}
                onChange={e => setEditModal(prev => ({ ...prev, notes: e.target.value }))}
              />
            </div>
            <div className="modal-btns">
              <button
                className="admin-btn"
                style={{ background: 'transparent' }}
                onClick={() => setEditModal({ open: false, team: null, name: '', member1: '', member2: '', current_stage: 1, notes: '' })}
              >
                Cancel
              </button>
              <button className="admin-btn" style={{ background: '#dfb125', color: '#000', fontWeight: 'bold' }} onClick={handleSaveEditTeam}>
                Save Team
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Note Team ── */}
      {noteModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setNoteModal({ open: false, team: null, notes: '' })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Annotate Team — {noteModal.team?.name}</h3>
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.8rem' }}>
              {['[Verified Station]', '[Fast Solver]', '[Assistance Requested]', '[Warning]', '[Disqualified]'].map(tag => (
                <button
                  key={tag}
                  type="button"
                  className="filter-pill"
                  onClick={() => setNoteModal(prev => ({ ...prev, notes: `${prev.notes ? prev.notes + ' ' : ''}${tag}` }))}
                >
                  {tag}
                </button>
              ))}
            </div>
            <div className="admin-field">
              <label>Team Note / Tag</label>
              <textarea
                rows={3}
                placeholder="Enter notes, workstation hardware flags, or judging notes..."
                value={noteModal.notes}
                onChange={e => setNoteModal(prev => ({ ...prev, notes: e.target.value }))}
                autoFocus
              />
            </div>
            <div className="modal-btns">
              <button
                className="admin-btn"
                style={{ background: 'transparent' }}
                onClick={() => setNoteModal({ open: false, team: null, notes: '' })}
              >
                Cancel
              </button>
              <button className="admin-btn" style={{ background: '#dfb125', color: '#000', fontWeight: 'bold' }} onClick={handleSaveNote}>
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Configure Round Timer ── */}
      {timerModal.open && (
        <div className="admin-modal-backdrop" onClick={() => setTimerModal({ open: false, round: 1, durationMinutes: 60 })}>
          <div className="admin-modal" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header">
              <h3>Configure Round {timerModal.round} Duration ({timerModal.round === 1 ? 'Virtual OS' : timerModal.round === 2 ? 'Image Recon' : 'Blockly Forest'})</h3>
            </div>
            <p style={{ color: '#a89d80', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Sets the allowed duration limit for Round {timerModal.round}. The timer will only start dynamically on participant workstations when they reach each round's milestone:
              <br />
              <strong style={{ color: '#dfb125' }}>
                {timerModal.round === 1 ? '• Round 1: Starts after entering into OS' : timerModal.round === 2 ? '• Round 2: Starts after entering Round 2 app' : '• Round 3: Starts after finishing the beginning story'}
              </strong>
            </p>
            <div className="admin-field">
              <label>Duration (Minutes)</label>
              <input
                type="number"
                min="1"
                max="240"
                value={timerModal.durationMinutes}
                onChange={e => setTimerModal(prev => ({ ...prev, durationMinutes: parseInt(e.target.value, 10) || 60 }))}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              {[5, 10, 15, 20, 30, 45, 60, 90, 120].map(mins => (
                <button
                  key={mins}
                  type="button"
                  className="filter-pill"
                  onClick={() => setTimerModal(prev => ({ ...prev, durationMinutes: mins }))}
                >
                  {mins}m
                </button>
              ))}
            </div>
            <div className="modal-btns">
              <button
                className="admin-btn"
                style={{ background: 'transparent' }}
                onClick={() => setTimerModal({ open: false, round: 1, durationMinutes: 60 })}
              >
                Cancel
              </button>
              <button
                className="admin-btn"
                style={{ background: '#dfb125', color: '#000', fontWeight: 'bold' }}
                onClick={async () => {
                  await handleControlTimer(timerModal.round, 'set', timerModal.durationMinutes);
                  setTimerModal({ open: false, round: 1, durationMinutes: 60 });
                }}
              >
                Save Round {timerModal.round} Duration
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: Score Audit Breakdown ── */}
      {auditModal.open && auditModal.team && (
        <div className="admin-modal-backdrop" onClick={() => setAuditModal({ open: false, team: null, submissions: [], loading: false })}>
          <div className="admin-modal audit-modal-wide" onClick={e => e.stopPropagation()}>
            <div className="admin-modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <History size={18} color="#dfb125" />
                  Score Audit Breakdown — {auditModal.team.name}
                </h3>
                <span style={{ fontSize: '0.75rem', color: '#8c8268' }}>
                  Workstation IP: {auditModal.team.ip_address || 'Unassigned'} • PIN: {auditModal.team.pin || 'None'}
                </span>
              </div>
              <button
                className="admin-btn"
                style={{ background: 'transparent', padding: '0.2rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setAuditModal({ open: false, team: null, submissions: [], loading: false })}
              >
                ✕
              </button>
            </div>

            {/* Score Summary Metrics */}
            <div className="audit-summary-cards">
              <div className="audit-summary-card">
                <div className="audit-summary-label">Round 1 (OS)</div>
                <div className="audit-summary-val">{auditModal.team.round1_score ?? 0}</div>
              </div>
              <div className="audit-summary-card">
                <div className="audit-summary-label">Round 2 (Img)</div>
                <div className="audit-summary-val">{auditModal.team.round2_score ?? 0}</div>
              </div>
              <div className="audit-summary-card">
                <div className="audit-summary-label">Round 3 (Code)</div>
                <div className="audit-summary-val">{auditModal.team.round3_score ?? 0}</div>
              </div>
              <div className="audit-summary-card highlight">
                <div className="audit-summary-label">Final (R2+R3) 🏆</div>
                <div className="audit-summary-val">
                  {(auditModal.team.round2_score ?? 0) + (auditModal.team.round3_score ?? 0)}
                </div>
              </div>
              <div className="audit-summary-card">
                <div className="audit-summary-label">Total Score</div>
                <div className="audit-summary-val">{auditModal.team.score ?? 0}</div>
              </div>
            </div>

            <div style={{ marginBottom: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', color: '#a89d80', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Complete Submission & Score Event History ({auditModal.submissions?.length || 0} events)
              </div>
              {auditModal.loading && (
                <span style={{ fontSize: '0.75rem', color: '#dfb125' }}>Fetching audit records...</span>
              )}
            </div>

            {/* Scrollable Submission Events */}
            <div className="audit-scroll-container">
              {auditModal.submissions?.length === 0 && !auditModal.loading && (
                <div style={{ textAlign: 'center', padding: '2rem 1rem', color: '#777', fontSize: '0.85rem' }}>
                  No submission records or score adjustments found for this team yet.
                </div>
              )}

              {auditModal.submissions?.map((sub, idx) => {
                const pts = sub.points_awarded ?? 0;
                const isPositive = pts >= 0;
                const meta = sub.metadata || {};
                return (
                  <div key={sub.id || idx} className="audit-entry-card">
                    <div className="audit-entry-left">
                      <div className="audit-entry-title-row">
                        <span className={`stage-pill stage-${sub.stage || 1}`}>
                          {sub.task_key?.startsWith('admin_adjust') ? 'ADMIN' : `STAGE ${sub.stage || 1}`}
                        </span>
                        <span className="audit-entry-task">{sub.task_key || 'Score Adjustment'}</span>
                        <span className="audit-entry-time">
                          {sub.submitted_at ? `${new Date(sub.submitted_at).toLocaleTimeString()} (${formatTimeSince(sub.submitted_at)})` : '—'}
                        </span>
                      </div>

                      {/* Detailed explanation of how score was earned / where */}
                      <div className="audit-entry-detail">
                        {meta.proof && (
                          <span>Proof: <code style={{ color: '#dfb125' }}>{meta.proof}</code> | </span>
                        )}
                        {meta.hints_used !== undefined && (
                          <span>Hints Used: {meta.hints_used} (-{meta.hint_penalty || 0} pts penalty) | </span>
                        )}
                        {meta.similarity !== undefined && (
                          <span>Reconstruction Accuracy: <strong style={{ color: '#2ed573' }}>{Number(meta.similarity).toFixed(1)}%</strong> | </span>
                        )}
                        {meta.prompt && (
                          <span>Prompt: <em>"{meta.prompt.slice(0, 75)}{meta.prompt.length > 75 ? '...' : ''}"</em> | </span>
                        )}
                        {meta.blocks_used !== undefined && (
                          <span>
                            Blocks: <strong>{meta.blocks_used}</strong>
                            {meta.block_score !== undefined ? ` (+${meta.block_score}b)` : ''} (Efficiency: {meta.efficiency}) | </span>
                        )}
                        {meta.time_used_seconds !== undefined && (
                          <span>
                            Time: <strong>{Math.floor(meta.time_used_seconds / 60)}m {meta.time_used_seconds % 60}s</strong>
                            {meta.time_score !== undefined ? ` (+${meta.time_score}t)` : ''} | </span>
                        )}
                        {meta.reason && (
                          <span style={{ color: '#eed56a' }}>Reason: "{meta.reason}"</span>
                        )}
                        {!meta.proof && !meta.hints_used && !meta.similarity && !meta.blocks_used && !meta.reason && (
                          <span>Event successfully verified & recorded.</span>
                        )}
                      </div>
                    </div>

                    <div className={`audit-entry-points ${isPositive ? 'positive' : 'negative'}`}>
                      {isPositive ? `+${pts}` : pts} pts
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="modal-btns" style={{ marginTop: '1rem', borderTop: '1px solid rgba(223, 177, 37, 0.2)', paddingTop: '0.8rem' }}>
              <button
                className="admin-btn"
                style={{ background: '#dfb125', color: '#000', fontWeight: 'bold', marginLeft: 'auto' }}
                onClick={() => setAuditModal({ open: false, team: null, submissions: [], loading: false })}
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminPortal;
