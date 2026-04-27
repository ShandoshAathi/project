/**
 * auth.js — Authentication and Splash Screen Logic
 */
import { supabase } from './supabase.js';
import { navigate } from './navigation.js';
import { getProfile } from './storage.js';
import { showOnboarding } from './onboarding.js';

let currentUser = null;
let currentPhone = '';

export function getCurrentUser() {
  return currentUser;
}

/** Check if user needs onboarding */
async function checkOnboarding(user) {
  if (!user) return;
  
  if (user.id.startsWith('sim-')) {
    // For simulation, check local storage for profile
    const storedProfile = localStorage.getItem('vaaniai_simulated_profile');
    if (storedProfile) {
      document.querySelector('.topnav').classList.remove('hidden');
      navigate('dashboard');
    } else {
      document.querySelector('.topnav').classList.add('hidden');
      showOnboarding();
    }
    return;
  }

  const profile = await getProfile(user.id);
  if (profile) {
    // Profile exists, go to dashboard
    document.querySelector('.topnav').classList.remove('hidden');
    navigate('dashboard');
  } else {
    // No profile, show onboarding
    document.querySelector('.topnav').classList.add('hidden');
    showOnboarding();
  }
}

/* ── Init Auth State ────────────────────────────────────────────── */
export async function initAuth() {
  const splash = document.getElementById('splash');
  
  // Simulate network delay for Splash Screen (2 seconds)
  setTimeout(async () => {
    // Hide splash screen
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.classList.remove('active');
    }, 800);

    // Check auth state
    if (supabase) {
      // Real Supabase check
      const { data: { session } } = await supabase.auth.getSession();
      currentUser = session?.user || null;
    } else {
      // Simulated check (look in localStorage)
      const stored = localStorage.getItem('vaaniai_simulated_user');
      currentUser = stored ? JSON.parse(stored) : null;
    }

    if (currentUser) {
      checkOnboarding(currentUser);
    } else {
      // Not logged in, show login screen
      document.querySelector('.topnav').classList.add('hidden');
      navigate('login');
    }
  }, 2000);
}

/* ── Google Auth ──────────────────────────────────────────────── */
export async function loginWithGoogle() {
  if (supabase) {
    await supabase.auth.signInWithOAuth({ provider: 'google' });
  } else {
    // Simulate Google Login
    const textSpan = document.getElementById('text-google');
    const originalText = textSpan ? textSpan.textContent : 'Google';
    if (textSpan) textSpan.textContent = 'Connecting...';
    
    setTimeout(() => {
      currentUser = { id: 'sim-1', email: 'user@gmail.com', name: 'Google User', app_metadata: { provider: 'google' } };
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
      if (textSpan) textSpan.textContent = originalText;
      checkOnboarding(currentUser);
    }, 1000);
  }
}

/* ── Github Auth ──────────────────────────────────────────────── */
export async function loginWithGithub() {
  if (supabase) {
    await supabase.auth.signInWithOAuth({ provider: 'github' });
  } else {
    // Simulate GitHub Login
    const textSpan = document.getElementById('text-github');
    const originalText = textSpan ? textSpan.textContent : 'GitHub';
    if (textSpan) textSpan.textContent = 'Connecting...';
    
    setTimeout(() => {
      currentUser = { id: 'sim-github-1', email: 'githubuser@example.com', name: 'GitHub User', app_metadata: { provider: 'github' } };
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
      if (textSpan) textSpan.textContent = originalText;
      checkOnboarding(currentUser);
    }, 1000);
  }
}

/* ── UI Toggle ────────────────────────────────────────────────── */
export function switchAuthType(type) {
  document.getElementById('btn-email-toggle').classList.toggle('active', type === 'email');
  document.getElementById('btn-phone-toggle').classList.toggle('active', type === 'phone');
  
  document.getElementById('email-auth-section').style.display = type === 'email' ? 'block' : 'none';
  document.getElementById('phone-auth-section').style.display = type === 'phone' ? 'block' : 'none';
  document.getElementById('otp-auth-section').style.display = 'none'; // reset otp on switch
}

/* ── Email Auth ───────────────────────────────────────────────── */
let isSignUpMode = false;
export function toggleEmailMode() {
  isSignUpMode = !isSignUpMode;
  const btn = document.getElementById('email-action-btn');
  const hint = document.getElementById('email-auth-hint');
  const toggle = document.getElementById('email-auth-toggle');

  if (isSignUpMode) {
    if (btn) {
      btn.textContent = 'Sign Up';
      btn.onclick = signUpWithEmail;
    }
    if (hint) hint.textContent = 'Already have an account?';
    if (toggle) toggle.textContent = 'Log In to Existing Account';
  } else {
    if (btn) {
      btn.textContent = 'Log In';
      btn.onclick = loginWithEmail;
    }
    if (hint) hint.textContent = "Don't have an account?";
    if (toggle) toggle.textContent = 'Create an Account';
  }
}

