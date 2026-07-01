/**
 * src/context/AppContext.jsx
 * Global state provider for VaaniAI.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getCurrentSubject as getStoredSubject, 
  saveCurrentSubject as setStoredSubject,
  getCustomSubjects as getStoredCustomSubjects,
  saveCustomSubject as setStoredCustomSubject,
  deleteCustomSubject as removeStoredCustomSubject,
  getXP,
  saveXP,
  getLevel,
  getXPProgress,
  getChatHistory,
  saveChatHistory,
  clearChatHistory,
  getResults,
  saveResult as writeResult,
  saveProfile
} from '../services/storage.js';
import { getFlashcards, saveWord as srsSave, updateSRS as srsUpdate } from '../services/srs.js';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // Navigation & User
  const [activePage, setActivePage] = useState('dashboard');
  const [currentUser, setCurrentUser] = useState(null);
  
  // Stats & Progress
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(0);
  const [currentSubject, setCurrentSubject] = useState('English');
  const [customSubjects, setCustomSubjects] = useState({});
  const [resultsHistory, setResultsHistory] = useState([]);
  
  // Flashcards (SRS)
  const [flashcards, setFlashcards] = useState([]);
  const [dueWords, setDueWords] = useState([]);

  // AI Chat & Drawer State
  const [chatHistory, setChatHistoryState] = useState([]);
  const [coachPersonality, setCoachPersonality] = useState('Friendly');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [settings, setSettings] = useState({
    theme: 'light',
    fontSize: 'medium',
    aiVoice: true,
    aiPersonality: 'Friendly',
    groqKey: '',
    geminiKey: '',
    openaiKey: ''
  });

  // Load initial states on mount
  useEffect(() => {
    // 1. Auth Simulation Setup
    const storedSim = localStorage.getItem('supabase.auth.token') || localStorage.getItem('vaaniai_simulated_profile');
    if (storedSim) {
      try {
        const parsed = JSON.parse(storedSim);
        setCurrentUser({ id: parsed.id || 'sim-user', email: parsed.email || 'user@example.com', full_name: parsed.full_name || 'User' });
      } catch (_) {
        setCurrentUser({ id: 'sim-user', email: 'user@example.com', full_name: 'User' });
      }
    } else {
      // Create guest
      setCurrentUser({ id: 'sim-guest', email: 'guest@example.com', full_name: 'Arjun Kumar' });
    }

    // 2. Stats
    setXp(getXP());
    setCurrentSubject(getStoredSubject());
    setCustomSubjects(getStoredCustomSubjects());

    // 3. Flashcards
    const cards = getFlashcards();
    setFlashcards(cards);

    // 4. Chat History
    setChatHistoryState(getChatHistory());

    // 5. Settings loading
    const savedSet = localStorage.getItem('vaaniai_settings');
    if (savedSet) {
      try {
        const parsed = JSON.parse(savedSet);
        setSettings(prev => ({ ...prev, ...parsed }));
        setCoachPersonality(parsed.aiPersonality || 'Friendly');
      } catch (_) {}
    }

    // Streak initialization
    const lastActive = localStorage.getItem('vaaniLastActive');
    const today = new Date().toDateString();
    let currentStreak = parseInt(localStorage.getItem('vaaniStreak') || '0');
    
    if (lastActive) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastActive === today) {
        // Already logged in today
      } else if (lastActive === yesterday.toDateString()) {
        currentStreak += 1;
        localStorage.setItem('vaaniStreak', currentStreak.toString());
      } else {
        currentStreak = 1; // Broken streak
        localStorage.setItem('vaaniStreak', '1');
      }
    } else {
      currentStreak = 1;
      localStorage.setItem('vaaniStreak', '1');
    }
    localStorage.setItem('vaaniLastActive', today);
    setStreak(currentStreak);
  }, []);

  // Update due flashcards whenever flashcards change
  useEffect(() => {
    const now = Date.now();
    const due = flashcards.filter(w => w.nextReview <= now);
    setDueWords(due);
  }, [flashcards]);

  // Sync results history when user loads or updates
  useEffect(() => {
    if (currentUser) {
      getResults(currentUser).then(history => {
        setResultsHistory(history);
      });
    }
  }, [currentUser, xp]);

  // Apply Theme & Font settings in real-time
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    document.documentElement.setAttribute('data-font-size', settings.fontSize);
  }, [settings.theme, settings.fontSize]);

  // Stats Actions
  const addXPPoints = (amount) => {
    setXp(prev => {
      const nextXP = prev + amount;
      saveXP(nextXP);
      
      // Toast feedback
      showXPToast(amount);
      return nextXP;
    });
  };

  const showXPToast = (amount) => {
    let container = document.getElementById('xp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'xp-toast-container';
      container.className = 'xp-toast-container';
      document.body.appendChild(container);
    }
    
    const toast = document.createElement('div');
    toast.className = 'xp-toast animate-in-up';
    toast.innerHTML = `<span class="xp-star">⭐</span> +${amount} XP`;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('fade-out');
      setTimeout(() => toast.remove(), 500);
    }, 2500);
  };

  // Subject Actions
  const switchSubject = (subject) => {
    setCurrentSubject(subject);
    setStoredSubject(subject);
  };

  const addCustomSubject = (subjectKey, data, contextText = '') => {
    setStoredCustomSubject(subjectKey, data, contextText);
    setCustomSubjects(getStoredCustomSubjects());
  };

  const deleteCustomSubject = (subjectKey) => {
    removeStoredCustomSubject(subjectKey);
    setCustomSubjects(getStoredCustomSubjects());
    if (currentSubject === subjectKey) {
      switchSubject('English');
    }
  };

  // Flashcards Actions
  const addWordToFlashcards = (word, definition) => {
    const updated = srsSave(word, definition);
    setFlashcards(updated);
  };

  const updateWordSRS = (word, remembered) => {
    const updated = srsUpdate(word, remembered);
    setFlashcards(updated);
  };

  // Chat actions
  const appendChatMessage = (role, content, imageData = null) => {
    setChatHistoryState(prev => {
      const nextChat = [...prev, { role, content, imageData }];
      saveChatHistory(nextChat);
      return nextChat;
    });
  };

  const clearChat = () => {
    setChatHistoryState([]);
    clearChatHistory();
  };

  // Settings Actions
  const updateSettings = (newSettings) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('vaaniai_settings', JSON.stringify(updated));
      if (newSettings.aiPersonality) {
        setCoachPersonality(newSettings.aiPersonality);
      }
      return updated;
    });
  };

  // Profile Save helper
  const handleSaveProfile = async (profileData) => {
    // Save to server
    await saveProfile(currentUser, profileData);
    
    // Update local currentUser context
    setCurrentUser(prev => ({
      ...prev,
      full_name: profileData.full_name,
      ...profileData
    }));
  };

  const recordResult = async (score, activityType) => {
    const newRes = await writeResult(currentUser, score, activityType);
    setResultsHistory(prev => [newRes, ...prev]);
    // Award 50 XP for completing a quiz/practice session
    addXPPoints(50);
  };

  const logoutUser = () => {
    localStorage.removeItem('supabase.auth.token');
    localStorage.removeItem('vaaniai_simulated_profile');
    setCurrentUser(null);
    setActivePage('auth');
  };

  return (
    <AppContext.Provider value={{
      activePage,
      setActivePage,
      currentUser,
      setCurrentUser,
      xp,
      level: getLevel(xp),
      xpProgress: getXPProgress(xp),
      addXPPoints,
      streak,
      currentSubject,
      switchSubject,
      customSubjects,
      addCustomSubject,
      deleteCustomSubject,
      flashcards,
      dueWords,
      addWordToFlashcards,
      updateWordSRS,
      
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
      resultsHistory,
      recordResult,
      handleSaveProfile,
      logoutUser
    }}>
      {children}
    </AppContext.Provider>
  );
}
