/**
 * main.js — Application entry point
 * Wires all modules together and attaches global event handlers.
 */
import { navigate, setPageChangeCallback } from './navigation.js';
import { startQuiz, nextQuestion, prevQuestion, goToQ } from './quiz.js';
import { toggleMic, newPassage, submitPractice } from './practice.js';
import { loadChapter } from './study.js';
import { editProfile } from './profile.js';
import { getSavedName, getResults } from './storage.js';
import { initAuth, loginWithGoogle, loginWithGithub, switchAuthType, loginWithEmail, signUpWithEmail, toggleEmailMode, sendOTP, verifyOTP, resetPhoneAuth, logout, getCurrentUser } from './auth.js';

import { extractProviderDetails, saveOnboarding } from './onboarding.js';

/* ── Expose to HTML onclick handlers ──────────────────────────── */
window.navigate        = navigate;
window.toggleMic       = toggleMic;
window.newPassage      = newPassage;
window.submitPractice  = submitPractice;
window.loadChapter     = loadChapter;
window.editProfile     = editProfile;
window.nextQuestion    = nextQuestion;
window.prevQuestion    = prevQuestion;
window.goToQ           = goToQ;
window.selectOption    = () => {};   // handled internally by quiz.js

// Onboarding
window.extractProviderDetails = extractProviderDetails;
window.saveOnboarding         = saveOnboarding;

// Auth handlers
window.loginWithGoogle   = loginWithGoogle;
window.loginWithGithub   = loginWithGithub;
window.switchAuthType    = switchAuthType;
window.loginWithEmail    = loginWithEmail;
window.signUpWithEmail   = signUpWithEmail;
window.toggleEmailMode   = toggleEmailMode;
window.sendOTP           = sendOTP;
window.verifyOTP         = verifyOTP;
window.resetPhoneAuth    = resetPhoneAuth;
window.logout            = logout;

/* ── Page-change hook ─────────────────────────────────────────── */
setPageChangeCallback(page => {
  if (page === 'quiz') startQuiz();
  if (page === 'dashboard') refreshDashboard();
  if (page === 'results') refreshResults();
  if (page === 'profile') refreshProfile();
});

export async function refreshProfile() {
  const results = await getResults();
  const practice = results.filter(r => r.activity_type === 'practice');
  const streak = calculateStreak(results);
  
  const avg = practice.length > 0 
    ? Math.round(practice.reduce((a, b) => a + b.score, 0) / practice.length)
    : 0;

  // Update Profile Stats
  const lessonsEl = document.getElementById('profile-lessons');
  const avgEl = document.getElementById('profile-avg');
  const streakEl = document.getElementById('profile-streak');

  if (lessonsEl) lessonsEl.textContent = practice.length;
  if (avgEl) avgEl.textContent = avg + '%';
  if (streakEl) streakEl.textContent = streak;

  // Update Personal Info (from Supabase if available)
  const user = getCurrentUser();
  if (user) {
    const emailEl = document.getElementById('infoEmail');
    if (emailEl) emailEl.textContent = user.email;
  }
}

export async function refreshResults() {
  const results = await getResults();
  const practice = results.filter(r => r.activity_type === 'practice');
  const quiz = results.filter(r => r.activity_type === 'quiz');

  // Big Score
  const bigScoreEl = document.querySelector('.big-score');
  if (practice.length > 0) {
    const avg = Math.round(practice.reduce((a, b) => a + b.score, 0) / practice.length);
    if (bigScoreEl) bigScoreEl.innerHTML = `${avg}<span>%</span>`;
  }

  // Best Sessions
  const bestList = document.querySelector('.best-list');
  if (bestList) {
    const best = [...results].sort((a, b) => b.score - a.score).slice(0, 3);
    if (best.length === 0) {
      bestList.innerHTML = '<p class="text-sm text-muted">No sessions yet.</p>';
    } else {
      bestList.innerHTML = best.map(r => `
        <div class="best-item">
          <div>
            <p>${r.activity_type === 'practice' ? 'Practice' : 'Quiz'}</p>
            <small>${new Date(r.created_at).toLocaleDateString()}</small>
          </div>
          <span class="score-pill ${r.score >= 80 ? 'good' : 'ok'}">${r.score}%</span>
        </div>
      `).join('');
    }
  }
}

/* ── Load saved data ──────────────────────────────────────────── */

