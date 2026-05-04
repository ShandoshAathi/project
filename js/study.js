/**
 * study.js — Chapter loading & navigation
 */

const chapters = [
  { title: 'Chapter 1: Speed Reading Basics',
    body: '<p>Speed reading is the practice of reading text at a faster rate than average without losing comprehension. The key is to reduce subvocalization and expand your visual span...</p>' },
  { title: 'Chapter 2: Rhythm & Pacing',
    body: '<p>Every language has its own natural rhythm. English follows a stress-timed rhythm, meaning stressed syllables occur at roughly equal intervals...</p>' },
  { title: 'Chapter 3: Intonation Patterns',
    body: '<p>Intonation refers to the rise and fall of pitch in speech. Falling intonation signals finality, while rising intonation often indicates a question...</p>' },
  { title: 'Chapter 4: Stress & Emphasis',
    body: '<p>When we speak, we naturally place <strong>stress</strong> on certain words and syllables. This stress pattern helps listeners understand the <em>most important</em> information in a sentence.</p><br/><h4>Key Concepts:</h4><ul><li><strong>Word Stress</strong> – Emphasizing the correct syllable in a word</li><li><strong>Sentence Stress</strong> – Highlighting the most important word</li><li><strong>Contrastive Stress</strong> – Using stress to show contrast</li></ul>' },
  { title: 'Chapter 5: Advanced Pronunciation',
    body: '<p>Advanced pronunciation focuses on connected speech features: elision, assimilation, linking, and weak forms. These make fluent speech sound natural...</p>' },
  { title: 'Chapter 6: Practice Assessment',
    body: '<p>This chapter contains your module assessment. Practice all reading passages, record yourself, and compare your performance metrics over time...</p>' },
  { title: 'Chapter 7: Sentence Patterns (Module)',
    body: '<p>Mastering sentence patterns is crucial for verbal aptitude. Common patterns include <strong>S+V+O+C</strong> (Subject+Verb+Object+Complement) and <strong>S+V+O+A</strong> (Subject+Verb+Object+Adjunct). Understanding these helps in identifying grammatical errors quickly.</p>' },
  { title: 'Chapter 8: Advanced Tenses (Module)',
    body: '<p>Go beyond basic tenses. Learn about the <strong>Past Perfect Continuous</strong>, <strong>Future Perfect</strong>, and how they relate to the sequence of events in complex narratives.</p>' },
  { title: 'Chapter 9: Active & Passive Voice (Module)',
    body: '<p>Learn to convert between active and passive voice. Focus on special cases like imperatives, interrogatives, and verbs with two objects.</p>' },
  { title: 'Chapter 10: Reported Speech (Module)',
    body: '<p>Direct vs Indirect speech. Understand how tenses, pronouns, and time expressions change when reporting someone else\'s words.</p>' },
  { title: 'Chapter 11: Subject-Verb Agreement (Module)',
    body: '<p>Also known as <strong>Concord</strong>. Master the rules of singular and plural matching, especially with collective nouns and compound subjects.</p>' },
  { title: 'Chapter 12: Prepositions & Phrasal Verbs (Module)',
    body: '<p>Prepositions define relationships in space and time. Phrasal verbs combine verbs with prepositions to create unique meanings essential for natural English.</p>' },
  { title: 'Chapter 13: IF Conditionals (Module)',
    body: '<p>Understand the four types of conditionals: Zero, First, Second, and Third. Learn when to use "would", "could", and "had been" in hypothetical scenarios.</p>' },
  { title: 'Chapter 14: Adverbs & Modifiers (Module)',
    body: '<p>Correct placement of adverbs and avoiding dangling modifiers. Ensure your descriptive phrases clearly refer to the correct subject.</p>' },
  { title: 'Chapter 15: Articles & Determiners (Module)',
    body: '<p>Usage of "a", "an", "the", and quantifiers like "some", "any", "much", and "many". Essential for precise communication.</p>' },
];

let currentIdx = 0;

export function loadChapter(idx) {
  currentIdx = idx;
  document.querySelectorAll('.chapter-item').forEach((c, i) => {
    c.className = 'chapter-item' + (i < idx ? ' done' : i === idx ? ' active-ch' : '');
  });
  document.getElementById('chapterTitle').textContent = chapters[idx].title;
  document.getElementById('chapterBody').innerHTML    = chapters[idx].body;
  document.querySelector('.mini-fill').style.width     = `${Math.round(((idx + 1) / chapters.length) * 100)}%`;
  document.querySelector('.content-progress span').textContent = `${idx + 1} of ${chapters.length}`;

  localStorage.setItem('last_chapter_index', idx);
  localStorage.setItem('last_chapter_title', chapters[idx].title);
}

export function prevChapter() {
  if (currentIdx > 0) loadChapter(currentIdx - 1);
}

export function nextChapter() {
  if (currentIdx < chapters.length - 1) loadChapter(currentIdx + 1);
}
