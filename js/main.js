/**
 * main.js — Application entry point
 * Wires all modules together and attaches global event handlers.
 */
import { navigate, setPageChangeCallback } from './navigation.js';
import { startQuiz, initiateQuiz, nextQuestion, prevQuestion, goToQ, selectOption, updateHistory } from './quiz.js';
import { toggleMic, newPassage, submitPractice, startPractice, initiatePractice, refreshPracticeUI } from './practice.js';
import { loadChapter, prevChapter, nextChapter, refreshSyllabusUI } from './study.js';
import { editProfile, closeProfileModal, saveProfileEdit } from './profile.js';
import { getResults, getProfile, saveResult, addXP, getXP, getLevel, getXPProgress, getChatHistory, getTopMistakes, getCurrentSubject, saveCurrentSubject, saveCustomSubject, getCustomSubjects, deleteCustomSubject } from './storage.js';
import { getFlashcards, getDueWords, updateSRS, saveWord } from './flashcards.js';
import { initAuth, loginWithGoogle, loginWithGithub, switchAuthType, loginWithEmail, signUpWithEmail, toggleEmailMode, sendOTP, verifyOTP, resetPhoneAuth, logout, updatePhonePlaceholder } from './auth.js';
import { getCurrentUser } from './state.js';

import { extractProviderDetails, saveOnboarding } from './onboarding.js';
import { generateDailyChallenge, evaluateChallengeResponse, generateRoleplayScenario, generateCustomSyllabus } from './ai_generator.js';

import { sendChatMessage, resetChatHistory, setCoachPersonality, getChatHistoryLength } from './ai_chatbot.js';
import { initSpeechToText, startListening, stopListening, speak, toggleTTS, isTTSEnabled } from './voice_engine.js';

import { loadSettings, saveSettings, refreshChatHistorySettings, clearFullChatHistory, toggleKeyVisibility } from './settings.js';

/* ── Expose to HTML onclick handlers ──────────────────────────── */
window.navigate        = navigate;
window.toggleMic       = toggleMic;
window.newPassage      = newPassage;
window.submitPractice  = submitPractice;
window.loadChapter     = loadChapter;
window.prevChapter     = prevChapter;
window.nextChapter     = nextChapter;
window.editProfile     = editProfile;
window.closeProfileModal = closeProfileModal;
window.saveProfileEdit   = saveProfileEdit;
window.refreshProfile    = refreshProfile;
window.nextQuestion    = nextQuestion;
window.prevQuestion    = prevQuestion;
window.goToQ           = goToQ;
window.initiateQuiz    = initiateQuiz;
window.initiatePractice = initiatePractice;
window.selectOption    = selectOption;

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
window.updatePhonePlaceholder = updatePhonePlaceholder;

// Challenge handlers
window.startDailyChallenge = startDailyChallenge;
window.initiateRoleplay    = initiateRoleplay;

// Chat & Flashcards
window.resetChatHistory = resetChatHistory;
window.setCoachPersonality = setCoachPersonality;
window.saveWordToFlashcards = (w, d) => {
  saveWord(w, d);
  alert(`✨ "${w}" saved to Flashcards!`);
};
window.flipCard = (el) => el.classList.toggle('flipped');
window.reviewWord = (remembered) => {
  const current = currentDueWords[currentCardIndex];
  if (current) {
    updateSRS(current.word, remembered);
    currentCardIndex++;
    showNextCard();
  }
};
window.closeChallengeModal = closeChallengeModal;
window.submitChallenge     = submitChallenge;
window.toggleChallengeMic  = toggleChallengeMic;

