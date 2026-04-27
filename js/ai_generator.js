/**
 * ai_generator.js — Generates dynamic content using Gemini API
 */
import { GEMINI_API_KEY } from './config.js';
import { getProfile } from './storage.js';
import { getCurrentUser } from './auth.js';

const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

/**
 * Generate a reading passage based on user level
 */
export async function generatePracticePassage() {
  const level = await getUserLevel();
  const prompt = `Generate a reading practice passage in English for a ${level} level learner. 
    The passage should be exactly 2-3 sentences long. 
    Choose a unique and interesting topic (e.g., science, history, daily life, travel).
    Ensure the passage is different from typical common examples.
    Return ONLY the plain text of the passage, nothing else.`;

  try {
    const text = await callGemini(prompt);
    return text.trim();
  } catch (err) {
    console.error("Passage Generation Failed:", err);
    return null; // Fallback to static in practice.js
  }
}

/**
 * Generate quiz questions based on topic and user level
 */
export async function generateQuizQuestions(topic = "Reading Fluency") {
  const level = await getUserLevel();
  const prompt = `Generate 5 multiple-choice questions about '${topic}' in English for a ${level} learner. 
    Ensure the questions are unique and cover different aspects of the topic.
    Choose interesting real-world scenarios or sentence examples.
    Return the response as a JSON array of objects.
    Each object MUST have:
    - "q": The question text
    - "opts": An array of exactly 4 options
    - "ans": The 0-based index of the correct option
    Return ONLY the raw JSON array, no markdown blocks.`;

  try {
    const responseText = await callGemini(prompt);
    // Clean up potential markdown formatting
    const jsonStr = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Quiz Generation Failed:", err);
    return null; // Fallback to static in quiz.js
  }
}

/* ── Internal Helpers ────────────────────────────────────────── */

async function callGemini(prompt) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PASTE_YOUR_KEY')) {
    throw new Error("Missing Gemini API Key");
  }

  const response = await fetch(`${API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }]
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "API Request Failed");
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function getUserLevel() {
  const user = getCurrentUser();
  if (!user) return "Beginner";

  const profile = await getProfile(user.id);
  if (!profile) return "Beginner";

  // Infer level from goal or use a default if not explicitly saved
  // For now, let's assume "Intermediate" if they have a goal, or "Beginner" otherwise.
  // We can enhance this by adding a level field to onboarding later.
  const goal = profile.learning_goal?.toLowerCase() || "";
  if (goal.includes("advanced") || goal.includes("business") || goal.includes("fluent")) return "Advanced";
  if (goal.includes("improve") || goal.includes("better") || goal.includes("intermediate")) return "Intermediate";
  
  return "Beginner";
}
