import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShieldAlert, Lock, AlertTriangle, KeyRound, CheckCircle2, Trophy, Search, RefreshCw, Radio } from 'lucide-react';
import './RoundTimerLockScreen.css';

// Authorized master and station proctor override codes
const AUTHORIZED_OVERRIDE_CODES = [
  'JCEAIML',
  '8080',
  'CYPH',
  'ROOT',
  '7492',
  'NOVA',
  '1234',
  'ADMIN'
];

const FALLBACK_EXPLORERS = [
  { rank: 1, name: 'Team Cipher', score: 1450, round1_score: 500, round2_score: 470, round3_score: 480, status: 'completed' },
  { rank: 2, name: 'Team Vortex', score: 1280, round1_score: 450, round2_score: 430, round3_score: 400, status: 'completed' },
  { rank: 3, name: 'Team Nexus', score: 1120, round1_score: 400, round2_score: 420, round3_score: 300, status: 'completed' },
  { rank: 4, name: 'Team Phantom', score: 960, round1_score: 380, round2_score: 350, round3_score: 230, status: 'active' },
  { rank: 5, name: 'Team Glitch', score: 820, round1_score: 350, round2_score: 270, round3_score: 200, status: 'active' },
  { rank: 6, name: 'Team Rogue', score: 680, round1_score: 320, round2_score: 210, round3_score: 150, status: 'active' },
  { rank: 7, name: 'Team Epoch', score: 500, round1_score: 280, round2_score: 120, round3_score: 100, status: 'idle' },
  { rank: 8, name: 'Team Blaze', score: 350, round1_score: 200, round2_score: 100, round3_score: 50, status: 'idle' },
];

