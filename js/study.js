import { getCurrentSubject } from './storage.js';

const syllabusData = {
  'English': [
    { title: 'Chapter 1: Speed Reading Basics',
      body: '<p>Speed reading is the practice of reading text at a faster rate than average without losing comprehension...</p>' },
    { title: 'Chapter 2: Rhythm & Pacing',
      body: '<p>Every language has its own natural rhythm. English follows a stress-timed rhythm...</p>' },
    { title: 'Chapter 3: Intonation Patterns',
      body: '<p>Intonation refers to the rise and fall of pitch in speech...</p>' },
    { title: 'Chapter 4: Stress & Emphasis',
      body: '<p>When we speak, we naturally place stress on certain words and syllables...</p>' },
    { title: 'Chapter 5: Advanced Pronunciation',
      body: '<p>Advanced pronunciation focuses on connected speech features: elision, assimilation...</p>' },
    { title: 'Chapter 6: Sentence Patterns (Module)',
      body: '<p>Mastering sentence patterns is crucial for verbal aptitude. Common patterns include S+V+O+C...</p>' }
  ],
  'Python': [
    { title: 'Chapter 1: Python Introduction',
      body: '<p>Python is a high-level, interpreted programming language known for its readability and versatility...</p>' },
    { title: 'Chapter 2: Variables & Data Types',
      body: '<p>In Python, variables are created when you assign a value to them. Data types include integers, strings, floats, and booleans...</p>' },
    { title: 'Chapter 3: Control Flow (If/Else)',
      body: '<p>Control the flow of your program using if, elif, and else statements. Python uses indentation to define blocks...</p>' },
    { title: 'Chapter 4: Loops (For/While)',
      body: '<p>Loops are used to iterate over a sequence. Learn how to use "for" loops and "while" loops effectively...</p>' },
    { title: 'Chapter 5: Functions & Modules',
      body: '<p>A function is a block of code which only runs when it is called. You can pass data, known as parameters, into a function...</p>' }
  ],
  'Java': [
    { title: 'Chapter 1: Java Overview',
      body: '<p>Java is a class-based, object-oriented programming language designed to have as few implementation dependencies as possible...</p>' },
    { title: 'Chapter 2: JVM & JDK',
      body: '<p>Understand the Java Virtual Machine (JVM) and the Java Development Kit (JDK) which are essential for Java development...</p>' }
  ]
};

function getChapters() {
  const subject = getCurrentSubject();
  return syllabusData[subject] || syllabusData['English'];
}

let currentIdx = 0;

export function loadChapter(idx) {
  const chapters = getChapters();
  currentIdx = idx;
  
  // Re-render sidebar list if needed
  const sidebar = document.querySelector('.syllabus-list');
  if (sidebar && sidebar.children.length !== chapters.length) {
    refreshSyllabusUI();
  }

  document.querySelectorAll('.chapter-item').forEach((c, i) => {
    c.className = 'chapter-item' + (i < idx ? ' done' : i === idx ? ' active-ch' : '');
  });
  
  if (chapters[idx]) {
    document.getElementById('chapterTitle').textContent = chapters[idx].title;
    document.getElementById('chapterBody').innerHTML    = chapters[idx].body;
    document.querySelector('.mini-fill').style.width     = `${Math.round(((idx + 1) / chapters.length) * 100)}%`;
    document.querySelector('.content-progress span').textContent = `${idx + 1} of ${chapters.length}`;

    localStorage.setItem('last_chapter_index', idx);
    localStorage.setItem('last_chapter_title', chapters[idx].title);
  }
}

export function refreshSyllabusUI() {
  const chapters = getChapters();
  const sidebar = document.querySelector('.syllabus-list');
  if (!sidebar) return;

  sidebar.innerHTML = chapters.map((ch, i) => `
    <div class="chapter-item ${i < currentIdx ? 'done' : i === currentIdx ? 'active-ch' : ''}" onclick="loadChapter(${i})">
      <div class="ch-num">${i + 1}</div>
      <div class="ch-info">
        <p class="ch-title">${ch.title}</p>
        <p class="ch-meta">${ch.body.replace(/<[^>]*>/g, '').substring(0, 40)}...</p>
      </div>
      <div class="ch-status"></div>
    </div>
  `).join('');
}

export function prevChapter() {
  if (currentIdx > 0) loadChapter(currentIdx - 1);
}

export function nextChapter() {
  const chapters = getChapters();
  if (currentIdx < chapters.length - 1) loadChapter(currentIdx + 1);
}
