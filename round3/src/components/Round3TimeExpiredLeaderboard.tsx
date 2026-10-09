import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, Trophy, Search, RefreshCw, KeyRound, Radio } from 'lucide-react';

interface Props {
  onAdminUnlock: () => void;
}

interface TeamItem {
  id?: string | number;
  rank?: number;
  name: string;
  score: number;
  round1_score?: number;
  round2_score?: number;
  round3_score?: number;
  status?: string;
}

const FALLBACK_TEAMS: TeamItem[] = [
  { rank: 1, name: 'Team Cipher', score: 1450, round1_score: 500, round2_score: 470, round3_score: 480, status: 'completed' },
  { rank: 2, name: 'Team Vortex', score: 1280, round1_score: 450, round2_score: 430, round3_score: 400, status: 'completed' },
  { rank: 3, name: 'Team Nexus', score: 1120, round1_score: 400, round2_score: 420, round3_score: 300, status: 'completed' },
  { rank: 4, name: 'Team Phantom', score: 960, round1_score: 380, round2_score: 350, round3_score: 230, status: 'active' },
  { rank: 5, name: 'Team Glitch', score: 820, round1_score: 350, round2_score: 270, round3_score: 200, status: 'active' },
  { rank: 6, name: 'Team Rogue', score: 680, round1_score: 320, round2_score: 210, round3_score: 150, status: 'active' },
  { rank: 7, name: 'Team Epoch', score: 500, round1_score: 280, round2_score: 120, round3_score: 100, status: 'idle' },
  { rank: 8, name: 'Team Blaze', score: 350, round1_score: 200, round2_score: 100, round3_score: 50, status: 'idle' },
];

