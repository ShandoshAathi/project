/**
 * src/services/storage.js
 * React Native AsyncStorage and Supabase database integration for mobile.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
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
export async function getCurrentSubject() {
  return (await AsyncStorage.getItem(KEYS.SUBJECT)) || 'English';
}

export async function saveCurrentSubject(subject) {
  await AsyncStorage.setItem(KEYS.SUBJECT, subject);
}

export async function getCustomSubjects() {
  const stored = await AsyncStorage.getItem(KEYS.CUSTOM_SUBJECTS);
  return stored ? JSON.parse(stored) : {};
}

export async function saveCustomSubject(subjectKey, data) {
  const customSubjects = await getCustomSubjects();
  customSubjects[subjectKey] = data;
  await AsyncStorage.setItem(KEYS.CUSTOM_SUBJECTS, JSON.stringify(customSubjects));
}

export async function deleteCustomSubject(subjectKey) {
  const customSubjects = await getCustomSubjects();
  if (customSubjects[subjectKey]) {
    delete customSubjects[subjectKey];
    await AsyncStorage.setItem(KEYS.CUSTOM_SUBJECTS, JSON.stringify(customSubjects));
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
  
  // Fallback to AsyncStorage
  const stored = await AsyncStorage.getItem(KEYS.RESULTS);
  const results = stored ? JSON.parse(stored) : [];
  results.unshift(resultObj);
  await AsyncStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
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
  
  // Fallback to AsyncStorage
  const stored = await AsyncStorage.getItem(KEYS.RESULTS);
  return stored ? JSON.parse(stored) : [];
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
    } catch (err) {
      console.error("Supabase Profile Fetch Error:", err);
    }
  }
  // Fallback for simulation
  const stored = await AsyncStorage.getItem('vaaniai_simulated_profile');
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
      throw error;
    } catch (err) {
      console.error("Supabase Profile Save Error:", err);
    }
  }
  
  // Save locally for simulation
  await AsyncStorage.setItem('vaaniai_simulated_profile', JSON.stringify(profileData));
  if (currentUser) {
    await saveName(profileData.full_name);
  }
}

/** Save user name locally */
export async function saveName(name) {
  await AsyncStorage.setItem(KEYS.NAME, name);
}

/** Get saved user name locally */
export async function getSavedName() {
  return await AsyncStorage.getItem(KEYS.NAME);
}

/** Save Chat History */
export async function saveChatHistory(history) {
  await AsyncStorage.setItem(KEYS.CHAT, JSON.stringify(history));
}

/** Get Chat History */
export async function getChatHistory() {
  try {
    const stored = await AsyncStorage.getItem(KEYS.CHAT);
    return stored ? JSON.parse(stored) : [];
  } catch (e) {
    console.error("Failed to parse chat history:", e);
    return [];
  }
}

/** Clear Chat History */
export async function clearChatHistory() {
  await AsyncStorage.removeItem(KEYS.CHAT);
}

/** XP & Leveling Logic */
export async function getXP() {
  const stored = await AsyncStorage.getItem(KEYS.XP);
  return parseInt(stored || '0');
}

export async function saveXP(xpVal) {
  await AsyncStorage.setItem(KEYS.XP, xpVal.toString());
}

export function getLevel(xp) {
  return Math.floor(xp / 1000) + 1;
}

export function getXPProgress(xp) {
  const levelXP = xp % 1000;
  return (levelXP / 1000) * 100;
}

/** Personalized Learning Path (Mistakes) */
export async function trackMistake(category) {
  const mistakes = await getMistakes();
  mistakes[category] = (mistakes[category] || 0) + 1;
  await AsyncStorage.setItem(KEYS.MISTAKES, JSON.stringify(mistakes));
}

export async function getMistakes() {
  const stored = await AsyncStorage.getItem(KEYS.MISTAKES);
  return stored ? JSON.parse(stored) : {};
}

export async function getTopMistakes() {
  const mistakes = await getMistakes();
  return Object.entries(mistakes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(entry => entry[0]);
}
