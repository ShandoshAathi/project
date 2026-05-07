/**
 * settings.js — User Preferences Management
 */
import { changeCoachPersonality, toggleCoachVoice } from './main.js';
import { isTTSEnabled } from './voice_engine.js';
import { getChatHistory, clearChatHistory } from './storage.js';

// Default settings
const DEFAULT_SETTINGS = {
  theme: 'light',
  fontSize: 'medium',
  aiVoice: true,
  aiPersonality: 'Friendly',
  groqKey: '',
  geminiKey: '',
  openaiKey: ''
};

export function loadSettings() {
  const saved = localStorage.getItem('vaaniai_settings');
  let settings = DEFAULT_SETTINGS;
  
  if (saved) {
    try {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      console.error("Failed to parse settings:", e);
      // Fallback to defaults
    }
  }
  
  // Set UI elements to match loaded settings
  const themeSelect = document.getElementById('setting-theme');
  const fontSelect = document.getElementById('setting-font-size');
  const voiceToggle = document.getElementById('setting-ai-voice');
  const personalitySelect = document.getElementById('setting-ai-personality');
  const groqInput = document.getElementById('setting-groq-key');
  const geminiInput = document.getElementById('setting-gemini-key');
  const openaiInput = document.getElementById('setting-openai-key');
  
  if (themeSelect) themeSelect.value = settings.theme;
  if (fontSelect) fontSelect.value = settings.fontSize;
  if (voiceToggle) voiceToggle.checked = settings.aiVoice;
  if (personalitySelect) personalitySelect.value = settings.aiPersonality;
  if (groqInput) groqInput.value = settings.groqKey || '';
  if (geminiInput) geminiInput.value = settings.geminiKey || '';
  if (openaiInput) openaiInput.value = settings.openaiKey || '';
  
  // Apply globally
  applySettingsLogic(settings, false);

  // Load history preview
  refreshChatHistorySettings();
}

export function saveSettings() {
  const settings = {
    theme: document.getElementById('setting-theme')?.value || DEFAULT_SETTINGS.theme,
    fontSize: document.getElementById('setting-font-size')?.value || DEFAULT_SETTINGS.fontSize,
    aiVoice: document.getElementById('setting-ai-voice')?.checked ?? DEFAULT_SETTINGS.aiVoice,
    aiPersonality: document.getElementById('setting-ai-personality')?.value || DEFAULT_SETTINGS.aiPersonality,
    groqKey: document.getElementById('setting-groq-key')?.value || '',
    geminiKey: document.getElementById('setting-gemini-key')?.value || '',
    openaiKey: document.getElementById('setting-openai-key')?.value || ''
  };
  
  localStorage.setItem('vaaniai_settings', JSON.stringify(settings));
  applySettingsLogic(settings, true);
}

function applySettingsLogic(settings, fromUIChange = false) {
  // Apply Theme
  if (settings.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  
  // Apply Font Size
  document.documentElement.setAttribute('data-font-size', settings.fontSize);
  
  // Apply AI Personality
  if (fromUIChange) {
    changeCoachPersonality(settings.aiPersonality);
  } else {
    // Just sync the UI select in the chatbot if we are loading
    const coachSelect = document.getElementById('coach-personality');
    if (coachSelect) coachSelect.value = settings.aiPersonality;
  }
  
  // Apply AI Voice
  const currentVoiceState = isTTSEnabled();
  if (currentVoiceState !== settings.aiVoice) {
    toggleCoachVoice();
  }
}

export function refreshChatHistorySettings() {
  const history = getChatHistory();
  const listEl = document.getElementById('settings-chat-history');
  if (!listEl) return;

  if (history.length === 0) {
    listEl.innerHTML = '<p class="empty-state">No chat history found.</p>';
    return;
  }

  // Show last 10 messages
  const recent = history.slice(-10);
  listEl.innerHTML = recent.map(m => `
    <div class="settings-history-item">
      <span class="role-badge ${m.role}">${m.role === 'user' ? 'You' : 'Coach'}</span>
      <p class="history-text">${m.content.substring(0, 120)}${m.content.length > 120 ? '...' : ''}</p>
    </div>
  `).join('');
}

export function clearFullChatHistory() {
  if (confirm("Are you sure you want to delete ALL chat history? This cannot be undone.")) {
    clearChatHistory();
    refreshChatHistorySettings();
    
    // Attempt to clear the live chat feed if it exists
    const feed = document.getElementById('coach-chat-feed');
    if (feed) {
      feed.innerHTML = `
        <div class="chat-bubble coach-bubble animate-in">
          <span class="ai-source-badge">✨ VaaniAI Coach</span>
          <div class="bubble-text">History cleared! How can I help you now? 🚀</div>
        </div>
      `;
    }
  }
}

/**
 * Toggle visibility of password/key inputs
 */
export function toggleKeyVisibility(id) {
  const input = document.getElementById(id);
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

/**
 * Get the currently active Groq Key (prefers localStorage, falls back to config.js)
 */
export function getActiveGroqKey() {
  const saved = localStorage.getItem('vaaniai_settings');
  if (saved) {
    const settings = JSON.parse(saved);
    if (settings.groqKey && settings.groqKey.length > 5) {
      return settings.groqKey;
    }
  }
  return null;
}

export function getActiveGeminiKey() {
  const saved = localStorage.getItem('vaaniai_settings');
  if (saved) {
    const settings = JSON.parse(saved);
    if (settings.geminiKey && settings.geminiKey.length > 5) {
      return settings.geminiKey;
    }
  }
  return null;
}

export function getActiveOpenAIKey() {
  const saved = localStorage.getItem('vaaniai_settings');
  if (saved) {
    const settings = JSON.parse(saved);
    if (settings.openaiKey && settings.openaiKey.length > 5) {
      return settings.openaiKey;
    }
  }
  return null;
}