// AI Chatbot handlers
window.sendCoachMessage   = sendCoachMessage;
window.resetCoachChat     = resetCoachChat;
window.handleChatKeydown  = handleChatKeydown;
window.toggleChatbot      = toggleChatbot;
window.toggleCoachMic      = toggleCoachMic;
window.toggleCoachVoice    = toggleCoachVoice;
window.changeCoachPersonality = changeCoachPersonality;
window.handleImageSelect   = handleImageSelect;
window.clearImageAttachment = clearImageAttachment;
window.speakMessage        = speakMessage;
window.applySettings       = saveSettings;
window.clearFullChatHistory = clearFullChatHistory;
window.toggleKeyVisibility = toggleKeyVisibility;
window.switchSubject = (subject) => {
  saveCurrentSubject(subject);
  refreshSubjectUI();
  refreshSyllabusUI();
  refreshPracticeUI();
  resetCoachChat();
  addXP(10);
  loadChapter(0); // Reset to first chapter of new subject

  // Update active class in subject cards
  document.querySelectorAll('.subject-card').forEach(card => {
    card.classList.toggle('active', card.dataset.subject === subject);
  });
};

/* ── Custom Path Generation ────────────────────────────────────── */
window.openCustomPathModal = () => {
  const modal = document.getElementById('custom-path-overlay');
  if (modal) {
    modal.classList.remove('hidden');
    modal.classList.add('active');
  }
};

window.closeCustomPathModal = () => {
  const modal = document.getElementById('custom-path-overlay');
  if (modal) {
    modal.classList.add('hidden');
    modal.classList.remove('active');
  }
};

window.generateCustomPath = async () => {
  const titleInput = document.getElementById('custom-path-title').value.trim();
  const fileInput = document.getElementById('custom-path-file').files[0];
  const linkInput = document.getElementById('custom-path-link').value.trim();

  if (!titleInput) {
    alert("Please provide at least a Topic or Book Title.");
    return;
  }

  const formEl = document.getElementById('custom-path-form');
  const loadingEl = document.getElementById('custom-path-loading');
  
  formEl.classList.add('hidden');
  loadingEl.classList.remove('hidden');

  try {
    // Generate the syllabus using AI
    const customData = await generateCustomSyllabus(titleInput);
    
    // Save to local storage
    const subjectKey = titleInput;
    saveCustomSubject(subjectKey, customData);
    
    // Add new card to the UI dynamically
    const grid = document.querySelector('.subject-path-grid');
    const newCardHTML = `
      <div class="subject-card" data-subject="${subjectKey}" onclick="switchSubject('${subjectKey}')">
        <div class="card-banner" style="background: linear-gradient(135deg, var(--primary), var(--accent))"></div>
        <div class="subject-card-info">
          <h4>${subjectKey}</h4>
          <p>Custom Learning Path</p>
        </div>
        <button class="path-btn">Resume Path →</button>
      </div>
    `;
    
    // Insert before the 'Create Custom Path' card
    const createCard = document.querySelector('.create-custom-card');
    if (grid && createCard) {
      createCard.insertAdjacentHTML('beforebegin', newCardHTML);
    }
    
    closeCustomPathModal();
    window.switchSubject(subjectKey);
    navigate('syllabus');
    addXP(100); // Reward for creating a path
    
  } catch (err) {
    alert("Failed to generate path: " + err.message);
    formEl.classList.remove('hidden');
    loadingEl.classList.add('hidden');
  }
};

window.deleteCustomPath = (event, subjectKey) => {
  event.stopPropagation(); // Prevent card from being clicked
  
  if (confirm(`Are you sure you want to permanently delete the custom path for "${subjectKey}"?`)) {
    deleteCustomSubject(subjectKey);
    
    // If the deleted path was the active one, switch to default English
    if (getCurrentSubject() === subjectKey) {
      window.switchSubject('English');
    } else {
      refreshDashboard(); // Just refresh the dashboard to remove the card
    }
  }
};

function formatSubjectName(subject) {
  if (!subject) return '';
  const map = {
    'cpp': 'C++',
    'python': 'Python',
    'java': 'Java',
    'english': 'English'
  };
  return map[subject.toLowerCase()] || subject.charAt(0).toUpperCase() + subject.slice(1);
}

