/**
 * src/services/storage.js
 * LocalStorage and Supabase database integration.
 */

import { supabase } from './supabase.js';

const KEYS = {
  NAME:    'vaaniName',
  RESULTS: 'vaaniResults',
  CHAT:    'vaaniChatHistory',
  XP:      'vaaniXP',
  MISTAKES: 'vaaniMistakes',
  SUBJECT:  'vaaniCurrentSubject',
  CUSTOM_SUBJECTS: 'vaaniCustomSubjects'
};

/** Get/Set current subject */
export function getCurrentSubject() {
  return localStorage.getItem(KEYS.SUBJECT) || 'English';
}

export function saveCurrentSubject(subject) {
  localStorage.setItem(KEYS.SUBJECT, subject);
}

export function getCustomSubjects() {
  const stored = localStorage.getItem(KEYS.CUSTOM_SUBJECTS);
  return stored ? JSON.parse(stored) : {};
}

export function saveCustomSubject(subjectKey, data) {
  const customSubjects = getCustomSubjects();
  customSubjects[subjectKey] = data;
  localStorage.setItem(KEYS.CUSTOM_SUBJECTS, JSON.stringify(customSubjects));
}

export function deleteCustomSubject(subjectKey) {
  const customSubjects = getCustomSubjects();
  if (customSubjects[subjectKey]) {
    delete customSubjects[subjectKey];
    localStorage.setItem(KEYS.CUSTOM_SUBJECTS, JSON.stringify(customSubjects));
  }
}

/** Save a practice / quiz score */
export async function saveResult(currentUser, score, activityType = 'practice') {
  const resultObj = { 
    user_id: currentUser?.id, 
    score, 
    activity_type: activityType, 
    created_at: new Date().toISOString() 
  };

  if (supabase && currentUser && !currentUser.id.startsWith('sim-')) {
    try {
      const { error } = await supabase
        .from('user_results')
        .insert([resultObj]);
      if (!error) return resultObj;
      console.error("Supabase Save Result Error:", error);
    } catch (err) {
      console.error("Supabase Save Result Exception:", err);
    }
  }
  
  // Fallback to localStorage
  const results = JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
  results.unshift(resultObj);
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
  return resultObj;
}

/** Get all saved results */
export async function getResults(currentUser) {
  if (supabase && currentUser && !currentUser.id.startsWith('sim-')) {
    try {
      const { data, error } = await supabase
        .from('user_results')
        .select('*')
        .eq('user_id', currentUser.id)
        .order('created_at', { ascending: false });
        
      if (!error && data) return data;
      console.error("Supabase Fetch Results Error:", error);
    } catch (err) {
      console.error("Supabase Fetch Results Exception:", err);
    }
  }
  
  // Fallback to localStorage
  return JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
}

/** Get saved user profile from DB */
export async function getProfile(userId) {
  if (supabase && userId && !userId.startsWith('sim-')) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (!error && data) return data;
      if (error && error.code === 'PGRST205') {
        console.warn("Supabase 'profiles' table missing. Using local storage.");
      }
    } catch (err) {
      console.error("Supabase Profile Fetch Error:", err);
    }
  }
  // Fallback for simulation or missing table
  const stored = localStorage.getItem('vaaniai_simulated_profile');
  return stored ? JSON.parse(stored) : null;
}

/** Save user profile to DB */
export async function saveProfile(currentUser, profileData) {
  if (supabase && currentUser && !currentUser.id.startsWith('sim-')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: currentUser.id, ...profileData });
      
      if (!error) return;
      
      if (error.code === 'PGRST205') {
        console.warn("Supabase 'profiles' table missing. Falling back to local storage.");
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Supabase Profile Save Error:", err);
    }
  }
  
  // Save locally for simulation or fallback
  localStorage.setItem('vaaniai_simulated_profile', JSON.stringify(profileData));
  if (currentUser) {
    saveName(profileData.full_name);
  }
}

/** Save user name locally */
export function saveName(name) {
  localStorage.setItem(KEYS.NAME, name);
}

/** Get saved user name locally */
export function getSavedName() {
  return localStorage.getItem(KEYS.NAME);
}

/** Save Chat History */
export function saveChatHistory(history) {
  localStorage.setItem(KEYS.CHAT, JSON.stringify(history));
}

/** Get Chat History */
export function getChatHistory() {
  try {
    const stored = localStorage.getItem(KEYS.CHAT);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse chat history:", e);
    return [];
  }
}

/** Clear Chat History */
export function clearChatHistory() {
  localStorage.removeItem(KEYS.CHAT);
}

/** XP & Leveling Logic */
export function getXP() {
  return parseInt(localStorage.getItem(KEYS.XP) || '0');
}

export function saveXP(xpVal) {
  localStorage.setItem(KEYS.XP, xpVal.toString());
}

export function getLevel(xp) {
  return Math.floor(xp / 1000) + 1;
}

export function getXPProgress(xp) {
  const levelXP = xp % 1000;
  return (levelXP / 1000) * 100;
}

/** Personalized Learning Path (Mistakes) */
export function trackMistake(category) {
  const mistakes = getMistakes();
  mistakes[category] = (mistakes[category] || 0) + 1;
  localStorage.setItem(KEYS.MISTAKES, JSON.stringify(mistakes));
}

export function getMistakes() {
  const stored = localStorage.getItem(KEYS.MISTAKES);
  return stored ? JSON.parse(stored) : {};
}

export function getTopMistakes() {
  const mistakes = getMistakes();
  return Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
}
