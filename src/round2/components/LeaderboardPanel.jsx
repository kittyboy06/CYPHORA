import React, { useState, useEffect } from 'react';
import { Trophy, X, Search, RefreshCw, Zap, Shield } from 'lucide-react';

const FALLBACK_EXPLORERS = [
  { rank: 1, name: 'Team Cipher', score: 1350, speed: '04:12', status: 'completed' },
  { rank: 2, name: 'Team Vortex', score: 1180, speed: '06:45', status: 'completed' },
  { rank: 3, name: 'Team Nexus', score: 1020, speed: '08:20', status: 'completed' },
  { rank: 4, name: 'Team Phantom', score: 860, speed: '11:05', status: 'active' },
  { rank: 5, name: 'Team Glitch', score: 720, speed: '13:18', status: 'active' },
  { rank: 6, name: 'Team Rogue', score: 580, speed: '--:--', status: 'active' },
  { rank: 7, name: 'Team Epoch', score: 400, speed: '--:--', status: 'idle' },
  { rank: 8, name: 'Team Blaze', score: 250, speed: '--:--', status: 'idle' },
];

export function LeaderboardPanel({
  isOpen,
  onClose,
  currentTeamName = 'Wandering Nomad',
  currentTeamScore = 0,
  currentTeamSpeed = null,
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [teams, setTeams] = useState(FALLBACK_EXPLORERS);
  const [loading, setLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  // Merge the active team's live score and speed, then re-rank by score descending
  const mergeCurrentTeamAndSort = (sourceList) => {
    const activeTeamName = (
      currentTeamName || localStorage.getItem('cyphora_team_name') || 'Wandering Nomad'
    ).trim();
    const lowerCurrent = activeTeamName.toLowerCase();

    // Determine the most up-to-date score and speed
    const savedScore = parseInt(localStorage.getItem('cyphora_round2_score'), 10) || 0;
    const activeScore = Math.max(Number(currentTeamScore) || 0, savedScore);

    const savedSpeed = localStorage.getItem('cyphora_round2_speed');
    const activeSpeed = currentTeamSpeed || savedSpeed || '--:--';

    let merged = sourceList.map(item => ({
      ...item,
      name: item.name || 'Anonymous Explorer',
      score: Number(item.score) || 0,
      speed: item.speed || '--:--',
    }));

    const matchIdx = merged.findIndex(
      t => (t.name || '').trim().toLowerCase() === lowerCurrent
    );

    if (matchIdx >= 0) {
      merged[matchIdx] = {
        ...merged[matchIdx],
        score: Math.max(merged[matchIdx].score || 0, activeScore),
        speed: activeSpeed !== '--:--' ? activeSpeed : (merged[matchIdx].speed || '--:--'),
        status: 'active',
      };
    } else {
      merged.push({
        name: activeTeamName,
        score: activeScore,
        speed: activeSpeed,
        status: 'active',
      });
    }

    // Sort descending by score (highest points first, speed as tie-breaker)
    merged.sort((a, b) => {
      const scoreDiff = (b.score || 0) - (a.score || 0);
      if (scoreDiff !== 0) return scoreDiff;
      const speedA = a.speed && a.speed !== '--:--' ? a.speed : '99:99';
      const speedB = b.speed && b.speed !== '--:--' ? b.speed : '99:99';
      return speedA.localeCompare(speedB);
    });

    // Re-index ranks 1..N based on points
    const rankedList = merged.map((t, idx) => ({
      ...t,
      rank: idx + 1,
    }));

    setTeams(rankedList);
  };

  const fetchLeaderboard = async () => {
    setLoading(true);
    let baseList = FALLBACK_EXPLORERS;
    try {
      const hostname = window.location.hostname || 'localhost';
      const isDev = window.location.port === '5173';
      const apiBase = isDev ? `http://${hostname}:8000` : '';

      const res = await fetch(`${apiBase}/api/teams/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        if (data.teams && data.teams.length > 0) {
          baseList = data.teams;
          setIsConnected(true);
        }
      }
    } catch (e) {
      // Local fallback
    } finally {
      setLoading(false);
    }

    mergeCurrentTeamAndSort(baseList);
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen, currentTeamScore, currentTeamSpeed, currentTeamName]);

  if (!isOpen) return null;

  // Filter only by team name (no participant names)
  const filteredTeams = teams.filter(t =>
    (t.name || '').toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  // Current team computed status for workstation banner
  const currentTeamObj = teams.find(
    t => (t.name || '').trim().toLowerCase() === (currentTeamName || '').trim().toLowerCase()
  );
  const displayRank = currentTeamObj?.rank;
  const displaySpeed = currentTeamObj?.speed || currentTeamSpeed || localStorage.getItem('cyphora_round2_speed') || '--:--';
  const displayScore = currentTeamObj ? currentTeamObj.score : Math.max(Number(currentTeamScore) || 0, parseInt(localStorage.getItem('cyphora_round2_score'), 10) || 0);

  return (
    <div className="leaderboard-modal-backdrop" onClick={onClose} role="dialog" aria-modal="true">
      <aside className="leaderboard-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-title-group">
            <Trophy className="gold-text" size={24} />
            <div>
              <h3>Expedition Standings</h3>
              <span className="drawer-subtitle">Stage 2 Live Scoreboard &bull; Speed Evaluation</span>
            </div>
          </div>
          <div className="drawer-actions">
            <button 
              type="button" 
              className={`refresh-btn ${loading ? 'spinning' : ''}`}
              onClick={fetchLeaderboard}
              title="Refresh standings"
              disabled={loading}
            >
              <RefreshCw size={16} />
            </button>
            <button 
              type="button" 
              className="drawer-close-btn" 
              onClick={onClose}
              aria-label="Close leaderboard"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Current Workstation Banner */}
        <div className="current-workstation-card">
          <div className="station-badge">
            <Shield size={14} />
            <span>THIS WORKSTATION</span>
          </div>
          <div className="station-content">
            <div className="station-team-info">
              <h4 className="gold-text">{currentTeamName}</h4>
              <div className="station-meta-row">
                <span className="station-speed">
                  <Zap size={12} className="gold-text" />
                  Speed: <strong>{displaySpeed}</strong>
                </span>
                {displayRank && (
                  <span className="station-rank">
                    Rank: <strong>#{displayRank}</strong>
                  </span>
                )}
              </div>
            </div>
            <div className="station-score-badge">
              <span className="pts-number">{displayScore}</span>
              <span className="pts-label">PTS</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="leaderboard-search-box">
          <Search size={15} className="search-icon" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Team Standings Table */}
        <div className="leaderboard-table-wrapper">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>Rank</th>
                <th>Team</th>
                <th style={{ width: '85px', textAlign: 'center' }}>Speed</th>
                <th style={{ width: '90px', textAlign: 'right' }}>Score</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeams.map((team) => {
                const isYou = (team.name || '').trim().toLowerCase() === (currentTeamName || '').trim().toLowerCase();
                let rankClass = '';
                if (team.rank === 1) rankClass = 'rank-gold';
                else if (team.rank === 2) rankClass = 'rank-silver';
                else if (team.rank === 3) rankClass = 'rank-bronze';

                return (
                  <tr key={team.name || team.rank} className={`team-row ${isYou ? 'you-row' : ''}`}>
                    <td>
                      <span className={`rank-badge ${rankClass}`}>
                        {team.rank}
                      </span>
                    </td>
                    <td>
                      <div className="team-cell-info">
                        <span className="team-cell-name">
                          {team.name}
                          {isYou && <span className="you-chip">YOU</span>}
                        </span>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="speed-tag">
                        <Zap size={11} />
                        {team.speed || '--:--'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="score-cell-pts gold-text">
                        {team.score ?? 0} PTS
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer info */}
        <div className="drawer-footer">
          <span className="status-indicator">
            <span className={`status-dot ${isConnected ? 'live' : 'local'}`}></span>
            {isConnected ? 'LIVE LAN SYNC (100 Nodes)' : 'STANDALONE RECON MODE'}
          </span>
          <span className="eval-rule-note">
            Faster completion yields higher speed points bonus!
          </span>
        </div>
      </aside>
    </div>
  );
}

export default LeaderboardPanel;
