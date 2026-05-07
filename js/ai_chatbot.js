/**
 * ai_chatbot.js — Dual-AI Smart Coach Chatbot
 * Races Google Gemini vs Groq (Llama 3)
 * Groq is used as a lightning-fast, 100% free alternative to OpenAI.
 */
import { GROQ_API_KEY } from './config.js';
import { getProfile, saveChatHistory, getChatHistory, clearChatHistory, addXP } from './storage.js';
import { getActiveGroqKey } from './settings.js';
import { getCurrentUser } from './state.js';

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

CRITICAL: If the user makes a recurring grammar or vocabulary mistake, conclude your message with exactly: [MISTAKE: CategoryName]
Categories: Tenses, Voice, Reported Speech, Concord, Prepositions, Phrasal Verbs, Articles, Adverbs, Modifiers.

Always personalize responses to ${name}'s level (${level}) and occupation (${occupation}).
If asked about topics outside English learning, answer helpfully but briefly encourage returning to their study goal.`;
}

/**
 * Call Groq (Llama 3) — 100% free, OpenAI-compatible API
 */
async function callGroq(systemPrompt, messages) {
  const userKey = getActiveGroqKey();
  const apiKey = userKey || GROQ_API_KEY;

  if (!apiKey || apiKey.includes('PASTE_YOUR_KEY')) {
    throw new Error('Missing Groq API Key. Please set it in Settings.');
  }

  const groqMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(m => ({ role: m.role, content: m.content }))
  ];

  const res = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
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
 * Main chat function — Groq only
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

  // If there is an image, we can't use Groq since it doesn't support vision yet
  if (imageData) {
    result = { text: "I couldn't analyze that image because Groq does not support image analysis yet. Please try again with text only.", source: 'Error' };
  } else {
    try {
      result = await callGroq(systemPrompt, messages);
    } catch (err) {
      console.error('[VaaniAI Chat] Groq failed:', err);
      result = {
        text: "I'm having trouble connecting to the AI right now. Please verify your free API keys in config.js! 🔧",
        source: 'Error'
      };
    }
  }

  chatHistory.push({ role: 'assistant', content: result.text });
  saveChatHistory(chatHistory);
  addXP(10); // Reward for each interaction

  // Check for mistake tagging
  const mistakeMatch = result.text.match(/\[MISTAKE:\s*(.*?)\]/i);
  if (mistakeMatch) {
    const category = mistakeMatch[1].trim();
    import('./storage.js').then(m => m.trackMistake(category));
    // Clean the tag from the text before returning if desired, 
    // or keep it for internal logic. We'll clean it for UI.
    result.text = result.text.replace(/\[MISTAKE:.*?\]/i, '').trim();
  }

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