export function refreshSubjectUI() {
  const subject = getCurrentSubject() || 'english';
  const formattedSubject = formatSubjectName(subject);
  
  const titleEls = document.querySelectorAll('.dynamic-subject-name');
  titleEls.forEach(el => el.textContent = formattedSubject);
  
  // Update dashboard specific elements
  const dashHeading = document.querySelector('.dashboard-header h1');
  if (dashHeading) dashHeading.innerHTML = `Welcome back to <span class="text-primary">${formattedSubject}</span>!`;
  
  // Update Syllabus header
  const sylHeader = document.querySelector('#page-syllabus h2');
  if (sylHeader) sylHeader.textContent = `${formattedSubject} Curriculum`;

  // Update Hero Background
  const hero = document.querySelector('.dashboard-hero');
  if (hero) {
    const customSubjects = getCustomSubjects();
    if (customSubjects && customSubjects[subject]) {
      // Generate a dynamic, premium background based on the custom topic
      const prompt = encodeURIComponent(`aesthetic abstract background representing ${subject}, 3d render, glowing, premium tech, dark mode`);
      hero.style.backgroundImage = `url('https://image.pollinations.ai/prompt/${prompt}?width=1200&height=400&nologo=true')`;
    } else {
      const bannerPath = `assets/img/${subject.toLowerCase()}_banner.png`;
      hero.style.backgroundImage = `url('${bannerPath}')`;
    }
  }
}

