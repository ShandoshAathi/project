/**
 * src/main.jsx
 * Entrypoint mounting the App with context provider and importing the design system CSS.
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { AppProvider } from './context/AppContext.jsx';

// Core Design System
import '../css/variables.css';
import '../css/base.css';
import '../css/layout.css';
import '../css/components.css';

// Page-Specific Layout Styles
import '../css/pages/auth.css';
import '../css/pages/dashboard.css';
import '../css/pages/syllabus.css';
import '../css/pages/study.css';
import '../css/pages/practice.css';
import '../css/pages/results.css';
import '../css/pages/quiz.css';
import '../css/pages/profile.css';
import '../css/pages/settings.css';
import '../css/pages/flashcards.css';
import '../css/pages/leaderboard.css';
import '../css/pages/analytics.css';
import '../css/pages/study-rooms.css';

// System Utilities & Responsive Glides
import '../css/responsive.css';
import '../css/utils.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AppProvider>
      <App />
    </AppProvider>
  </React.StrictMode>
);
