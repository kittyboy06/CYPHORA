import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Trophy, Search, RefreshCw, Medal, Users, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';

export interface LeaderboardEntry {
  rank?: number;
  id?: number | string;
  name: string;
  member1?: string;
  member2?: string;
  score: number;
  round1_score?: number;
  round2_score?: number;
  round3_score?: number;
  status?: string;
  is_connected?: boolean;
}

interface FinaleLeaderboardProps {
  currentTeamName: string;
  currentTeamScore: string | number;
  onReplayOutro: () => void;
  onReviewTrials: () => void;
  onReturnToDesktop: () => void;
}

const FALLBACK_EXPLORERS: LeaderboardEntry[] = [
  { rank: 1, name: 'Team Cipher', score: 1850, round1_score: 550, round2_score: 145, round3_score: 1155, status: 'completed' },
  { rank: 2, name: 'Team Vortex', score: 1680, round1_score: 520, round2_score: 135, round3_score: 1025, status: 'completed' },
  { rank: 3, name: 'Team Nexus', score: 1520, round1_score: 480, round2_score: 140, round3_score: 900, status: 'completed' },
  { rank: 4, name: 'Team Phantom', score: 1360, round1_score: 450, round2_score: 120, round3_score: 790, status: 'active' },
  { rank: 5, name: 'Team Glitch', score: 1180, round1_score: 410, round2_score: 110, round3_score: 660, status: 'active' },
  { rank: 6, name: 'Team Rogue', score: 980, round1_score: 380, round2_score: 100, round3_score: 500, status: 'active' },
  { rank: 7, name: 'Team Epoch', score: 720, round1_score: 320, round2_score: 90, round3_score: 310, status: 'idle' },
  { rank: 8, name: 'Team Blaze', score: 550, round1_score: 250, round2_score: 80, round3_score: 220, status: 'idle' },
];

