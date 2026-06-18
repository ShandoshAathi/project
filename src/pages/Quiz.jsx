/**
 * src/pages/Quiz.jsx
 * Dynamic Quiz Engine for VaaniAI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generateQuizQuestions } from '../services/ai.js';

export default function Quiz() {
  const { 
    currentUser, 
    addXPPoints, 
    recordResult, 
    resultsHistory,
    currentSubject 
  } = useApp();

  const [started, setStarted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);
  const [errorMsg, setErrorMsg] = useState("");
  const [finished, setFinished] = useState(false);

  const timerRef = useRef(null);

  // Generate dynamic quiz questions via AI service
  const startGeneratingQuiz = async () => {
    setLoading(true);
    setErrorMsg("");
    setQuestions([]);
    
    let dynamicQs = null;
    try {
      const topic = currentSubject === 'English' ? 'Verbal Aptitude (Module)' : `${currentSubject} Programming`;
      dynamicQs = await generateQuizQuestions(currentUser, topic);
    } catch (err) {
      console.error("AI quiz generation error:", err);
    }

    if (dynamicQs && dynamicQs.length === 10) {
      setQuestions(dynamicQs);
      setUserAnswers(new Array(dynamicQs.length).fill(null));
      setCurrentQIndex(0);
      setTimeLeft(30);
      setFinished(false);
      setStarted(true);
      startTimer();
    } else {
      setErrorMsg("⚠️ AI question generation failed. Please verify your API keys in settings.");
      setTimeout(() => {
        setStarted(false);
      }, 3000);
    }
    setLoading(false);
  };

  // Timer Control
  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(30);
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleNextQuestion();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  // Option select
  const selectOption = (optIndex) => {
    if (userAnswers[currentQIndex] !== null) return; // already answered
    stopTimer();

    setUserAnswers(prev => {
      const updated = [...prev];
      updated[currentQIndex] = optIndex;
      return updated;
    });
  };

  const handleNextQuestion = () => {
    if (currentQIndex < questions.length - 1) {
      setCurrentQIndex(prev => prev + 1);
      startTimer();
    } else {
      handleFinishQuiz();
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(prev => prev - 1);
      // Resume timer if unanswered
      if (userAnswers[currentQIndex - 1] === null) {
        startTimer();
      } else {
        stopTimer();
      }
    }
  };

  const handleFinishQuiz = () => {
    stopTimer();
    setFinished(true);

    // Calculate score
    const correctCount = userAnswers.reduce((acc, ans, idx) => {
      return acc + (ans === questions[idx].ans ? 1 : 0);
    }, 0);
    
    const pct = Math.round((correctCount / questions.length) * 100);
    
    // Save performance
    recordResult(pct, 'quiz');
    // Award XP
    addXPPoints(pct * 2);
  };

  const handleRetryQuiz = () => {
    setStarted(false);
    setFinished(false);
    setQuestions([]);
    setUserAnswers([]);
    setCurrentQIndex(0);
  };

  // Clean up timer on unmount
  useEffect(() => {
    return () => stopTimer();
  }, []);

  // Filter local resultsHistory for last 5 quizzes
  const quizHistory = (resultsHistory || [])
    .filter(r => r.activity_type === 'quiz')
    .slice(0, 5);

  const currentQ = questions[currentQIndex];

  return (
    <div className="page active" id="page-quiz">
      {!started ? (
        <div id="quiz-start-overlay" className="quiz-overlay">
          <div className="auth-card text-center animate-in">
            <div className="auth-logo mb-4">Q</div>
            <h2>Ready to start the Quiz?</h2>
            <p className="mb-6">
              Test your knowledge with 10 dynamic questions tailored to your level in {currentSubject}.
            </p>
            <div className="quiz-meta mb-6 justify-center">
              <div className="qm-item">
                <span>📚 Topic</span>
                <span>{currentSubject === 'English' ? 'General English' : currentSubject}</span>
              </div>
              <div className="qm-item">
                <span>❓ Questions</span>
                <span>10</span>
              </div>
            </div>
            
            {loading ? (
              <div className="py-2">
                <div className="spinner mx-auto mb-4"></div>
                <p>Generating personalized questions...</p>
              </div>
            ) : errorMsg ? (
              <p style={{ color: '#EF4444' }}>{errorMsg}</p>
            ) : (
              <button className="btn-primary auth-btn" onClick={startGeneratingQuiz}>
                Start Quiz Now
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="quiz-layout" id="quiz-content">
          <div className="quiz-main card">
            {finished ? (
              <div className="grid-span-2-center text-center py-6">
                <div className="big-score-dynamic">
                  {Math.round(
                    (userAnswers.filter((a, i) => a === questions[i].ans).length / questions.length) * 100
                  )}%
                </div>
                <p className="score-desc">
                  You got {userAnswers.filter((a, i) => a === questions[i].ans).length} out of {questions.length} correct!
                </p>
                <button className="btn-primary mt-4" onClick={handleRetryQuiz}>
                  Try Another Quiz
                </button>
              </div>
            ) : (
              <>
                <div className="quiz-header">
                  <span className="quiz-num" id="quizNum">
                    Question {currentQIndex + 1} of {questions.length}
                  </span>
                  <div className="quiz-timer" id="quizTimer">
                    ⏱️ {timeLeft}s
                  </div>
                </div>
                
                <div className="quiz-progress-bar">
                  <div 
                    className="quiz-progress-fill" 
                    id="quizProgressFill" 
                    style={{ width: `${((currentQIndex + 1) / questions.length) * 100}%` }}
                  ></div>
                </div>

                {currentQ && (
                  <div className="question-area">
                    <h3 id="questionText">{currentQ.q}</h3>
                    <div className="options-grid" id="optionsGrid">
                      {currentQ.opts.map((opt, i) => {
                        const hasAnswered = userAnswers[currentQIndex] !== null;
                        const isSelected = userAnswers[currentQIndex] === i;
                        const isCorrectOption = i === currentQ.ans;

                        let btnClass = "option-btn";
                        if (hasAnswered) {
                          if (isCorrectOption) btnClass += " correct";
                          else if (isSelected) btnClass += " wrong";
                        }

                        return (
                          <button
                            key={i}
                            className={btnClass}
                            onClick={() => selectOption(i)}
                            disabled={hasAnswered}
                          >
                            {String.fromCharCode(65 + i)}. {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="quiz-actions">
                  <button 
                    className="btn-outline" 
                    id="prevBtn" 
                    onClick={handlePrevQuestion}
                    disabled={currentQIndex === 0}
                  >
                    ← Prev
                  </button>
                  <button 
                    className="btn-primary" 
                    id="nextBtn" 
                    onClick={handleNextQuestion}
                    disabled={userAnswers[currentQIndex] === null}
                  >
                    {currentQIndex === questions.length - 1 ? 'Finish' : 'Next →'}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="quiz-sidebar">
            <div className="card">
              <h3>Quiz Info</h3>
              <div className="quiz-meta">
                <div className="qm-item">
                  <span>📚 Topic</span>
                  <span>{currentSubject === 'English' ? 'Reading Fluency' : currentSubject}</span>
                </div>
                <div className="qm-item">
                  <span>❓ Questions</span>
                  <span>{questions.length}</span>
                </div>
                <div className="qm-item">
                  <span>⏱️ Time</span>
                  <span>30s each</span>
                </div>
                <div className="qm-item">
                  <span>🏆 Pass Mark</span>
                  <span>70%</span>
                </div>
              </div>
            </div>

            {!finished && (
              <div className="card">
                <h3>Questions</h3>
                <div className="q-navigator" id="qNav">
                  {questions.map((_, i) => {
                    const isCurrent = i === currentQIndex;
                    const ans = userAnswers[i];
                    
                    let dotClass = "q-dot";
                    if (isCurrent) dotClass += " active-q";
                    if (ans !== null) {
                      dotClass += (ans === questions[i].ans) ? " correct" : " wrong";
                    }

                    return (
                      <div 
                        key={i} 
                        className={dotClass}
                        onClick={() => !finished && setCurrentQIndex(i)}
                      >
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="card quiz-history-card">
              <h3>Score History</h3>
              <div id="quiz-history-list" className="quiz-history-list">
                {quizHistory.length === 0 ? (
                  <p className="empty-state-sm">No history yet</p>
                ) : (
                  quizHistory.map((h, i) => {
                    const date = new Date(h.created_at).toLocaleDateString(undefined, { 
                      month: 'short', 
                      day: 'numeric' 
                    });
                    const cls = h.score >= 80 ? 'good' : h.score >= 60 ? 'ok' : 'warn';
                    return (
                      <div className="history-item" key={i}>
                        <span className="hist-date">{date}</span>
                        <span className={`hist-score ${cls}`}>{h.score}%</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
