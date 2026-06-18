/**
 * src/services/voice.js
 * Speech-to-Text (STT) and Text-to-Speech (TTS) integration using Expo Speech.
 */

import * as Speech from 'expo-speech';

let ttsEnabled = true;
let isRecording = false;
let recordingTimer = null;

export function initSpeechToText(onResult, onEnd, onError) {
  // Returns a simulator handle for speech recognition
  return {
    start: () => startListening(onResult, onEnd),
    stop: () => stopListening(onEnd)
  };
}

export function startListening(onResult, onEnd, targetText = "Hello World") {
  if (isRecording) return;
  isRecording = true;

  // Simulate speech processing delay
  recordingTimer = setTimeout(() => {
    isRecording = false;
    
    // Generate a simulated transcript close to the targetText
    // In a real native production app, this would bridge to @react-native-voice/voice
    let simulatedTranscript = targetText;
    
    // If the target text is too complex, let's keep it clean
    if (targetText && targetText.length > 5) {
      simulatedTranscript = targetText;
    } else {
      simulatedTranscript = "Hello VaaniAI Smart Coach!";
    }

    if (onResult) onResult(simulatedTranscript);
    if (onEnd) onEnd();
  }, 3500); // 3.5 seconds of listening simulation
}

export function stopListening(onEnd) {
  if (!isRecording) return;
  isRecording = false;
  if (recordingTimer) {
    clearTimeout(recordingTimer);
  }
  if (onEnd) onEnd();
}

export function speak(text) {
  if (!ttsEnabled) return;
  try {
    Speech.stop();
    Speech.speak(text, {
      language: 'en-US',
      pitch: 1.0,
      rate: 0.95,
      onError: (err) => console.warn("TTS Error:", err)
    });
  } catch (err) {
    console.warn("Speech Synthesis failed:", err);
  }
}

export function stopSpeaking() {
  try {
    Speech.stop();
  } catch (_) {}
}

export function toggleTTS(enabled) {
  ttsEnabled = enabled;
  if (!enabled) stopSpeaking();
}

export function isTTSEnabled() {
  return ttsEnabled;
}
