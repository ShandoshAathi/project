import { saveResult, addXP, getCurrentSubject } from './storage.js';
import { GEMINI_API_KEY } from './config.js';
import { generatePracticePassage } from './ai_generator.js';
import { saveWord } from './flashcards.js';

export function refreshPracticeUI() {
  const subject = getCurrentSubject();
  const isCoding = subject !== 'English';
  
  // Update Overlay
  const overlayTitle = document.querySelector('#practice-start-overlay h2');
  const overlayDesc = document.querySelector('#practice-start-overlay p');
  const overlayGoal = document.querySelector('#practice-start-overlay .qm-item:last-child span:last-child');
  const overlayActivity = document.querySelector('#practice-start-overlay .qm-item:first-child span:last-child');
  
  if (overlayTitle) overlayTitle.textContent = isCoding ? `${subject} Code Analysis` : 'Ready for Practice?';
  if (overlayDesc) overlayDesc.textContent = isCoding ? `Analyze the generated ${subject} snippet and explain its logic verbally.` : 'Improve your pronunciation by reading dynamic passages aloud.';
  if (overlayGoal) overlayGoal.textContent = isCoding ? 'Logic & Technical Clarity' : 'Accuracy & Fluency';
  if (overlayActivity) overlayActivity.textContent = isCoding ? 'Code Explainer' : 'Read Aloud';

  // Update Main Practice UI
  const practiceTitle = document.querySelector('.practice-header h3');
  if (practiceTitle) practiceTitle.textContent = isCoding ? 'Code Explainer' : 'Read Aloud';
  
  const passageContainer = document.getElementById('practicePassage');
  if (passageContainer) {
    passageContainer.classList.toggle('is-code', isCoding);
  }
  
  // Update Metrics Labels
  const metrics = document.querySelectorAll('.feedback-metrics .metric span:first-child');
  if (metrics.length >= 4) {
    if (isCoding) {
      metrics[0].textContent = 'Logic';
      metrics[1].textContent = 'Clarity';
      metrics[2].textContent = 'Keywords';
      metrics[3].textContent = 'Complexity';
    } else {
      metrics[0].textContent = 'Accuracy';
      metrics[1].textContent = 'Fluency';
      metrics[2].textContent = 'Pronunciation';
      metrics[3].textContent = 'Speed';
    }
  }
}

/* ── Passages ─────────────────────────────────────────────────── */
const passagesData = {
  'English': [
    "The sun rises in the east and sets in the west. Every morning brings a new beginning, full of possibilities and opportunities waiting to be discovered.",
    "Reading is a gateway to the world of knowledge. It opens doors to new ideas, cultures, and experiences that we might never encounter in our daily lives.",
    "Language is the most powerful tool humans possess. Through words, we share our thoughts, emotions, and dreams with others across time and distance.",
    "Education is the foundation of progress. By learning new skills and expanding our knowledge, we prepare ourselves for the challenges of tomorrow."
  ],
  'Python': [
    "def greet(name):\n    return f'Hello, {name}!'\n\n# Explain how this function uses f-strings to format the greeting.",
    "numbers = [1, 2, 3, 4, 5]\nsquares = [n**2 for n in numbers]\n\n# Describe how this list comprehension works to create a new list of squares.",
    "import requests\nresponse = requests.get('https://api.github.com')\n\n# Explain the process of making an HTTP GET request using the requests library."
  ],
  'Java': [
    "public class Main {\n    public static void main(String[] args) {\n        System.out.println(\"Hello World\");\n    }\n}\n\n# Explain the structure of a basic Java class and the main method."
  ]
};

function getFallbackPassages() {
  const subject = getCurrentSubject();
  return passagesData[subject] || passagesData['English'];
}

/* ── State ────────────────────────────────────────────────────── */
let isRecording = false;
let recognition = null;
let wordTimer   = null;
let recordedWords = [];   // track which words were "spoken"
let finalTranscript = ''; // complete spoken text for AI evaluation
let lastPassageIndex = -1;

/* ── Recording ────────────────────────────────────────────────── */

export function toggleMic() {
  if (!isRecording) startRecording(); else stopRecording();
}

function startRecording() {
  isRecording = true;
  recordedWords = [];
  finalTranscript = '';
  document.getElementById('micBtn').classList.add('recording');
  setStatus('🔴 Recording… Speak now!', '#EF4444');

  /* Reset highlights */
  document.querySelectorAll('#passageText .word').forEach(w => {
    w.className = 'word';
  });

  if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.onresult = e => {
      const t = Array.from(e.results).map(r => r[0].transcript).join(' ');
      finalTranscript = t;
      highlightWords(t);
    };
    recognition.onerror = () => stopRecording();
    recognition.onend = () => { 
      // If the browser stops it due to silence, but the user hasn't clicked stop, restart it
      if (isRecording) recognition.start(); 
    };
    recognition.start();
  } else {
    /* Simulate word-by-word highlighting */
    let i = 0;
    const words = document.querySelectorAll('#passageText .word');
    const total = words.length;
    wordTimer = setInterval(() => {
      /* Mark previous word as correct/wrong */
      if (i > 0 && words[i - 1]) {
        words[i - 1].className = 'word ' + (Math.random() > 0.15 ? 'correct' : 'wrong');
        recordedWords.push(i - 1);
      }
      /* Highlight current word */
      if (i < total) {
        words[i].className = 'word highlight';
        i++;
      } else {
        clearInterval(wordTimer);
        wordTimer = null;
        stopRecording();
      }
    }, 1000); // Slowed down from 300ms to 1000ms for better UX
  }
}

