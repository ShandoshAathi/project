/**
 * profile.js — User profile editing
 */
import { saveProfile, getProfile } from './storage.js';
import { getCurrentUser } from './auth.js';
import { refreshProfile } from './main.js';

export async function editProfile() {
  const user = getCurrentUser();
  if (!user) return;

  const profile = await getProfile(user.id);
  if (profile) {
    document.getElementById('edit-name').value = profile.full_name || '';
    document.getElementById('edit-occupation').value = profile.occupation || '';
    document.getElementById('edit-age').value = profile.age || '';
    document.getElementById('edit-goal').value = profile.learning_goal || 'Improve Fluency';
  }

  document.getElementById('profile-edit-modal').classList.remove('hidden');
}

export function closeProfileModal() {
  document.getElementById('profile-edit-modal').classList.add('hidden');
}

export async function saveProfileEdit() {
  const name = document.getElementById('edit-name').value;
  const occ  = document.getElementById('edit-occupation').value;
  const age  = document.getElementById('edit-age').value;
  const goal = document.getElementById('edit-goal').value;

  if (!name) return alert("Name is required");

  const btn = document.querySelector('#profile-edit-modal .btn-primary');
  const originalText = btn.textContent;
  btn.textContent = 'Saving...';

  try {
    await saveProfile({
      full_name: name,
      occupation: occ,
      age: age,
      learning_goal: goal
    });
    
    closeProfileModal();
    refreshProfile();
  } catch (err) {
    console.error(err);
    alert("Save failed");
  } finally {
    btn.textContent = originalText;
  }
}