export const FinaleLeaderboard: React.FC<FinaleLeaderboardProps> = ({
  currentTeamName,
  currentTeamScore,
  onReplayOutro,
  onReviewTrials,
  onReturnToDesktop
}) => {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'lore'>('leaderboard');
  const [teams, setTeams] = useState<LeaderboardEntry[]>(FALLBACK_EXPLORERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLiveSynced, setIsLiveSynced] = useState(false);

  const teamScoreNum = typeof currentTeamScore === 'string' ? parseInt(currentTeamScore, 10) || 0 : currentTeamScore;

  const fetchStandings = useCallback(async () => {
    setIsLoading(true);
    let baseList = FALLBACK_EXPLORERS;
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost';
      const isDevPort = typeof window !== 'undefined' && window.location.port && window.location.port !== '8000';
      const apiBase = isDevPort ? `http://${hostname}:8000` : '';

      const res = await fetch(`${apiBase}/api/teams/leaderboard`);
      if (res.ok) {
        const data = await res.json();
        if (data.teams && Array.isArray(data.teams) && data.teams.length > 0) {
          baseList = data.teams;
          setIsLiveSynced(true);
        }
      }
    } catch (_) {
      // Local fallback in case offline or standalone kiosk
    } finally {
      setIsLoading(false);
    }

    // Merge active player's team and re-sort descending by score
    const targetName = (currentTeamName || localStorage.getItem('cyphora_team_name') || 'Explorer').trim().toLowerCase();
    const r1 = parseInt(localStorage.getItem('cyphora_round1_score') || '0', 10);
    const r2 = parseInt(localStorage.getItem('cyphora_round2_score') || '0', 10);
    const r3 = parseInt(localStorage.getItem('cyphora_round3_score') || '0', 10);
    const activeScore = Math.max(teamScoreNum, r1 + r2 + r3, parseInt(localStorage.getItem('cyphora_team_score') || '0', 10));

    const updated = [...baseList];
    const matchIdx = updated.findIndex(t => (t.name || '').trim().toLowerCase() === targetName);

    if (matchIdx >= 0) {
      updated[matchIdx] = {
        ...updated[matchIdx],
        score: Math.max(updated[matchIdx].score || 0, activeScore),
        round1_score: updated[matchIdx].round1_score ?? r1,
        round2_score: updated[matchIdx].round2_score ?? r2,
        round3_score: updated[matchIdx].round3_score ?? r3,
        status: 'completed'
      };
    } else {
      updated.push({
        name: currentTeamName || 'Explorer Team',
        score: activeScore,
        round1_score: r1,
        round2_score: r2,
        round3_score: r3,
        status: 'completed'
      });
    }

    // Sort descending by score
    updated.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Assign 1-indexed ranks
    const ranked = updated.map((item, idx) => ({
      ...item,
      rank: idx + 1
    }));

    setTeams(ranked);
  }, [currentTeamName, teamScoreNum]);

  useEffect(() => {
    fetchStandings();
    const interval = setInterval(fetchStandings, 6000);
    return () => clearInterval(interval);
  }, [fetchStandings]);

  // Current team standing calculations
  const myTeam = useMemo(() => {
    const clean = (currentTeamName || '').trim().toLowerCase();
    return teams.find(t => (t.name || '').trim().toLowerCase() === clean);
  }, [teams, currentTeamName]);

  const currentRank = myTeam?.rank ?? 1;
  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    const term = searchTerm.toLowerCase().trim();
    return teams.filter(t => (t.name || '').toLowerCase().includes(term));
  }, [teams, searchTerm]);

  return (
    <div className="w-screen h-screen flex flex-col items-center justify-between relative bg-[#050804] p-3 md:p-6 select-none overflow-hidden font-sans">
      {/* Ambient background atmosphere glow - golden sunrise & temple light */}
      <div className="absolute inset-0 pointer-events-none opacity-45 bg-[radial-gradient(circle_at_50%_30%,rgba(223,177,37,0.25),transparent_75%)]" />
      <div className="absolute inset-0 pointer-events-none opacity-20 bg-[linear-gradient(rgba(223,177,37,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(223,177,37,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* TOP HEADER: Grand Finale Badge & Standings Title */}
      <header className="relative z-10 w-full max-w-5xl flex flex-wrap items-center justify-between border-b border-[var(--border-gold)]/40 pb-2.5 pt-1 gap-2">
        <div className="flex items-center gap-3">
          <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-gold)] animate-pulse shadow-[0_0_12px_var(--accent-gold)]" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-[0.25em] text-[var(--accent-gold)]/90">
                Grand Finale // Outro Complete
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <ShieldCheck size={11} />
                <span>{isLiveSynced ? 'LIVE STANDINGS' : 'EXPEDITION SYNC'}</span>
              </span>
            </div>
            <h1 className="text-lg md:text-2xl font-cinzel text-[var(--accent-gold)] tracking-widest font-bold drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]">
              THE LIGHT OF CYPHORA
            </h1>
          </div>
        </div>

        {/* Tab Switcher: Leaderboard vs Lore */}
        <div className="flex items-center bg-black/60 border border-[var(--border-gold)]/50 rounded-sm p-1 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 md:px-4 py-1 rounded-sm font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'leaderboard'
                ? 'bg-[var(--accent-gold)] text-black font-bold shadow-[0_0_14px_rgba(223,177,37,0.5)]'
                : 'text-neutral-400 hover:text-[var(--accent-gold)]'
            }`}
          >
            <Trophy size={13} />
            <span>Leaderboard</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lore')}
            className={`px-3 md:px-4 py-1 rounded-sm font-mono text-xs uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'lore'
                ? 'bg-[var(--accent-gold)] text-black font-bold shadow-[0_0_14px_rgba(223,177,37,0.5)]'
                : 'text-neutral-400 hover:text-[var(--accent-gold)]'
            }`}
          >
            <Sparkles size={13} />
            <span>Epilogue Lore</span>
          </button>
        </div>
      </header>

      {/* CENTER STAGE: Leaderboard View or Lore View */}
      <main className="relative z-10 w-full max-w-5xl flex-1 flex flex-col items-center justify-center my-2 overflow-hidden">
        {activeTab === 'leaderboard' ? (
          <div className="w-full h-full flex flex-col bg-[rgba(10,14,8,0.92)] border border-[var(--border-gold)] rounded-sm shadow-[0_0_50px_rgba(0,0,0,0.9),0_0_30px_rgba(223,177,37,0.15)] overflow-hidden">
            {/* Team Highlight Banner */}
            <div className="bg-gradient-to-r from-amber-950/40 via-black/80 to-amber-950/40 border-b border-[var(--border-gold)]/50 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-sm bg-[var(--accent-gold)]/15 border border-[var(--accent-gold)]/60 flex items-center justify-center text-[var(--accent-gold)] shadow-[0_0_16px_rgba(223,177,37,0.3)]">
                  <Trophy size={20} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-cinzel font-bold text-[var(--accent-gold)] text-base md:text-lg">
                      {currentTeamName || 'Explorer Team'}
                    </span>
                    <span className="px-2 py-0.5 rounded-sm bg-[var(--accent-gold)] text-black font-mono text-[10px] font-bold">
                      YOU
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-mono text-neutral-400">
                    <span>Rank: <strong className="text-amber-300 font-bold">#{currentRank}</strong> of {teams.length}</span>
                    <span>•</span>
                    <span>Total Score: <strong className="text-emerald-400 font-bold">{myTeam?.score ?? teamScoreNum} PTS</strong></span>
                  </div>
                </div>
              </div>

              {/* Search Bar & Refresh */}
              <div className="flex items-center gap-2">
                <div className="flex items-center bg-black/60 border border-[var(--border-gold)]/40 rounded-sm px-2.5 py-1 text-xs">
                  <Search size={13} className="text-neutral-500 mr-1.5" />
                  <input
                    type="text"
                    placeholder="Search squad..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="bg-transparent text-neutral-200 outline-none w-32 sm:w-44 text-xs font-mono placeholder:text-neutral-600"
                  />
                </div>
                <button
                  type="button"
                  onClick={fetchStandings}
                  title="Refresh standings"
                  className="p-1.5 rounded-sm bg-black/60 border border-[var(--border-gold)]/40 hover:border-[var(--accent-gold)] text-[var(--accent-gold)] transition-colors cursor-pointer"
                >
                  <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                </button>
              </div>
            </div>

            {/* Leaderboard Table */}
            <div className="flex-1 overflow-y-auto px-2 py-1 scrollbar-thin">
              <table className="w-full border-collapse text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-[var(--border-gold)]/30 text-[var(--text-muted)] text-[10px] uppercase tracking-wider sticky top-0 bg-[#070b07] z-10">
                    <th className="py-2 px-3">RANK</th>
                    <th className="py-2 px-3">EXPLORER SQUAD</th>
                    <th className="py-2 px-3 text-center hidden sm:table-cell">R1 (OS)</th>
                    <th className="py-2 px-3 text-center hidden sm:table-cell">R2 (IMAGE)</th>
                    <th className="py-2 px-3 text-center hidden sm:table-cell">R3 (CODE)</th>
                    <th className="py-2 px-3 text-right">TOTAL SCORE</th>
                    <th className="py-2 px-3 text-center hidden md:table-cell">STATUS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeams.map((item, idx) => {
                    const isYou = (item.name || '').trim().toLowerCase() === (currentTeamName || '').trim().toLowerCase();
                    const rankNum = item.rank || idx + 1;

                    return (
                      <tr
                        key={item.id || item.name || idx}
                        className={`transition-colors border-b border-white/[0.04] ${
                          isYou
                            ? 'bg-[var(--accent-gold)]/15 border-[var(--accent-gold)]/40 text-amber-200 shadow-[inset_0_0_16px_rgba(223,177,37,0.1)]'
                            : 'hover:bg-white/[0.02] text-neutral-300'
                        }`}
                      >
                        {/* Rank Column */}
                        <td className="py-2.5 px-3 font-bold">
                          <div className="flex items-center gap-1.5">
                            {rankNum === 1 ? (
                              <span className="text-amber-400 font-bold text-sm">🥇 #1</span>
                            ) : rankNum === 2 ? (
                              <span className="text-slate-300 font-bold text-sm">🥈 #2</span>
                            ) : rankNum === 3 ? (
                              <span className="text-amber-600 font-bold text-sm">🥉 #3</span>
                            ) : (
                              <span className="text-neutral-500 font-mono">#{rankNum}</span>
                            )}
                          </div>
                        </td>

                        {/* Squad Name */}
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span className={`font-semibold ${isYou ? 'text-[var(--accent-gold)] font-bold text-sm' : ''}`}>
                              {item.name}
                            </span>
                            {isYou && (
                              <span className="bg-[var(--accent-gold)] text-black text-[9px] px-1.5 py-0.2 rounded-xs font-bold uppercase tracking-wider">
                                YOU
                              </span>
                            )}
                          </div>
                          {(item.member1 || item.member2) && (
                            <div className="text-[10px] text-neutral-500 mt-0.5">
                              {item.member1}{item.member2 ? ` & ${item.member2}` : ''}
                            </div>
                          )}
                        </td>

                        {/* R1 */}
                        <td className="py-2.5 px-3 text-center text-neutral-400 hidden sm:table-cell">
                          {item.round1_score !== undefined ? `${item.round1_score}p` : '—'}
                        </td>

                        {/* R2 */}
                        <td className="py-2.5 px-3 text-center text-neutral-400 hidden sm:table-cell">
                          {item.round2_score !== undefined ? `${item.round2_score}p` : '—'}
                        </td>

                        {/* R3 */}
                        <td className="py-2.5 px-3 text-center text-neutral-400 hidden sm:table-cell">
                          {item.round3_score !== undefined ? `${item.round3_score}p` : '—'}
                        </td>

                        {/* Total Score */}
                        <td className="py-2.5 px-3 text-right">
                          <span className={`font-mono font-bold text-sm ${isYou ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'text-emerald-400'}`}>
                            {item.score} PTS
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-2.5 px-3 text-center hidden md:table-cell">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider font-semibold ${
                            item.status === 'completed'
                              ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          }`}>
                            {item.status || 'ACTIVE'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}

                  {filteredTeams.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-8 text-neutral-500">
                        No explorer squads matching "{searchTerm}"
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Lore & Ancient Epilogue View */
          <div className="max-w-2xl w-full bg-[rgba(10,14,8,0.95)] border-2 border-[var(--border-gold)] p-8 md:p-12 rounded-sm shadow-[0_0_60px_rgba(0,0,0,0.9),0_0_40px_rgba(223,177,37,0.25)] text-center space-y-6 animate-[fadeIn_0.4s_ease-out]">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[rgba(223,177,37,0.15)] border border-[var(--accent-gold)] text-[var(--accent-gold)] font-mono text-xs uppercase tracking-[0.25em]">
              <Sparkles size={14} />
              <span>Expedition Epilogue // Chapter VI</span>
            </div>

            <h2 className="text-2xl md:text-4xl font-cinzel text-[var(--accent-gold)] font-bold tracking-widest drop-shadow-[0_4px_16px_rgba(0,0,0,0.9)]">
              THE CIPHER RESOLVED
            </h2>

            <p className="text-sm md:text-base font-cinzel text-[var(--text-primary)] leading-relaxed italic max-w-xl mx-auto">
              "The trials of the ancient forest have bowed before your intellect. The gate is unsealed, and the memories of Cyphora return. The light beyond is no longer an anomaly—it is a beginning."
            </p>

            <div className="bg-black/60 border border-[var(--border-gold)]/50 p-6 rounded-sm space-y-3">
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-gold)]/20 pb-2">
                <span>Explorer Team:</span>
                <span className="font-bold text-[var(--accent-gold)] text-sm">{currentTeamName}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border-gold)]/20 pb-2">
                <span>Championship Standing:</span>
                <span className="font-bold text-green-400 text-base font-mono">#{currentRank} ({myTeam?.score ?? teamScoreNum} PTS)</span>
              </div>
              <div className="flex justify-between items-center text-xs font-mono uppercase tracking-wider text-[var(--text-muted)]">
                <span>Trial Outcome:</span>
                <span className="font-bold text-yellow-400">🏆 VICTORIOUS EXPEDITION COMPLETE</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveTab('leaderboard')}
              className="w-full py-3 bg-[var(--accent-gold)] hover:bg-amber-400 text-black font-mono text-xs uppercase tracking-widest font-bold rounded-sm transition-all shadow-[0_0_20px_rgba(223,177,37,0.4)] active:scale-95 cursor-pointer flex items-center justify-center gap-2"
            >
              <Trophy size={15} />
              <span>View Live Expedition Standings →</span>
            </button>
          </div>
        )}
      </main>

      {/* BOTTOM CONTROLS: Action Buttons */}
      <footer className="relative z-10 w-full max-w-5xl flex flex-col sm:flex-row items-center justify-between border-t border-[var(--border-gold)]/30 pt-3 gap-2">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onReplayOutro}
            className="px-4 py-2 bg-[rgba(223,177,37,0.12)] hover:bg-[rgba(223,177,37,0.22)] border border-[var(--accent-gold)] text-[var(--accent-gold)] font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>🎬 Replay Outro Story</span>
          </button>

          <button
            type="button"
            onClick={onReviewTrials}
            className="px-4 py-2 bg-black/60 hover:bg-black/90 border border-neutral-700 hover:border-[var(--accent-gold)] text-neutral-300 hover:text-[var(--accent-gold)] font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
          >
            <span>🔄 Review Trials & Sandbox</span>
          </button>
        </div>

        <button
          type="button"
          onClick={onReturnToDesktop}
          className="px-4 py-2 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-500/50 hover:border-emerald-400 text-emerald-300 font-mono text-xs uppercase tracking-wider font-semibold rounded-sm transition-all cursor-pointer active:scale-95 flex items-center gap-1.5"
        >
          <span>← Return To Workstation Desktop</span>
          <ArrowRight size={13} />
        </button>
      </footer>
    </div>
  );
};