function stopRecording() {
  isRecording = false;
  document.getElementById('micBtn').classList.remove('recording');
  if (recognition) { recognition.stop(); recognition = null; }
  if (wordTimer) { clearInterval(wordTimer); wordTimer = null; }

  /* Convert any remaining highlighted words to correct */
  document.querySelectorAll('#passageText .word').forEach((w, i) => {
    if (w.classList.contains('highlight')) {
      w.className = 'word correct';
      recordedWords.push(i);
    }
  });

  /* If no words were processed, mark all as correct (simulation didn't run) */
  if (recordedWords.length === 0) {
    document.querySelectorAll('#passageText .word').forEach((w, i) => {
      w.className = 'word correct';
      recordedWords.push(i);
    });
  }

  setStatus('✅ Recording complete! Click Submit.', '#10B981');
}

function highlightWords(transcript) {
  const spoken = transcript.toLowerCase().split(/\s+/);
  document.querySelectorAll('#passageText .word').forEach((s, i) => {
    const w = s.textContent.toLowerCase().replace(/[^a-z]/g, '');
    if (spoken.includes(w)) {
      s.className = 'word correct';
      if (!recordedWords.includes(i)) recordedWords.push(i);
    }
  });
}

/* ── Passages ─────────────────────────────────────────────────── */

export function startPractice() {
  const overlay = document.getElementById('practice-start-overlay');
  const content = document.getElementById('practice-content');
  if (overlay) overlay.classList.remove('hidden');
  if (content) content.classList.add('hidden');
}

export async function initiatePractice() {
  const overlay = document.getElementById('practice-start-overlay');
  const content = document.getElementById('practice-content');
  if (overlay) overlay.classList.add('hidden');
  if (content) content.classList.remove('hidden');
  
  newPassage();
}

export async function newPassage() {
  if (isRecording) stopRecording();
  recordedWords = [];
  
  const statusEl = document.getElementById('micStatus');
  statusEl.textContent = "✨ Generating dynamic content...";
  
  let p;
  try {
    p = await generatePracticePassage();
  } catch (e) {
    p = null;
  }
  
  if (!p) {
    const fallbacks = getFallbackPassages();
    p = fallbacks[Math.floor(Math.random() * fallbacks.length)];
    statusEl.textContent = "ℹ️ Using library passage (AI failed/offline).";
  } else {
    setStatus('Click to Start Recording', '');
  }
  
  loadPassage(p);
}

function loadPassage(text) {
  document.getElementById('passageText').innerHTML =
    text.split(' ').map((w, i) => `<span class="word" id="w${i}">${w}</span>`).join(' ');
}

/* ── Submit ────────────────────────────────────────────────────── */

