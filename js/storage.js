/**
 * storage.js — localStorage persistence layer
 * All data read/write goes through this module.
 */

import { supabase } from './supabase.js';
import { getCurrentUser } from './auth.js';

const KEYS = {
  NAME:    'vaaniName',
  RESULTS: 'vaaniResults',
};

/** Save a practice / quiz score */
export async function saveResult(score, activityType = 'practice') {
  const user = getCurrentUser();
  const resultObj = { user_id: user?.id, score, activity_type: activityType, created_at: new Date().toISOString() };

  if (supabase && user && !user.id.startsWith('sim-')) {
    try {
      const { error } = await supabase
        .from('user_results')
        .insert([resultObj]);
      if (!error) return;
      console.error("Supabase Save Result Error:", error);
    } catch (err) {
      console.error("Supabase Save Result Exception:", err);
    }
  }
  
  // Fallback to localStorage
  const results = JSON.parse(localStorage.getItem(KEYS.RESULTS) || '[]');
  results.unshift(resultObj); // Add to beginning
  localStorage.setItem(KEYS.RESULTS, JSON.stringify(results));
}

/** Get all saved results */
export async function getResults() {
  const user = getCurrentUser();
  if (supabase && user && !user.id.startsWith('sim-')) {
    try {
      const { data, error } = await supabase
        .from('user_results')
        .select('*')
        .eq('user_id', user.id)
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
export async function saveProfile(profileData) {
  const user = getCurrentUser();
  if (supabase && user && !user.id.startsWith('sim-')) {
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id: user.id, ...profileData });
      
      if (!error) return;
      
      if (error.code === 'PGRST205') {
        console.warn("Supabase 'profiles' table missing. Falling back to local storage.");
      } else {
        throw error;
      }
    } catch (err) {
      console.error("Supabase Profile Save Error:", err);
      // Fallback below
    }
  }
  
  // Save locally for simulation or fallback
  localStorage.setItem('vaaniai_simulated_profile', JSON.stringify(profileData));
  if (user) {
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
