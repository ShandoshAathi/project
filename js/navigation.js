/**
 * navigation.js — SPA page routing
 */

const pages  = ['dashboard', 'syllabus', 'study', 'practice', 'results', 'quiz', 'profile', 'settings', 'login', 'flashcards'];
const titles = {
  dashboard: 'Dashboard',
  syllabus:  'Syllabus',
  study:     'Study Material',
  practice:  'Practice',
  results:   'Results',
  quiz:      'Quiz',
  profile:   'Profile',
  settings:  'Settings',
  login:     'Login',
  flashcards: 'Flashcards'
};

/** Callback that fires after a page becomes active (set by main.js) */
let onPageChange = null;

export function setPageChangeCallback(cb) {
  onPageChange = cb;
}

export function navigate(page) {
  /* Hide all pages, deactivate all nav items */
  pages.forEach(p => {
    document.getElementById('page-' + p)?.classList.remove('active');
  });
  document.querySelectorAll('.nav-item').forEach(n => {
    n.classList.toggle('active', n.dataset.page === page);
  });

  /* Show target page */
  document.getElementById('page-' + page)?.classList.add('active');
  document.getElementById('pageTitle').textContent = titles[page] || page;

  /* Set attribute for CSS hooks */
  document.querySelector('.app')?.setAttribute('data-active-page', page);

  /* Update Glider Position */
  updateGlider();

  /* Notify listeners */
  if (onPageChange) onPageChange(page);
}

function updateGlider() {
  const glider = document.getElementById('nav-glider');
  const activeItem = document.querySelector('.nav-item.active');
  if (!glider || !activeItem) return;

  const rect = activeItem.getBoundingClientRect();
  const parentRect = activeItem.parentElement.getBoundingClientRect();

  glider.style.width = rect.width + 'px';
  glider.style.left = (rect.left - parentRect.left) + 'px';
}

// Ensure glider updates on resize
window.addEventListener('resize', updateGlider);

// Initialize glider on load
setTimeout(updateGlider, 100);
