/**
 * src/components/Splash.jsx
 * Splash Screen layout with skip controls.
 */

import React, { useState, useEffect } from 'react';

export default function Splash({ onDismiss }) {
  const [visible, setVisible] = useState(true);
  const [showSkip, setShowSkip] = useState(false);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Check if shown in this session
    if (sessionStorage.getItem('vaani_splash_shown')) {
      setVisible(false);
      if (onDismiss) onDismiss();
      return;
    }

    // Auto-show skip button after 3s
    const skipTimer = setTimeout(() => {
      setShowSkip(true);
    }, 3000);

    // Safety fail-safe auto dismiss after 5s
    const dismissTimer = setTimeout(() => {
      dismissSplash();
    }, 5000);

    return () => {
      clearTimeout(skipTimer);
      clearTimeout(dismissTimer);
    };
  }, []);

  const dismissSplash = () => {
    setOpacity(0);
    setTimeout(() => {
      setVisible(false);
      sessionStorage.setItem('vaani_splash_shown', 'true');
      if (onDismiss) onDismiss();
    }, 400); // Wait for opacity transition
  };

  if (!visible) return null;

  return (
    <div 
      id="splash" 
      className="splash-screen active"
      style={{ 
        opacity: opacity, 
        transition: 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
        display: visible ? 'flex' : 'none'
      }}
    >
      <div className="splash-content">
        <div className="splash-logo">V</div>
        <div className="splash-title">VaaniAI</div>
        <div className="splash-subtitle">Your AI Learning Tutor</div>
        {showSkip && (
          <button 
            id="skip-splash" 
            className="btn-skip-splash" 
            style={{ display: 'block' }}
            onClick={dismissSplash}
          >
            Skip Splash Screen
          </button>
        )}
      </div>
    </div>
  );
}
