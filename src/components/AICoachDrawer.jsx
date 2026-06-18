/**
 * src/components/AICoachDrawer.jsx
 * Floating AI Smart Coach chat interface.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { sendChatMessage } from '../services/ai.js';
import { initSpeechToText, startListening, stopListening, speak, stopSpeaking } from '../services/voice.js';

export default function AICoachDrawer() {
  const { 
    currentUser, 
    chatHistory, 
    setChatHistoryState,
    appendChatMessage, 
    clearChat, 
    coachPersonality, 
    setCoachPersonality,
    isChatOpen, 
    setIsChatOpen,
    settings,
    updateSettings,
    addXPPoints
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [imageAttached, setImageAttached] = useState(null);
  const [loading, setLoading] = useState(false);
  
  const feedRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Speech-to-Text on mount or toggle
  useEffect(() => {
    const recognition = initSpeechToText(
      (transcript) => {
        setInputText(prev => prev + ' ' + transcript);
        setIsListening(false);
      },
      () => {
        setIsListening(false);
      },
      (error) => {
        console.error("Mic error:", error);
        setIsListening(false);
      }
    );

    return () => {
      stopListening();
    };
  }, []);

  // Auto Scroll to bottom on new messages
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [chatHistory, isChatOpen]);

  const handleSendMessage = async (textToSend = inputText) => {
    if (!textToSend.trim() && !imageAttached) return;

    setInputText('');
    setLoading(true);

    // 1. Add user message locally
    appendChatMessage('user', textToSend, imageAttached);
    
    // Reset image
    setImageAttached(null);

    try {
      // 2. Fetch AI response
      const result = await sendChatMessage(
        currentUser,
        chatHistory,
        textToSend,
        imageAttached,
        coachPersonality
      );

      // 3. Update global chat state
      setChatHistoryState(result.updatedHistory);
      addXPPoints(10); // Reward XP

      // 4. TTS speech if enabled
      if (settings.aiVoice) {
        speak(result.assistantMessage.content);
      }
    } catch (err) {
      console.error(err);
      appendChatMessage('assistant', "I'm having trouble connecting to the AI Coach. Please check your network and API keys.");
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleMic = () => {
    if (isListening) {
      stopListening();
      setIsListening(false);
    } else {
      setIsListening(true);
      startListening();
    }
  };

  const toggleVoiceOutput = () => {
    const nextVoice = !settings.aiVoice;
    updateSettings({ aiVoice: nextVoice });
    if (!nextVoice) {
      stopSpeaking();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setImageAttached(event.target.result);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setImageAttached(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleQuickPrompt = (promptText) => {
    if (!isChatOpen) {
      setIsChatOpen(true);
    }
    handleSendMessage(promptText);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button 
        className="ai-fab" 
        onClick={() => setIsChatOpen(!isChatOpen)} 
        title="Ask AI Coach"
      >
        <div className="ai-fab-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="32" height="32">
            <path d="M12 8V4H8"/>
            <rect width="16" height="12" x="4" y="8" rx="2"/>
            <path d="M2 14h2"/>
            <path d="M20 14h2"/>
            <path d="M15 13v2"/>
            <path d="M9 13v2"/>
          </svg>
        </div>
      </button>

      {/* Floating Coach Chat Card */}
      <div 
        className={`card ai-coach-card floating-coach ${isChatOpen ? 'chat-open' : ''}`}
      >
        {/* Header */}
        <div className="coach-header floating-header">
          <div className="coach-avatar-wrap">
            <div className={`coach-avatar-pulse ${loading ? 'active' : ''}`}></div>
            <div className="coach-avatar floating-avatar"></div>
          </div>
          <div className="coach-header-info">
            <h3 className="card-title floating-title">AI Smart Coach</h3>
            <div className="coach-ai-badges">
              <span className="coach-status-dot" title="AI Online"></span>
              <button 
                className={`btn-icon-xs ${settings.aiVoice ? 'active-voice' : ''}`} 
                onClick={toggleVoiceOutput} 
                title="Toggle Voice Output"
              >
                {settings.aiVoice ? '🔊' : '🔇'}
              </button>
              <select 
                className="coach-personality-select" 
                value={coachPersonality}
                onChange={(e) => {
                  setCoachPersonality(e.target.value);
                  updateSettings({ aiPersonality: e.target.value });
                }} 
                title="Choose AI Coach Personality"
              >
                <option value="Friendly">😊 Friendly</option>
                <option value="Professional">💼 Professional</option>
                <option value="Strict">🎓 Strict</option>
              </select>
            </div>
          </div>
          <div className="coach-header-actions">
            <button className="btn-icon-sm" onClick={clearChat} title="New Chat">↺</button>
            <button className="btn-icon-sm" onClick={() => setIsChatOpen(false)} title="Close">✕</button>
          </div>
        </div>

        {/* Chat Feed & Input Row */}
        <div className="coach-chat-panel chat-open">
          {/* Feed */}
          <div className="coach-chat-feed" ref={feedRef}>
            <div className="chat-bubble coach-bubble animate-in">
              <span className="ai-source-badge">✨ VaaniAI Coach</span>
              <div className="bubble-text">
                Hello! I'm your <strong>VaaniAI Smart Coach</strong>. Ask me anything — grammar, vocabulary, practice tips, or any question! 🚀
              </div>
            </div>

            {chatHistory.map((msg, index) => (
              <div 
                key={index}
                className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'coach-bubble'} animate-in`}
              >
                <span className="ai-source-badge">
                  {msg.role === 'user' ? 'You' : '✨ VaaniAI Coach'}
                </span>
                <div className="bubble-text">
                  {msg.content}
                  {msg.imageData && (
                    <div className="bubble-image-attached">
                      <img src={msg.imageData} alt="Attached attachment" style={{ maxWidth: '100%', borderRadius: '8px', marginTop: '6px' }} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="chat-bubble coach-bubble loading-bubble">
                <span className="ai-source-badge">✨ Coach is thinking...</span>
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Prompts */}
          <div className="quick-prompts coach-quick-prompts-floater">
            <button className="quick-btn" onClick={() => handleQuickPrompt('Explain sentence patterns with examples')}>📖 Sentence Patterns</button>
            <button className="quick-btn" onClick={() => handleQuickPrompt('Give me 5 practice tips to improve English fluency')}>💡 Fluency Tips</button>
          </div>

          {/* Image attachment preview */}
          {imageAttached && (
            <div id="coach-image-preview" className="coach-image-preview">
              <img src={imageAttached} alt="Upload Preview" />
              <button className="remove-preview" onClick={clearImage}>×</button>
            </div>
          )}

          {/* Input Row */}
          <div className="coach-input-row">
            <textarea
              id="coach-chat-input"
              className="coach-input"
              placeholder="Ask anything..."
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
            ></textarea>
            
            <input 
              type="file" 
              ref={fileInputRef}
              accept="image/*" 
              className="hidden" 
              onChange={handleImageSelect}
              title="Choose an image to upload" 
            />
            
            <button 
              className="coach-attach-btn" 
              onClick={() => fileInputRef.current.click()} 
              title="Attach Image"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
              </svg>
            </button>

            <button 
              className={`coach-mic-btn ${isListening ? 'listening' : ''}`}
              onClick={toggleMic} 
              title="Voice Input"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={isListening ? 3 : 2} width="18" height="18">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            </button>

            <button 
              className="coach-send-btn" 
              onClick={() => handleSendMessage()} 
              title="Send"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="18" height="18">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
