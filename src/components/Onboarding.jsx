/**
 * src/components/Onboarding.jsx
 * Onboarding form overlay to complete user profiles.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Onboarding({ onComplete }) {
  const { currentUser, handleSaveProfile } = useApp();
  const [step, setStep] = useState(1);
  const [agreedToPrivacy, setAgreedToPrivacy] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [agreedToCookies, setAgreedToCookies] = useState(false);
  
  const [formData, setFormData] = useState({
    name: currentUser?.full_name || '',
    occupation: '',
    age: '',
    language: 'Tamil',
    goal: 'Improve Fluency'
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    const key = id.replace('onboard-', '');
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleNextStep = () => {
    if (step === 1 && agreedToPrivacy) {
      setStep(2);
    } else if (step === 2 && agreedToTerms) {
      setStep(3);
    } else if (step === 3 && agreedToCookies) {
      setStep(4);
    }
  };

  const getHeaderInfo = () => {
    if (step === 1) return { title: 'Privacy Policy & Data Usage', desc: 'Please review how we handle your data before continuing' };
    if (step === 2) return { title: 'Terms & Conditions', desc: 'Please read and agree to our terms of service' };
    if (step === 3) return { title: 'Cookies Policy', desc: 'Understand how we use cookies to improve your experience' };
    return { title: 'Complete Your Profile', desc: 'Help us personalize your learning journey' };
  };
  const headerInfo = getHeaderInfo();

  const handleFinish = async () => {
    if (!formData.name.trim()) {
      alert("Please enter your name");
      return;
    }

    const profileData = {
      full_name: formData.name,
      occupation: formData.occupation,
      age: formData.age ? parseInt(formData.age) : null,
      native_language: formData.language,
      learning_goal: formData.goal,
      privacy_accepted: true,
      updated_at: new Date().toISOString()
    };

    try {
      await handleSaveProfile(profileData);
      if (onComplete) onComplete();
    } catch (err) {
      console.error("Failed to save profile:", err);
    }
  };

  return (
    <div id="onboarding-overlay" className="auth-page" style={{ display: 'flex', overflowY: 'auto', padding: '2rem 0' }}>
      <div className="auth-card animate-in" style={{ maxWidth: '600px', margin: 'auto' }}>
        <div className="auth-header">
          <div className="auth-logo">V</div>
          <h2>{headerInfo.title}</h2>
          <p>{headerInfo.desc}</p>
        </div>

        {step === 1 && (
          <div id="onboarding-step-1" style={{ textAlign: 'left' }}>
            <div className="privacy-policy-content" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6' }}>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>What information do we collect?</h3>
              <p>We ask for basic profile details including your <strong>Name, Occupation, Age, Native Language, and Learning Goal</strong>. We also collect your chat interactions and practice results.</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Why do we use it?</h3>
              <ul style={{ paddingLeft: '1.5rem', marginBottom: '1rem' }}>
                <li><strong>Personalized AI Coach:</strong> Your occupation and age help our AI understand your context and generate relevant scenarios.</li>
                <li><strong>Adaptive Difficulty:</strong> Your learning goal and language allow us to tailor the difficulty and explanations to your exact level.</li>
                <li><strong>Progress Tracking:</strong> Your practice results are used to track your growth and adjust the syllabus over time.</li>
              </ul>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>Data Security & AI Generation</h3>
              <p>Your details form the basis of the prompts sent to our AI providers (like Groq/Llama 3) to generate unique, on-the-fly learning content. We do not sell your personal data to third parties.</p>
            </div>

            <div className="privacy-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="privacy-agree" 
                checked={agreedToPrivacy}
                onChange={(e) => setAgreedToPrivacy(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="privacy-agree" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                I have read and agree to the Privacy Policy and Data Usage terms.
              </label>
            </div>

            <button 
              className="btn-primary auth-btn" 
              onClick={handleNextStep}
              disabled={!agreedToPrivacy}
              style={{ opacity: agreedToPrivacy ? 1 : 0.5, cursor: agreedToPrivacy ? 'pointer' : 'not-allowed' }}
            >
              Accept & Continue
            </button>
          </div>
        )}

        {step === 2 && (
          <div id="onboarding-step-2" style={{ textAlign: 'left' }}>
            <div className="privacy-policy-content" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', maxHeight: '300px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>Terms of Service</h3>
              <p>Welcome to VaaniAI! By using our application, you agree to the following terms and conditions.</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>1. Usage Restrictions</h3>
              <p>You agree not to misuse the platform. This includes attempting to reverse-engineer the AI, generating malicious or offensive content, or attempting to compromise the application's security.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>2. Account Responsibility</h3>
              <p>You are responsible for maintaining the confidentiality of your account credentials. All activities that occur under your account are your responsibility.</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>3. Service Availability</h3>
              <p>While we strive for 100% uptime, our AI models (like Groq) may occasionally experience downtime. We are not liable for service interruptions.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>4. Subscriptions & Payments</h3>
              <p>In the future, VaaniAI may offer premium subscription plans. By subscribing, you agree to pay the recurring fees associated with your chosen plan. You can join a subscription directly through the application's billing portal when the feature becomes available.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>5. Refund Policy</h3>
              <p>Subscription fees are billed in advance and are non-refundable. If you cancel your subscription, you will retain access to the premium features until the end of your current billing cycle. We do not offer prorated refunds for partial months of service.</p>
            </div>

            <div className="privacy-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="terms-agree" 
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="terms-agree" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                I have read and agree to the Terms & Conditions.
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-outline auth-btn" onClick={() => setStep(1)} style={{ flex: 1 }}>
                Back
              </button>
              <button 
                className="btn-primary auth-btn" 
                onClick={handleNextStep}
                disabled={!agreedToTerms}
                style={{ flex: 2, opacity: agreedToTerms ? 1 : 0.5, cursor: agreedToTerms ? 'pointer' : 'not-allowed' }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div id="onboarding-step-3" style={{ textAlign: 'left' }}>
            <div className="privacy-policy-content" style={{ background: 'rgba(255,255,255,0.05)', padding: '1.5rem', borderRadius: '12px', marginBottom: '1.5rem', fontSize: '0.95rem', lineHeight: '1.6', maxHeight: '300px', overflowY: 'auto' }}>
              <h3 style={{ marginBottom: '1rem', color: '#fff' }}>How We Use Cookies</h3>
              <p>We use cookies and similar tracking technologies to enhance your experience on VaaniAI.</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>1. Essential Cookies</h3>
              <p>These cookies are required for the application to function properly, such as keeping you securely logged into your account.</p>

              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>2. Analytics & Performance</h3>
              <p>We use analytics to understand how you interact with our lessons and AI coach, which helps us improve the quality and relevance of the content generated for you.</p>
              
              <h3 style={{ marginTop: '1.5rem', marginBottom: '1rem', color: '#fff' }}>3. Your Choices</h3>
              <p>By continuing to use this application, you consent to our use of essential and performance cookies. You can manage your preferences at any time in your browser settings.</p>
            </div>

            <div className="privacy-checkbox" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem' }}>
              <input 
                type="checkbox" 
                id="cookies-agree" 
                checked={agreedToCookies}
                onChange={(e) => setAgreedToCookies(e.target.checked)}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
              <label htmlFor="cookies-agree" style={{ cursor: 'pointer', fontSize: '0.95rem' }}>
                I have read and agree to the Cookies Policy.
              </label>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-outline auth-btn" onClick={() => setStep(2)} style={{ flex: 1 }}>
                Back
              </button>
              <button 
                className="btn-primary auth-btn" 
                onClick={handleNextStep}
                disabled={!agreedToCookies}
                style={{ flex: 2, opacity: agreedToCookies ? 1 : 0.5, cursor: agreedToCookies ? 'pointer' : 'not-allowed' }}
              >
                Accept & Continue
              </button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div id="onboarding-step-4">
            <div className="input-group">
              <label htmlFor="onboard-name">Full Name</label>
              <input 
                type="text" 
                id="onboard-name" 
                placeholder="John Doe" 
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            
            <div className="social-auth-grid mb-6">
              <div className="input-group">
                <label htmlFor="onboard-occupation">Study / Job</label>
                <input 
                  type="text" 
                  id="onboard-occupation" 
                  placeholder="Software Engineer" 
                  value={formData.occupation}
                  onChange={handleChange}
                />
              </div>
              <div className="input-group">
                <label htmlFor="onboard-age">Age</label>
                <input 
                  type="number" 
                  id="onboard-age" 
                  placeholder="24" 
                  value={formData.age}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="onboard-language">Native Language</label>
              <select 
                id="onboard-language" 
                title="Select your native language"
                value={formData.language}
                onChange={handleChange}
              >
                <option value="Tamil">Tamil</option>
                <option value="Hindi">Hindi</option>
                <option value="Malayalam">Malayalam</option>
                <option value="Telugu">Telugu</option>
                <option value="Kannada">Kannada</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="onboard-goal">Learning Goal</label>
              <select 
                id="onboard-goal" 
                title="Select your learning goal"
                value={formData.goal}
                onChange={handleChange}
              >
                <option value="Improve Fluency">Improve Fluency</option>
                <option value="Pass an Exam (IELTS/TOEFL)">Pass an Exam (IELTS/TOEFL)</option>
                <option value="Business Communication">Business Communication</option>
                <option value="Daily Conversation">Daily Conversation</option>
                <option value="Public Speaking">Public Speaking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn-outline auth-btn" onClick={() => setStep(3)} style={{ flex: 1 }}>
                Back
              </button>
              <button className="btn-primary auth-btn" onClick={handleFinish} style={{ flex: 2 }}>
                Finish Setup
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