/* ── Page-change hook ─────────────────────────────────────────── */
setPageChangeCallback(page => {
  if (page === 'quiz') startQuiz();
  if (page === 'practice') startPractice();
  if (page === 'dashboard') refreshDashboard();
  if (page === 'results') refreshResults();
  if (page === 'profile') refreshProfile();
  if (page === 'settings') refreshChatHistorySettings();
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

  // Update Personal Info
  const user = getCurrentUser();
  if (user) {
    const emailEl = document.getElementById('infoEmail');
    if (emailEl) emailEl.textContent = user.email;

    const profile = await getProfile(user.id);
    if (profile) {
      if (document.getElementById('infoName')) document.getElementById('infoName').textContent = profile.full_name || 'User';
      if (document.getElementById('infoOccupation')) document.getElementById('infoOccupation').textContent = profile.occupation || 'Not set';
      if (document.getElementById('infoAge')) document.getElementById('infoAge').textContent = profile.age || 'Not set';
      if (document.getElementById('infoLang')) document.getElementById('infoLang').textContent = profile.native_language || 'Not set';
      if (document.getElementById('infoGoal')) document.getElementById('infoGoal').textContent = profile.learning_goal || 'Not set';
      
      // Also update the sidebar/header name if it changed
      const sideName = document.getElementById('profileName');
      if (sideName) sideName.textContent = profile.full_name || 'User';
    }
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
  const user = getCurrentUser();
  if (user) {
    const profile = await getProfile(user.id);
    if (profile) {
      const el   = document.getElementById('profileName');
      const info = document.getElementById('infoName');
      if (el)   el.textContent   = profile.full_name || 'User';
      if (info) info.textContent = profile.full_name || 'User';
    }
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

  // Level & XP
  const level = getLevel();
  const xp = getXP();
  const progress = getXPProgress();

  document.getElementById('stat-level').textContent = `Lvl ${level}`;
  document.getElementById('stat-xp').textContent    = `${xp} XP Total`;
  document.getElementById('level-percentage').textContent = `${Math.floor(progress)}%`;
  document.getElementById('level-progress-fill').style.width = `${progress}%`;

  // Recent Activity
  updateRecentActivity(results.slice(0, 4));

  // Continue Learning
  updateContinueLearning();

  // Load Daily Challenge
  loadTodayChallenge();
  
  // Load Custom Subjects into Dashboard
  loadCustomSubjectsToDashboard();
}

function loadCustomSubjectsToDashboard() {
  const customSubjects = getCustomSubjects();
  const keys = Object.keys(customSubjects);
  
  if (keys.length === 0) return;
  
  const grid = document.querySelector('.subject-path-grid');
  const createCard = document.querySelector('.create-custom-card');
  
  if (!grid || !createCard) return;
  
  // Remove existing custom cards to avoid duplicates on refresh
  document.querySelectorAll('.subject-card.custom-injected').forEach(c => c.remove());
  
  const currentSub = getCurrentSubject() || 'english';
  
  keys.forEach(subjectKey => {
    const isActive = subjectKey === currentSub ? 'active' : '';
    const promptCard = encodeURIComponent(`aesthetic abstract background representing ${subjectKey}, 3d render, glowing, premium tech, dark mode`);
    const cardBgUrl = `https://image.pollinations.ai/prompt/${promptCard}?width=400&height=200&nologo=true`;
    
    const newCardHTML = `
      <div class="subject-card custom-injected ${isActive}" data-subject="${subjectKey}" onclick="switchSubject('${subjectKey}')">
        <div class="card-banner" style="background: url('${cardBgUrl}') center/cover no-repeat; box-shadow: inset 0 0 40px rgba(0,0,0,0.5);"></div>
        <button class="delete-path-btn" onclick="deleteCustomPath(event, '${subjectKey}')" title="Delete Path">✕</button>
        <div class="subject-card-info">
          <h4>${subjectKey}</h4>
          <p>Custom Learning Path</p>
        </div>
        <button class="path-btn">Resume Path →</button>
      </div>
    `;
    createCard.insertAdjacentHTML('beforebegin', newCardHTML);
  });
  
  // Attach hover listeners to the newly injected cards
  document.querySelectorAll('.subject-card.custom-injected').forEach(card => {
    card.addEventListener('mouseenter', () => {
      const s = card.dataset.subject;
      const hero = document.querySelector('.dashboard-hero');
      if (hero) {
        const promptHero = encodeURIComponent(`aesthetic abstract background representing ${s}, 3d render, glowing, premium tech, dark mode`);
        hero.style.backgroundImage = `url('https://image.pollinations.ai/prompt/${promptHero}?width=1200&height=400&nologo=true')`;
      }
    });
    card.addEventListener('mouseleave', () => {
      refreshSubjectUI(); // Restore active subject's background
    });
  });
}

/* ── Daily Challenge Logic ────────────────────────────────────── */
let currentChallenge = null;
let challengeRecognition = null;
let isChallengeRecording = false;

async function loadTodayChallenge() {
  const displayEl = document.getElementById('challenge-display-text');
  if (!displayEl) return;

  // Check if we already have a challenge for today in local storage
  const today = new Date().toDateString();
  const saved = localStorage.getItem('daily_challenge_data');
  const savedDate = localStorage.getItem('daily_challenge_date');

  if (saved && savedDate === today) {
    currentChallenge = JSON.parse(saved);
  } else {
    displayEl.textContent = "✨ Generating mission...";
    currentChallenge = await generateDailyChallenge();
    localStorage.setItem('daily_challenge_data', JSON.stringify(currentChallenge));
    localStorage.setItem('daily_challenge_date', today);
  }

  displayEl.textContent = currentChallenge.scenario.substring(0, 80) + "...";
  document.getElementById('challenge-type').textContent = currentChallenge.title;
}

export function startDailyChallenge() {
  if (!currentChallenge) return;
  
  const modal = document.getElementById('challenge-modal');
  modal.classList.remove('hidden');
  
  document.getElementById('modal-challenge-title').textContent = currentChallenge.title;
  document.getElementById('modal-challenge-scenario').textContent = currentChallenge.scenario;
  document.getElementById('modal-challenge-task').textContent = currentChallenge.task;
  
  // Reset previous state
  document.getElementById('challengeResponse').value = '';
  document.getElementById('challenge-result').classList.add('hidden');
  document.getElementById('btn-submit-challenge').disabled = false;
  document.getElementById('btn-submit-challenge').textContent = 'Submit Mission';
}

export function closeChallengeModal() {
  document.getElementById('challenge-modal').classList.add('hidden');
  if (isChallengeRecording) toggleChallengeMic();
}

export async function submitChallenge() {
  const response = document.getElementById('challengeResponse').value;
  if (!response || response.length < 5) return alert("Please provide a more detailed response.");

  const btn = document.getElementById('btn-submit-challenge');
  btn.disabled = true;
  btn.textContent = 'Evaluating...';

  const result = await evaluateChallengeResponse(currentChallenge.task, response);
  
  // Show result
  document.getElementById('challenge-result').classList.remove('hidden');
  document.getElementById('challenge-score').textContent = result.score + '%';
  document.getElementById('challenge-feedback').textContent = result.feedback;
  document.getElementById('challenge-suggestion').textContent = result.suggestion;
  
  btn.textContent = 'Mission Complete!';
  
  // Save result
  saveResult(result.score, 'challenge');
}

export function toggleChallengeMic() {
  const micBtn = document.getElementById('challenge-mic');
  const textarea = document.getElementById('challengeResponse');

  if (!isChallengeRecording) {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      return alert("Speech recognition not supported in this browser.");
    }
    
    isChallengeRecording = true;
    micBtn.classList.add('active');
    
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    challengeRecognition = new SR();
    challengeRecognition.continuous = true;
    challengeRecognition.interimResults = true;
    
    challengeRecognition.onresult = (event) => {
      let transcript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcript += event.results[i][0].transcript;
      }
      textarea.value = transcript;
    };
    
    challengeRecognition.onerror = () => toggleChallengeMic();
    challengeRecognition.start();
  } else {
    isChallengeRecording = false;
    micBtn.classList.remove('active');
    if (challengeRecognition) {
      challengeRecognition.stop();
      challengeRecognition = null;
    }
  }
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

/* ── AI Chatbot Logic ─────────────────────────────────────────── */
let isChatbotOpen = false;

export function toggleChatbot() {
  const coachCard = document.getElementById('ai-coach-card');
  if (!coachCard) return;
  
  isChatbotOpen = !isChatbotOpen;
  coachCard.classList.toggle('chat-open', isChatbotOpen);
  
  if (isChatbotOpen) {
    // Focus input
    setTimeout(() => {
      const inp = document.getElementById('coach-chat-input');
      if (inp) inp.focus();
    }, 300);
  }
}

export function handleChatKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendCoachMessage();
  }
}

