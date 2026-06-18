/**
 * src/services/ai.js
 * Dual-AI Smart Coach Chatbot & syllabus generator using Groq (Llama 3).
 */

import { GROQ_API_KEY } from '../../js/config.js'; // Keep importing from the original config to avoid breaking keys
import { getProfile, getCurrentSubject, trackMistake } from './storage.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function getActiveGroqKey() {
  const saved = localStorage.getItem('vaaniai_settings');
  if (saved) {
    try {
      const settings = JSON.parse(saved);
      if (settings.groqKey && settings.groqKey.length > 5) {
        return settings.groqKey;
      }
    } catch (_) {}
  }
  return null;
}

async function getUserContext(currentUser) {
  const subject = getCurrentSubject();
  if (!currentUser) return { level: "Beginner", occupation: "Student", subject };

  const profile = await getProfile(currentUser.id);
  if (!profile) return { level: "Beginner", occupation: "Student", subject };

  const goal = profile.learning_goal || "";
  const occupation = profile.occupation || "Student";
  let level = "Beginner";

  if (goal === "Business Communication" || goal === "Public Speaking") level = "Advanced";
  else if (goal === "Pass an Exam (IELTS/TOEFL)" || goal === "Improve Fluency") level = "Intermediate";
  else if (goal === "Daily Conversation") level = "Beginner";
  
  return { level, occupation, subject };
}

async function callGroq(prompt, model = 'llama-3.3-70b-versatile') {
  const userKey = getActiveGroqKey();
  const apiKey = userKey || GROQ_API_KEY;

  if (!apiKey || apiKey.includes('PASTE_YOUR_KEY')) {
    throw new Error("Missing Groq API Key. Please set it in Settings.");
  }

  const response = await fetch(GROQ_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
      max_tokens: 1500
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || "Groq API Request Failed");
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content || "";
  if (!text) throw new Error("Groq returned empty response");
  return text;
}

/**
 * Build the system prompt using user context so the coach is personalized.
 */
