/**
 * src/components/TopNav.jsx
 * Navigation bar matching original CSS styling and state integration.
 */

import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function TopNav() {
  const { activePage, setActivePage, streak, currentUser } = useApp();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'practice', label: 'Practice', icon: '🎙️' },
    { id: 'writing', label: 'Writing', icon: '✍️' },
    { id: 'quiz', label: 'Quiz', icon: '🧠' },
    { id: 'flashcards', label: 'Flashcards', icon: '🗂️' },
    { id: 'study', label: 'Study', icon: '📖' },
    { id: 'syllabus', label: 'Syllabus', icon: '📚' },
    { id: 'results', label: 'Results', icon: '📊' },
    { id: 'leaderboard', label: 'Rank', icon: '🏆' },
    { id: 'analytics', label: 'Analytics', icon: '📈' },
    { id: 'rooms', label: 'Social', icon: '🌍' },
    { id: 'profile', label: 'Profile', icon: '👤' }
  ];

  const handleNavClick = (pageId) => {
    setActivePage(pageId);
  };

  const getInitials = () => {
    if (!currentUser) return 'A';
    const name = currentUser.full_name || 'Learner';
    return name.charAt(0).toUpperCase();
  };

  return (
    <nav className="topnav">
      <div className="brand" onClick={() => handleNavClick('dashboard')} style={{ cursor: 'pointer' }}>
        <div className="brand-icon">V</div>
        <span className="brand-name">VaaniAI</span>
      </div>
      
      <div className="nav">
        {/* Simple reactive active glider position can be simulated, or simple active class matches original */}
        {navItems.map(item => (
          <a 
            key={item.id}
            className={`nav-item ${activePage === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item.id)}
            style={{ cursor: 'pointer' }}
          >
            <span className="nav-icon">{item.icon}</span>
            <span>{item.label}</span>
          </a>
        ))}
      </div>

      <div className="topnav-right">
        <div className="streak-badge" id="streak-badge">
          🔥 {streak} Day{streak !== 1 ? 's' : ''} Streak
        </div>
        <div className="avatar" onClick={() => handleNavClick('profile')} style={{ cursor: 'pointer' }}>
          {getInitials()}
        </div>
      </div>
    </nav>
  );
}
