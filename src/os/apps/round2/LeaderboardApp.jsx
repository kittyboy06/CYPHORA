import React, { useState, useEffect } from 'react';
import { Trophy, Search, RefreshCw, Zap, Shield, Users } from 'lucide-react';
import { useOS } from '../../state/OSContext.jsx';

export function LeaderboardApp() {
  const { liveExplorers = [], fetchLeaderboard, teamData, isWsConnected } = useOS();
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const teamName = (teamData?.name || localStorage.getItem('cyphora_team_name') || 'Wandering Nomad').trim().toLowerCase();

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (typeof fetchLeaderboard === 'function') {
      await fetchLeaderboard(teamData?.name, true);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const explorers = Array.isArray(liveExplorers) && liveExplorers.length > 0 ? liveExplorers : [
    { rank: 1, name: 'Team Cipher', score: 1350, speed: '04:12', status: 'completed' },
    { rank: 2, name: 'Team Vortex', score: 1180, speed: '06:45', status: 'completed' },
    { rank: 3, name: 'Team Nexus', score: 1020, speed: '08:20', status: 'completed' },
    { rank: 4, name: 'Team Phantom', score: 860, speed: '11:05', status: 'active' },
    { rank: 5, name: 'Team Glitch', score: 720, speed: '13:18', status: 'active' },
    { rank: 6, name: 'Team Rogue', score: 580, speed: '--:--', status: 'active' },
  ];

  const filtered = explorers.filter(e =>
    (e.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      background: '#070b07',
      color: '#eae0c8',
      fontFamily: 'Montserrat, sans-serif',
      overflow: 'hidden'
    }}>
      {/* Top Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0.65rem 1rem',
        background: 'rgba(22, 28, 20, 0.95)',
        borderBottom: '1px solid rgba(223, 177, 37, 0.25)',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Trophy size={16} color="#dfb125" />
          <span style={{ fontFamily: 'Cinzel', fontSize: '0.88rem', fontWeight: 700, color: '#dfb125', letterSpacing: '1px' }}>
            EXPEDITION STANDINGS
          </span>
          <span style={{
            fontSize: '0.68rem',
            padding: '2px 8px',
            borderRadius: '10px',
            background: isWsConnected ? 'rgba(126, 231, 135, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            color: isWsConnected ? '#7ee787' : '#f59e0b',
            fontWeight: 600
          }}>
            {isWsConnected ? '● LIVE SYNC' : '○ REST SYNC'}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(0, 0, 0, 0.35)',
            border: '1px solid rgba(223, 177, 37, 0.25)',
            borderRadius: '4px',
            padding: '3px 8px'
          }}>
            <Search size={12} color="#889280" />
            <input
              type="text"
              placeholder="Search team..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#eae0c8',
                fontSize: '0.75rem',
                outline: 'none',
                paddingLeft: '6px',
                width: '120px'
              }}
            />
          </div>

          <button
            type="button"
            onClick={handleRefresh}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(223, 177, 37, 0.2)',
              color: '#d1c7b7',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <RefreshCw size={12} className={isRefreshing ? 'spin' : ''} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem 1rem' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
          <thead>
            <tr style={{
              borderBottom: '1px solid rgba(223, 177, 37, 0.3)',
              color: '#a8a08d',
              fontSize: '0.7rem',
              letterSpacing: '1px',
              textAlign: 'left'
            }}>
              <th style={{ padding: '0.5rem 0.6rem' }}>RANK</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>EXPLORER TEAM</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>SCORE</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>SPEED</th>
              <th style={{ padding: '0.5rem 0.6rem' }}>STATUS</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, idx) => {
              const isYou = (item.name || '').toLowerCase() === teamName;
              return (
                <tr
                  key={idx}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                    background: isYou ? 'rgba(223, 177, 37, 0.12)' : 'transparent',
                    color: isYou ? '#ffe680' : '#eae0c8'
                  }}
                >
                  <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'Fira Code', fontWeight: 700 }}>
                    #{item.rank || idx + 1}
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <span style={{ fontWeight: isYou ? 700 : 500 }}>{item.name}</span>
                      {isYou && (
                        <span style={{
                          background: '#dfb125',
                          color: '#060905',
                          fontSize: '0.62rem',
                          padding: '1px 5px',
                          borderRadius: '3px',
                          fontWeight: 700
                        }}>
                          YOU
                        </span>
                      )}
                    </div>
                    {(item.member1 || item.member2) && (
                      <div style={{ fontSize: '0.68rem', color: '#889280', marginTop: '2px' }}>
                        {item.member1}{item.member2 ? ` & ${item.member2}` : ''}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'Fira Code', fontWeight: 700, color: '#dfb125' }}>
                    {item.score ?? 0} PTS
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem', fontFamily: 'Fira Code', color: '#79c0ff' }}>
                    {item.speed || '--:--'}
                  </td>
                  <td style={{ padding: '0.65rem 0.6rem' }}>
                    <span style={{
                      fontSize: '0.68rem',
                      padding: '2px 7px',
                      borderRadius: '8px',
                      background: item.status === 'completed' ? 'rgba(126, 231, 135, 0.15)' : 'rgba(88, 166, 255, 0.15)',
                      color: item.status === 'completed' ? '#7ee787' : '#79c0ff',
                      fontWeight: 600,
                      textTransform: 'uppercase'
                    }}>
                      {item.status || 'active'}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default LeaderboardApp;
