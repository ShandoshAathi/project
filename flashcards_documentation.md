# VaaniAI Flashcard System (SRS)

The Flashcard system in VaaniAI uses a **Spaced Repetition System (SRS)** to help users memorize vocabulary efficiently. 

## How it Works

The system tracks every saved word with an SRS level (0–5). Depending on whether the user remembers the word or not, the level increases or decreases, which changes the time interval before the word is shown again.

### SRS Levels & Intervals

| Level | Interval | Description |
|-------|----------|-------------|
| 0     | 0 hours  | Immediate review |
| 1     | 4 hours  | First repetition |
| 2     | 24 hours | Daily review |
| 3     | 72 hours | 3-day review |
| 4     | 168 hours| 1-week review |
| 5     | 720 hours| 1-month review (Mastery) |

## Core Logic (`js/flashcards.js`)

### `saveWord(word, definition)`
Saves a new word to the user's local bank. 
- **Default Level**: 0
- **Next Review**: Immediate

### `updateSRS(word, remembered)`
Updates the word's level based on user performance:
- **Remembered (✅)**: Level increases by 1 (max 5).
- **Forgot (❌)**: Level decreases by 1 (min 0).
- **Calculation**: Sets `nextReview` to `Date.now() + intervals[level]`.

### `getDueWords()`
Filters the flashcard bank for words where `nextReview <= Date.now()`. These are the words currently displayed in the "Flashcards" section.

## Integration

- **AI Coach**: Words can be saved directly from the AI Coach chat using `window.saveWordToFlashcards`.
- **Practice Section**: Words missed during pronunciation practice are automatically flagged for future integration (planned).

## Storage
Currently, all flashcard data is stored in `localStorage` under the key `vaaniFlashcards`. This ensures privacy and offline availability.
