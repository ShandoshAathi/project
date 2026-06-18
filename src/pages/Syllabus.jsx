/**
 * src/pages/Syllabus.jsx
 * Syllabus page for VaaniAI.
 * Renders the personalized learning roadmap of units/modules.
 */

import React from 'react';
import { useApp } from '../context/AppContext.jsx';
import { getModules } from '../services/studyData.js';

export default function Syllabus() {
  const { currentSubject, customSubjects, setActivePage } = useApp();
  
  const modules = getModules(currentSubject, customSubjects);

  return (
    <div className="page active" id="page-syllabus">
      <div className="syllabus-header">
        <h2 className="section-title">{currentSubject} Syllabus</h2>
        <p className="subtitle">Your personalized learning roadmap</p>
      </div>
      
      <div className="syllabus-grid" id="syllabus-grid">
        {modules.map((m, idx) => {
          const isLocked = m.class === 'locked';
          const isActive = m.class === 'active-unit';
          
          return (
            <div 
              key={idx} 
              className={`unit-card ${m.class || ''}`}
              onClick={() => {
                if (!isLocked) {
                  setActivePage('study');
                }
              }}
              style={{ cursor: isLocked ? 'not-allowed' : 'pointer' }}
            >
              <div className={`unit-badge ${isActive ? 'current' : ''}`}>
                {m.icon}
              </div>
              <div className="unit-num">{m.num}</div>
              <h3>{m.title}</h3>
              <p>{m.desc}</p>
              
              <div className="unit-progress">
                <div className="unit-bar" style={{ width: `${m.progress}%` }}></div>
              </div>
              
              <span className={`unit-status ${isLocked ? 'locked-s' : m.progress === 100 ? 'done' : 'progress'}`}>
                {m.status}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
