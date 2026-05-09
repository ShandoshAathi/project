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
  ],
  'C++': [
    { title: 'Chapter 1: C++ Introduction',
      body: '<p>C++ is a high-performance, compiled language used in system programming, game development, and more...</p>' },
    { title: 'Chapter 2: Pointers & Memory',
      body: '<p>Learn about memory addresses, pointers, and how C++ gives you direct control over hardware resources...</p>' },
    { title: 'Chapter 3: Classes & Objects',
      body: '<p>Explore the object-oriented side of C++. Classes, inheritance, and polymorphism are key concepts...</p>' }
  ]
};

const modulesData = {
  'English': [
    { num: 'Module 1', title: 'Foundations of Reading', desc: 'Basic phonics, letter sounds, and simple words', status: 'Completed', progress: 100, icon: '✓', class: 'completed' },
    { num: 'Module 2', title: 'Sentence Formation', desc: 'Building simple and compound sentences', status: 'Completed', progress: 100, icon: '✓', class: 'completed' },
    { num: 'Module 3', title: 'Reading Fluency', desc: 'Speed reading, rhythm and intonation patterns', status: '65% Done', progress: 65, icon: '●', class: 'active-unit' },
    { num: 'Module 4', title: 'Verbal Aptitude', desc: 'Sentence patterns, voice, and grammar mastery', status: '0% Done', progress: 0, icon: '📖', class: '' }
  ],
  'Python': [
    { num: 'Module 1', title: 'Python Basics', desc: 'Syntax, variables, and basic data types', status: 'In Progress', progress: 30, icon: '●', class: 'active-unit' },
    { num: 'Module 2', title: 'Data Structures', desc: 'Lists, dictionaries, and tuples', status: 'Locked', progress: 0, icon: '🔒', class: 'locked' }
  ],
  'Java': [
    { num: 'Module 1', title: 'Java Fundamentals', desc: 'Classes, objects, and basic syntax', status: 'In Progress', progress: 10, icon: '●', class: 'active-unit' }
  ],
  'C++': [
    { num: 'Module 1', title: 'C++ Systems', desc: 'Memory management and performance basics', status: 'In Progress', progress: 5, icon: '●', class: 'active-unit' }
  ]
};

function getChapters() {
  const subject = getCurrentSubject();
  return syllabusData[subject] || syllabusData['English'];
}

function getModules() {
  const subject = getCurrentSubject();
  return modulesData[subject] || modulesData['English'];
}

let currentIdx = 0;

export function loadChapter(idx) {
  const chapters = getChapters();
  currentIdx = idx;
  
  // Re-render sidebar list if needed
  const sidebar = document.querySelector('.chapter-list');
  if (sidebar && sidebar.children.length !== chapters.length) {
    refreshSyllabusUI();
  }

  document.querySelectorAll('.chapter-item').forEach((c, i) => {
    c.className = 'chapter-item' + (i < idx ? ' done' : i === idx ? ' active-ch' : '');
  });
  
  if (chapters[idx]) {
    document.getElementById('chapterTitle').textContent = chapters[idx].title;
    document.getElementById('chapterBody').innerHTML    = chapters[idx].body;
    const fill = document.querySelector('.mini-fill');
    const span = document.querySelector('.content-progress span');
    if (fill) fill.style.width = `${Math.round(((idx + 1) / chapters.length) * 100)}%`;
    if (span) span.textContent = `${idx + 1} of ${chapters.length}`;

    localStorage.setItem('last_chapter_index', idx);
    localStorage.setItem('last_chapter_title', chapters[idx].title);
  }
}

export function refreshSyllabusUI() {
  const chapters = getChapters();
  const sidebar = document.querySelector('.chapter-list');
  if (sidebar) {
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

  // Also refresh the Syllabus Grid
  const grid = document.getElementById('syllabus-grid');
  if (grid) {
    const modules = getModules();
    grid.innerHTML = modules.map(m => `
      <div class="unit-card ${m.class}">
        <div class="unit-badge ${m.class === 'active-unit' ? 'current' : ''}">${m.icon}</div>
        <div class="unit-num">${m.num}</div>
        <h3>${m.title}</h3>
        <p>${m.desc}</p>
        <div class="unit-progress"><div class="unit-bar" style="width: ${m.progress}%"></div></div>
        <span class="unit-status ${m.class === 'locked' ? 'locked-s' : m.progress === 100 ? 'done' : 'progress'}">${m.status}</span>
      </div>
    `).join('');
  }
}

export function prevChapter() {
  if (currentIdx > 0) loadChapter(currentIdx - 1);
}

export function nextChapter() {
  const chapters = getChapters();
  if (currentIdx < chapters.length - 1) loadChapter(currentIdx + 1);
}
