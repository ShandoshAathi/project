/**
 * ai_chatbot.js — Dual-AI Smart Coach Chatbot
 * Races Google Gemini vs Groq (Llama 3)
 * Groq is used as a lightning-fast, 100% free alternative to OpenAI.
 */
import { GEMINI_API_KEY, GROQ_API_KEY } from './config.js';
import { getProfile, saveChatHistory, getChatHistory, clearChatHistory } from './storage.js';
import { getCurrentUser } from './state.js';

const GEMINI_URL  = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
const GROQ_URL    = 'https://api.groq.com/openai/v1/chat/completions'; // OpenAI compatible endpoint

// Conversation history (OpenAI format)
let chatHistory = getChatHistory();
let coachPersonality = 'Friendly'; // Default: Friendly, Professional, Strict

/**
 * Build the system prompt using user context so the coach is personalized.
 */
async function buildSystemPrompt() {
  let name = 'Learner';
  let level = 'Beginner';
  let occupation = 'Student';
  let goal = 'Improve Fluency';

  try {
    const user = getCurrentUser();
    if (user) {
      const profile = await getProfile(user.id);
      if (profile) {
        name       = profile.full_name   || name;
        occupation = profile.occupation  || occupation;
        goal       = profile.learning_goal || goal;
        if (goal === 'Business Communication' || goal === 'Public Speaking') level = 'Advanced';
        else if (goal === 'Pass an Exam (IELTS/TOEFL)' || goal === 'Improve Fluency') level = 'Intermediate';
        else level = 'Beginner';
      }
    }
  } catch (_) { /* use defaults */ }

  let personalityPrompt = "";
  if (coachPersonality === 'Professional') {
    personalityPrompt = "Maintain a formal, professional tone. Focus on business etiquette and precise grammar.";
  } else if (coachPersonality === 'Strict') {
    personalityPrompt = "Be a strict examiner. Correct every mistake immediately and focus heavily on technical accuracy.";
  } else {
    personalityPrompt = "Be a friendly, encouraging coach. Use motivating language and focus on building confidence.";
  }

  return `You are VaaniAI Smart Coach — a ${coachPersonality.toLowerCase()}, expert English language tutor embedded inside the VaaniAI learning platform.
${personalityPrompt}

User profile:
- Name: ${name}
- Level: ${level}
- Occupation: ${occupation}
- Learning Goal: ${goal}

Your capabilities:
- Answer any English grammar, vocabulary, pronunciation, or verbal aptitude question
- Explain concepts from the syllabus (Sentence Patterns, Tenses, Voice, Reported Speech, Conditionals, Prepositions, Phrasal Verbs, Articles, Concord, Adverbs)
- Give practice tips, study plans, and encouragement
- Answer general knowledge questions the user asks (you are a capable AI assistant)
- Keep responses concise, clear, and motivating — use emojis sparingly for a premium feel

Always personalize responses to ${name}'s level (${level}) and occupation (${occupation}).
If asked about topics outside English learning, answer helpfully but briefly encourage returning to their study goal.`;
}

/**
 * Call Gemini Flash — returns text or throws
 */
async function callGemini(systemPrompt, messages) {
  if (!GEMINI_API_KEY || GEMINI_API_KEY.includes('PASTE_YOUR_KEY')) {
    throw new Error('Missing Gemini API Key');
  }

  const contents = [];
  contents.push({
    role: 'user',
    parts: [{ text: systemPrompt + '\n\n[Conversation starts below]' }]
  });
  contents.push({
    role: 'model',
    parts: [{ text: 'Understood! I\'m VaaniAI Smart Coach, ready to help you excel in English. What would you like to learn or ask today? 🎯' }]
  });

  for (const m of messages) {
    const parts = [{ text: m.content }];
    
    // Add image if present in this specific message
    if (m.imageData) {
      parts.push({
        inline_data: {
          mime_type: 'image/jpeg',
          data: m.imageData // Base64
        }
      });
    }

    contents.push({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts
    });
  }

  const res = await fetch(`${GEMINI_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Gemini API Failed');
  }

  const data = await res.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  if (!text) throw new Error('Gemini returned empty response');
  return { text, source: 'Gemini' };
}

/**
 * Call Groq (Llama 3) — 100% free, OpenAI-compatible API
 */
async function callGroq(systemPrompt, messages) {
  if (!GROQ_API_KEY || GROQ_API_KEY.includes('PASTE_YOUR_KEY')) {
    throw new Error('Missing Groq API Key');
  }

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify({
      model: 'llama-3.3-70b-versatile', // Latest free model, replaced decommissioned 8b
      messages: groqMessages,
      temperature: 0.7,
      max_tokens: 600
    })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Groq API Failed');
  }

  const data = await res.json();
  const text = data.choices?.[0]?.message?.content || '';
  if (!text) throw new Error('Groq returned empty response');
  return { text, source: 'Groq (Llama 3)' };
}

/**
 * Main chat function — Race Gemini vs Groq
 *
 * @param {string} userMessage
 * @returns {Promise<{text: string, source: string}>}
 */
export async function sendChatMessage(userMessage, imageData = null) {
  chatHistory.push({ role: 'user', content: userMessage, imageData });

  if (chatHistory.length > 12) {
    chatHistory = chatHistory.slice(chatHistory.length - 12);
  }

  const systemPrompt = await buildSystemPrompt();
  const messages = [...chatHistory];

  let result;

  // If there is an image, only use Gemini (Groq doesn't support vision yet)
  if (imageData) {
    try {
      result = await callGemini(systemPrompt, messages);
    } catch (err) {
      result = { text: "I couldn't analyze that image. Please try again or use text only.", source: 'Error' };
    }
  } else {
    try {
      // Race both for text-only
      result = await Promise.any([
        callGemini(systemPrompt, messages),
        callGroq(systemPrompt, messages)
      ]);
    } catch (aggregateError) {
      console.warn('[VaaniAI Chat] Both AIs failed. Sequential fallback...');
      try {
        result = await callGemini(systemPrompt, messages);
      } catch (_) {
        try {
          result = await callGroq(systemPrompt, messages);
        } catch (__) {
          result = {
            text: "I'm having trouble connecting to the AI right now. Please verify your free API keys in config.js! 🔧",
            source: 'Error'
          };
        }
      }
    }
  }

  chatHistory.push({ role: 'assistant', content: result.text });
  saveChatHistory(chatHistory);
  return result;
}

export function setCoachPersonality(p) {
  coachPersonality = p;
}

export function resetChatHistory() {
  chatHistory = [];
  clearChatHistory();
}

export function getChatHistoryLength() {
  return chatHistory.length;
}
