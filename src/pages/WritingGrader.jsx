import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext.jsx';
import { gradeWriting } from '@/services/ai.js';
import { getCurrentSubject } from '@/services/storage.js';

export default function WritingGrader() {
  const { currentUser } = useApp();
  const [text, setText] = useState('');
  const [isGrading, setIsGrading] = useState(false);
  const [result, setResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const subject = getCurrentSubject();

  const handleGrade = async () => {
    if (text.trim().length < 20) {
      setErrorMsg("Please write at least a few sentences.");
      return;
    }
    
    setErrorMsg('');
    setIsGrading(true);
    setResult(null);

    try {
      const response = await gradeWriting(subject, text, currentUser);
      setResult(response);
    } catch (err) {
      setErrorMsg(err.message || "Failed to grade writing.");
    } finally {
      setIsGrading(false);
    }
  };

  const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

  return (
    <div className="page active" id="page-writing">
      <div className="page-header mb-6">
        <h1>AI Writing Grader</h1>
        <p className="text-secondary">Practice your writing and get instant feedback from your AI coach.</p>
      </div>

      <div className="writing-layout">
        <div className="writing-editor card">
          <textarea 
            className="writing-textarea"
            placeholder={`Write about ${subject} here...`}
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={isGrading}
          />
          <div className="writing-controls">
            <span className="word-count">{wordCount} words</span>
            <button 
              className="btn-primary"
              onClick={handleGrade}
              disabled={isGrading || text.length === 0}
            >
              {isGrading ? 'Grading...' : 'Submit for Grading'}
            </button>
          </div>
          {errorMsg && <p style={{ color: 'var(--danger)', marginTop: '1rem' }}>{errorMsg}</p>}
        </div>

        <div className="writing-feedback-panel card">
          {isGrading ? (
            <div className="text-center py-6">
              <div className="spinner mx-auto mb-4"></div>
              <p>Analyzing grammar, vocabulary, and flow...</p>
            </div>
          ) : result ? (
            <div className="animate-in">
              <div className="score-circle mb-6">
                <div className="score-number">{result.score}</div>
                <div className="score-label">Score</div>
              </div>
              
              <div className="mb-6">
                <h3 className="mb-2">General Feedback</h3>
                <p style={{ color: 'var(--text2)' }}>{result.general_feedback}</p>
              </div>

              {result.grammar_corrections && result.grammar_corrections.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4">Grammar Corrections</h3>
                  {result.grammar_corrections.map((item, idx) => (
                    <div key={idx} className="correction-item">
                      <div className="mb-2">
                        <span className="correction-original">{item.original}</span>
                        <span className="correction-fixed">→ {item.correction}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}

              {result.vocabulary_suggestions && result.vocabulary_suggestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="mb-4">Vocabulary Enhancements</h3>
                  {result.vocabulary_suggestions.map((item, idx) => (
                    <div key={idx} className="vocab-item">
                      <div className="mb-2">
                        <span className="vocab-original">{item.original}</span>
                        <span className="vocab-better">→ {item.better}</span>
                      </div>
                      <p style={{ fontSize: '0.9rem', color: 'var(--text2)' }}>{item.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center text-secondary py-6" style={{ opacity: 0.7 }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✍️</div>
              <p>Write an essay or paragraph and submit it to see your AI-graded results here.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
