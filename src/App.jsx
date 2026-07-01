/**
 * src/App.jsx
 * Master layout and navigation routing for VaaniAI.
 */

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext.jsx';
import Splash from '@/components/Splash.jsx';
import Onboarding from '@/components/Onboarding.jsx';
import TopNav from '@/components/TopNav.jsx';
import AICoachDrawer from '@/components/AICoachDrawer.jsx';

// Pages
import Auth from '@/pages/Auth.jsx';
import Dashboard from '@/pages/Dashboard.jsx';
import Practice from '@/pages/Practice.jsx';
import Quiz from '@/pages/Quiz.jsx';
import Flashcards from '@/pages/Flashcards.jsx';
import Study from '@/pages/Study.jsx';
import Syllabus from '@/pages/Syllabus.jsx';
import Results from '@/pages/Results.jsx';
import Profile from '@/pages/Profile.jsx';
import Settings from '@/pages/Settings.jsx';
import Leaderboard from '@/pages/Leaderboard.jsx';
import Analytics from '@/pages/Analytics.jsx';
import StudyRooms from '@/pages/StudyRooms.jsx';
import WritingGrader from '@/pages/WritingGrader.jsx';

export default function App() {
  const { activePage, setActivePage, currentUser } = useApp();
  const [splashActive, setSplashActive] = useState(true);

  if (splashActive) {
    return <Splash onDismiss={() => setSplashActive(false)} />;
  }

  if (!currentUser) {
    return <Auth />;
  }

  if (activePage === 'onboarding') {
    return <Onboarding onComplete={() => setActivePage('dashboard')} />;
  }

  const renderPage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'practice':
        return <Practice />;
      case 'quiz':
        return <Quiz />;
      case 'flashcards':
        return <Flashcards />;
      case 'study':
        return <Study />;
      case 'syllabus':
        return <Syllabus />;
      case 'results':
        return <Results />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'leaderboard':
        return <Leaderboard />;
      case 'analytics':
        return <Analytics />;
      case 'rooms':
        return <StudyRooms />;
      case 'writing':
        return <WritingGrader />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app">
      <TopNav />
      <main className="main">
        {renderPage()}
      </main>
      <AICoachDrawer />
    </div>
  );
}
