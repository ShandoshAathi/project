/**
 * src/components/Onboarding.jsx
 * Onboarding form overlay to complete user profiles.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Onboarding({ onComplete }) {
  const { currentUser, handleSaveProfile } = useApp();
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
    <div id="onboarding-overlay" className="auth-page">
      <div className="auth-card animate-in">
        <div className="auth-header">
          <div className="auth-logo">V</div>
          <h2>Complete Your Profile</h2>
          <p>Help us personalize your learning journey</p>
        </div>

        <div id="onboarding-step-1">
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

          <button className="btn-primary auth-btn" onClick={handleFinish}>
            Finish Setup
          </button>
        </div>
      </div>
    </div>
  );
}