export async function submitPractice() {
  /* Stop recording if still active */
  if (isRecording) stopRecording();

  const originalPassage = document.getElementById('passageText').textContent;
  const allWords = document.querySelectorAll('#passageText .word');
  const total    = allWords.length;

  /* If user hasn't recorded, auto-simulate a quick result */
  if (recordedWords.length === 0) {
    allWords.forEach((w, i) => {
      const rnd = Math.random();
      w.className = 'word ' + (rnd > 0.2 ? 'correct' : 'wrong');
      recordedWords.push(i);
    });
    finalTranscript = "I didn't read anything clearly.";
  }

  const subject = getCurrentSubject();
  const isCoding = subject !== 'English';

  // Set loading state
  setStatus(`🤖 AI is evaluating your ${isCoding ? 'explanation' : 'reading'}...`, '#6366F1');

  let v1, v2, v3, v4;

  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
    try {
      const prompt = isCoding ? 
        `You are a Senior ${subject} Developer. Evaluate the user's verbal explanation of this code snippet.
Code Snippet: "${originalPassage}"
User's Explanation: "${finalTranscript}"

Evaluate Logic, Clarity, Keywords usage, and Complexity understanding out of 100.
Respond ONLY with a valid JSON object:
{ "v1": 0, "v2": 0, "v3": 0, "v4": 0 }` :
        `You are an expert English language tutor. Evaluate the user's reading performance.
Original Passage: "${originalPassage}"
User's Spoken Transcript: "${finalTranscript}"

Evaluate accuracy, fluency, pronunciation, and speed out of 100.
Respond ONLY with a valid JSON object:
{ "v1": 0, "v2": 0, "v3": 0, "v4": 0 }`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      });

      const data = await response.json();
      let textResponse = data.candidates[0].content.parts[0].text;
      
      // Clean markdown if Gemini still included it
      textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const evaluation = JSON.parse(textResponse);
      v1 = evaluation.v1 || 0;
      v2 = evaluation.v2 || 0;
      v3 = evaluation.v3 || 0;
      v4 = evaluation.v4 || 0;

    } catch (error) {
      console.error("Gemini API Error:", error);
      setStatus('⚠️ AI Evaluation failed. Using simulation.', '#EF4444');
      // Fallback
      v1 = 70; v2 = 70; v3 = 70; v4 = 70;
    }
  } else {
    // SIMULATED EVALUATION (Fallback)
    const correct = document.querySelectorAll('#passageText .word.correct').length;
    v1 = Math.min(100, Math.round((correct / Math.max(total, 1)) * 100));
    v2 = Math.min(100, Math.round(v1 * 0.85 + Math.random() * 15));
    v3 = Math.min(100, Math.round(v1 * 0.9  + Math.random() * 10));
    v4 = Math.min(100, Math.round(50 + Math.random() * 40));
  }

  const overall = Math.round(v1 * 0.35 + v2 * 0.25 + v3 * 0.25 + v4 * 0.15);

  animateRing(overall);
  updateMetrics([v1, v2, v3, v4]);
  updateTip(v4, v2, v3, v1);
  addSessionEntry(overall);

  setStatus(
    `🎉 Score: ${overall}% — ${overall >= 80 ? 'Excellent!' : overall >= 60 ? 'Good work!' : 'Keep practicing!'}`,
    overall >= 80 ? '#10B981' : overall >= 60 ? '#00D4FF' : '#F59E0B'
  );

  saveResult(overall, 'practice');
  addXP(Math.round(overall * 1.5)); // Up to 150 XP per session

  /* Learning Loop: Save missed words to Flashcards */
  const missedWords = Array.from(allWords)
    .filter(w => w.classList.contains('wrong') || (!w.classList.contains('correct') && !w.classList.contains('highlight')))
    .map(w => w.textContent.replace(/[^a-zA-Z]/g, '').toLowerCase())
    .filter(w => w.length > 2); // Avoid saving tiny words

  if (missedWords.length > 0) {
    const uniqueMissed = [...new Set(missedWords)];
    uniqueMissed.forEach(word => {
      saveWord(word, "Pronunciation review required (from Practice)");
    });
    console.log(`[VaaniAI] Saved ${uniqueMissed.length} words to Flashcards.`);
  }

  recordedWords = [];   // reset for next round
  finalTranscript = ''; // reset transcript
}

/* ── Helpers ──────────────────────────────────────────────────── */

function setStatus(text, color) {
  const el = document.getElementById('micStatus');
  el.textContent = text;
  el.style.color = color;
}

function animateRing(overall) {
  const circumference = 2 * Math.PI * 40;
  const dashLen = Math.round((overall / 100) * circumference);
  const circle  = document.querySelector('.ring-svg circle:nth-child(2)');
  if (circle) {
    circle.style.transition = 'stroke-dasharray 1s ease';
    circle.setAttribute('stroke-dasharray', `${dashLen} ${circumference}`);
  }
  const scoreEl = document.querySelector('.ring-score');
  if (!scoreEl) return;
  let cur = 0;
  const anim = setInterval(() => {
    cur += 2;
    if (cur >= overall) { cur = overall; clearInterval(anim); }
    scoreEl.textContent = cur + '%';
  }, 20);
}

function updateMetrics(values) {
  document.querySelectorAll('.feedback-metrics .metric').forEach((m, i) => {
    const valEl = m.querySelector('.metric-val');
    if (!valEl) return;
    valEl.textContent = values[i] + '%';
    valEl.className = 'metric-val ' + (values[i] >= 80 ? 'good' : values[i] >= 60 ? 'ok' : 'warn');
  });
}

function updateTip(speed, fluency, pronunciation, accuracy) {
  const tips = [
    { cond: speed < 60,          text: '💡 Tip: Try reading at a more consistent pace for better speed scores.' },
    { cond: fluency < 70,        text: '💡 Tip: Work on your pacing – try reading slightly slower for better clarity.' },
    { cond: pronunciation < 75,  text: '💡 Tip: Focus on pronouncing each word clearly, especially longer words.' },
    { cond: accuracy < 80,       text: '💡 Tip: Make sure to read every word in the passage. Practice the tricky ones.' },
    { cond: true,                text: '🎉 Great job! Keep practicing to maintain your excellent scores!' },
  ];
  const tip = tips.find(t => t.cond);
  const el  = document.querySelector('.feedback-tip p');
  if (el) el.innerHTML = `<strong>${tip.text.split(':')[0]}:</strong>${tip.text.split(':').slice(1).join(':')}`;
}

function addSessionEntry(score) {
  const list = document.querySelector('.session-list');
  if (!list) return;
  const count = list.querySelectorAll('.session-item').length + 1;
  const cls = score >= 80 ? 'good' : score >= 60 ? 'ok' : 'warn';
  const div = document.createElement('div');
  div.className = 'session-item';
  div.innerHTML = `<span>Session ${count}</span><span class="${cls}">${score}%</span>`;
  list.appendChild(div);
}
