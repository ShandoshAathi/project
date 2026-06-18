/**
 * src/pages/Settings.jsx
 * Settings & configurations module for VaaniAI.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Settings() {
  const { 
    settings, 
    updateSettings, 
    chatHistory, 
    clearChat 
  } = useApp();

  // Local visibility toggles for passwords
  const [showGroq, setShowGroq] = useState(false);
  const [showGemini, setShowGemini] = useState(false);
  const [showOpenai, setShowOpenai] = useState(false);

  const handleSettingChange = (key, val) => {
    updateSettings({ [key]: val });
  };

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to delete ALL chat history? This cannot be undone.")) {
      clearChat();
    }
  };

  const recentChat = chatHistory.slice(-10);

  return (
    <div className="page active" id="page-settings">
      <div className="settings-layout">
        {/* Appearance Settings */}
        <div className="card animate-in">
          <h3>Appearance</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Theme</label>
              <p>Toggle between Light and Dark mode</p>
            </div>
            <select 
              id="setting-theme" 
              value={settings.theme} 
              onChange={(e) => handleSettingChange('theme', e.target.value)}
              title="Select application theme"
            >
              <option value="light">Light Mode</option>
              <option value="dark">Dark Mode</option>
            </select>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Font Size</label>
              <p>Adjust the text size across the application</p>
            </div>
            <select 
              id="setting-font-size" 
              value={settings.fontSize} 
              onChange={(e) => handleSettingChange('fontSize', e.target.value)}
              title="Select application font size"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
        </div>
        
        {/* AI Coach Settings */}
        <div className="card mt-6 animate-in">
          <h3>AI Coach Settings</h3>
          <div className="setting-item">
            <div className="setting-info">
              <label>Voice Output</label>
              <p>Enable text-to-speech for AI responses</p>
            </div>
            <label className="switch">
              <input 
                type="checkbox" 
                id="setting-ai-voice" 
                checked={settings.aiVoice} 
                onChange={(e) => handleSettingChange('aiVoice', e.target.checked)}
                title="Toggle AI Voice Output"
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="setting-item">
            <div className="setting-info">
              <label>Default Personality</label>
              <p>How should the AI respond to you?</p>
            </div>
            <select 
              id="setting-ai-personality" 
              value={settings.aiPersonality} 
              onChange={(e) => handleSettingChange('aiPersonality', e.target.value)}
              title="Select AI coach personality"
            >
              <option value="Friendly">😊 Friendly</option>
              <option value="Professional">💼 Professional</option>
              <option value="Strict">🎓 Strict</option>
            </select>
          </div>
        </div>

        {/* API Configurations */}
        <div className="card mt-6 animate-in">
          <h3>API Configuration</h3>
          <p className="text-sm text-muted mb-4">
            Set your personal API keys here. These are saved only in your browser's local storage.
          </p>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Groq API Key</label>
              <p>Used for the AI Chatbot and Exercises</p>
            </div>
            <div className="input-with-toggle">
              <input 
                type={showGroq ? "text" : "password"} 
                id="setting-groq-key" 
                placeholder="gsk_..." 
                value={settings.groqKey || ''} 
                onChange={(e) => handleSettingChange('groqKey', e.target.value)}
              />
              <button 
                className="btn-icon-sm" 
                onClick={() => setShowGroq(!showGroq)}
                title="Toggle Key Visibility"
              >
                {showGroq ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>Gemini API Key</label>
              <p>Backup Google AI engine</p>
            </div>
            <div className="input-with-toggle">
              <input 
                type={showGemini ? "text" : "password"} 
                id="setting-gemini-key" 
                placeholder="AIza..." 
                value={settings.geminiKey || ''} 
                onChange={(e) => handleSettingChange('geminiKey', e.target.value)}
              />
              <button 
                className="btn-icon-sm" 
                onClick={() => setShowGemini(!showGemini)}
                title="Toggle Key Visibility"
              >
                {showGemini ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          
          <div className="setting-item">
            <div className="setting-info">
              <label>OpenAI API Key</label>
              <p>Backup OpenAI engine</p>
            </div>
            <div className="input-with-toggle">
              <input 
                type={showOpenai ? "text" : "password"} 
                id="setting-openai-key" 
                placeholder="sk-..." 
                value={settings.openaiKey || ''} 
                onChange={(e) => handleSettingChange('openaiKey', e.target.value)}
              />
              <button 
                className="btn-icon-sm" 
                onClick={() => setShowOpenai(!showOpenai)}
                title="Toggle Key Visibility"
              >
                {showOpenai ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
        </div>

        {/* Chat History Panel */}
        <div className="card mt-6 animate-in">
          <h3>Chat History</h3>
          <p className="text-sm text-muted mb-4">
            Your recent conversations with the AI Coach are stored locally.
          </p>
          <div id="settings-chat-history" className="settings-history-list">
            {recentChat.length === 0 ? (
              <p className="empty-state">No chat history found.</p>
            ) : (
              recentChat.map((m, idx) => (
                <div className="settings-history-item" key={idx}>
                  <span className={`role-badge ${m.role}`}>
                    {m.role === 'user' ? 'You' : 'Coach'}
                  </span>
                  <p className="history-text">
                    {m.content.substring(0, 120)}
                    {m.content.length > 120 ? '...' : ''}
                  </p>
                </div>
              ))
            )}
          </div>
          <button 
            className="btn-outline btn-sm mt-4 btn-danger-hover" 
            onClick={handleClearHistory}
          >
            🗑️ Clear All Chat History
          </button>
        </div>
      </div>
    </div>
  );
}
