/**
 * voice_engine.js — Web Speech API wrapper for STT and TTS
 */

let recognition = null;
let isSpeaking = false;
let ttsEnabled = true;

/**
 * Initialize Speech Recognition
 */
export function initSpeechToText(onResult, onEnd, onError) {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    console.warn("Speech recognition not supported in this browser.");
    return null;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.lang = 'en-US';

  recognition.onresult = (event) => {
    const transcript = event.results[0][0].transcript;
    if (onResult) onResult(transcript);
  };

  recognition.onerror = (event) => {
    console.error("Speech Recognition Error:", event.error);
    if (onError) onError(event.error);
  };

  recognition.onend = () => {
    if (onEnd) onEnd();
  };

  return recognition;
}

export function startListening() {
  if (recognition) {
    try {
      recognition.start();
    } catch (e) {
      console.warn("Recognition already started or error:", e);
    }
  }
}

export function stopListening() {
  if (recognition) recognition.stop();
}

/**
 * Text to Speech
 */
export function speak(text) {
  if (!ttsEnabled || !('speechSynthesis' in window)) return;

  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  utterance.onstart = () => { isSpeaking = true; };
  utterance.onend = () => { isSpeaking = false; };

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
  isSpeaking = false;
}

export function toggleTTS(enabled) {
  ttsEnabled = enabled;
  if (!enabled) stopSpeaking();
}

export function isTTSEnabled() {
  return ttsEnabled;
}
