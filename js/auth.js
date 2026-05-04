/**
 * auth.js — Authentication and Splash Screen Logic
 */
import { supabase } from './supabase.js';
import { navigate } from './navigation.js';
import { getProfile } from './storage.js';
import { showOnboarding } from './onboarding.js';
import { getCurrentUser, setCurrentUser } from './state.js';
let currentPhone = '';

/** Check if user needs onboarding */
async function checkOnboarding(user) {
  if (!user) return;
  
  // Always hide login page first
  const loginPage = document.getElementById('page-login');
  if (loginPage) loginPage.classList.remove('active');

  if (user.id.startsWith('sim-')) {
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
    document.querySelector('.topnav').classList.remove('hidden');
    navigate('dashboard');
  } else {
    document.querySelector('.topnav').classList.add('hidden');
    showOnboarding();
  }
}

/* ── Init Auth State ────────────────────────────────────────────── */
export async function initAuth() {
  const splash = document.getElementById('splash');
  
  try {
    // Check auth state while splash is still showing
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      setCurrentUser(session?.user || null);
    } else {
      const stored = localStorage.getItem('vaaniai_simulated_user');
      setCurrentUser(stored ? JSON.parse(stored) : null);
    }
  } catch (err) {
    console.error('Auth check failed:', err);
    setCurrentUser(null);
  }

  // Branded splash — 2.5s then dismiss
  setTimeout(() => {
    splash.classList.add('fade-out');

    setTimeout(() => {
      splash.classList.remove('active');

      const currentUser = getCurrentUser();
      if (currentUser) {
        checkOnboarding(currentUser);
      } else {
        showLoginPage();
      }
    }, 350);
  }, 2000);
}

/** Show the login page (auth-page needs flex, not block) */
export function showLoginPage() {
  document.querySelector('.topnav')?.classList.add('hidden');
  const loginPage = document.getElementById('page-login');
  if (loginPage) {
    loginPage.classList.add('active');
  }
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
      const user = { id: 'sim-1', email: 'user@gmail.com', name: 'Google User', app_metadata: { provider: 'google' } };
      setCurrentUser(user);
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(user));
      if (textSpan) textSpan.textContent = originalText;
      checkOnboarding(user);
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
      const user = { id: 'sim-github-1', email: 'githubuser@example.com', name: 'GitHub User', app_metadata: { provider: 'github' } };
      setCurrentUser(user);
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(user));
      if (textSpan) textSpan.textContent = originalText;
      checkOnboarding(user);
    }, 1000);
  }
}

/* ── UI Toggle ────────────────────────────────────────────────── */
export function switchAuthType(type) {
  document.getElementById('btn-email-toggle').classList.toggle('active', type === 'email');
  document.getElementById('btn-phone-toggle').classList.toggle('active', type === 'phone');
  
  const emailSection = document.getElementById('email-auth-section');
  const phoneSection = document.getElementById('phone-auth-section');
  const otpSection = document.getElementById('otp-auth-section');

  if (type === 'email') {
    emailSection.classList.remove('hidden');
    phoneSection.classList.add('hidden');
  } else {
    emailSection.classList.add('hidden');
    phoneSection.classList.remove('hidden');
  }
  otpSection.classList.add('hidden'); // reset otp on switch
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
    
    const user = data.user;
    setCurrentUser(user);
    checkOnboarding(user);
  } else {
    setTimeout(() => {
      btn.innerHTML = originalText;
      const user = { id: 'sim-email-1', email, name: 'Email User', app_metadata: { provider: 'email' } };
      setCurrentUser(user);
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(user));
      checkOnboarding(user);
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
    const originalText = btn ? btn.innerHTML : '';
    if (btn) btn.innerHTML = 'Signing up...';
    setTimeout(() => {
      if (btn) btn.innerHTML = originalText;
      const user = { id: 'sim-email-1', email, name: 'Email User', app_metadata: { provider: 'email' } };
      setCurrentUser(user);
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(user));
      checkOnboarding(user);
    }, 1000);
  }
}

/* ── Mobile Phone Auth (OTP) ──────────────────────────────────── */
export function updatePhonePlaceholder() {
  // Optional: could update placeholder based on country
}

export async function sendOTP() {
  const countryCode = document.getElementById('countryCode')?.value || '+91';
  const phoneNumber = document.getElementById('phoneInput').value.trim().replace(/\s/g, '');

  if (!phoneNumber || phoneNumber.length < 5) {
    alert('Please enter a valid phone number.');
    return;
  }

  currentPhone = countryCode + phoneNumber;
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
  document.getElementById('phone-auth-section').classList.add('hidden');
  document.getElementById('otp-auth-section').classList.remove('hidden');
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
      alert('Invalid code: ' + error.message);
      return;
    }
    setCurrentUser(data.user);
  } else {
    // Simulate OTP Verify
    await new Promise(r => setTimeout(r, 1000));
    btn.innerHTML = originalText;
    if (otp === '123456') {
      const user = { id: 'sim-2', phone: currentPhone, name: 'Mobile User', app_metadata: { provider: 'phone' } };
      setCurrentUser(user);
      localStorage.setItem('vaaniai_simulated_user', JSON.stringify(user));
    } else {
      alert("Invalid code. For simulation, use '123456'.");
      return;
    }
  }

  // Success
  document.getElementById('otpInput').value = '';
  checkOnboarding(getCurrentUser());
}

export function resetPhoneAuth() {
  document.getElementById('otp-auth-section').classList.add('hidden');
  document.getElementById('phone-auth-section').classList.remove('hidden');
  document.getElementById('otpInput').value = '';
}

export async function logout() {
  if (supabase) {
    await supabase.auth.signOut();
  } else {
    localStorage.removeItem('vaaniai_simulated_user');
  }
  setCurrentUser(null);
  document.querySelector('.topnav').classList.add('hidden');
  
  // Reset auth UI
  if (isSignUpMode) toggleEmailMode(); // Reset back to Log In mode
  resetPhoneAuth(); // Resets phone/otp internals
  switchAuthType('email'); // Reset back to Email tab (hides phone tab)
  document.getElementById('emailInput').value = '';
  document.getElementById('passwordInput').value = '';
  document.getElementById('phoneInput').value = '';
  
  // Ensure login page is visible
  showLoginPage();
}
