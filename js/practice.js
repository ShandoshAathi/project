/**
 * practice.js — Mic recording, passage management, feedback
 */
import { saveResult } from './storage.js';
import { GEMINI_API_KEY } from './config.js';
import { generatePracticePassage } from './ai_generator.js';

/* ── Passages ─────────────────────────────────────────────────── */
const passages = [
  "The sun rises in the east and sets in the west. Every morning brings a new beginning, full of possibilities and opportunities waiting to be discovered.",
  "Reading is a gateway to the world of knowledge. It opens doors to new ideas, cultures, and experiences that we might never encounter in our daily lives.",
  "Language is the most powerful tool humans possess. Through words, we share our thoughts, emotions, and dreams with others across time and distance.",
  "Education is the foundation of progress. By learning new skills and expanding our knowledge, we prepare ourselves for the challenges of tomorrow.",
  "Nature teaches us patience and resilience. The trees grow slowly but stand strong for centuries, reminding us that great things take time.",
  "Technology is a double-edged sword. It can connect us with people halfway around the world, but it can also make us feel more isolated than ever before.",
  "The ocean covers more than seventy percent of our planet. It is home to millions of species, many of which remain undiscovered in the deep dark waters.",
  "Music is a universal language that transcends all boundaries. It can move us to tears or make us dance with joy, regardless of where we come from.",
  "Perseverance is the key to success. No matter how many times we fall, the important thing is to get back up and keep moving toward our goals.",
  "Traveling allows us to see the world from different perspectives. It challenges our assumptions and helps us grow into more open-minded individuals.",
  "Healthy habits are essential for a long and happy life. Eating well and staying active provide the energy we need to pursue our passions every day.",
  "The stars in the night sky have inspired dreamers for millennia. They remind us of the vastness of the universe and our place within its infinite beauty.",
  "A single act of kindness can change someone's entire day. It ripples outward, creating a wave of positivity that touches the lives of many others.",
  "Curiosity is the engine of discovery. By asking questions and seeking answers, we uncover the secrets of the world around us and within ourselves.",
  "Time is our most precious resource. Once it is gone, we can never get it back, so we must make the most of every moment we are given.",
];

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
  const originalStatus = statusEl.textContent;
  statusEl.textContent = "✨ Generating dynamic passage...";
  
  let p;
  try {
    p = await generatePracticePassage();
  } catch (e) {
    p = null;
  }
  
  if (!p) {
    let nextIdx;
    do {
      nextIdx = Math.floor(Math.random() * passages.length);
    } while (nextIdx === lastPassageIndex);
    
    lastPassageIndex = nextIdx;
    p = passages[nextIdx];
  }
  
  loadPassage(p);
  setStatus('Click to Start Recording', '');
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

  // Set loading state
  setStatus('🤖 AI is evaluating your reading...', '#6366F1');

  let accuracy, fluency, pronunciation, speed;

  if (GEMINI_API_KEY && GEMINI_API_KEY.length > 10) {
    // REAL EVALUATION VIA GEMINI API
    try {
      const prompt = `You are an expert English language tutor. Evaluate the user's reading performance.
Original Passage: "${originalPassage}"
User's Spoken Transcript: "${finalTranscript}"

Evaluate accuracy, fluency, pronunciation, and speed out of 100.
Respond ONLY with a valid JSON object. No markdown formatting, no backticks, just the JSON.
{ "accuracy": 0, "fluency": 0, "pronunciation": 0, "speed": 0 }`;

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
      accuracy = evaluation.accuracy || 0;
      fluency = evaluation.fluency || 0;
      pronunciation = evaluation.pronunciation || 0;
      speed = evaluation.speed || 0;

    } catch (error) {
      console.error("Gemini API Error:", error);
      setStatus('⚠️ AI Evaluation failed. Using simulation.', '#EF4444');
      // Fallback
      accuracy = 70; fluency = 70; pronunciation = 70; speed = 70;
    }
  } else {
    // SIMULATED EVALUATION (Fallback)
    const correct = document.querySelectorAll('#passageText .word.correct').length;
    accuracy       = Math.min(100, Math.round((correct / Math.max(total, 1)) * 100));
    fluency        = Math.min(100, Math.round(accuracy * 0.85 + Math.random() * 15));
    pronunciation  = Math.min(100, Math.round(accuracy * 0.9  + Math.random() * 10));
    speed          = Math.min(100, Math.round(50 + Math.random() * 40));
  }

  const overall = Math.round(accuracy * 0.35 + fluency * 0.25 + pronunciation * 0.25 + speed * 0.15);

  animateRing(overall);
  updateMetrics([accuracy, fluency, pronunciation, speed]);
  updateTip(speed, fluency, pronunciation, accuracy);
  addSessionEntry(overall);

  setStatus(
    `🎉 Score: ${overall}% — ${overall >= 80 ? 'Excellent!' : overall >= 60 ? 'Good work!' : 'Keep practicing!'}`,
    overall >= 80 ? '#10B981' : overall >= 60 ? '#00D4FF' : '#F59E0B'
  );

  saveResult(overall);
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