export async function loginWithEmail() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  if (!email || !password) return alert("Please enter email and password.");
  
  const btn = document.getElementById('email-action-btn') || document.querySelector('#email-auth-section .btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Logging in...';

  if (supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    btn.innerHTML = originalText;
    if (error) return alert("Login failed: " + error.message);
    
    currentUser = data.user;
    checkOnboarding(currentUser);
  } else {
    setTimeout(() => {
      btn.innerHTML = originalText;
      currentUser = { id: 'sim-email-1', email, name: 'Email User', app_metadata: { provider: 'email' } };
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
      checkOnboarding(currentUser);
    }, 1000);
  }
}

export async function signUpWithEmail() {
  const email = document.getElementById('emailInput').value;
  const password = document.getElementById('passwordInput').value;
  
  if (!email || !password) return alert("Please enter email and password.");

  if (supabase) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) return alert("Signup failed: " + error.message);
    alert("Signup successful! Please check your email to verify your account, then log in.");
  } else {
    const btn = document.getElementById('email-action-btn') || document.querySelector('#email-auth-section .btn-primary');
    if (btn) {
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Signing up...';
      setTimeout(() => {
        btn.innerHTML = originalText;
        currentUser = { id: 'sim-email-1', email, name: 'Email User', app_metadata: { provider: 'email' } };
        localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
        checkOnboarding(currentUser);
      }, 1000);
    } else {
      currentUser = { id: 'sim-email-1', email, name: 'Email User', app_metadata: { provider: 'email' } };
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
      checkOnboarding(currentUser);
    }
  }
}

/* ── Mobile Phone Auth (OTP) ──────────────────────────────────── */
export async function sendOTP() {
  const phoneInput = document.getElementById('phoneInput').value;
  if (!phoneInput || phoneInput.length < 5) {
    alert("Please enter a valid phone number.");
    return;
  }

  currentPhone = phoneInput;
  const btn = document.querySelector('#phone-auth-section .btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Sending...';

  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({ phone: currentPhone });
    btn.innerHTML = originalText;
    if (error) {
      alert("Error sending code: " + error.message);
      return;
    }
  } else {
    // Simulate OTP sending
    await new Promise(r => setTimeout(r, 1000));
    btn.innerHTML = originalText;
  }

  // Show OTP section
  document.getElementById('phone-auth-section').style.display = 'none';
  document.getElementById('otp-auth-section').style.display = 'block';
  document.getElementById('otpInput').focus();
}

export async function verifyOTP() {
  const otp = document.getElementById('otpInput').value;
  if (!otp || otp.length < 6) {
    alert("Please enter the 6-digit code.");
    return;
  }

  const btn = document.querySelector('#otp-auth-section .btn-primary');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'Verifying...';

  if (supabase) {
    const { data, error } = await supabase.auth.verifyOtp({
      phone: currentPhone,
      token: otp,
      type: 'sms'
    });
    btn.innerHTML = originalText;
    
    if (error) {
      alert("Invalid code: " + error.message);
      return;
    }
    currentUser = data.user;
  } else {
    // Simulate OTP Verify
    await new Promise(r => setTimeout(r, 1000));
    btn.innerHTML = originalText;
    if (otp === '123456') { // Mock correct code
      currentUser = { id: 'sim-2', phone: currentPhone, name: 'Mobile User' };
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(currentUser));
    } else {
      alert("Invalid code. For simulation, use '123456'.");
      return;
    }
  }

  // Success
  document.getElementById('otpInput').value = '';
  checkOnboarding(currentUser);
}

export function resetPhoneAuth() {
  document.getElementById('otp-auth-section').style.display = 'none';
  document.getElementById('phone-auth-section').style.display = 'block';
  document.getElementById('otpInput').value = '';
}

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('vaaniai_simulated_user');
  }
  currentUser = null;
  document.querySelector('.topnav').classList.add('hidden');
  
  // Reset auth UI
  if (isSignUpMode) toggleEmailMode(); // Reset back to Log In mode
  resetPhoneAuth(); // Resets phone/otp internals
  switchAuthType('email'); // Reset back to Email tab (hides phone tab)
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('phoneInput').value = '';
  
  // Ensure login page is visible
  const loginPage = document.getElementById('page-login');
  if (loginPage) loginPage.style.display = 'flex';
  
  navigate('login');
}
