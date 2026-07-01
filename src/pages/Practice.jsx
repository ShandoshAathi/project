/**
 * src/pages/Practice.jsx
 * Speech practice / code analyzer module for VaaniAI.
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { generatePracticePassage, generateRoleplayScenario } from '../services/ai.js';

const FALLBACK_PASSAGES = {
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
  ],
  'C++': [
    "#include <iostream>\nusing namespace std;\nint main() {\n    cout << \"Hello World\";\n    return 0;\n}\n\n# Explain the purpose of #include and return 0 in standard C++ program."
  ]
};

export default function Practice() {
  const { 
    currentSubject, 
    currentUser, 
    addXPPoints, 
    addWordToFlashcards, 
    recordResult,
    settings,
    setIsChatOpen,
    setChatHistoryState
  } = useApp();

  const isCoding = currentSubject !== 'English';
  
  // Navigation / Overlay States
  const [started, setStarted] = useState(false);
  const [loadingPassage, setLoadingPassage] = useState(false);
  const [passageText, setPassageText] = useState("");
  
  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [micStatus, setMicStatus] = useState("Click to Start Recording");
  const [micStatusColor, setMicStatusColor] = useState("");
  const [words, setWords] = useState([]); // array of { text, status: 'correct' | 'wrong' | 'highlight' | null }
  
  // Transcription Ref / State
  const finalTranscriptRef = useRef("");
  const recordedWordsRef = useRef(new Set());
  const recognitionRef = useRef(null);
  const simulationIntervalRef = useRef(null);

  // Roleplay Scenario Card
  const [generatingRoleplay, setGeneratingRoleplay] = useState(false);
  const [roleplay, setRoleplay] = useState({
    scenario: "Generate a mission to start real-world practice!",
    ai_character: "Waiting...",
    goal: "Waiting..."
  });

  // Feedback State
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [scores, setScores] = useState({ v1: 0, v2: 0, v3: 0, v4: 0, overall: 0 });
  const [feedbackTip, setFeedbackTip] = useState("💡 Tip: Click Start Practice and record yourself reading the passage aloud.");
  const [sessionHistory, setSessionHistory] = useState([82, 74, 88]);

  // Load a new passage
  const loadNewPassage = async () => {
    if (isRecording) stopRecording();
    setPassageText("");
    setWords([]);
    recordedWordsRef.current.clear();
    finalTranscriptRef.current = "";
    
    setMicStatus("✨ Generating dynamic content...");
    setMicStatusColor("#6366F1");
    setLoadingPassage(true);

    let passage = null;
    try {
      const contextText = customSubjects[currentSubject]?.contextText || '';
      passage = await generatePracticePassage(currentUser, contextText);
    } catch (e) {
      console.error("AI Passage generation failed, using library fallbacks:", e);
    }

    if (!passage) {
      const fallbacks = FALLBACK_PASSAGES[currentSubject] || FALLBACK_PASSAGES['English'];
      passage = fallbacks[Math.floor(Math.random() * fallbacks.length)];
      setMicStatus("ℹ️ Using library passage (AI failed/offline).");
      setMicStatusColor("");
    } else {
      setMicStatus("Click to Start Recording");
      setMicStatusColor("");
    }

    setPassageText(passage);
    setLoadingPassage(false);

    // Split passage into words
    const wordsArr = passage.split(/\s+/).map((w, idx) => ({
      text: w,
      status: null,
      id: idx
    }));
    setWords(wordsArr);
  };

  // Start Voice Recording
  const startRecording = () => {
    setIsRecording(true);
    recordedWordsRef.current.clear();
    finalTranscriptRef.current = "";
    setMicStatus("🔴 Recording… Speak now!");
    setMicStatusColor("#EF4444");

    // Reset word classes
    setWords(prev => prev.map(w => ({ ...w, status: null })));

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = currentSubject === 'English' ? 'en-US' : 'en-US';

      rec.onresult = (e) => {
        const transcript = Array.from(e.results)
          .map(r => r[0].transcript)
          .join(' ');
        finalTranscriptRef.current = transcript;
        highlightWords(transcript);
      };

      rec.onerror = (err) => {
        console.error("Speech Recognition Error:", err);
        stopRecording();
      };

      rec.onend = () => {
        // Safe restarts if recording is still set to true
        if (isRecording && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (_) {}
        }
      };

      recognitionRef.current = rec;
      rec.start();
    } else {
      // Browser does not support SpeechRecognition -> fall back to simulation
      let currentWordIndex = 0;
      simulationIntervalRef.current = setInterval(() => {
        setWords(prev => {
          const next = [...prev];
          
          // Mark previous as correct/wrong
          if (currentWordIndex > 0 && next[currentWordIndex - 1]) {
            const isCorrect = Math.random() > 0.15;
            next[currentWordIndex - 1].status = isCorrect ? 'correct' : 'wrong';
            if (isCorrect) recordedWordsRef.current.add(currentWordIndex - 1);
          }

          // Highlight current word
          if (currentWordIndex < next.length) {
            next[currentWordIndex].status = 'highlight';
            currentWordIndex++;
          } else {
            clearInterval(simulationIntervalRef.current);
            simulationIntervalRef.current = null;
            stopRecording();
          }
          return next;
        });
      }, 1000);
    }
  };

  // Stop Recording
  const stopRecording = () => {
    setIsRecording(false);
    setMicStatus("Status: Processing Speech...");
    setMicStatusColor("#F59E0B");

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
      simulationIntervalRef.current = null;
    }

    // Finish clean up: change highlighed to correct
    setWords(prev => {
      const next = prev.map((w, i) => {
        if (w.status === 'highlight') {
          recordedWordsRef.current.add(i);
          return { ...w, status: 'correct' };
        }
        return w;
      });

      // If absolutely no words were processed/recorded, auto-highlight all as correct for simulation fallback
      if (recordedWordsRef.current.size === 0) {
        next.forEach((_, i) => recordedWordsRef.current.add(i));
        return next.map(w => ({ ...w, status: 'correct' }));
      }
      return next;
    });

    setMicStatus("✅ Recording complete! Click Submit.");
    setMicStatusColor("#10B981");
  };

  // Match voice input against words in passage
  const highlightWords = (transcript) => {
    const spokenList = transcript.toLowerCase().split(/\s+/);
    setWords(prev =>
      prev.map((w, idx) => {
        const cleanWord = w.text.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (spokenList.includes(cleanWord)) {
          recordedWordsRef.current.add(idx);
          return { ...w, status: 'correct' };
        }
        return w;
      })
    );
  };

  // Submit Practice
  const submitPractice = async () => {
    if (isRecording) stopRecording();

    setIsEvaluating(true);
    setMicStatus(isCoding ? "🤖 AI is evaluating your explanation..." : "🤖 AI is evaluating your reading...");
    setMicStatusColor("#6366F1");

    let v1, v2, v3, v4;
    const finalTrans = finalTranscriptRef.current || "No verbal description captured.";

    // API Key Checks
    const geminiKey = settings.geminiKey || "";
    if (geminiKey.length > 10) {
      try {
        const prompt = isCoding ? 
          `You are a Senior ${currentSubject} Developer. Evaluate the user's verbal explanation of this code snippet.
Code Snippet: "${passageText}"
User's Explanation: "${finalTrans}"

Evaluate Logic, Clarity, Keywords usage, and Complexity understanding out of 100.
Respond ONLY with a valid JSON object:
{ "v1": 0, "v2": 0, "v3": 0, "v4": 0 }` :
          `You are an expert English language tutor. Evaluate the user's reading performance.
Original Passage: "${passageText}"
User's Spoken Transcript: "${finalTrans}"

Evaluate accuracy, fluency, pronunciation, and speed out of 100.
Respond ONLY with a valid JSON object:
{ "v1": 0, "v2": 0, "v3": 0, "v4": 0 }`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        const data = await response.json();
        let textResponse = data.candidates[0].content.parts[0].text;
        textResponse = textResponse.replace(/```json/g, '').replace(/```/g, '').trim();

        const evaluation = JSON.parse(textResponse);
        v1 = evaluation.v1 || 0;
        v2 = evaluation.v2 || 0;
        v3 = evaluation.v3 || 0;
        v4 = evaluation.v4 || 0;
      } catch (err) {
        console.error("Gemini practice scoring failed, resorting to mock calculator:", err);
        // Fallback scoring
        v1 = 75; v2 = 80; v3 = 70; v4 = 85;
      }
    } else {
      // Mock / Offline math
      const totalWordsCount = words.length || 1;
      const correctCount = words.filter(w => w.status === 'correct').length;
      v1 = Math.min(100, Math.round((correctCount / totalWordsCount) * 100));
      v2 = Math.min(100, Math.round(v1 * 0.85 + Math.random() * 15));
      v3 = Math.min(100, Math.round(v1 * 0.90 + Math.random() * 10));
      v4 = Math.min(100, Math.round(50 + Math.random() * 40));
    }

    const overall = Math.round(v1 * 0.35 + v2 * 0.25 + v3 * 0.25 + v4 * 0.15);
    setScores({ v1, v2, v3, v4, overall });

    // Set interactive tips
    const tipsList = [
      { cond: v4 < 60, text: isCoding ? '💡 Tip: Structure your thoughts first. Try outlining the logic in steps.' : '💡 Tip: Try reading at a more consistent pace for better speed scores.' },
      { cond: v2 < 70, text: isCoding ? '💡 Tip: Focus on technical clarity – explain *why* the code runs, not just *what* it is.' : '💡 Tip: Work on your pacing – try reading slightly slower for better clarity.' },
      { cond: v3 < 75, text: isCoding ? '💡 Tip: Incorporate key coding keywords (e.g. loops, declarations, imports) in your speech.' : '💡 Tip: Focus on pronouncing each word clearly, especially longer words.' },
      { cond: v1 < 80, text: isCoding ? '💡 Tip: Explain the complete logical sequence. Don\'t skip variables or return statements.' : '💡 Tip: Make sure to read every word in the passage. Practice the tricky ones.' },
      { cond: true,   text: '🎉 Great job! Keep practicing to maintain your excellent scores!' }
    ];
    const matchingTip = tipsList.find(t => t.cond);
    setFeedbackTip(matchingTip.text);

    // Save to global results history
    recordResult(overall, 'practice');
    addXPPoints(Math.round(overall * 1.5));

    // Append to sessions history UI list
    setSessionHistory(prev => [...prev, overall]);

    // SRS System integration: Save mispronounced/wrong words for later review in Flashcards (only for English)
    if (!isCoding) {
      const wrongWords = words
        .filter(w => w.status === 'wrong' || w.status === null)
        .map(w => w.text.replace(/[^a-zA-Z]/g, '').toLowerCase())
        .filter(w => w.length > 2);
      
      if (wrongWords.length > 0) {
        const uniqueWrong = [...new Set(wrongWords)];
        uniqueWrong.forEach(word => {
          addWordToFlashcards(word, "Pronunciation review required (from Practice page)");
        });
        console.log(`[VaaniAI] Added ${uniqueWrong.length} mispronounced words to Spaced Repetition Flashcards.`);
      }
    }

    setMicStatus(`🎉 Score: ${overall}% — ${overall >= 80 ? 'Excellent!' : overall >= 60 ? 'Good work!' : 'Keep practicing!'}`);
    setMicStatusColor(overall >= 80 ? '#10B981' : overall >= 60 ? '#00D4FF' : '#F59E0B');
    setIsEvaluating(false);
  };

  // Launch AI Chatbot Roleplay Scenario
  const launchRoleplay = async () => {
    setGeneratingRoleplay(true);
    try {
      const contextText = customSubjects[currentSubject]?.contextText || '';
      const mission = await generateRoleplayScenario(currentUser, contextText);
      setRoleplay({
        scenario: mission.scenario,
        ai_character: mission.ai_character,
        goal: mission.goal
      });

      // Clear previous chatbot history, set context, open drawer
      setChatHistoryState([
        {
          role: 'assistant',
          content: `⚡ **ROLEPLAY MISSION STARTED** ⚡\n\n**Scenario**: ${mission.scenario}\n**Coach Character**: ${mission.ai_character}\n**Your Goal**: ${mission.goal}\n\n💬 *${mission.ai_character}:* "${mission.first_message}"`
        }
      ]);
      setIsChatOpen(true);
    } catch (err) {
      console.error("Failed to generate roleplay scenario:", err);
      const isCoding = ['Python', 'Java', 'C++'].includes(currentSubject) || currentSubject.toLowerCase().includes('program') || currentSubject.toLowerCase().includes('code');
      // Fallback
      setRoleplay({
        scenario: isCoding ? "Code Architecture Review" : "At a Coffee Shop",
        ai_character: isCoding ? "Senior Tech Lead" : "Cafe Barista",
        goal: isCoding ? "Explain your component design structure" : "Order an iced latte and ask about dairy alternatives"
      });
      setChatHistoryState([
        {
          role: 'assistant',
          content: `⚡ **ROLEPLAY MISSION STARTED** ⚡\n\n**Scenario**: At a Coffee Shop\n**Coach Character**: Cafe Barista\n**Your Goal**: Order an iced latte and ask about dairy alternatives\n\n💬 *Cafe Barista:* "Hi! Welcome to Vaani Brews. What can I get started for you today?"`
        }
      ]);
      setIsChatOpen(true);
    }
    setGeneratingRoleplay(false);
  };

  const handleStartPractice = () => {
    setStarted(true);
    loadNewPassage();
  };

  // Clean up recording on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) recognitionRef.current.stop();
      if (simulationIntervalRef.current) clearInterval(simulationIntervalRef.current);
    };
  }, []);

  // SVG Ring values
  const circumference = 2 * Math.PI * 40;
  const dashOffset = Math.round((scores.overall / 100) * circumference);

  return (
    <div className="page active" id="page-practice">
      {!started ? (
        <div id="practice-start-overlay" className="quiz-overlay">
          <div className="auth-card text-center animate-in">
            <div className="auth-logo mb-4">P</div>
            <h2>{isCoding ? `${currentSubject} Code Analysis` : 'Ready for Practice?'}</h2>
            <p className="mb-6">
              {isCoding 
                ? `Analyze the generated ${currentSubject} snippet and explain its logic verbally.` 
                : 'Improve your pronunciation by reading dynamic passages aloud.'}
            </p>
            <div className="quiz-meta mb-6 justify-center">
              <div className="qm-item">
                <span>📖 Activity</span>
                <span>{isCoding ? 'Code Explainer' : 'Read Aloud'}</span>
              </div>
              <div className="qm-item">
                <span>🎯 Goal</span>
                <span>{isCoding ? 'Logic & Technical Clarity' : 'Accuracy & Fluency'}</span>
              </div>
            </div>
            <button className="btn-primary auth-btn" onClick={handleStartPractice}>
              Start Practice
            </button>
          </div>
        </div>
      ) : (
        <div className="practice-layout" id="practice-content">
          <div className="practice-text-card card">
            <div className="practice-header">
              <h3>{isCoding ? 'Code Explainer' : 'Read Aloud'}</h3>
              <span className="difficulty-badge">Medium</span>
            </div>

            <div className={`practice-passage ${isCoding ? 'is-code' : ''}`} id="practicePassage">
              {loadingPassage ? (
                <div className="spinner mx-auto my-6"></div>
              ) : isCoding ? (
                <pre>
                  <code>
                    {words.map((w, idx) => (
                      <span 
                        key={idx} 
                        className={`word ${w.status || ''}`}
                      >
                        {w.text}{' '}
                      </span>
                    ))}
                  </code>
                </pre>
              ) : (
                <p id="passageText">
                  {words.map((w, idx) => (
                    <span 
                      key={idx} 
                      className={`word ${w.status || ''}`} 
                      id={`w${idx}`}
                    >
                      {w.text}{' '}
                    </span>
                  ))}
                </p>
              )}
            </div>

            <div className="mic-section">
              <button 
                className={`mic-btn ${isRecording ? 'recording' : ''}`} 
                id="micBtn" 
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loadingPassage || isEvaluating}
                title={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                <span className="mic-icon">🎙️</span>
                {isRecording && <div className="mic-pulse" id="micPulse"></div>}
              </button>
              <p id="micStatus" style={{ color: micStatusColor }}>{micStatus}</p>
            </div>

            <div className="practice-actions">
              <button 
                className="btn-outline" 
                onClick={loadNewPassage}
                disabled={isRecording || isEvaluating || loadingPassage}
              >
                New Passage
              </button>
              <button 
                className="btn-primary" 
                onClick={submitPractice}
                disabled={isRecording || isEvaluating || loadingPassage || words.length === 0}
              >
                {isEvaluating ? 'Evaluating...' : 'Submit →'}
              </button>
            </div>
          </div>

          <div className="feedback-panel">
            {/* Roleplay Mission Launcher */}
            <div className="card roleplay-card grad-blue" id="roleplayCard">
              <div className="roleplay-badge">NEW MISSION</div>
              <h3>Roleplay Scenario</h3>
              <p id="roleplay-scenario">{roleplay.scenario}</p>
              <div className="mission-details">
                <div>
                  <strong>AI Character: </strong> 
                  <span id="roleplay-ai">{roleplay.ai_character}</span>
                </div>
                <div>
                  <strong>Goal: </strong> 
                  <span id="roleplay-goal">{roleplay.goal}</span>
                </div>
              </div>
              <button 
                className="btn-primary auth-btn mt-4" 
                onClick={launchRoleplay}
                disabled={generatingRoleplay}
              >
                {generatingRoleplay ? '✨ Initializing...' : 'Start Mission →'}
              </button>
            </div>

            {/* Score Metrics Panel */}
            <div className="card" id="feedbackCard">
              <h3>Feedback</h3>
              <div className="score-ring">
                <svg viewBox="0 0 100 100" className="ring-svg">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="#1A1A3E" strokeWidth="8"/>
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    fill="none" 
                    stroke="url(#grad)" 
                    strokeWidth="8" 
                    strokeDasharray={`${dashOffset} ${circumference}`}
                    strokeLinecap="round" 
                    transform="rotate(-90 50 50)"
                  />
                  <defs>
                    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" className="stop-purple"/>
                      <stop offset="100%" className="stop-blue"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="ring-score">{scores.overall}%</div>
              </div>

              <div className="feedback-metrics">
                <div className="metric">
                  <span>{isCoding ? 'Logic' : 'Accuracy'}</span>
                  <span className={`metric-val ${scores.v1 >= 80 ? 'good' : scores.v1 >= 60 ? 'ok' : 'warn'}`}>
                    {scores.v1}%
                  </span>
                </div>
                <div className="metric">
                  <span>{isCoding ? 'Clarity' : 'Fluency'}</span>
                  <span className={`metric-val ${scores.v2 >= 80 ? 'good' : scores.v2 >= 60 ? 'ok' : 'warn'}`}>
                    {scores.v2}%
                  </span>
                </div>
                <div className="metric">
                  <span>{isCoding ? 'Keywords' : 'Pronunciation'}</span>
                  <span className={`metric-val ${scores.v3 >= 80 ? 'good' : scores.v3 >= 60 ? 'ok' : 'warn'}`}>
                    {scores.v3}%
                  </span>
                </div>
                <div className="metric">
                  <span>{isCoding ? 'Complexity' : 'Speed'}</span>
                  <span className={`metric-val ${scores.v4 >= 80 ? 'good' : scores.v4 >= 60 ? 'ok' : 'warn'}`}>
                    {scores.v4}%
                  </span>
                </div>
              </div>

              <div className="feedback-tip">
                <p>{feedbackTip}</p>
              </div>
            </div>

            {/* Session History */}
            <div className="card">
              <h3>Session History</h3>
              <div className="session-list">
                {sessionHistory.map((score, i) => (
                  <div className="session-item" key={i}>
                    <span>Session {i + 1}</span>
                    <span className={score >= 80 ? 'good' : score >= 60 ? 'ok' : 'warn'}>
                      {score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
