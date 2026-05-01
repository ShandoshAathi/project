import { GEMINI_API_KEY, OPENAI_API_KEY } from './config.js';
import { getProfile } from './storage.js';
import { getCurrentUser } from './auth.js';

const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

// Choose your preferred provider: 'gemini' or 'openai'
const AI_PROVIDER = 'openai'; 

export async function generatePracticePassage() {
  const { level, occupation } = await getUserContext();
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const prompt = `Generate a highly unique and creative reading practice passage in English for a ${level} level learner who is a ${occupation}. 
    Reference ID: ${seed}
    The passage should be exactly 2-3 sentences long. 
    Use complex, specific vocabulary and scenarios related to their background as a ${occupation}.
    CRITICAL: DO NOT use generic topics like 'The sun rises'. Choose something niche, modern, or unexpected.
    Return ONLY the plain text of the passage, nothing else.`;

  try {
    const text = AI_PROVIDER === 'openai' 
      ? await callOpenAI(prompt)
      : await callGemini(prompt);
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
  const { level, occupation } = await getUserContext();
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const prompt = `Generate 10 unique, high-variety multiple-choice questions about '${topic}' in English for a ${level} learner who is a ${occupation}. 
    Reference ID: ${seed}
    Use diverse question types: vocabulary, comprehension, grammar, and situational scenarios relevant to a ${occupation}.
    CRITICAL: Avoid standard textbook examples. Be imaginative and challenging.
    Return the response as a JSON array of 10 objects.
    Each object MUST have:
    - "q": The question text
    - "opts": An array of exactly 4 options
    - "ans": The 0-based index of the correct option
    Return ONLY the raw JSON array, no markdown blocks.`;

  try {
    const responseText = AI_PROVIDER === 'openai'
      ? await callOpenAI(prompt)
      : await callGemini(prompt);
      
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

  const response = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
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

async function callOpenAI(prompt) {
  if (!OPENAI_API_KEY || OPENAI_API_KEY.includes('PASTE_YOUR_KEY')) {
    throw new Error("Missing OpenAI API Key");
  }

  const response = await fetch(OPENAI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo", // or "gpt-4"
      messages: [{ role: "user", content: prompt }],
      temperature: 0.9,
      presence_penalty: 0.6,
      frequency_penalty: 0.6
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "OpenAI API Request Failed");
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}

async function getUserContext() {
  const user = getCurrentUser();
  if (!user) return { level: "Beginner", occupation: "Student" };

  const profile = await getProfile(user.id);
  if (!profile) return { level: "Beginner", occupation: "Student" };

  const goal = profile.learning_goal || "";
  const occupation = profile.occupation || "Student";
  let level = "Beginner";

  if (goal === "Business Communication" || goal === "Public Speaking") level = "Advanced";
  else if (goal === "Pass an Exam (IELTS/TOEFL)" || goal === "Improve Fluency") level = "Intermediate";
  else if (goal === "Daily Conversation") level = "Beginner";
  
  return { level, occupation };
}
