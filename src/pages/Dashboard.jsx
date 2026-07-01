/**
 * src/pages/Dashboard.jsx
 * Dashboard page for VaaniAI.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateDailyChallenge, evaluateChallengeResponse, generateCustomSyllabus } from '../services/ai.js';
import { initSpeechToText, startListening, stopListening } from '../services/voice.js';
import { extractTextFromPDF, fetchTextFromURL } from '../services/fileParser.js';

export default function Dashboard() {
  const { 
    currentUser, 
    xp, 
    level, 
    xpProgress,
    addXPPoints, 
    streak, 
    currentSubject, 
    switchSubject, 
    customSubjects, 
    addCustomSubject, 
    deleteCustomSubject, 
    setActivePage,
    setIsChatOpen
  } = useApp();

  // Modals & Challenge state
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customFile, setCustomFile] = useState(null);
  const [customLink, setCustomLink] = useState('');
  const [generatingCustom, setGeneratingCustom] = useState(false);
  const [customStatus, setCustomStatus] = useState('Analyzing Document...');

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [dailyChallenge, setDailyChallenge] = useState(null);
  const [challengeResponse, setChallengeResponse] = useState('');
  const [challengeLoading, setChallengeLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);

  const levelRef = React.useRef(null);
  const weeklyRef = React.useRef(null);
  const skillsRef = React.useRef(null);

  const [levelVisible, setLevelVisible] = useState(false);
  const [weeklyVisible, setWeeklyVisible] = useState(false);
  const [skillsVisible, setSkillsVisible] = useState(false);

  useEffect(() => {
    const observerOpts = { threshold: 0.15 }; // Trigger when 15% visible
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (entry.target === levelRef.current) setLevelVisible(true);
          if (entry.target === weeklyRef.current) setWeeklyVisible(true);
          if (entry.target === skillsRef.current) setSkillsVisible(true);
        }
      });
    }, observerOpts);

    if (levelRef.current) observer.observe(levelRef.current);
    if (weeklyRef.current) observer.observe(weeklyRef.current);
    if (skillsRef.current) observer.observe(skillsRef.current);

    return () => observer.disconnect();
  }, []);

  // Stats Simulation values
  const [dashboardStats, setDashboardStats] = useState({
    lessonsDone: 0,
    accuracy: 75,
    timeSpent: 2
  });

  useEffect(() => {
    // Generate simulated daily mission text
    const fetchChallenge = async () => {
      try {
        const contextText = customSubjects[currentSubject]?.contextText || '';
        const challenge = await generateDailyChallenge(currentUser, currentSubject, contextText);
        setDailyChallenge(challenge);
      } catch (err) {
        console.error("Daily challenge generation failed:", err);
      }
    };

    fetchChallenge();

    // Setup speech synthesis for challenge dictation if needed
    const recognition = initSpeechToText(
      (transcript) => {
        setChallengeResponse(prev => prev + ' ' + transcript);
        setIsListening(false);
      },
      () => setIsListening(false),
      () => setIsListening(false)
    );

    // Compute active stats from localStorage history
    const storedResults = JSON.parse(localStorage.getItem('vaaniResults') || '[]');
    if (storedResults.length > 0) {
      const avg = Math.round(storedResults.reduce((acc, curr) => acc + curr.score, 0) / storedResults.length);
      setDashboardStats({
        lessonsDone: storedResults.length,
        accuracy: avg,
        timeSpent: Math.round(storedResults.length * 15 / 60) + 1 // 15 mins per lesson roughly
      });
    }

    return () => {
      stopListening();
    };
  }, [currentUser]);

  // Actions
  const handleStartChallenge = () => {
    setChallengeResult(null);
    setChallengeResponse('');
    setShowChallengeModal(true);
  };

  const handleSubmitChallenge = async () => {
    if (!challengeResponse.trim()) return alert("Please enter your response.");
    setChallengeLoading(true);

    try {
      const result = await evaluateChallengeResponse(dailyChallenge?.task, challengeResponse);
      setChallengeResult(result);
      // Award XP
      addXPPoints(100);
      
      // Save result
      const results = JSON.parse(localStorage.getItem('vaaniResults') || '[]');
      results.unshift({
        user_id: currentUser?.id,
        score: result.score,
        activity_type: 'challenge',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('vaaniResults', JSON.stringify(results));
    } catch (err) {
      console.error(err);
      alert("Failed to evaluate challenge response.");
    } finally {
      setChallengeLoading(false);
    }
  };

  const handleToggleChallengeMic = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening();
    }
  };

  const handleGenerateCustomPath = async () => {
    if (!customTitle.trim()) {
      console.warn("Title empty, alerting user.");
      return alert("Please enter a topic title.");
    }
    setGeneratingCustom(true);
    setCustomStatus("Initializing...");

    try {
      let extractedContext = "";
      
      if (customFile) {
        setCustomStatus("Reading PDF (extracting text)...");
        extractedContext = await extractTextFromPDF(customFile);
      } else if (customLink) {
        setCustomStatus("Fetching content from link...");
        extractedContext = await fetchTextFromURL(customLink);
      }
      
      console.warn("Starting generateCustomSyllabus API call...");
      setCustomStatus("AI is designing your modules...");
      const syllabus = await generateCustomSyllabus(customTitle, extractedContext);
      console.warn("API call succeeded!", { syllabusLength: syllabus?.chapters?.length });
      
      setCustomStatus("Finalizing course structure...");
      addCustomSubject(customTitle, syllabus, extractedContext);

      setShowCustomModal(false);
      setCustomTitle('');
      setCustomFile(null);
      setCustomLink('');
      switchSubject(customTitle);
      
      // Auto-navigate to study page so the user sees the generated syllabus immediately
      setActivePage('study');
      console.warn("Successfully generated and navigated to study page!");
    } catch (err) {
      console.warn("API call FAILED with error:", err.message);
      console.error(err);
      alert("Failed to generate custom syllabus. Error: " + err.message + "\nPlease take a screenshot of this error.");
    } finally {
      setGeneratingCustom(false);
    }
  };

  return (
    <div className="page active" id="page-dashboard">
      <header 
        className="dashboard-hero"
        data-subject={currentSubject === 'C++' ? 'cpp' : currentSubject.toLowerCase()}
      >
        <div className="hero-content">
          <div className="dashboard-header">
            <h1>Welcome back to <span className="text-primary dynamic-subject-name">{currentSubject}</span>!</h1>
            <p>Pick your focus area and let's crush your goals today.</p>
          </div>
          
          <div className="hero-stats-bar">
            <div className="hero-stat-card">
              <span className="stat-icon">🎯</span>
              <div className="stat-details">
                <span className="stat-label">Daily Goal</span>
                <span className="stat-value">{dashboardStats.lessonsDone > 0 ? '85%' : '0%'} Complete</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <span className="stat-icon">🏆</span>
              <div className="stat-details">
                <span className="stat-label">Next Rank</span>
                <span className="stat-value">Master II</span>
              </div>
            </div>
            <div className="hero-stat-card">
              <span className="stat-icon">✨</span>
              <div className="stat-details">
                <span className="stat-label">Total XP</span>
                <span className="stat-value">{xp.toLocaleString()} XP</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="section-header mb-6">
        <h3 className="section-title">Continue Your Learning Path</h3>
        <p className="section-subtitle">Pick up right where you left off or explore a new domain.</p>
      </div>

      <div className="subject-path-grid mb-10">
        {['English', 'Python', 'Java', 'C++'].map(sub => (
          <div 
            key={sub}
            className={`subject-card ${currentSubject === sub ? 'active-path' : ''}`} 
            data-subject={sub === 'C++' ? 'cpp' : sub.toLowerCase()}
            onClick={() => switchSubject(sub)}
          >
            <div className="card-banner-wrap">
              <div className="card-banner"></div>
            </div>
            <div className="subject-card-info">
              <h4>{sub} {sub === 'English' ? 'Master' : sub === 'Python' ? 'Mentor' : sub === 'Java' ? 'Expert' : 'Master'}</h4>
              <p>{sub === 'English' ? 'Fluency & Communication' : 'Programming & Logic'}</p>
            </div>
            <button className="path-btn">
              {currentSubject === sub ? 'Currently Learning' : 'Resume Path →'}
            </button>
          </div>
        ))}

        {/* Custom Subjects rendered dynamically */}
        {Object.keys(customSubjects).map(subKey => (
          <div 
            key={subKey}
            className={`subject-card custom-path ${currentSubject === subKey ? 'active-path' : ''}`}
            onClick={() => switchSubject(subKey)}
          >
            <div className="card-banner-wrap">
              <div className="card-banner" style={{ background: 'linear-gradient(135deg, #FF007F, #7F00FF)' }}></div>
            </div>
            <div className="subject-card-info">
              <h4>{subKey}</h4>
              <p>Custom AI Course</p>
              <button 
                className="btn-icon-xs text-danger" 
                style={{ position: 'absolute', top: '10px', right: '10px', zIndex: 10 }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete the custom course "${subKey}"?`)) {
                    deleteCustomSubject(subKey);
                  }
                }}
              >
                🗑️
              </button>
            </div>
            <button className="path-btn">
              {currentSubject === subKey ? 'Currently Learning' : 'Resume Path →'}
            </button>
          </div>
        ))}

        <div className="subject-card create-custom-card" onClick={() => setShowCustomModal(true)}>
          <div className="create-icon">➕</div>
          <div className="subject-card-info text-center mt-4">
            <h4>Create Custom Path</h4>
            <p>Upload Book or Link</p>
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card lessons">
          <div className="stat-info-overlay">
            <div className="stat-icon grad-purple">📖</div>
            <div className="stat-info">
              <p className="stat-label">Lessons Done</p>
              <h3 className="stat-value" id="stat-lessons">{dashboardStats.lessonsDone}</h3>
              <p className="stat-change positive">Updated now</p>
            </div>
          </div>
        </div>
        <div className="stat-card accuracy">
          <div className="stat-info-overlay">
            <div className="stat-icon grad-blue">🎯</div>
            <div className="stat-info">
              <p className="stat-label">Accuracy</p>
              <h3 className="stat-value" id="stat-accuracy">{dashboardStats.accuracy}%</h3>
              <p className="stat-change positive">Updated now</p>
            </div>
          </div>
        </div>
        <div className="stat-card time">
          <div className="stat-info-overlay">
            <div className="stat-icon grad-amber">⏱️</div>
            <div className="stat-info">
              <p className="stat-label">Time Spent</p>
              <h3 className="stat-value" id="stat-time">{dashboardStats.timeSpent}h</h3>
              <p className="stat-change positive">Updated now</p>
            </div>
          </div>
        </div>
        <div className="stat-card level">
          <div className="stat-info-overlay">
            <div className="stat-icon grad-indigo">✨</div>
            <div className="stat-info">
              <p className="stat-label">Current Level</p>
              <h3 className="stat-value" id="stat-level">Lvl {level}</h3>
              <p className="stat-change positive" id="stat-xp">{xp} XP Total</p>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6 level-progress-card" ref={levelRef}>
        <div className="level-header">
          <span>Level Progress</span>
          <span id="level-percentage">{Math.round(xpProgress)}%</span>
        </div>
        <div className="progress-bar-container">
          <div className="progress-bar-fill" style={{ width: levelVisible ? `${xpProgress}%` : '0%', transition: 'width 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}></div>
        </div>
      </div>

      {/* Module Live Guide Section */}
      <div className="card mt-6 grad-purple guide-card">
        <div className="guide-bg-icon">📚</div>
        <h3 className="guide-title">Module: Verbal Aptitude is Live! 🚀</h3>
        <p className="guide-text">Master the Verbal Aptitude Workbook through our integrated 3-step learning flow.</p>
        <div className="guide-steps">
          <div className="guide-step">
            <p className="guide-step-title">1. Learn</p>
            <p className="guide-step-desc">Read Ch 7-15 in Study section.</p>
          </div>
          <div className="guide-step">
            <p className="guide-step-title">2. Practice</p>
            <p className="guide-step-desc">AI generates workbook-themed passages.</p>
          </div>
          <div className="guide-step">
            <p className="guide-step-title">3. Quiz</p>
            <p className="guide-step-desc">Test yourself with Hybrid questions.</p>
          </div>
        </div>
        <button className="btn-primary guide-btn" onClick={() => setActivePage('study')}>Go to Syllabus →</button>
      </div>

      <div className="dashboard-grid mt-6">
        {/* Weekly Chart */}
        <div className="card" ref={weeklyRef}>
          <h3 className="card-title">Weekly Progress</h3>
          <div className="bar-chart">
            {[
              { day: 'Mon', h: 60 }, { day: 'Tue', h: 80 }, { day: 'Wed', h: 45 },
              { day: 'Thu', h: 90 }, { day: 'Fri', h: 70 }, { day: 'Sat', h: 55 },
              { day: 'Sun', h: 85, active: true }
            ].map((b, i) => (
              <div className="bar-group" key={b.day}>
                <div className={`bar ${b.active ? 'active-bar' : ''}`} style={{ 
                  height: weeklyVisible ? `${b.h}%` : '0%', 
                  transition: `height 1s cubic-bezier(0.34, 1.56, 0.64, 1) ${i * 0.1}s` 
                }}></div>
                <span>{b.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Levels */}
        <div className="card" ref={skillsRef}>
          <h3 className="card-title">Skill Levels</h3>
          <div className="skill-list" id="skill-list">
            <div className="skill-item">
              <div className="skill-header"><span>Reading</span><span>{dashboardStats.accuracy}%</span></div>
              <div className="skill-bar"><div className="skill-fill grad-purple-90" style={{ width: skillsVisible ? `${dashboardStats.accuracy}%` : '0%', transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.1s' }}></div></div>
            </div>
            <div className="skill-item">
              <div className="skill-header"><span>Pronunciation</span><span>{dashboardStats.accuracy - 5}%</span></div>
              <div className="skill-bar"><div className="skill-fill grad-blue-90" style={{ width: skillsVisible ? `${Math.max(0, dashboardStats.accuracy - 5)}%` : '0%', transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s' }}></div></div>
            </div>
            <div className="skill-item">
              <div className="skill-header"><span>Comprehension</span><span>{dashboardStats.accuracy + 2}%</span></div>
              <div className="skill-bar"><div className="skill-fill grad-green-90" style={{ width: skillsVisible ? `${Math.min(100, dashboardStats.accuracy + 2)}%` : '0%', transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s' }}></div></div>
            </div>
            <div className="skill-item">
              <div className="skill-header"><span>Fluency</span><span>{Math.max(40, dashboardStats.accuracy - 10)}%</span></div>
              <div className="skill-bar"><div className="skill-fill grad-amber-90" style={{ width: skillsVisible ? `${Math.max(40, dashboardStats.accuracy - 10)}%` : '0%', transition: 'width 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) 0.4s' }}></div></div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="card">
          <h3 className="card-title">Recent Activity</h3>
          <div className="activity-list">
            {dashboardStats.lessonsDone > 0 ? (
              <div className="activity-item" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                <div style={{ fontSize: '1.5rem' }}>🎯</div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>Completed Lesson Practice</p>
                  <small style={{ color: 'var(--text-muted)' }}>Score: {dashboardStats.accuracy}%</small>
                </div>
              </div>
            ) : (
              <p className="empty-state">No recent activity yet.</p>
            )}
          </div>
        </div>

        {/* Continue Learning card */}
        <div className="card">
          <h3 className="card-title">Continue Learning</h3>
          <div className="continue-card">
            <div className="continue-icon">📖</div>
            <div className="continue-info">
              <p className="continue-lesson">Chapter 5: Advanced Pronunciation</p>
              <p className="continue-sub">Study Material • 12 min read</p>
              <div className="progress-bar"><div className="progress-fill" style={{ width: '45%' }}></div></div>
              <small>45% complete</small>
            </div>
          </div>
          <button className="btn-primary w-full mt-4" onClick={() => setActivePage('study')}>Resume →</button>
        </div>

        {/* Daily Challenge */}
        <div className="card daily-challenge-card" id="daily-challenge-card">
          <h3 className="card-title">Daily Mission</h3>
          <div className="challenge-box">
            <div className="challenge-icon">✨</div>
            <p className="challenge-text" id="challenge-display-text">
              {dailyChallenge ? dailyChallenge.title : 'Loading today\'s mission...'}
            </p>
            <div className="challenge-meta">
              <span className="xp-badge">+100 XP</span>
              <span className="diff-label" id="challenge-type">Flash-Chat</span>
            </div>
            <button 
              className="btn-primary btn-sm w-full mt-4" 
              id="btn-start-challenge" 
              onClick={handleStartChallenge}
              disabled={!dailyChallenge}
            >
              Start Mission
            </button>
          </div>
        </div>

        {/* AI Coach promotion */}
        <div className="card ai-coach-dashboard-card">
          <div className="coach-card-overlay"></div>
          <div className="coach-card-content">
            <div className="coach-header">
              <div className="coach-avatar dashboard-avatar"></div>
              <div className="coach-header-info">
                <h3 className="card-title dashboard-title">AI Smart Coach</h3>
                <p className="section-subtitle">Your personalized learning mentor</p>
              </div>
            </div>
            <div className="coach-banner-img"></div>
            <p className="coach-tip">"You're doing great! Ready for a quick practice session to solidify your progress?"</p>
            <button className="btn-primary w-full mt-4" onClick={() => setIsChatOpen(true)}>Chat with AI Coach →</button>
          </div>
        </div>
      </div>

      {/* --- Modals Renderings --- */}

      {/* Custom Syllabus Creation Modal */}
      {showCustomModal && (
        <div id="custom-path-overlay" className="auth-page active" style={{ display: 'flex' }}>
          <div className="auth-card animate-in custom-path-modal">
            <div className="auth-header">
              <div className="auth-logo">✨</div>
              <h2>Create Custom Path</h2>
              <p>Generate a complete course from a book, PDF, or link.</p>
            </div>

            {!generatingCustom ? (
              <form id="custom-path-form" onSubmit={(e) => { e.preventDefault(); handleGenerateCustomPath(); }}>
                <div className="input-group">
                  <label htmlFor="custom-path-title">Topic or Book Title <span className="text-danger">*</span></label>
                  <input 
                    type="text" 
                    id="custom-path-title" 
                    placeholder="e.g. Advanced React Patterns" 
                    required 
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                  />
                </div>
                
                <div className="input-group mt-4">
                  <label htmlFor="custom-path-file">Upload Book / PDF (Optional)</label>
                  <input 
                    type="file" 
                    id="custom-path-file" 
                    accept=".pdf" 
                    className="file-input" 
                    onChange={(e) => setCustomFile(e.target.files[0])}
                  />
                </div>

                <div className="input-group mt-4">
                  <label htmlFor="custom-path-link">Web Link (Optional)</label>
                  <input 
                    type="url" 
                    id="custom-path-link" 
                    placeholder="https://example.com/article" 
                    value={customLink}
                    onChange={(e) => setCustomLink(e.target.value)}
                  />
                </div>

                <div className="modal-actions mt-6 custom-path-actions">
                  <button type="button" className="btn-outline w-full" onClick={() => setShowCustomModal(false)}>Cancel</button>
                  <button type="submit" className="btn-primary w-full">Generate Path</button>
                </div>
              </form>
            ) : (
              <div id="custom-path-loading" className="text-center py-6">
                <div className="spinner mb-4 custom-path-spinner"></div>
                <h3 id="custom-path-status">{customStatus}</h3>
                <p className="text-gray mt-2">Our AI is reading your details and building a custom syllabus. This might take a minute.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Daily Challenge Interactive Modal */}
      {showChallengeModal && (
        <div id="challenge-modal" className="modal-overlay" style={{ display: 'flex' }}>
          <div className="auth-card challenge-modal-content animate-in">
            <div className="modal-close" onClick={() => setShowChallengeModal(false)}>×</div>
            <div className="auth-header">
              <div className="auth-logo">✨</div>
              <h2 id="modal-challenge-title">{dailyChallenge?.title || 'Daily Mission'}</h2>
              <p id="modal-challenge-scenario">{dailyChallenge?.scenario || 'Scenario loading...'}</p>
            </div>

            <div className="challenge-task-box">
              <p><strong>Your Task:</strong></p>
              <p id="modal-challenge-task">{dailyChallenge?.task || 'Task loading...'}</p>
            </div>

            <div className="input-group mt-6">
              <label htmlFor="challengeResponse" className="challenge-label">Your Response</label>
              <textarea 
                id="challengeResponse" 
                className="challenge-textarea" 
                placeholder="Type or speak your response here..." 
                rows="4"
                value={challengeResponse}
                onChange={(e) => setChallengeResponse(e.target.value)}
              ></textarea>
            </div>

            <div className="challenge-actions">
              <button 
                className={`mic-btn-small ${isListening ? 'listening' : ''}`}
                id="challenge-mic" 
                onClick={handleToggleChallengeMic}
              >
                🎙️
              </button>
              <button 
                className="btn-primary w-full" 
                id="btn-submit-challenge" 
                onClick={handleSubmitChallenge}
                disabled={challengeLoading}
              >
                {challengeLoading ? 'Submitting...' : 'Submit Mission'}
              </button>
            </div>

            {challengeResult && (
              <div id="challenge-result" className="mt-6 animate-in">
                <div className="result-divider"></div>
                <div className="result-score-mini">
                  <span className="label">Evaluation Score:</span>
                  <span className="value" id="challenge-score">{challengeResult.score}%</span>
                </div>
                <p className="feedback-text" id="challenge-feedback">{challengeResult.feedback}</p>
                <div className="suggestion-box">
                  <p><strong>Try this:</strong></p>
                  <p id="challenge-suggestion">{challengeResult.suggestion}</p>
                </div>
                <button className="btn-outline w-full mt-4" onClick={() => setShowChallengeModal(false)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