export function RoundTimerLockScreen({
  round = 1,
  roundName = 'Round 1 — OS Navigation',
  teamName = 'Explorer',
  onUnlockOverride = () => {}
}) {
  const [overrideKey, setOverrideKey] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isUnlockedSuccess, setIsUnlockedSuccess] = useState(false);

  // Leaderboard states
  const [teams, setTeams] = useState(FALLBACK_EXPLORERS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showOverrideInput, setShowOverrideInput] = useState(true);

  const activeTeamName = (
    teamName ||
    (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_name') : '') ||
    'Explorer'
  ).trim();

  // Merge the active team's live score and sort descending
  const mergeAndSortTeams = useCallback((sourceList) => {
    const lowerCurrent = activeTeamName.toLowerCase();
    const storedTeamScore = parseInt(
      (typeof localStorage !== 'undefined' && localStorage.getItem('cyphora_team_score')) ||
      (typeof sessionStorage !== 'undefined' && sessionStorage.getItem('cyphora_team_score')) ||
      '0',
      10
    ) || 0;

    let merged = (sourceList || []).map(item => ({
      ...item,
      name: item.name || 'Anonymous Explorer',
      score: Number(item.score) || 0,
      round1_score: Number(item.round1_score) || 0,
      round2_score: Number(item.round2_score) || 0,
      round3_score: Number(item.round3_score) || 0,
      status: item.status || 'active'
    }));

    const matchIdx = merged.findIndex(
      t => (t.name || '').trim().toLowerCase() === lowerCurrent
    );

    if (matchIdx >= 0) {
      merged[matchIdx] = {
        ...merged[matchIdx],
        score: Math.max(merged[matchIdx].score || 0, storedTeamScore),
        status: 'active'
      };
    } else if (activeTeamName && activeTeamName !== 'Explorer') {
      merged.push({
        id: 'self',
        name: activeTeamName,
        score: storedTeamScore,
        round1_score: parseInt(localStorage.getItem('cyphora_round1_score') || '0', 10) || 0,
        round2_score: parseInt(localStorage.getItem('cyphora_round2_score') || '0', 10) || 0,
        round3_score: parseInt(localStorage.getItem('cyphora_round3_score') || '0', 10) || 0,
        status: 'active'
      });
    }

    // Sort descending by score
    merged.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Re-index ranks 1..N
    return merged.map((t, idx) => ({
      ...t,
      rank: idx + 1
    }));
  }, [activeTeamName]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    let baseList = FALLBACK_EXPLORERS;
    try {
      const res = await fetch('/api/teams/leaderboard');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.teams) && data.teams.length > 0) {
          baseList = data.teams;
          setIsConnected(true);
        }
      }
    } catch (_) {
      // Backend may be offline, keep fallback
    } finally {
      setTeams(mergeAndSortTeams(baseList));
      setLoading(false);
    }
  }, [mergeAndSortTeams]);

  useEffect(() => {
    fetchLeaderboard();
    const interval = setInterval(fetchLeaderboard, 6000);
    return () => clearInterval(interval);
  }, [fetchLeaderboard]);

  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    const term = searchTerm.toLowerCase();
    return teams.filter(t => t.name.toLowerCase().includes(term));
  }, [teams, searchTerm]);

  const handleOverrideSubmit = (e) => {
    e.preventDefault();
    const cleanKey = overrideKey.trim().toUpperCase();
    if (!cleanKey) {
      setErrorMsg('Please enter administrator override key.');
      return;
    }

    if (AUTHORIZED_OVERRIDE_CODES.includes(cleanKey)) {
      setErrorMsg('');
      setIsUnlockedSuccess(true);
      setTimeout(() => {
        onUnlockOverride();
      }, 400);
      return;
    }

    setErrorMsg('Access Denied: Invalid administrator override key.');
  };

  return (
    <div
      className="round-timer-lockscreen-root"
      onContextMenu={(e) => e.preventDefault()}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="lock-heading"
    >
      <div className="lockscreen-scanner-line" aria-hidden="true" />
      <div className="lockscreen-glow-ambient" aria-hidden="true" />

      <div className="lockscreen-card lockscreen-card-wide">
        {/* Top Header Row */}
        <div className="lockscreen-header-row">
          <div className="lockscreen-icon-capsule">
            <ShieldAlert size={36} className="lockscreen-alert-icon" />
            <div className="lockscreen-icon-ring" />
          </div>

          <div className="lockscreen-header-text">
            <div className="lockscreen-badges-row">
              <span className="lockscreen-badge round-badge">ROUND {round} EXPIRED</span>
              <span className="lockscreen-badge security-badge">
                <Lock size={11} /> SECURITY TIMEOUT
              </span>
            </div>

            <h1 id="lock-heading" className="lockscreen-title">
              TIME HAS EXPIRED
            </h1>
            <h2 className="lockscreen-round-sub">
              {roundName.toUpperCase()} CONCLUDED BEFORE COMPLETION
            </h2>
          </div>
        </div>

        {/* Informational Notice */}
        <div className="lockscreen-alert-box">
          <div className="alert-box-header">
            <AlertTriangle size={16} className="alert-triangle-icon" />
            <span>ALLOTTED COMPETITION TIME HAS ENDED</span>
          </div>
          <p className="alert-box-text">
            Your workstation time limit expired before completing all tasks for <strong>{roundName}</strong>. 
            Below are the current live championship standings and official telemetry for this expedition.
          </p>
        </div>

        {/* ── EXPEDITION LEADERBOARD SECTION ── */}
        <div className="lockscreen-leaderboard-section">
          <div className="lockscreen-lb-toolbar">
            <div className="lockscreen-lb-title">
              <Trophy size={16} className="text-amber-400" />
              <span>EXPEDITION LEADERBOARD</span>
              <span className={`lockscreen-sync-pill ${isConnected ? 'synced' : 'local'}`}>
                {isConnected ? 'LIVE SYNC' : 'OFFLINE'}
              </span>
            </div>

            <div className="lockscreen-lb-controls">
              <div className="lockscreen-search-box">
                <Search size={13} className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="lockscreen-search-input"
                />
              </div>

              <button
                type="button"
                onClick={fetchLeaderboard}
                disabled={loading}
                title="Refresh standings"
                className="lockscreen-refresh-btn"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="lockscreen-table-wrap">
            <table className="lockscreen-table">
              <thead>
                <tr>
                  <th style={{ width: '70px', textAlign: 'center' }}>RANK</th>
                  <th>EXPEDITION TEAM</th>
                  <th style={{ textAlign: 'center' }}>R1</th>
                  <th style={{ textAlign: 'center' }}>R2</th>
                  <th style={{ textAlign: 'center' }}>R3</th>
                  <th style={{ textAlign: 'right' }}>TOTAL PTS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTeams.map((team, idx) => {
                  const rank = team.rank || idx + 1;
                  const isSelf = (team.name || '').trim().toLowerCase() === activeTeamName.toLowerCase();
                  return (
                    <tr
                      key={team.id || team.name || idx}
                      className={`lockscreen-row ${isSelf ? 'is-self' : ''}`}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <span className={`lb-rank-badge rank-${rank <= 3 ? rank : 'other'}`}>
                          {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
                        </span>
                      </td>
                      <td>
                        <div className="lb-team-name-cell">
                          <span className="lb-team-name" title={team.name}>
                            {team.name}
                          </span>
                          {isSelf && <span className="lb-you-badge">YOU</span>}
                        </div>
                      </td>
                      <td className="lb-stage-score" style={{ textAlign: 'center' }}>
                        {team.round1_score ?? '\u2014'}
                      </td>
                      <td className="lb-stage-score" style={{ textAlign: 'center' }}>
                        {team.round2_score ?? '\u2014'}
                      </td>
                      <td className="lb-stage-score" style={{ textAlign: 'center' }}>
                        {team.round3_score ?? '\u2014'}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <span className="lb-total-score">
                          {team.score ?? 0} <small>PTS</small>
                        </span>
                      </td>
                    </tr>
                  );
                })}
                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="lockscreen-empty-cell">
                      <Radio size={14} className="inline mr-2 opacity-60" /> No matching teams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diagnostics & Proctor Override Toggle */}
        <div className="lockscreen-bottom-bar">
          <div className="lockscreen-team-summary">
            <span className="summary-label">YOUR TEAM:</span>
            <span className="summary-val diag-val highlight">{activeTeamName}</span>
            <span className="summary-divider">•</span>
            <span className="summary-label">CODE:</span>
            <span className="summary-val code diag-val code-text">CYPHORA_ROUND_{round}_TIME_EXPIRED</span>
            <span className="summary-divider">•</span>
            <span className="summary-label">PLEASE CONTACT THE ADMINISTRATOR</span>
          </div>

          <button
            type="button"
            onClick={() => setShowOverrideInput(prev => !prev)}
            className="lockscreen-toggle-proctor-btn"
          >
            <KeyRound size={12} />
            <span>{showOverrideInput ? 'Hide Proctor Controls' : 'Proctor Unlock'}</span>
          </button>
        </div>

        {/* Proctor Override Key Section */}
        {showOverrideInput && (
          <div className="lockscreen-override-section animate-[fadeIn_0.2s_ease-out]">
            <form onSubmit={handleOverrideSubmit} className="override-form" autoComplete="off">
              <div className="override-input-wrap">
                <input
                  type="password"
                  name="admin_override_key"
                  className="override-key-input pin-mask-input"
                  placeholder="Enter Proctor Authorization Code..."
                  value={overrideKey}
                  onChange={(e) => {
                    setOverrideKey(e.target.value.toUpperCase());
                    if (errorMsg) setErrorMsg('');
                  }}
                  autoComplete="off"
                />
                <button type="submit" className="override-submit-btn">
                  <span>Authorize & Resume</span>
                </button>
              </div>
              {errorMsg && <div className="override-error-msg">{errorMsg}</div>}
              {isUnlockedSuccess && (
                <div className="override-success-msg">
                  <CheckCircle2 size={14} /> Override Verified — Resuming Station...
                </div>
              )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default RoundTimerLockScreen;
