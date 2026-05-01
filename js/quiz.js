/**
 * quiz.js — Quiz engine
 */
import { saveResult } from './storage.js';
import { generateQuizQuestions } from './ai_generator.js';

let questions = [
  { q: "Which of the following best describes 'word stress' in English?",
    opts: ["Speaking very loudly", "Emphasizing a particular syllable in a word",
           "Writing in capital letters", "Pausing between sentences"], ans: 1 },
  { q: "What is 'sentence stress'?",
    opts: ["Stressing every word equally", "Making all words louder",
           "Highlighting the most important word in a sentence", "Speaking very fast"], ans: 2 },
  { q: "Which word has stress on the FIRST syllable?",
    opts: ["banana", "guitar", "TABLE", "machine"], ans: 2 },
  { q: "Contrastive stress is used to:",
    opts: ["Slow down speech", "Show contrast between ideas",
           "Soften pronunciation", "Change grammatical structure"], ans: 1 },
  { q: "Which best improves reading fluency?",
    opts: ["Reading silently", "Memorizing dictionaries",
           "Reading aloud regularly with feedback", "Avoiding difficult words"], ans: 2 },
  { q: "Which vowel sound is often unstressed in English?", 
    opts: ["Schwa (ə)", "Long A", "Short O", "Diphthong"], ans: 0 },
  { q: "Falling intonation is most common in:", 
    opts: ["Yes/No questions", "Statements and WH-questions", "Listing items", "Expressing surprise"], ans: 1 },
  { q: "What is 'connected speech'?", 
    opts: ["Speaking very loudly", "Linking words together smoothly", "Reading one word at a time", "Pausing after every noun"], ans: 1 },
  { q: "The word 'Photography' has stress on which syllable?", 
    opts: ["1st (PHO-to-graphy)", "2nd (pho-TO-graphy)", "3rd (photo-GRAPH-y)", "4th (photograph-Y)"], ans: 1 },
  { q: "The symbol (') in a phonetic transcription indicates:", 
    opts: ["Secondary stress", "Primary stress", "Silent letter", "Long vowel"], ans: 1 },
];

let currentQ = 0;
let userAnswers = [];
let timerInterval = null;
let timeLeft = 30;

/* ── Public API ──────────────────────────────────────────────── */

export async function startQuiz() {
  const overlay = document.getElementById('quiz-start-overlay');
  const content = document.getElementById('quiz-content');
  if (overlay) overlay.classList.remove('hidden');
  if (content) content.classList.add('hidden');
  
  // Clear any existing timer
  if (timerInterval) clearInterval(timerInterval);
}

export async function initiateQuiz() {
  const overlay = document.getElementById('quiz-start-overlay');
  const content = document.getElementById('quiz-content');
  
  if (overlay) overlay.classList.add('hidden');
  if (content) content.classList.remove('hidden');

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '<div class="grid-span-2-center">✨ Generating personalized questions...</div>';

  const dynamicQs = await generateQuizQuestions();
  if (dynamicQs && dynamicQs.length > 0) {
    questions = dynamicQs;
  }

  currentQ = 0;
  userAnswers = new Array(questions.length).fill(null);
  timeLeft = 30;
  document.getElementById('nextBtn').style.display = '';
  document.getElementById('prevBtn').style.display = '';
  renderQuestion();
  startTimer();
}

export function nextQuestion() {
  if (currentQ < questions.length - 1) {
    currentQ++; timeLeft = 30;
    renderQuestion(); startTimer();
  } else {
    showResults();
  }
}

export function prevQuestion() {
  if (currentQ > 0) { currentQ--; renderQuestion(); }
}

export function goToQ(i) {
  currentQ = i; renderQuestion();
}

/* ── Internal ────────────────────────────────────────────────── */

function renderQuestion() {
  const q = questions[currentQ];
  document.getElementById('questionText').textContent = q.q;
  document.getElementById('quizNum').textContent = `Question ${currentQ + 1} of ${questions.length}`;
  document.getElementById('quizProgressFill').style.width = `${((currentQ + 1) / questions.length) * 100}%`;

  const grid = document.getElementById('optionsGrid');
  grid.innerHTML = '';
  q.opts.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
    btn.onclick = () => selectOption(btn, i);
    if (userAnswers[currentQ] !== null) {
      if (i === q.ans) btn.classList.add('correct');
      else if (i === userAnswers[currentQ]) btn.classList.add('wrong');
      btn.disabled = true;
    }
    grid.appendChild(btn);
  });

  document.getElementById('prevBtn').disabled = currentQ === 0;
  document.getElementById('nextBtn').textContent = currentQ === questions.length - 1 ? 'Finish' : 'Next →';
  updateQNav();
}

function selectOption(btn, idx) {
  userAnswers[currentQ] = idx;
  const grid = document.getElementById('optionsGrid');
  grid.querySelectorAll('.option-btn').forEach((b, i) => {
    b.disabled = true;
    if (i === questions[currentQ].ans) b.classList.add('correct');
    else if (i === idx) b.classList.add('wrong');
  });
  clearInterval(timerInterval);
  updateQNav();
}

function startTimer() {
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById('quizTimer').textContent = `⏱️ ${timeLeft}s`;
    if (timeLeft <= 0) { clearInterval(timerInterval); nextQuestion(); }
  }, 1000);
}

function updateQNav() {
  document.querySelectorAll('.q-dot').forEach((d, i) => {
    d.className = 'q-dot' + (i === currentQ ? ' active-q' : userAnswers[i] !== null ? ' answered' : '');
  });
}

function showResults() {
  clearInterval(timerInterval);
  const score = userAnswers.filter((a, i) => a === questions[i].ans).length;
  const pct = Math.round((score / questions.length) * 100);

  document.getElementById('optionsGrid').innerHTML = `
    <div class="grid-span-2-center">
      <div class="big-score-dynamic">${pct}%</div>
      <p class="score-desc">You got ${score} out of ${questions.length} correct</p>
      <button class="btn-primary mt-4" id="retryBtn">Try Again</button>
    </div>`;

  document.getElementById('retryBtn').onclick = () => startQuiz();
  document.getElementById('nextBtn').style.display = 'none';
  document.getElementById('prevBtn').style.display = 'none';
  saveResult(pct);
}
