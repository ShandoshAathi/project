/**
 * flashcards.js — Spaced Repetition System (SRS) for Vocabulary
 * Uses localStorage to save words and their "next review" date.
 */

const KEYS = {
  WORDS: 'vaaniFlashcards',
};

/**
 * Add a word to the SRS bank
 * @param {string} word 
 * @param {string} definition 
 */
export function saveWord(word, definition) {
  const bank = getFlashcards();
  
  // Don't duplicate
  if (bank.find(w => w.word.toLowerCase() === word.toLowerCase())) return;

  const newWord = {
    word,
    definition,
    level: 0, // SRS level (0 to 5)
    nextReview: Date.now(), // Review immediately
    addedAt: Date.now(),
  };

  bank.push(newWord);
  localStorage.setItem(KEYS.WORDS, JSON.stringify(bank));
}

export function getFlashcards() {
  const stored = localStorage.getItem(KEYS.WORDS);
  return stored ? JSON.parse(stored) : [];
}

/**
 * Update SRS level after a review
 * @param {string} word 
 * @param {boolean} remembered 
 */
export function updateSRS(word, remembered) {
  const bank = getFlashcards();
  const index = bank.findIndex(w => w.word === word);
  if (index === -1) return;

  const w = bank[index];
  if (remembered) {
    w.level = Math.min(5, w.level + 1);
  } else {
    w.level = Math.max(0, w.level - 1);
  }

  // Spaced Repetition intervals (in hours)
  const intervals = [0, 4, 24, 72, 168, 720]; // Immediate, 4h, 1d, 3d, 1w, 1mo
  w.nextReview = Date.now() + (intervals[w.level] * 60 * 60 * 1000);

  localStorage.setItem(KEYS.WORDS, JSON.stringify(bank));
}

export function getDueWords() {
  const now = Date.now();
  return getFlashcards().filter(w => w.nextReview <= now);
}
