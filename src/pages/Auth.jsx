/**
 * src/pages/Auth.jsx
 * Unified Sign-in / Sign-up page for VaaniAI.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { supabase } from '../services/supabase.js';

export default function Auth() {
  const { setCurrentUser, setActivePage } = useApp();
  const [authType, setAuthType] = useState('email'); // 'email' or 'phone'
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Inputs
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [countryCode, setCountryCode] = useState('+91');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  // Loadings and Feedback
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const checkOnboarding = (user) => {
    const profile = localStorage.getItem('vaaniai_simulated_profile');
    if (profile) {
      setActivePage('dashboard');
    } else {
      setActivePage('onboarding');
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    if (supabase) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } else {
      // Simulation
      setTimeout(() => {
        const user = { id: 'sim-1', email: 'user@gmail.com', full_name: 'Google User' };
        setCurrentUser(user);
        localStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Google User', learning_goal: 'Improve Fluency' }));
        setLoading(false);
        checkOnboarding(user);
      }, 1000);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    if (supabase) {
      await supabase.auth.signInWithOAuth({ provider: 'github' });
    } else {
      // Simulation
      setTimeout(() => {
        const user = { id: 'sim-github-1', email: 'githubuser@example.com', full_name: 'GitHub User' };
        setCurrentUser(user);
        localStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'GitHub User', learning_goal: 'Daily Conversation' }));
        setLoading(false);
        checkOnboarding(user);
      }, 1000);
    }
  };

  const handleEmailAction = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!email || !password) {
      setErrorMsg("Please fill in all fields.");
      return;
    }

    if (isSignUp && password.length < 8) {
      setErrorMsg("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    if (isSignUp) {
      // Sign Up
      if (supabase) {
        const { error } = await supabase.auth.signUp({ email, password });
        setLoading(false);
        if (error) return setErrorMsg("Signup failed: " + error.message);
        setSuccessMsg("Signup successful! Please check your email to verify your account, then log in.");
      } else {
        setTimeout(() => {
          const user = { id: 'sim-email-1', email, full_name: 'Email Learner' };
          setCurrentUser(user);
          setLoading(false);
          checkOnboarding(user);
        }, 1000);
      }
    } else {
      // Sign In
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) return setErrorMsg("Login failed: " + error.message);
        setCurrentUser(data.user);
        checkOnboarding(data.user);
      } else {
        setTimeout(() => {
          const user = { id: 'sim-email-1', email, full_name: 'Email Learner' };
          setCurrentUser(user);
          localStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Email Learner', learning_goal: 'Improve Fluency' }));
          setLoading(false);
          checkOnboarding(user);
        }, 1000);
      }
    }
  };

  const handleSendOTP = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    const cleanPhone = phone.trim().replace(/\s/g, '');
    if (!cleanPhone || cleanPhone.length < 5) {
      setErrorMsg('Please enter a valid phone number.');
      return;
    }

    setLoading(true);
    const fullPhone = countryCode + cleanPhone;

    if (supabase) {
      const { error } = await supabase.auth.signInWithOtp({ phone: fullPhone });
      setLoading(false);
      if (error) {
        setErrorMsg("Error sending code: " + error.message);
        return;
      }
    } else {
      // Simulation
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
    }
    setOtpSent(true);
  };

  const handleVerifyOTP = async () => {
    setErrorMsg('');
    setSuccessMsg('');
    if (!otp || otp.length < 6) {
      setErrorMsg("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    const fullPhone = countryCode + phone.trim().replace(/\s/g, '');

    if (supabase) {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: fullPhone,
        token: otp,
        type: 'sms'
      });
      setLoading(false);
      if (error) {
        setErrorMsg('Invalid code: ' + error.message);
        return;
      }
      setCurrentUser(data.user);
      checkOnboarding(data.user);
    } else {
      // Simulation
      await new Promise(r => setTimeout(r, 1000));
      setLoading(false);
      if (otp === '123456') {
        const user = { id: 'sim-2', phone: fullPhone, full_name: 'Mobile Learner' };
        setCurrentUser(user);
        localStorage.setItem('vaaniai_simulated_profile', JSON.stringify({ full_name: 'Mobile Learner', learning_goal: 'Daily Conversation' }));
        checkOnboarding(user);
      } else {
        setErrorMsg("Invalid code. For simulation, use '123456'.");
      }
    }
  };

  return (
    <div id="page-login" className="page auth-page active" style={{ display: 'flex' }}>
      <div className="auth-card animate-in">
        <div className="auth-header">
          <div className="auth-logo">V</div>
          <h2>Welcome Back</h2>
          <p>Sign in to continue your learning journey</p>
        </div>

        <div className="auth-options">
          {/* Social Logins */}
          <div className="social-auth-grid">
            <button className="btn-google" onClick={handleGoogleLogin} disabled={loading}>
              <svg className="google-icon" viewBox="0 0 48 48" width="20" height="20">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              </svg>
              <span>{loading && authType === 'google' ? 'Connecting...' : 'Google'}</span>
            </button>
            <button className="btn-github" onClick={handleGithubLogin} disabled={loading}>
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              <span>{loading && authType === 'github' ? 'Connecting...' : 'GitHub'}</span>
            </button>
          </div>

          <div className="auth-divider"><span>OR</span></div>

          {errorMsg && <div className="auth-error" style={{color: '#ff4d4f', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem'}}>{errorMsg}</div>}
          {successMsg && <div className="auth-success" style={{color: '#52c41a', marginBottom: '1rem', textAlign: 'center', fontSize: '0.9rem'}}>{successMsg}</div>}

          {/* Toggle Type */}
          <div className="auth-type-toggle">
            <button 
              className={`toggle-btn ${authType === 'email' ? 'active' : ''}`}
              onClick={() => { setAuthType('email'); setOtpSent(false); }}
            >
              Email
            </button>
            <button 
              className={`toggle-btn ${authType === 'phone' ? 'active' : ''}`}
              onClick={() => { setAuthType('phone'); setOtpSent(false); }}
            >
              Mobile
            </button>
          </div>

          {/* Email section */}
          {authType === 'email' && (
            <div id="email-auth-section">
              <div className="input-group">
                <label htmlFor="emailInput">Email Address</label>
                <input 
                  type="email" 
                  id="emailInput" 
                  placeholder="you@example.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="input-group">
                <label htmlFor="passwordInput">Password</label>
                <input 
                  type="password" 
                  id="passwordInput" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button 
                className="btn-primary auth-btn" 
                onClick={handleEmailAction}
                disabled={loading}
              >
                {loading ? 'Processing...' : (isSignUp ? 'Sign Up' : 'Log In')}
              </button>
              
              <div className="auth-footer-note">
                <span className="auth-hint-small">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </span>
                <button 
                  type="button" 
                  className="btn-outline w-full"
                  onClick={() => setIsSignUp(!isSignUp)}
                >
                  {isSignUp ? 'Log In to Existing Account' : 'Create an Account'}
                </button>
              </div>
            </div>
          )}

          {/* Phone section */}
          {authType === 'phone' && !otpSent && (
            <div id="phone-auth-section">
              <div className="input-group">
                <label htmlFor="phoneInput">Mobile Number</label>
                <div className="phone-input-wrapper">
                  <div className="phone-country-selector">
                    <select 
                      id="countryCode" 
                      title="Country code"
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                    >
                      <option value="+91">🇮🇳 +91</option>
                      <option value="+1">🇺🇸 +1</option>
                      <option value="+44">🇬🇧 +44</option>
                      <option value="+61">🇦🇺 +61</option>
                      <option value="+971">🇦🇪 +971</option>
                      <option value="+65">🇸🇬 +65</option>
                      <option value="+60">🇲🇾 +60</option>
                      <option value="+94">🇱👑 +94</option>
                      <option value="+880">🇧🇩 +880</option>
                      <option value="+92">🇵🇰 +92</option>
                    </select>
                  </div>
                  <input 
                    type="tel" 
                    id="phoneInput" 
                    placeholder="98765 43210" 
                    className="phone-number-input" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>
              <button 
                className="btn-primary auth-btn" 
                onClick={handleSendOTP}
                disabled={loading}
              >
                {loading ? 'Sending...' : '📱 Send Verification Code'}
              </button>
            </div>
          )}

          {/* OTP verify section */}
          {authType === 'phone' && otpSent && (
            <div id="otp-auth-section">
              <label htmlFor="otpInput">Enter Verification Code</label>
              <p className="auth-hint">We sent a 6-digit code to your phone.</p>
              <div className="otp-group">
                <input 
                  type="text" 
                  id="otpInput" 
                  placeholder="123456" 
                  maxLength={6} 
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              <button 
                className="btn-primary auth-btn" 
                onClick={handleVerifyOTP}
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button 
                className="btn-text" 
                onClick={() => setOtpSent(false)}
              >
                Change Phone Number
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