export async function sendCoachMessage() {
  const input   = document.getElementById('coach-chat-input');
  const feed    = document.getElementById('coach-chat-feed');
  const sendBtn = document.getElementById('coach-send-btn');
  if (!input || !feed) return;

  const text = input.value.trim();
  const imageData = currentAttachedImage;

  if (!text && !imageData) return;

  // Clear input & disable
  input.value = '';
  clearImageAttachment();
  input.disabled = true;
  sendBtn.disabled = true;

  // Append user bubble (show image thumbnail if present)
  appendChatBubble(feed, text, 'user', '', imageData);

  // Show typing indicator
  const typingId = 'typing-' + Date.now();
  feed.insertAdjacentHTML('beforeend', `
    <div class="chat-bubble coach-bubble typing-indicator" id="${typingId}">
      <span class="ai-source-badge">✨ AI</span>
      <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>
  `);
  feed.scrollTop = feed.scrollHeight;

  try {
    const { text: reply, source } = await sendChatMessage(text, imageData);
    // Remove typing indicator
    document.getElementById(typingId)?.remove();
    // Append AI bubble with source badge
    appendChatBubble(feed, reply, 'coach', source);
    // Voice Output
    speak(reply);
  } catch (err) {
    document.getElementById(typingId)?.remove();
    appendChatBubble(feed, '⚠️ Could not get a response. Please check your API keys.', 'coach', 'Error');
  }

  input.disabled = false;
  sendBtn.disabled = false;
  input.focus();
  feed.scrollTop = feed.scrollHeight;
}

export function resetCoachChat() {
  const feed = document.getElementById('coach-chat-feed');
  if (feed) feed.innerHTML = getWelcomeBubble();
  resetChatHistory();
}

let isCoachMicActive = false;
let chatRecognition = null;

export function toggleCoachMic() {
  const micBtn = document.getElementById('coach-mic-btn');
  const input = document.getElementById('coach-chat-input');

  if (!isCoachMicActive) {
    isCoachMicActive = true;
    micBtn.classList.add('recording');
    
    if (!chatRecognition) {
      chatRecognition = initSpeechToText(
        (text) => { input.value = text; },
        () => { toggleCoachMic(); },
        () => { toggleCoachMic(); }
      );
    }
    startListening();
  } else {
    isCoachMicActive = false;
    micBtn.classList.remove('recording');
    stopListening();
  }
}

