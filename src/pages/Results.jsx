/**
 * src/pages/Results.jsx
 * Results & analytics dashboard for VaaniAI.
 */

import React from 'react';
import { useApp } from '../context/AppContext.jsx';

export default function Results() {
  const { resultsHistory } = useApp();

  const practice = resultsHistory.filter(r => r.activity_type === 'practice');
  const quiz = resultsHistory.filter(r => r.activity_type === 'quiz');

  // Overall avg score calculation
  const overallAvg = resultsHistory.length > 0
    ? Math.round(resultsHistory.reduce((a, b) => a + b.score, 0) / resultsHistory.length)
    : 0;

  // Best sessions
  const bestSessions = [...resultsHistory]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  // Category break downs
  const readingAvg = practice.length > 0
    ? Math.round(practice.reduce((acc, curr) => acc + curr.score, 0) / practice.length)
    : 0;

  const quizAvg = quiz.length > 0
    ? Math.round(quiz.reduce((acc, curr) => acc + curr.score, 0) / quiz.length)
    : 0;

  // Fluency is simulated as readingAvg * 0.9 (since speed is usually slightly lower)
  const fluencyScore = Math.max(0, Math.round(readingAvg * 0.88));
  // Speaking is average of practice
  const speakingAvg = readingAvg;

  // Chart plotting logic (Dynamic SVG based on past results chronologically, capped at last 8)
  const lastEight = [...resultsHistory]
    .reverse() // chronological order
    .slice(-8);

  const getChartPoints = () => {
    if (lastEight.length === 0) {
      // Default line coordinates if no history exists yet
      return {
        line: "10,120 50,95 90,105 130,70 170,80 210,55 250,40 290,35",
        area: "10,120 50,95 90,105 130,70 170,80 210,55 250,40 290,35 290,150 10,150"
      };
    }
    
    // Width: 300, Height: 150. Let's map X from 10 to 290, Y from 130 (0 score) to 20 (100 score).
    const width = 280;
    const xStep = lastEight.length > 1 ? width / (lastEight.length - 1) : width;
    
    const coords = lastEight.map((r, idx) => {
      const x = Math.round(10 + idx * xStep);
      // y maps 0% -> 130, 100% -> 20
      const y = Math.round(130 - (r.score / 100) * 110);
      return { x, y };
    });

    const linePoints = coords.map(c => `${c.x},${c.y}`).join(' ');
    
    const lastX = coords[coords.length - 1].x;
    const firstX = coords[0].x;
    const areaPoints = `${linePoints} ${lastX},150 ${firstX},150`;

    return { line: linePoints, area: areaPoints };
  };

  const points = getChartPoints();

  return (
    <div className="page active" id="page-results">
      <div className="results-overview">
        {/* Performance Score Card */}
        <div className="result-score-card card animate-in">
          <h3>Overall Performance</h3>
          <div className="big-score">
            {overallAvg}<span>%</span>
          </div>
          <p>
            {overallAvg >= 80 
              ? 'Excellent Tutor Standard 🏆' 
              : overallAvg >= 65 
                ? 'Above Average Learner 📈' 
                : 'Steady Progress 🎯'}
          </p>
          <div className="result-badges">
            <span className="badge">🎯 Consistent</span>
            <span className="badge">📈 Improving</span>
            <span className="badge">⭐ Top 10%</span>
          </div>
        </div>

        {/* Dynamic Trend Chart */}
        <div className="card results-chart-card animate-in">
          <h3>Performance Over Time</h3>
          <div className="line-chart">
            <svg viewBox="0 0 300 150" className="line-svg">
              <polyline 
                points={points.line} 
                fill="none" 
                stroke="url(#lineGrad)" 
                strokeWidth="3" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              />
              <defs>
                <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" className="stop-purple"/>
                  <stop offset="100%" className="stop-blue"/>
                </linearGradient>
              </defs>
              <polyline 
                points={points.area} 
                fill="url(#areaGrad)" 
                opacity="0.15"
              />
              <defs>
                <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" className="stop-purple"/>
                  <stop offset="100%" className="stop-transparent"/>
                </linearGradient>
              </defs>
            </svg>
            <div className="chart-labels">
              {lastEight.length === 0 ? (
                <>
                  <span>W1</span><span>W2</span><span>W3</span><span>W4</span>
                  <span>W5</span><span>W6</span><span>W7</span><span>W8</span>
                </>
              ) : (
                lastEight.map((_, i) => <span key={i}>S{i + 1}</span>)
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="results-detail-grid">
        {/* Skill Category breakdowns */}
        <div className="card animate-in">
          <h3>Category Breakdown</h3>
          <div className="breakdown-list">
            <div className="breakdown-item">
              <span>📖 Reading</span>
              <div className="bd-bar">
                <div 
                  className="grad-purple-90"
                  style={{ width: `${readingAvg}%` }}
                ></div>
              </div>
              <span>{readingAvg}%</span>
            </div>
            
            <div className="breakdown-item">
              <span>🎙️ Speaking</span>
              <div className="bd-bar">
                <div 
                  className="grad-blue-90"
                  style={{ width: `${speakingAvg}%` }}
                ></div>
              </div>
              <span>{speakingAvg}%</span>
            </div>
            
            <div className="breakdown-item">
              <span>🧠 Quiz</span>
              <div className="bd-bar">
                <div 
                  className="grad-green-90"
                  style={{ width: `${quizAvg}%` }}
                ></div>
              </div>
              <span>{quizAvg}%</span>
            </div>
            
            <div className="breakdown-item">
              <span>⚡ Fluency</span>
              <div className="bd-bar">
                <div 
                  className="grad-amber-90"
                  style={{ width: `${fluencyScore}%` }}
                ></div>
              </div>
              <span>{fluencyScore}%</span>
            </div>
          </div>
        </div>

        {/* Best Session list */}
        <div className="card animate-in">
          <h3>Best Sessions</h3>
          <div className="best-list">
            {bestSessions.length === 0 ? (
              <p className="text-sm text-muted py-4">No sessions recorded yet.</p>
            ) : (
              bestSessions.map((r, i) => (
                <div className="best-item" key={i}>
                  <div>
                    <p>{r.activity_type === 'practice' ? '🎙️ Speaking Practice' : '🧠 Knowledge Quiz'}</p>
                    <small>{new Date(r.created_at).toLocaleDateString()}</small>
                  </div>
                  <span className={`score-pill ${r.score >= 80 ? 'good' : 'ok'}`}>
                    {r.score}%
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
