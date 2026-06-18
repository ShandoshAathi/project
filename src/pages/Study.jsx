/**
 * src/pages/Study.jsx
 * Study page for VaaniAI.
 * Interactive sidebar navigation of chapters and reader window.
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getChapters } from '../services/studyData.js';

export default function Study() {
  const { currentSubject, customSubjects, setActivePage } = useApp();
  
  // Obtain active syllabus chapters
  const chapters = getChapters(currentSubject, customSubjects);
  
  // Initialize current index from localStorage
  const [currentIdx, setCurrentIdx] = useState(() => {
    const saved = localStorage.getItem('last_chapter_index');
    if (saved !== null) {
      const parsed = parseInt(saved, 10);
      if (parsed >= 0 && parsed < chapters.length) {
        return parsed;
      }
    }
    return 0;
  });

  // Sync index change to localStorage
  useEffect(() => {
    if (chapters[currentIdx]) {
      localStorage.setItem('last_chapter_index', currentIdx.toString());
      localStorage.setItem('last_chapter_title', chapters[currentIdx].title);
    }
  }, [currentIdx, chapters]);

  // Reset chapter index to 0 if subject changes and previous index exceeds new chapters length
  useEffect(() => {
    setCurrentIdx(0);
  }, [currentSubject]);

  const loadChapter = (idx) => {
    if (idx >= 0 && idx < chapters.length) {
      setCurrentIdx(idx);
    }
  };

  const prevChapter = () => {
    if (currentIdx > 0) {
      setCurrentIdx(currentIdx - 1);
    }
  };

  const nextChapter = () => {
    if (currentIdx < chapters.length - 1) {
      setCurrentIdx(currentIdx + 1);
    }
  };

  const currentChapter = chapters[currentIdx] || { title: 'No chapter found', body: '<p>Please select another subject or generate a custom path.</p>' };
  const progressPercentage = chapters.length > 0 ? Math.round(((currentIdx + 1) / chapters.length) * 100) : 0;

  // Helper to remove HTML tags for sub-meta descriptions
  const stripHtml = (html) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
  };

  return (
    <div className="page active" id="page-study">
      <div className="study-layout">
        
        {/* Chapters Sidebar Panel */}
        <div className="chapters-panel">
          <h3>{currentSubject} — Study Materials</h3>
          <div className="chapter-list">
            {chapters.map((ch, i) => {
              const isDone = i < currentIdx;
              const isActive = i === currentIdx;
              const plainText = stripHtml(ch.body);
              const metaText = plainText.substring(0, 40) + (plainText.length > 40 ? '...' : '');
              
              return (
                <div 
                  key={i}
                  className={`chapter-item ${isDone ? 'done' : ''} ${isActive ? 'active-ch' : ''}`} 
                  onClick={() => loadChapter(i)}
                >
                  <div className="ch-num">{i + 1}</div>
                  <div className="ch-info">
                    <p className="ch-title">{ch.title}</p>
                    <p className="ch-meta">{metaText}</p>
                  </div>
                  <div className="ch-status"></div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Viewer Panel */}
        <div className="content-panel card">
          <div className="content-header">
            <h3 id="chapterTitle">{currentChapter.title}</h3>
            <div className="content-progress">
              <span>{currentIdx + 1} of {chapters.length}</span>
              <div className="mini-bar">
                <div className="mini-fill" style={{ width: `${progressPercentage}%` }}></div>
              </div>
            </div>
          </div>
          
          <div 
            className="content-body" 
            id="chapterBody"
            dangerouslySetInnerHTML={{ __html: currentChapter.body }}
          />
          
          <div className="content-actions">
            <button 
              className="btn-outline" 
              onClick={prevChapter}
              disabled={currentIdx === 0}
            >
              ← Previous
            </button>
            <button 
              className="btn-primary" 
              onClick={() => setActivePage('practice')}
            >
              Practice This →
            </button>
            <button 
              className="btn-outline" 
              onClick={nextChapter}
              disabled={currentIdx === chapters.length - 1}
            >
              Next Chapter →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
