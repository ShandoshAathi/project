/**
 * src/services/voice.js
 * Web Speech API wrappers for Speech-to-Text (STT) and Text-to-Speech (TTS).
 */

let recognition = null;
let ttsEnabled = true;

export function initSpeechToText(onResult, onEnd, onError) {
  if (typeof window === 'undefined') return null;
  
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
  if (recognition) {
    try {
      recognition.stop();
    } catch (e) {
      console.warn("Recognition stop error:", e);
    }
  }
}

export function speak(text) {
  if (typeof window === 'undefined' || !ttsEnabled || !('speechSynthesis' in window)) return;

  // Stop any current speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.rate = 1.0;
  utterance.pitch = 1.0;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

export function toggleTTS(enabled) {
  ttsEnabled = enabled;
  if (!enabled) stopSpeaking();
}

export function isTTSEnabled() {
  return ttsEnabled;
}
