/**
 * mobile/src/context/AppContext.js
 * Global state provider for VaaniAI React Native mobile app.
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
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
import { getThemeColors, getFontSizes } from '../theme/colors.js';

const AppContext = createContext();

export function useApp() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  // Loading state
  const [loading, setLoading] = useState(true);

  // Navigation & User
  const [activePage, setActivePage] = useState('dashboard'); // dashboard, syllabus, study, practice, quiz, flashcards, results, profile, settings, auth
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

  // XP Toast visual state
  const [toastXP, setToastXP] = useState(null);

  // Load initial states on mount
  useEffect(() => {
    async function loadInitialData() {
      try {
        setLoading(true);

        // 1. Auth Simulation Setup
        const storedSim = await AsyncStorage.getItem('vaaniai_simulated_profile');
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
        const savedXp = await getXP();
        setXp(savedXp);

        const savedSub = await getStoredSubject();
        setCurrentSubject(savedSub || 'English');

        const savedCustomSubs = await getStoredCustomSubjects();
        setCustomSubjects(savedCustomSubs || {});

        // 3. Flashcards
        const cards = await getFlashcards();
        setFlashcards(cards || []);

        // 4. Chat History
        const chats = await getChatHistory();
        setChatHistoryState(chats || []);

        // 5. Settings loading
        const savedSet = await AsyncStorage.getItem('vaaniai_settings');
        if (savedSet) {
          try {
            const parsed = JSON.parse(savedSet);
            setSettings(prev => ({ ...prev, ...parsed }));
            setCoachPersonality(parsed.aiPersonality || 'Friendly');
          } catch (_) {}
        }

        // Streak initialization
        const lastActive = await AsyncStorage.getItem('vaaniLastActive');
        const today = new Date().toDateString();
        let currentStreak = parseInt((await AsyncStorage.getItem('vaaniStreak')) || '0');
        
        if (lastActive) {
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          
          if (lastActive === today) {
            // Already logged in today
          } else if (lastActive === yesterday.toDateString()) {
            currentStreak += 1;
            await AsyncStorage.setItem('vaaniStreak', currentStreak.toString());
          } else {
            currentStreak = 1; // Broken streak
            await AsyncStorage.setItem('vaaniStreak', '1');
          }
        } else {
          currentStreak = 1;
          await AsyncStorage.setItem('vaaniStreak', '1');
        }
        await AsyncStorage.setItem('vaaniLastActive', today);
        setStreak(currentStreak);

      } catch (err) {
        console.error("Error loading initial data inside AppContext:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
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

  // Stats Actions
  const addXPPoints = async (amount) => {
    const nextXP = xp + amount;
    setXp(nextXP);
    await saveXP(nextXP);
    
    // Trigger dynamic XP Toast overlay
    setToastXP(amount);
    setTimeout(() => {
      setToastXP(null);
    }, 2500);
  };

  // Subject Actions
  const switchSubject = async (subject) => {
    setCurrentSubject(subject);
    await setStoredSubject(subject);
  };

  const addCustomSubject = async (subjectKey, data) => {
    await setStoredCustomSubject(subjectKey, data);
    const updated = await getStoredCustomSubjects();
    setCustomSubjects(updated || {});
  };

  const deleteCustomSubject = async (subjectKey) => {
    await removeStoredCustomSubject(subjectKey);
    const updated = await getStoredCustomSubjects();
    setCustomSubjects(updated || {});
    if (currentSubject === subjectKey) {
      await switchSubject('English');
    }
  };

  // Flashcards Actions
  const addWordToFlashcards = async (word, definition) => {
    const updated = await srsSave(word, definition);
    setFlashcards(updated || []);
  };

  const updateWordSRS = async (word, remembered) => {
    const updated = await srsUpdate(word, remembered);
    setFlashcards(updated || []);
  };

  // Chat actions
  const appendChatMessage = async (role, content, imageData = null) => {
    const nextChat = [...chatHistory, { role, content, imageData }];
    setChatHistoryState(nextChat);
    await saveChatHistory(nextChat);
  };

  const clearChat = async () => {
    setChatHistoryState([]);
    await clearChatHistory();
  };

  // Settings Actions
  const updateSettings = async (newSettings) => {
    const updated = { ...settings, ...newSettings };
    setSettings(updated);
    await AsyncStorage.setItem('vaaniai_settings', JSON.stringify(updated));
    if (newSettings.aiPersonality) {
      setCoachPersonality(newSettings.aiPersonality);
    }
  };

  // Profile Save helper
  const handleSaveProfile = async (profileData) => {
    await saveProfile(currentUser, profileData);
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
    await addXPPoints(50);
  };

  const logoutUser = async () => {
    await AsyncStorage.removeItem('vaaniai_supabase_token');
    await AsyncStorage.removeItem('vaaniai_simulated_profile');
    setCurrentUser(null);
    setActivePage('auth');
  };

  // Compute theme and fonts dynamically
  const activeColors = getThemeColors(settings.theme);
  const activeFontSizes = getFontSizes(settings.fontSize);

  return (
    <AppContext.Provider value={{
      loading,
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
      activeColors,
      activeFontSizes,
      toastXP,
      resultsHistory,
      recordResult,
      handleSaveProfile,
      logoutUser
    }}>
      {children}
    </AppContext.Provider>
  );
}
