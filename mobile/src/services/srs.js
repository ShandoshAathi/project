/**
 * src/services/srs.js
 * Spaced Repetition System (SRS) logic for React Native mobile.
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  WORDS: 'vaaniFlashcards',
};

export async function getFlashcards() {
  const stored = await AsyncStorage.getItem(KEYS.WORDS);
  return stored ? JSON.parse(stored) : [];
}

export async function saveWord(word, definition) {
  const bank = await getFlashcards();
  
  // Don't duplicate
  if (bank.find(w => w.word.toLowerCase() === word.toLowerCase())) return bank;

  const newWord = {
    word,
    definition,
    level: 0, // SRS level (0 to 5)
    nextReview: Date.now(), // Review immediately
    addedAt: Date.now(),
  };

  bank.push(newWord);
  await AsyncStorage.setItem(KEYS.WORDS, JSON.stringify(bank));
  return bank;
}

export async function updateSRS(word, remembered) {
  const bank = await getFlashcards();
  const index = bank.findIndex(w => w.word === word);
  if (index === -1) return bank;

  const w = bank[index];
  if (remembered) {
    w.level = Math.min(5, w.level + 1);
  } else {
    w.level = Math.max(0, w.level - 1);
  }

  // Spaced Repetition intervals (in hours)
  const intervals = [0, 4, 24, 72, 168, 720]; // Immediate, 4h, 1d, 3d, 1w, 1mo
  w.nextReview = Date.now() + (intervals[w.level] * 60 * 60 * 1000);

  await AsyncStorage.setItem(KEYS.WORDS, JSON.stringify(bank));
  return bank;
}

export async function getDueWords() {
  const now = Date.now();
  const flashcards = await getFlashcards();
  return flashcards.filter(w => w.nextReview <= now);
}
