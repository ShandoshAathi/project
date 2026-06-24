import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Leaderboard() {
  const { currentUser, xp, level } = useApp();
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    // Simulated global ranking data relative to current user
    const simulatedUsers = [
      { id: 1, name: 'Alex T.', xp: 12500, level: 14, avatar: 'A' },
      { id: 2, name: 'Maria S.', xp: 11200, level: 12, avatar: 'M' },
      { id: 3, name: 'John D.', xp: 10500, level: 11, avatar: 'J' },
      { id: 4, name: 'Sarah K.', xp: 9800, level: 10, avatar: 'S' },
      { 
        id: 'currentUser', 
        name: currentUser?.full_name || 'You', 
        xp: xp, 
        level: level, 
        avatar: currentUser?.full_name ? currentUser.full_name.charAt(0).toUpperCase() : 'Y' 
      },
      { id: 5, name: 'David L.', xp: Math.max(0, xp - 50), level: Math.max(1, level - 1), avatar: 'D' },
      { id: 6, name: 'Emma R.', xp: Math.max(0, xp - 300), level: Math.max(1, level - 1), avatar: 'E' },
    ];

    // Sort by XP descending
    const sorted = simulatedUsers.sort((a, b) => b.xp - a.xp);
    setLeaderboardData(sorted);
  }, [xp, level, currentUser]);

  return (
    <div className="page active" id="page-leaderboard">
      <div className="section-header mb-6">
        <h3 className="section-title">Global Leaderboard</h3>
        <p className="section-subtitle">Compete with learners worldwide and climb the ranks.</p>
      </div>

      <div className="card animate-in">
        <div className="leaderboard-list">
          {leaderboardData.map((user, index) => (
            <div key={user.id} className={`leaderboard-item ${user.id === 'currentUser' ? 'highlight-user' : ''}`}>
              <div className="rank">
                {index === 0 ? '🏆' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`}
              </div>
              <div className="leaderboard-avatar">{user.avatar}</div>
              <div className="leaderboard-info">
                <h4>{user.name}</h4>
                <p>Level {user.level}</p>
              </div>
              <div className="leaderboard-xp">
                <span>{user.xp} XP</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