export async function refreshDashboard() {
  // Update Profile Name
  const name = getSavedName();
  if (name) {
    const el   = document.getElementById('profileName');
    const info = document.getElementById('infoName');
    if (el)   el.textContent   = name;
    if (info) info.textContent = name;
  }

  // Fetch results from DB or local
  const results = await getResults();
  
  const practiceResults = results.filter(r => r.activity_type === 'practice');
  const quizResults     = results.filter(r => r.activity_type === 'quiz');

  // Lessons Done
  document.getElementById('stat-lessons').textContent = practiceResults.length;

  // Accuracy (Avg Practice Score)
  if (practiceResults.length > 0) {
    const sum = practiceResults.reduce((acc, curr) => acc + curr.score, 0);
    const avg = Math.round(sum / practiceResults.length);
    document.getElementById('stat-accuracy').textContent = avg + '%';
    
    // Update Skill Levels (Simulated breakdown based on overall accuracy)
    updateSkillUI('reading', Math.min(100, avg - 5 + Math.random() * 10));
    updateSkillUI('pronunciation', Math.min(100, avg - 2 + Math.random() * 10));
    updateSkillUI('comprehension', Math.min(100, avg + 2 + Math.random() * 10));
    updateSkillUI('fluency', Math.min(100, avg - 10 + Math.random() * 10));
  } else {
    document.getElementById('stat-accuracy').textContent = '0%';
  }

  // Quiz Score (Latest or Highest)
  if (quizResults.length > 0) {
    const max = Math.max(...quizResults.map(r => r.score));
    document.getElementById('stat-quiz').textContent = max + '%';
  } else {
    document.getElementById('stat-quiz').textContent = '0%';
  }

  // Streak Calculation
  const streak = calculateStreak(results);
  const streakBadge = document.getElementById('streak-badge');
  if (streakBadge) {
    streakBadge.textContent = `🔥 ${streak} Day Streak`;
  }

  // Recent Activity
  updateRecentActivity(results.slice(0, 4));

  // Continue Learning
  updateContinueLearning();
}

function updateContinueLearning() {
  const lastIdx = parseInt(localStorage.getItem('last_chapter_index') || '0');
  const lastTitle = localStorage.getItem('last_chapter_title') || 'Chapter 1: Speed Reading Basics';
  
  const titleEl = document.querySelector('.continue-lesson');
  const progFill = document.querySelector('.continue-card .progress-fill');
  const progText = document.querySelector('.continue-card small');
  
  if (titleEl) titleEl.textContent = lastTitle;
  
  const progress = Math.round(((lastIdx + 1) / 6) * 100);
  if (progFill) progFill.style.width = progress + '%';
  if (progText) progText.textContent = progress + '% complete';
}

function updateSkillUI(type, value) {
  const rounded = Math.round(value);
  const valEl = document.getElementById(`skill-val-${type}`);
  const barEl = document.getElementById(`skill-bar-${type}`);
  if (valEl) valEl.textContent = rounded + '%';
  if (barEl) barEl.style.width = rounded + '%';
}

function calculateStreak(results) {
  if (!results.length) return 0;
  
  // Sort by date descending
  const dates = results
    .map(r => new Date(r.created_at).toDateString())
    .filter((v, i, a) => a.indexOf(v) === i); // Unique dates

  let streak = 0;
  let today = new Date();
  let checkDate = new Date(today.toDateString());

  for (let i = 0; i < dates.length; i++) {
    const d = new Date(dates[i]);
    const diff = Math.floor((checkDate - d) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (diff === 1 && i === 0) {
      // User hasn't practiced today yet, but did yesterday
      checkDate.setDate(checkDate.getDate() - 1);
      i--; // re-check this date
    } else {
      break;
    }
  }
  return streak;
}

function updateRecentActivity(recent) {
  const list = document.getElementById('activity-list');
  if (!list) return;

  if (recent.length === 0) {
    list.innerHTML = `<p class="empty-state">No recent activity yet.</p>`;
    return;
  }

  list.innerHTML = recent.map(r => {
    const date = new Date(r.created_at);
    const now = new Date();
    const diffMin = Math.floor((now - date) / 60000);
    let timeStr = diffMin < 60 ? `${diffMin}m ago` : diffMin < 1440 ? `${Math.floor(diffMin/60)}h ago` : `${Math.floor(diffMin/1440)}d ago`;
    if (diffMin < 1) timeStr = 'Just now';

    const icon = r.activity_type === 'practice' ? '🎙️' : r.activity_type === 'quiz' ? '🧠' : '📖';
    const title = r.activity_type === 'practice' ? 'Practice Session' : r.activity_type === 'quiz' ? 'Quiz Completed' : 'Study Material';
    
    return `
      <div class="activity-item">
        <span class="act-icon">${icon}</span>
        <div>
          <p>${title}</p>
          <small>Scored ${r.score}% ${r.activity_type === 'practice' ? 'accuracy' : ''}</small>
        </div>
        <span class="act-time">${timeStr}</span>
      </div>
    `;
  }).join('');
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Hide topnav initially while splash/auth is checking
  document.querySelector('.topnav').classList.add('hidden');
  
  // Initialize Auth (handles Splash Screen and routing)
  initAuth();
});