export function toggleCoachVoice() {
  const btn = document.getElementById('coach-tts-toggle');
  const enabled = !isTTSEnabled();
  toggleTTS(enabled);
  btn.classList.toggle('active', enabled);
  btn.textContent = enabled ? '🔊' : '🔇';
}

export function changeCoachPersonality(p) {
  setCoachPersonality(p);
  // Optional: show a small toast or just reset chat to apply immediately if empty
  if (getChatHistoryLength() === 0) {
    resetCoachChat();
  }
}

function appendChatBubble(feed, text, type, source = '', imageData = null) {
  const isCoach = type === 'coach';
  const badge   = isCoach ? `<span class="ai-source-badge source-vaaniai">✨ VaaniAI Coach</span>` : '';
  
  // Per-message speaker button for AI
  const speakBtn = isCoach ? `<button class="btn-speak-msg" onclick="speakMessage(this.parentElement.querySelector('.bubble-text').innerText)" title="Speak Message">🔊</button>` : '';

  const imageTag = imageData ? `<div class="chat-image-attachment"><img src="data:image/jpeg;base64,${imageData}" /></div>` : '';

  // Convert newlines to <br> and markdown bold **text** to <strong>
  const html = text
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  feed.insertAdjacentHTML('beforeend', `
    <div class="chat-bubble ${isCoach ? 'coach-bubble' : 'user-bubble'} animate-in">
      ${isCoach ? badge : ''}
      ${speakBtn}
      ${imageTag}
      <div class="bubble-text">${html}</div>
    </div>
  `);
  feed.scrollTop = feed.scrollHeight;
}

let currentAttachedImage = null;

export function handleImageSelect(event) {
  const file = event.target.files[0];
  if (!file) return;

  if (file.size > 4 * 1024 * 1024) {
    alert("Image is too large (max 4MB)");
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    const base64 = e.target.result.split(',')[1];
    currentAttachedImage = base64;
    
    // Show preview
    document.getElementById('coach-image-preview').classList.remove('hidden');
    document.getElementById('coach-preview-img').src = e.target.result;
  };
  reader.readAsDataURL(file);
}

export function clearImageAttachment() {
  currentAttachedImage = null;
  document.getElementById('coach-file-input').value = '';
  document.getElementById('coach-image-preview').classList.add('hidden');
}

export function speakMessage(text) {
  speak(text);
}

function getSourceIcon(source) {
  if (source === 'Gemini') return '🔷';
  if (source === 'OpenAI') return '🟢';
  return '⚠️';
}

function getWelcomeBubble() {
  return `
    <div class="chat-bubble coach-bubble animate-in">
      <span class="ai-source-badge">✨ VaaniAI Coach</span>
      <div class="bubble-text">Hello! I'm your <strong>VaaniAI Smart Coach</strong>. Ask me anything — grammar, vocabulary, practice tips, or any question you have! 🚀</div>
    </div>
  `;
}

