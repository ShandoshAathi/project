/**
 * src/pages/Profile.jsx
 * User profile dashboard for VaaniAI.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Profile() {
  const { 
    currentUser, 
    resultsHistory, 
    streak, 
    level,
    setActivePage, 
    logoutUser,
    handleSaveProfile 
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: currentUser?.full_name || 'User',
    occupation: currentUser?.occupation || 'Not set',
    age: currentUser?.age || 24,
    native_language: currentUser?.native_language || 'English',
    learning_goal: currentUser?.learning_goal || 'General Learning'
  });

  const [saving, setSaving] = useState(false);

  const practice = (resultsHistory || []).filter(r => r.activity_type === 'practice');
  const avgScore = practice.length > 0
    ? Math.round(practice.reduce((acc, curr) => acc + curr.score, 0) / practice.length)
    : 0;

  const handleOpenEdit = () => {
    setFormData({
      full_name: currentUser?.full_name || 'User',
      occupation: currentUser?.occupation || 'Not set',
      age: currentUser?.age || 24,
      native_language: currentUser?.native_language || 'English',
      learning_goal: currentUser?.learning_goal || 'General Learning'
    });
    setIsEditing(true);
  };

  const handleCloseEdit = () => {
    setIsEditing(false);
  };

  const handleFormChange = (key, val) => {
    setFormData(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await handleSaveProfile(formData);
      setIsEditing(false);
    } catch (e) {
      console.error("Save profile error:", e);
    }
    setSaving(false);
  };

  // Get initials for avatar
  const getInitials = () => {
    const name = currentUser?.full_name || 'A';
    return name.charAt(0).toUpperCase();
  };

  return (
    <div className="page active" id="page-profile">
      <div className="profile-layout">
        {/* Left Side: Avatar Card */}
        <div className="profile-card card animate-in">
          <div className="profile-avatar-big">{getInitials()}</div>
          <h2 id="profileName">{currentUser?.full_name || 'User'}</h2>
          <p className="profile-tag">Level {level} Learner 🎓</p>
          
          <div className="profile-stats">
            <div className="ps">
              <h4 id="profile-lessons">{practice.length}</h4>
              <p>Lessons</p>
            </div>
            <div className="ps">
              <h4 id="profile-avg">{avgScore}%</h4>
              <p>Avg Score</p>
            </div>
            <div className="ps">
              <h4 id="profile-streak">{streak}</h4>
              <p>Day Streak</p>
            </div>
          </div>

          <div className="profile-actions-list">
            <button className="profile-action-btn" onClick={handleOpenEdit}>
              <span className="pbtn-icon">✏️</span> Edit Profile
            </button>
            <button className="profile-action-btn" onClick={() => setActivePage('settings')}>
              <span className="pbtn-icon">⚙️</span> Settings
            </button>
            <button className="profile-action-btn btn-danger-text" onClick={logoutUser}>
              <span className="pbtn-icon">🚪</span> Logout
            </button>
          </div>
        </div>

        {/* Right Side: Details and Achievements */}
        <div className="profile-details">
          {/* Personal Info Grid */}
          <div className="card animate-in">
            <h3>Personal Info</h3>
            <div className="info-grid" id="infoGrid">
              <div className="info-item">
                <label>Full Name</label>
                <p id="infoName">{currentUser?.full_name || 'User'}</p>
              </div>
              <div className="info-item">
                <label>Email</label>
                <p id="infoEmail">{currentUser?.email || 'user@example.com'}</p>
              </div>
              <div className="info-item">
                <label>Occupation</label>
                <p id="infoOccupation">{currentUser?.occupation || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Age</label>
                <p id="infoAge">{currentUser?.age || 'Not set'}</p>
              </div>
              <div className="info-item">
                <label>Language</label>
                <p id="infoLang">{currentUser?.native_language || 'English'}</p>
              </div>
              <div className="info-item">
                <label>Level</label>
                <p>Level {level} (Intermediate)</p>
              </div>
              <div className="info-item">
                <label>Joined</label>
                <p id="infoJoined">May 2026</p>
              </div>
              <div className="info-item">
                <label>Goal</label>
                <p id="infoGoal">{currentUser?.learning_goal || 'General Learning'}</p>
              </div>
            </div>
          </div>

          {/* Achievements badge grid */}
          <div className="card animate-in">
            <h3>Achievements</h3>
            <div className="achievements-grid">
              <div className={`achievement ${practice.length > 0 ? 'earned' : ''}`}>
                <div>🎯</div>
                <p>First Practice</p>
              </div>
              <div className={`achievement ${streak >= 7 ? 'earned' : ''}`}>
                <div>🔥</div>
                <p>7-Day Streak</p>
              </div>
              <div className={`achievement ${practice.length >= 10 ? 'earned' : ''}`}>
                <div>📚</div>
                <p>10 Lessons</p>
              </div>
              <div className={`achievement ${level >= 3 ? 'earned' : ''}`}>
                <div>🏆</div>
                <p>Master III</p>
              </div>
              <div className={`achievement ${avgScore >= 90 && practice.length > 0 ? 'earned' : ''}`}>
                <div>⭐</div>
                <p>Top Scorer</p>
              </div>
              <div className={`achievement ${practice.length >= 25 ? 'earned' : ''}`}>
                <div>🎓</div>
                <p>Graduate</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal (Using absolute stylesheet classes to keep styled design intact) */}
      {isEditing && (
        <div id="profile-edit-modal" className="auth-page active">
          <div className="auth-card animate-in">
            <div className="auth-header">
              <div className="auth-logo">P</div>
              <h2>Edit Profile</h2>
              <p>Update your personal information</p>
            </div>
            
            <div className="input-group">
              <label htmlFor="edit-name">Full Name</label>
              <input 
                type="text" 
                id="edit-name" 
                value={formData.full_name} 
                onChange={(e) => handleFormChange('full_name', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-occupation">Study / Job</label>
              <input 
                type="text" 
                id="edit-occupation" 
                value={formData.occupation} 
                onChange={(e) => handleFormChange('occupation', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-age">Age</label>
              <input 
                type="number" 
                id="edit-age" 
                value={formData.age} 
                onChange={(e) => handleFormChange('age', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="edit-goal">Learning Goal</label>
              <select 
                id="edit-goal"
                value={formData.learning_goal}
                onChange={(e) => handleFormChange('learning_goal', e.target.value)}
              >
                <option value="Improve Fluency">Improve Fluency</option>
                <option value="Pass an Exam (IELTS/TOEFL)">Pass an Exam (IELTS/TOEFL)</option>
                <option value="Business Communication">Business Communication</option>
                <option value="Daily Conversation">Daily Conversation</option>
                <option value="Public Speaking">Public Speaking</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="modal-actions">
              <button 
                className="btn-outline w-full" 
                onClick={handleCloseEdit}
                disabled={saving}
              >
                Cancel
              </button>
              <button 
                className="btn-primary w-full" 
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
