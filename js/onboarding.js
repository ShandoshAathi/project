/**
 * onboarding.js — Handles the candidate details collection
 */
import { getCurrentUser } from './state.js';
import { saveProfile } from './storage.js';
import { navigate } from './navigation.js';

/** Show the onboarding overlay */
export function showOnboarding() {
  const user = getCurrentUser();
  const overlay = document.getElementById('onboarding-overlay');
  const loginPage = document.getElementById('page-login');
  
  if (loginPage) loginPage.classList.add('hidden');
  overlay.classList.remove('hidden');
  overlay.classList.add('active');

  // Check if we can extract details
  const extractSection = document.getElementById('extract-section');
  const providerSpan = document.getElementById('provider-name');
  
  if (user && user.app_metadata && user.app_metadata.provider) {
    const provider = user.app_metadata.provider;
    if (provider === 'google' || provider === 'github') {
      extractSection.classList.remove('hidden');
      providerSpan.textContent = provider.charAt(0).toUpperCase() + provider.slice(1);
    } else {
      extractSection.classList.add('hidden');
    }
  }
}

/** Pre-fill details from Supabase user object */
export function extractProviderDetails() {
  const user = getCurrentUser();
  if (!user) return;

  const fullName = user.user_metadata?.full_name || user.user_metadata?.name || '';
  if (fullName) {
    document.getElementById('onboard-name').value = fullName;
  }
  
  // Bonus: If it's GitHub, maybe we can fetch more? 
  // For now, just the name is usually available in metadata.
}

/** Save and continue to dashboard */
export async function saveOnboarding() {
  const name = document.getElementById('onboard-name').value;
  const occupation = document.getElementById('onboard-occupation').value;
  const age = document.getElementById('onboard-age').value;
  const lang = document.getElementById('onboard-language').value;
  const goal = document.getElementById('onboard-goal').value;

  if (!name) return alert("Please enter your name.");

  const btn = document.querySelector('#onboarding-overlay .auth-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Saving...';

  try {
    await saveProfile({
      full_name: name,
      occupation: occupation,
      age: age,
      native_language: lang,
      learning_goal: goal
    });

    // Hide overlay and go to dashboard
    const overlay = document.getElementById('onboarding-overlay');
    overlay.classList.add('hidden');
    overlay.classList.remove('active');
    
    document.querySelector('.topnav').classList.remove('hidden');
    navigate('dashboard');
  } catch (err) {
    console.error(err);
    alert("Failed to save profile: " + err.message);
  } finally {
    btn.innerHTML = originalText;
  }
}
