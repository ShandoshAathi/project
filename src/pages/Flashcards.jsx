/**
 * src/pages/Flashcards.jsx
 * Spaced Repetition Vocabulary Flashcards for VaaniAI.
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Flashcards() {
  const { 
    flashcards, 
    dueWords, 
    updateWordSRS 
  } = useApp();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const currentCard = dueWords[currentIndex];

  const handleReview = (remembered) => {
    if (!currentCard) return;

    // Trigger SRS update in AppContext
    updateWordSRS(currentCard.word, remembered);
    
    // Reset flip state and move index forward
    setIsFlipped(false);
    // Since dueWords will change reactively in context when we call updateWordSRS,
    // the current index might not need to be incremented because the reviewed card 
    // is immediately filtered out of `dueWords`! That is a beautiful advantage of React!
    // But let's be careful. If the card level is still 0 (meaning review immediately),
    // it could still be in `dueWords` depending on math. To be safe, let's keep the card index
    // stable or increment if the list length stays the same, or reset to 0.
    // Actually, because it is removed from dueWords, the next card naturally falls to index 0!
    // So resetting index to 0 or bounded index is perfect.
    setCurrentIndex(prev => {
      // If the word remains in the due list, move to next. Otherwise, stay at 0 as it updates.
      return 0;
    });
  };

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // 1. Empty state: No cards saved in the entire bank at all
  if (flashcards.length === 0) {
    return (
      <div className="page active" id="page-flashcards">
        <div className="flashcard-container">
          <div id="flashcard-stack">
            <div className="empty-state animate-in">
              <div className="empty-icon">🗂️</div>
              <h3>Your Word Bank is Empty</h3>
              <p>Save interesting words from the AI Coach to start practicing!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. Empty state: Has cards, but none are due right now
  if (dueWords.length === 0 || currentIndex >= dueWords.length) {
    return (
      <div className="page active" id="page-flashcards">
        <div className="flashcard-container">
          <div id="flashcard-stack">
            <div className="empty-state animate-in">
              <div className="empty-icon">✅</div>
              <h3>All caught up!</h3>
              <p>No words due for review right now. Come back later!</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active" id="page-flashcards">
      <div className="flashcard-container">
        <div className="flashcard-due-indicator">
          Card {currentIndex + 1} of {dueWords.length} due
        </div>

        <div id="flashcard-stack">
          <div 
            className={`flashcard ${isFlipped ? 'flipped' : ''}`} 
            onClick={handleFlip}
          >
            <div className="flashcard-front">
              <div className="flashcard-word">{currentCard.word}</div>
              <div className="flashcard-hint">Click to flip 🔄</div>
            </div>
            <div className="flashcard-back">
              <div className="flashcard-definition">{currentCard.definition}</div>
              <div className="flashcard-hint">Click to flip 🔄</div>
            </div>
          </div>
        </div>
        
        <div className="flashcard-actions" id="flashcard-controls">
          <button className="btn-wrong" onClick={() => handleReview(false)}>
            Forgot ❌
          </button>
          <button className="btn-correct" onClick={() => handleReview(true)}>
            Remembered ✅
          </button>
        </div>
      </div>
    </div>
  );
}