/* ── Init ─────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  // Load user settings
  loadSettings();

  // Hide topnav initially while splash/auth is checking
  document.querySelector('.topnav').classList.add('hidden');
  
  // Initialize Auth (handles Splash Screen and routing)
  try {
    initAuth();
  } catch (e) {
    console.error("Critical error during Auth Init:", e);
    // Emergency: Hide splash if it's stuck
    const splash = document.getElementById('splash');
    if (splash) splash.classList.remove('active');
  }

  // Load existing chat history if any
  const history = getChatHistory();
  if (history && history.length > 0) {
    const feed = document.getElementById('coach-chat-feed');
    if (feed) {
      feed.innerHTML = ''; // Clear welcome
      history.forEach(m => appendChatBubble(feed, m.content, m.role === 'assistant' ? 'coach' : 'user'));
    }
  }

  // Load Custom Subjects into Dashboard on initial load
  loadCustomSubjectsToDashboard();

  // Refresh Subject UI (Syllabus, Dashboard Headings)
  refreshSubjectUI();
  refreshSyllabusUI();
  refreshPracticeUI();
  
  // Set initial active state in subject cards
  const currentSub = getCurrentSubject() || 'english';
  document.querySelectorAll('.subject-card').forEach(card => {
    card.classList.toggle('active', card.dataset.subject === currentSub);
    
    // Hover preview for hero background
    card.addEventListener('mouseenter', () => {
      const s = card.dataset.subject;
      const hero = document.querySelector('.dashboard-hero');
      if (hero) hero.style.backgroundImage = `url('assets/img/${s}_banner.png')`;
    });
    card.addEventListener('mouseleave', () => {
      refreshSubjectUI(); // Restore active subject's background
    });
  });
});

/* ── Flashcard Logic ─────────────────────────────────────────── */
let currentDueWords = [];
let currentCardIndex = 0;

function renderFlashcards() {
  currentDueWords = getDueWords();
  currentCardIndex = 0;
  showNextCard();
}

function showNextCard() {
  const stack = document.getElementById('flashcard-stack');
  const controls = document.getElementById('flashcard-controls');
  if (!stack) return;

  if (currentCardIndex >= currentDueWords.length) {
    stack.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">✅</div>
        <h3>All caught up!</h3>
        <p>No words due for review right now. Come back later!</p>
      </div>`;
    if (controls) controls.classList.add('hidden');
    return;
  }

  const card = currentDueWords[currentCardIndex];
  stack.innerHTML = `
    <div class="flashcard" onclick="flipCard(this)">
      <div class="flashcard-front">
        <div class="flashcard-word">${card.word}</div>
        <div class="flashcard-hint">Click to flip 🔄</div>
      </div>
      <div class="flashcard-back">
        <div class="flashcard-definition">${card.definition}</div>
        <div class="flashcard-hint">Click to flip 🔄</div>
      </div>
    </div>`;
  if (controls) controls.classList.remove('hidden');
}

// Hook into navigation
setPageChangeCallback((page) => {
  if (page === 'dashboard') refreshDashboard();
  if (page === 'flashcards') renderFlashcards();
  if (page === 'quiz') updateHistory();
  if (page === 'study' || page === 'syllabus') highlightWeaknesses();
  
  // Update scroll button visibility for the new page
  if (window.updateScrollBtns) {
    setTimeout(window.updateScrollBtns, 100);
    setTimeout(window.updateScrollBtns, 500); // Second check after content renders
  }
});

function highlightWeaknesses() {
  const topMistakes = getTopMistakes();
  document.querySelectorAll('.chapter-item').forEach(item => {
    const text = item.textContent.toLowerCase();
    item.classList.remove('weakness-highlight');
    if (topMistakes.some(m => text.includes(m.toLowerCase()))) {
      item.classList.add('weakness-highlight');
    }
  });
}

/* ── Roleplay Logic ─────────────────────────────────────────── */
async function initiateRoleplay() {
  const btn = document.querySelector('#roleplayCard button');
  if (!btn) return;
  
  const originalText = btn.textContent;
  btn.textContent = '✨ Generating...';
  btn.disabled = true;

  try {
    const mission = await generateRoleplayScenario();
    
    // Open Chatbot
    const coach = document.getElementById('aiCoachFloating');
    if (coach) coach.classList.add('chat-open');
    
    // Reset Chat for the mission
    resetChatHistory();
    const feed = document.getElementById('coach-chat-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="chat-bubble coach-bubble">
          <div class="bubble-text">
            <strong>MISSION: ${mission.scenario}</strong><br/>
            Target Character: ${mission.ai_character}<br/>
            Goal: ${mission.goal}<br/><br/>
            <em>${mission.first_message}</em>
          </div>
        </div>
      `;
    }
    
  } catch (err) {
    console.error("Roleplay Start Failed:", err);
    alert("Mission generation failed. Please check your API keys!");
  } finally {
    btn.textContent = originalText;
    btn.disabled = false;
  }
}