async function buildSystemPrompt(currentUser, coachPersonality = 'Friendly') {
  let name = 'Learner';
  let level = 'Beginner';
  let occupation = 'Student';
  let goal = 'Improve Fluency';
  const subject = getCurrentSubject();
  const isCoding = subject !== 'English';

  try {
    if (currentUser) {
      const profile = await getProfile(currentUser.id);
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
    personalityPrompt = `Maintain a formal, professional tone. Focus on ${isCoding ? 'clean code, best practices, and architecture' : 'business etiquette and precise grammar'}.`;
  } else if (coachPersonality === 'Strict') {
    personalityPrompt = `Be a strict mentor. Correct every ${isCoding ? 'syntax error or logical flaw' : 'grammar mistake'} immediately and focus heavily on technical accuracy.`;
  } else {
    personalityPrompt = `Be a friendly, encouraging coach. Use motivating language and focus on building confidence in ${subject}.`;
  }

  return `You are VaaniAI Smart Coach — a ${coachPersonality.toLowerCase()}, expert ${subject} ${isCoding ? 'Mentor' : 'Tutor'} embedded inside the VaaniAI learning platform.
${personalityPrompt}

User profile:
- Name: ${name}
- Level: ${level}
- Occupation: ${occupation}
- Learning Goal: ${goal}
- Current Subject: ${subject}

Your capabilities:
${isCoding ? `- Answer any ${subject} programming, logic, or syntax questions
- Explain concepts like variables, loops, classes, and algorithms
- Provide code snippets and debug assistance` : 
`- Answer any English grammar, vocabulary, pronunciation, or verbal aptitude question
- Explain concepts from the syllabus (Sentence Patterns, Tenses, Voice, Reported Speech, Conditionals, Prepositions, Phrasal Verbs, Articles, Concord, Adverbs)`}
- Give practice tips, study plans, and encouragement
- Answer general knowledge questions (you are a capable AI assistant)
- Keep responses concise, clear, and motivating — use emojis sparingly

CRITICAL: If the user makes a recurring ${isCoding ? 'logical or syntax' : 'grammar or vocabulary'} mistake, conclude your message with exactly: [MISTAKE: CategoryName]
Categories for English: Tenses, Voice, Reported Speech, Concord, Prepositions, Phrasal Verbs, Articles, Adverbs, Modifiers.
Categories for ${subject}: Syntax, Logic, Naming, Efficiency, Security.

Always personalize responses to ${name}'s level (${level}) and occupation (${occupation}).`;
}

/**
 * Main chat function — Groq only
 */
export async function sendChatMessage(currentUser, chatHistory, userMessage, imageData = null, coachPersonality = 'Friendly') {
  const updatedHistory = [...chatHistory, { role: 'user', content: userMessage, imageData }];
  const recentHistory = updatedHistory.slice(-12);

  const systemPrompt = await buildSystemPrompt(currentUser, coachPersonality);
  
  let result;

  if (imageData) {
    result = { 
      text: "I couldn't analyze that image because Groq does not support image analysis yet. Please try again with text only.", 
      source: 'Error' 
    };
  } else {
    try {
      const apiKey = getActiveGroqKey() || GROQ_API_KEY;
      if (!apiKey || apiKey.includes('PASTE_YOUR_KEY')) {
        throw new Error('Missing Groq API Key. Please set it in Settings.');
      }

      const groqMessages = [
        { role: 'system', content: systemPrompt },
        ...recentHistory.map(m => ({ role: m.role, content: m.content }))
      ];

      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
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
      
      result = { text, source: 'Groq (Llama 3)' };
    } catch (err) {
      console.error('[VaaniAI Chat] Groq failed:', err);
      result = {
        text: "I'm having trouble connecting to the AI right now. Please verify your free API keys in settings or config.js! 🔧",
        source: 'Error'
      };
    }
  }

  // Parse mistake categories
  const mistakeMatch = result.text.match(/\[MISTAKE:\s*(.*?)\]/i);
  if (mistakeMatch) {
    const category = mistakeMatch[1].trim();
    trackMistake(category);
    result.text = result.text.replace(/\[MISTAKE:.*?\]/i, '').trim();
  }

  return {
    assistantMessage: { role: 'assistant', content: result.text },
    source: result.source,
    updatedHistory: [...updatedHistory, { role: 'assistant', content: result.text }]
  };
}

/**
 * Generate practice passages
 */
export async function generatePracticePassage(currentUser) {
  const { level, occupation, subject } = await getUserContext(currentUser);
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2);
  let lengthInstruction = "";
  
  if (level === "Beginner") {
    lengthInstruction = "The content should be short, simple, and easy to read, exactly 1-2 sentences. Use basic vocabulary.";
  } else if (level === "Intermediate") {
    lengthInstruction = "The content should be moderately challenging, exactly 2-3 sentences.";
  } else {
    lengthInstruction = "The content should be complex and detailed, exactly 3-4 sentences forming a rich paragraph with advanced vocabulary.";
  }

  const isCoding = ['Python', 'Java', 'C++'].includes(subject) || subject.toLowerCase().includes('program') || subject.toLowerCase().includes('code');
  const prompt = `Generate a highly unique and creative ${isCoding ? 'coding practice snippet or explanation' : 'reading practice passage'} in ${subject} for a ${level} level learner who is a ${occupation}. 
    Reference ID: ${seed}
    ${lengthInstruction}
    ${isCoding ? 'For coding, provide a code snippet and a brief explanation. Ensure it is syntactically correct.' : 'Include verbal aptitude elements from the Module appropriate for their level.'}
    Use scenarios related to their background as a ${occupation}.
    CRITICAL: DO NOT use generic topics. Choose something niche, modern, or unexpected.
    Return ONLY the plain text, nothing else. No markdown, no quotes.`;

  try {
    const text = await callGroq(prompt);
    return text.trim();
  } catch (err) {
    console.error("Passage Generation Failed:", err);
    return null;
  }
}

/**
 * Generate quiz questions based on topic and user level
 */
