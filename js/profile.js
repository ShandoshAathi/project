/**
 * profile.js — User profile editing
 */
import { saveName } from './storage.js';

export function editProfile() {
  const name = prompt('Enter your name:', document.getElementById('profileName').textContent);
  if (name) {
    document.getElementById('profileName').textContent = name;
    document.getElementById('infoName').textContent    = name;
    saveName(name);
  }
}
