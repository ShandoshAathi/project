import { GROQ_API_KEY } from './config.js';
import { getProfile, getCurrentSubject } from './storage.js';
import { getCurrentUser } from './state.js';
import { getActiveGroqKey } from './settings.js';

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function generatePracticePassage() {
  const { level, occupation, subject } = await getUserContext();
  const seed = Date.now().toString(36) + Math.random().toString(36).substring(2);
  let lengthInstruction = "";
  // ... (rest of length logic) ...
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
export async function generateQuizQuestions(topic = "Verbal Aptitude (Module)") {
  const { level, occupation, subject } = await getUserContext();
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
    // Clean up potential markdown formatting
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
export async function generateDailyChallenge() {
  const { level, occupation, subject } = await getUserContext();
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
export async function generateRoleplayScenario() {
  const { level, occupation, subject } = await getUserContext();
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
    const responseText = await callGroq(prompt);
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
    // Increase max_tokens since this is a large generation
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

/* ── Internal Helpers ────────────────────────────────────────── */

async function callGroq(prompt) {
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

async function getUserContext() {
  const user = getCurrentUser();
  const subject = getCurrentSubject();
  
  if (!user) return { level: "Beginner", occupation: "Student", subject };

  const profile = await getProfile(user.id);
  if (!profile) return { level: "Beginner", occupation: "Student", subject };

  const goal = profile.learning_goal || "";
  const occupation = profile.occupation || "Student";
  let level = "Beginner";

  if (goal === "Business Communication" || goal === "Public Speaking") level = "Advanced";
  else if (goal === "Pass an Exam (IELTS/TOEFL)" || goal === "Improve Fluency") level = "Intermediate";
  else if (goal === "Daily Conversation") level = "Beginner";
  
  return { level, occupation, subject };
}
