/**
 * src/services/supabase.js
 * Backend initialization wrapper using the global window.supabase CDN or simulated fallback.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY_HERE';

export let supabase = null;

if (typeof window !== 'undefined' && window.supabase && SUPABASE_URL && SUPABASE_URL !== 'YOUR_SUPABASE_URL_HERE') {
  supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} else {
  console.warn("Supabase URL not configured or SDK missing. Running in simulated authentication mode.");
}