export async function generateQuizQuestions(currentUser, topic = "Verbal Aptitude (Module)") {
  const { level, occupation, subject } = await getUserContext(currentUser);
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2);
  const isCoding = ['Python', 'Java', 'C++'].includes(subject) || subject.toLowerCase().includes('program') || subject.toLowerCase().includes('code');
  
  let difficultyInstruction = "";
  if (level === "Beginner") {
    difficultyInstruction = `The questions should be relatively easy, focusing on foundational ${isCoding ? 'syntax and logic' : 'grammar rules'}. Avoid overly tricky distractors.`;
  } else if (level === "Intermediate") {
    difficultyInstruction = `The questions should be moderately challenging, requiring a good understanding of ${isCoding ? 'core concepts and libraries' : 'the syllabus grammar'}.`;
  } else {
    difficultyInstruction = `The questions should be highly advanced and tricky, testing nuanced ${isCoding ? 'performance, architecture, and edge cases' : 'grammar and professional vocabulary'}.`;
  }

  const prompt = `Generate exactly 10 unique, high-variety multiple-choice questions about '${isCoding ? subject + ' programming' : topic}' for a ${level} learner who is a ${occupation}. 
    Reference ID: ${seed}
    ${difficultyInstruction}
    ${!isCoding ? 'Focus strictly on topics from their COMPLETED Syllabus Module: Sentence Patterns, Verb Tenses, Voice, Reported Speech, Concord, Prepositions, Phrasal Verbs, Conditionals, Adverbs, Articles, or Dangling Modifiers.' : ''}
    Use diverse question types: vocabulary, comprehension, grammar, and situational scenarios.
    CRITICAL: Avoid standard textbook examples. Be imaginative and challenging.
    Return the response as a JSON array of exactly 10 objects.
    Each object MUST have:
    - "q": The question text
    - "opts": An array of exactly 4 options
    - "ans": The 0-based index of the correct option
    Return ONLY the raw JSON array, no markdown blocks.`;

  try {
    const responseText = await callGroq(prompt);
    const jsonStr = responseText.replace(/```json|```/g, '').trim();
    return JSON.parse(jsonStr);
  } catch (err) {
    console.error("Quiz Generation Failed:", err);
    return null;
  }
}

/**
 * Generate a unique daily challenge scenario
 */
