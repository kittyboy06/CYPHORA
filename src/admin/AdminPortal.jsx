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
  PlusCircle,
  MinusCircle,
  FileText,
  RefreshCw,
  LogOut,
  CheckCircle2,
  AlertTriangle,
  Play,
  Pause,
  RotateCcw,
  Tag,
  ExternalLink
} from 'lucide-react';
import './AdminPortal.css';

const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const isDev = typeof window !== 'undefined' && window.location.port === '5173';
const API_BASE = isDev ? `http://${hostname}:8000` : '';
const WS_PROTOCOL = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const WS_HOST = isDev ? `${hostname}:8000` : (typeof window !== 'undefined' ? window.location.host : 'localhost:8000');
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

  // Search & Filter & Sort
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'idle' | 'noted'
  const [sortField, setSortField] = useState('rank'); // 'rank' | 'name' | 'score' | 'status' | 'updated_at'
  const [sortAsc, setSortAsc] = useState(true);

  // Modals
  const [scoreModal, setScoreModal] = useState({ open: false, team: null, delta: 0, reason: '', exactScore: '' });
  const [editModal, setEditModal] = useState({ open: false, team: null, name: '', member1: '', member2: '', current_stage: 1, notes: '' });
  const [noteModal, setNoteModal] = useState({ open: false, team: null, notes: '' });
  const [timerModal, setTimerModal] = useState({ open: false, durationMinutes: 60 });

  // Live timer tick
  const [currentTime, setCurrentTime] = useState(new Date());

  const socketRef = useRef(null);

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

  useEffect(() => {
    if (isAuthenticated) {
      fetchTeams();
      fetchStatus();
      const statusInterval = setInterval(fetchStatus, 15000);
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
      await fetch(`${API_BASE}/api/admin/teams/${teamId}/score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Password': HARDCODED_ADMIN_PASS
        },
        body: JSON.stringify({ points_delta: delta, reason: `Quick adjustment (${delta > 0 ? '+' : ''}${delta} pts)` })
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

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'rank') cmp = a.rank - b.rank;
    else if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'score') cmp = b.score - a.score;
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
            <form onSubmit={handleLoginSubmit}>
              <div className="admin-input-group">
                <Lock size={18} color="#dfb125" />
                <input
                  type="password"
                  placeholder="Master Password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
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
              <span className="metric-label">Top Score</span>
              <span className="metric-val">
                {teams.length > 0 ? Math.max(...teams.map(t => t.score || 0)) : 0} pts
              </span>
              <span className="metric-sub">
                Leader: {teams[0]?.name || 'None'}
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
            <button className="admin-btn" onClick={handleExportJSON}>
              <Download size={14} />
              <span>JSON Dump</span>
            </button>
          </div>
        </section>

        {/* ── Main Explanatory Leaderboard Table ── */}
        <section className="admin-table-card">
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th className="sortable" onClick={() => handleSortClick('rank')} style={{ width: '60px' }}>
                    Rank {sortField === 'rank' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('name')}>
                    Team Name & Workstation {sortField === 'name' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th>Crew (2 Members)</th>
                  <th className="sortable" onClick={() => handleSortClick('score')}>
                    Score & Controls {sortField === 'score' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('stage')}>
                    Stage {sortField === 'stage' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th className="sortable" onClick={() => handleSortClick('updated_at')}>
                    Live Timers {sortField === 'updated_at' ? (sortAsc ? '▲' : '▼') : ''}
                  </th>
                  <th>Admin Notes / Flags</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedTeams.map((t) => {
                  const rankClass = t.rank === 1 ? 'gold' : t.rank === 2 ? 'silver' : t.rank === 3 ? 'bronze' : '';
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

                      {/* Score with Quick Point Adjustment Controls */}
                      <td>
                        <div className="score-cell-wrap">
                          <span className="score-num">{t.score ?? 0} pts</span>
                          <div className="quick-pts-btns">
                            <button
                              className="quick-pt-btn"
                              onClick={() => handleQuickScore(t.id, 50)}
                              title="Award +50 points"
                            >
                              +50
                            </button>
                            <button
                              className="quick-pt-btn"
                              onClick={() => handleQuickScore(t.id, 100)}
                              title="Award +100 points"
                            >
                              +100
                            </button>
                            <button
                              className="quick-pt-btn minus"
                              onClick={() => handleQuickScore(t.id, -50)}
                              title="Deduct -50 points"
                            >
                              -50
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

                      {/* Current Stage */}
                      <td>
                        <span style={{
                          background: 'rgba(223, 177, 37, 0.1)',
                          border: '1px solid rgba(223, 177, 37, 0.3)',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '3px',
                          fontSize: '0.72rem',
                          fontWeight: 'bold',
                          color: '#dfb125'
                        }}>
                          STAGE {t.current_stage || 1}
                        </span>
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
                    <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#777' }}>
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
                <option value={1}>Stage 1 — Virtual OS Navigation</option>
                <option value={2}>Stage 2 — Image Reconstruction</option>
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
    </div>
  );
}

export default AdminPortal;
