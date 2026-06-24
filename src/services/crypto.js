/**
 * src/services/crypto.js
 * Utility for AES encryption/decryption of user profile data.
 */

import CryptoJS from 'crypto-js';

// Use a secret key from environment variables, or a fallback for dev
const SECRET_KEY = import.meta.env.VITE_ENCRYPTION_KEY || 'vaaniai_default_secret_key_123';

export function encryptProfileData(data) {
  if (!data) return null;
  try {
    const jsonStr = JSON.stringify(data);
    const ciphertext = CryptoJS.AES.encrypt(jsonStr, SECRET_KEY).toString();
    return ciphertext;
  } catch (err) {
    console.error("Encryption failed:", err);
    return null;
  }
}

export function decryptProfileData(ciphertext) {
  if (!ciphertext) return null;
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    const decryptedStr = bytes.toString(CryptoJS.enc.Utf8);
    if (!decryptedStr) return null;
    return JSON.parse(decryptedStr);
  } catch (err) {
    console.warn("Decryption failed (might be legacy unencrypted data):", err);
    return null; // Signals that fallback to unencrypted data should be used
  }
}