export async function generateDailyChallenge(currentUser) {
  const { level, occupation, subject } = await getUserContext(currentUser);
  const isCoding = ['Python', 'Java', 'C++'].includes(subject) || subject.toLowerCase().includes('program') || subject.toLowerCase().includes('code');
  
  const prompt = `Generate a unique, interactive learning challenge for a ${level} level learner who is a ${occupation} studying ${subject}.
    The challenge should be a 'Flash-Chat' mission.
    ${isCoding ? `Example scenarios: debugging a snippet, explaining a ${subject} concept, or optimizing a small function.` : `Example scenarios: ordering a coffee with a specific constraint, responding to a job interview question, or explaining a technical concept to a child.`}
    Return the response as a JSON object with:
    - "title": A catchy name for the mission
    - "scenario": A detailed description of the situation
    - "task": The specific question or prompt the user must respond to
    Return ONLY the raw JSON, no markdown.`;

  try {
    const responseText = await callGroq(prompt);
    return JSON.parse(responseText.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error("Challenge Generation Failed:", err);
    return {
      title: isCoding ? `The ${subject} Bug` : "The Elevator Pitch",
      scenario: isCoding ? `A critical bug was found in your ${subject} code.` : "You just bumped into a potential investor in an elevator. You have 30 seconds to explain your product.",
      task: isCoding ? `Explain how you would debug this situation.` : "What do you say to grab their attention?"
    };
  }
}

/**
 * Generate a Roleplay Scenario
 */
export async function generateRoleplayScenario(currentUser) {
  const { level, occupation, subject } = await getUserContext(currentUser);
  const isCoding = ['Python', 'Java', 'C++'].includes(subject) || subject.toLowerCase().includes('program') || subject.toLowerCase().includes('code');
  
  const prompt = `Generate a real-world ${isCoding ? subject + ' technical' : 'English'} roleplay scenario for a ${level} level learner who is a ${occupation}.
    The scenario should involve a conversation with an AI character.
    ${isCoding ? `Examples: 
    - Code review with a senior dev
    - Discussing a feature with a project manager
    - Explaining a bug to a non-technical client` : `Examples: 
    - At a doctor's appointment (Beginner)
    - Negotiating a contract (Advanced)
    - Handling a customer complaint (Intermediate)`}
    Return the response as a JSON object with:
    - "scenario": A brief description of the setting
    - "ai_character": Who the AI is acting as
    - "goal": What the user needs to achieve
    - "first_message": The AI's opening line to start the roleplay
    Return ONLY the raw JSON, no markdown blocks.`;

  try {
    const responseText = await callGroq(prompt);
    return JSON.parse(responseText.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error("Roleplay Generation Failed:", err);
    return {
      scenario: isCoding ? "Code Review" : "Checking into a hotel",
      ai_character: isCoding ? "Senior Developer" : "Hotel Receptionist",
      goal: isCoding ? `Explain your ${subject} design choice` : "Check into your room and ask about breakfast times",
      first_message: isCoding ? "I've looked at your PR. Can you explain why you chose this approach?" : "Welcome to the Grand View Hotel! How can I help you today?"
    };
  }
}

/**
 * Evaluate a user's response to a challenge
 */
export async function evaluateChallengeResponse(task, userResponse) {
  const prompt = `Evaluate this response to a language learning challenge.
    Challenge Task: ${task}
    User Response: ${userResponse}
    
    Provide an evaluation in JSON format:
    - "score": A number from 0 to 100
    - "feedback": Constructive feedback on grammar, tone, and effectiveness
    - "suggestion": One specific sentence they could have used instead
    Return ONLY the raw JSON, no markdown.`;

  try {
    const responseText = await callGroq(prompt, 'llama-3.1-8b-instant');
    return JSON.parse(responseText.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error("Challenge Evaluation Failed:", err);
    return { score: 70, feedback: "Great effort! Try to be more concise.", suggestion: "I'm working on a revolutionary AI tool." };
  }
}

/**
 * Generate a complete syllabus and modules for a custom topic
 */
export async function generateCustomSyllabus(topicName) {
  const prompt = `Generate a comprehensive, professional-grade learning syllabus for the topic: "${topicName}".
    Return ONLY a raw JSON object with no markdown formatting. The JSON must match this structure exactly:
    {
      "modules": [
        { "num": "Module 1", "title": "Module Title", "desc": "Brief 1-sentence description", "status": "In Progress", "progress": 20, "icon": "●", "class": "active-unit" },
        { "num": "Module 2", "title": "Module Title", "desc": "Brief 1-sentence description", "status": "0% Done", "progress": 0, "icon": "📖", "class": "" },
        { "num": "Module 3", "title": "Module Title", "desc": "Brief 1-sentence description", "status": "Locked", "progress": 0, "icon": "🔒", "class": "locked" },
        { "num": "Module 4", "title": "Module Title", "desc": "Brief 1-sentence description", "status": "Locked", "progress": 0, "icon": "🔒", "class": "locked" }
      ],
      "chapters": [
        { "title": "Chapter 1: Title", "body": "<p>Rich HTML content here with <h4> subheadings, <ul> lists, and <pre><code> blocks if applicable.</p>" },
        { "title": "Chapter 2: Title", "body": "<p>Rich HTML content here...</p>" },
        { "title": "Chapter 3: Title", "body": "<p>Rich HTML content here...</p>" },
        { "title": "Chapter 4: Title", "body": "<p>Rich HTML content here...</p>" },
        { "title": "Chapter 5: Title", "body": "<p>Rich HTML content here...</p>" }
      ]
    }
    Requirements:
    1. Provide exactly 4 or 5 modules.
    2. Provide exactly 8 to 10 chapters.
    3. The chapter 'body' MUST be formatted in clean, rich HTML (use <p>, <h4>, <ul>, <li>, <strong>, <em>, and <pre><code> for code if it's a programming topic).
    4. Ensure the content is accurate and highly educational.`;

  try {
    const userKey = getActiveGroqKey();
    const apiKey = userKey || GROQ_API_KEY;

    if (!apiKey || apiKey.includes('PASTE_YOUR_KEY')) {
      throw new Error("Missing Groq API Key. Please set it in Settings.");
    }

    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 3000
      })
    });

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData.error?.message || "Groq API Request Failed");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    if (!text) throw new Error("Groq returned empty response");
    
    return JSON.parse(text.replace(/```json|```/g, '').trim());
  } catch (err) {
    console.error("Custom Syllabus Generation Failed:", err);
    throw err;
  }
}