export const Round3TimeExpiredLeaderboard: React.FC<Props> = ({ onAdminUnlock }) => {
  const [adminCode, setAdminCode] = useState('');
  const [adminError, setAdminError] = useState('');
  const [showAdminForm, setShowAdminForm] = useState(false);

  const [teams, setTeams] = useState<TeamItem[]>(FALLBACK_TEAMS);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  const activeTeamName = (
    (typeof localStorage !== 'undefined' ? localStorage.getItem('cyphora_team_name') : '') ||
    'Explorer'
  ).trim();

  const mergeAndSortTeams = useCallback((sourceList: TeamItem[]) => {
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

    merged.sort((a, b) => (b.score || 0) - (a.score || 0));

    return merged.map((t, idx) => ({
      ...t,
      rank: idx + 1
    }));
  }, [activeTeamName]);

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    let baseList = FALLBACK_TEAMS;
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
      // Offline fallback
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

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = adminCode.trim().toUpperCase();
    if (['JCEAIML', 'CYPHORA-ADMIN', '8080', 'ADMIN', '1234', 'ROOT'].includes(code)) {
      onAdminUnlock();
    } else {
      setAdminError('Invalid admin override code.');
    }
  };

  return (
    <div className="absolute inset-0 bg-red-950/95 flex flex-col items-center justify-center p-3 md:p-6 z-[200] backdrop-blur-md select-none overflow-y-auto">
      <div className="max-w-4xl w-full bg-black/90 p-6 md:p-8 border border-red-500/50 rounded-sm shadow-2xl space-y-5 animate-[fadeIn_0.3s_ease-out]">
        
        {/* Top Header Banner */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left border-b border-red-900/40 pb-4">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/40 flex items-center justify-center shrink-0">
            <Clock size={32} className="text-red-500 animate-pulse" />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded bg-red-500/20 border border-red-500/40 text-[10px] font-mono text-red-400 uppercase tracking-widest mb-1">
              <span>Security Freeze</span>
              <span>•</span>
              <span>Round 3 Time Expired</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-cinzel text-red-500 font-bold tracking-widest">
              ROUND 3 TIME EXPIRED
            </h1>
            <p className="text-xs md:text-sm font-mono text-neutral-400 mt-0.5">
              "The temple gates have closed before all trials were completed. Final standing recorded."
            </p>
          </div>
        </div>

        {/* ── LEADERBOARD COMPONENT ── */}
        <div className="bg-black/60 border border-[var(--border-gold)]/40 rounded-sm overflow-hidden shadow-lg">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-neutral-900/90 border-b border-[var(--border-gold)]/30 gap-3">
            <div className="flex items-center gap-2">
              <Trophy size={16} className="text-amber-400" />
              <span className="font-cinzel font-bold text-xs md:text-sm text-[var(--accent-gold)] tracking-wider">
                EXPEDITION LEADERBOARD
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                isConnected ? 'bg-green-500/20 text-green-400 border-green-500/40' : 'bg-neutral-800 text-neutral-400 border-neutral-700'
              }`}>
                {isConnected ? 'LIVE' : 'OFFLINE'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 bg-black/70 border border-[var(--border-gold)]/30 rounded px-2.5 py-1">
                <Search size={12} className="text-neutral-500" />
                <input
                  type="text"
                  placeholder="Filter teams..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-transparent text-xs text-neutral-200 outline-none w-24 md:w-32 font-mono"
                />
              </div>

              <button
                type="button"
                onClick={fetchLeaderboard}
                disabled={loading}
                title="Refresh standings"
                className="p-1.5 bg-[rgba(223,177,37,0.15)] hover:bg-[rgba(223,177,37,0.3)] text-[var(--accent-gold)] border border-[var(--border-gold)]/40 rounded cursor-pointer transition-colors"
              >
                <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="max-h-64 overflow-y-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="sticky top-0 bg-neutral-950 border-b border-[var(--border-gold)]/20 text-[10px] text-neutral-400 tracking-wider">
                <tr>
                  <th className="py-2 px-3 text-center w-16">RANK</th>
                  <th className="py-2 px-3">EXPEDITION TEAM</th>
                  <th className="py-2 px-3 text-center">R1</th>
                  <th className="py-2 px-3 text-center">R2</th>
                  <th className="py-2 px-3 text-center">R3</th>
                  <th className="py-2 px-3 text-right">TOTAL PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-900">
                {filteredTeams.map((team, idx) => {
                  const rank = team.rank || idx + 1;
                  const isSelf = (team.name || '').trim().toLowerCase() === activeTeamName.toLowerCase();
                  return (
                    <tr
                      key={team.id || team.name || idx}
                      className={`transition-colors ${isSelf ? 'bg-[rgba(223,177,37,0.15)] font-bold border-l-2 border-[var(--accent-gold)]' : 'hover:bg-neutral-900/40'}`}
                    >
                      <td className="py-2.5 px-3 text-center">
                        <span className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                          rank === 1
                            ? 'bg-amber-500/30 text-amber-300 border border-amber-500/60 shadow-[0_0_8px_rgba(245,158,11,0.3)]'
                            : rank === 2
                            ? 'bg-neutral-300/20 text-neutral-200 border border-neutral-400/50'
                            : rank === 3
                            ? 'bg-amber-700/20 text-amber-500 border border-amber-700/50'
                            : 'text-neutral-500'
                        }`}>
                          {rank === 1 ? '🥇 #1' : rank === 2 ? '🥈 #2' : rank === 3 ? '🥉 #3' : `#${rank}`}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`${isSelf ? 'text-[var(--accent-gold)]' : 'text-neutral-200'} truncate max-w-[200px]`}>
                            {team.name}
                          </span>
                          {isSelf && (
                            <span className="text-[9px] bg-[var(--accent-gold)] text-black px-1.5 py-0.2 rounded font-bold">
                              YOU
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-center text-neutral-400">{team.round1_score ?? '\u2014'}</td>
                      <td className="py-2.5 px-3 text-center text-neutral-400">{team.round2_score ?? '\u2014'}</td>
                      <td className="py-2.5 px-3 text-center text-neutral-400">{team.round3_score ?? '\u2014'}</td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-green-400 font-bold text-sm">{team.score ?? 0}</span>
                        <span className="text-[10px] text-neutral-500 ml-1">PTS</span>
                      </td>
                    </tr>
                  );
                })}
                {filteredTeams.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500 font-mono text-xs">
                      <Radio size={14} className="inline mr-1 opacity-60" /> No matching teams found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Bar: Team summary and Proctor Unlock toggle */}
        <div className="flex items-center justify-between text-xs font-mono border-t border-red-900/30 pt-3">
          <div className="flex items-center gap-2 text-neutral-400">
            <span>TEAM: <strong className="text-amber-400">{activeTeamName}</strong></span>
            <span>•</span>
            <span className="text-red-400/80">Awaiting proctor evaluation</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAdminForm(prev => !prev)}
            className="flex items-center gap-1.5 px-3 py-1 bg-neutral-900 border border-neutral-700 hover:border-red-500/50 text-neutral-400 hover:text-white rounded cursor-pointer transition-colors"
          >
            <KeyRound size={12} />
            <span>{showAdminForm ? 'Hide Proctor Unlock' : 'Proctor Unlock'}</span>
          </button>
        </div>

        {/* Proctor Unlock Form */}
        {showAdminForm && (
          <div className="p-3 bg-black/80 border border-red-900/50 rounded animate-[fadeIn_0.2s_ease-out]">
            <form onSubmit={handleAdminSubmit} className="flex flex-col sm:flex-row items-center gap-2">
              <input
                type="password"
                value={adminCode}
                onChange={(e) => {
                  setAdminCode(e.target.value);
                  if (adminError) setAdminError('');
                }}
                placeholder="Supervisor Access Code"
                className="bg-black/60 border border-red-900/60 text-red-400 text-center text-xs font-mono px-3 py-2 outline-none focus:border-red-500 flex-1 w-full sm:w-auto"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-red-500 text-white font-mono text-xs font-bold uppercase tracking-wider rounded cursor-pointer transition-colors"
              >
                Unlock
              </button>
            </form>
            {adminError && <p className="text-red-400 text-xs font-mono mt-1 text-center">{adminError}</p>}
          </div>
        )}
      </div>
    </div>
  );
};
