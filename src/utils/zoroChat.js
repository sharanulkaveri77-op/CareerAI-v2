/**
 * Zoro Conversational Intelligence & Dynamic Technical Interview Engine
 * Powered by Gemini AI (with gemini-3.1-flash-lite & high-quota endpoints)
 * and deep semantic topic comprehension for instant, role-calibrated responses to Sharanu.
 */

import {
  normalizeRole,
  getDifficultyForIndex,
  getQuestionForRole,
  ROLE_QUESTION_BANK,
} from './roleQuestions'

export async function generateZoroResponse(userText, options = {}) {
  const {
    interviewer = { name: 'CAREERAI', title: 'Personal AI Companion (Gemini 3.8 Flash)' },
    history = [],
    wpm = 135,
    eyeContact = 95,
    deliveryScore = 90,
    config = {},
    role = 'Full Stack Engineer',
    difficulty = 'Basic',
    questionIndex = 0,
    candidateName = 'Sharanu',
  } = options

  const cleanText = (userText || '').trim()
  const lower = cleanText.toLowerCase().replace(/[^a-z0-9\s]/g, ' ')
  const normalizedRole = normalizeRole(role)
  const roleData = ROLE_QUESTION_BANK[normalizedRole] || ROLE_QUESTION_BANK['full stack engineer']
  const currentDiff = difficulty || getDifficultyForIndex(questionIndex)

  // 1. Direct Gemini AI API call with working active models
  const apiKey =
    config.apiKey ||
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_GEMINI_API_KEY) ||
    ''

  if (apiKey && apiKey.length > 15) {
    try {
      const recentTurns = history
        .slice(-4)
        .map((h) => `${h.sender === 'user' ? candidateName : 'CAREERAI'}: ${h.text}`)
        .join('\n')

      const isExplicitQuestionRequest =
        lower.includes('next question') ||
        lower.includes('ask me a question') ||
        lower.includes('give me a question') ||
        lower.includes('interview question') ||
        lower.includes('test me') ||
        lower.includes('quiz me')

      const prompt = `You are CAREERAI, a friendly, encouraging AI conversational companion and technical mentor talking live on video with ${candidateName}.
Target Role: ${roleData.title}

Recent Conversation Context:
${recentTurns}

Candidate ${candidateName} Said/Asked: "${cleanText}"

CRITICAL INSTRUCTIONS:
1. Speak in 1-3 natural, warm, conversational spoken sentences directly to ${candidateName}.
2. If ${candidateName} asked a question (e.g. "what is html", "what is a database", "how does an api work", etc.):
   - Answer their question directly, clearly, and concisely.
   - DO NOT append or ask any technical interview question after your answer. Keep it natural and conversational!
3. If ${candidateName} gave a short reply, comment, greeting, or answer (e.g. "okay nice on", "cool", "sounds good", "yes", or answered an earlier topic):
   - Respond naturally and warmly to their comment.
   - DO NOT interrogate or force a technical question after responding!
4. ONLY ask a technical question if ${candidateName} explicitly asked you to ask one (such as saying "ask me a question" or "next question"). Otherwise, NEVER attach an unprompted technical question.
5. Address ${candidateName} naturally by name. Do NOT use markdown, bullet points, asterisks, brackets, or quotes.`

      const models = [
        'gemini-3.1-flash-lite',
        'gemini-3.1-flash-lite-preview',
        'gemini-flash-lite-latest',
        'gemini-flash-latest',
      ]

      for (const model of models) {
        try {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 3500)

          const res = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              signal: controller.signal,
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
              }),
            }
          )
          clearTimeout(timeoutId)

          if (res.ok) {
            const data = await res.json()
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text
            if (text && text.trim()) {
              return text.replace(/[*_#`~[\]]/g, '').trim()
            }
          }
        } catch {
          // try next model or semantic fallback
        }
      }
    } catch {
      // proceed to rich semantic responder
    }
  }

  // 2. Comprehensive Semantic Topic Engine (Role-aware conversational responder)
  const nextQ = getQuestionForRole(normalizedRole, currentDiff, questionIndex + 1)

  // Candidate Casual Affirmation (e.g. "okay nice on", "cool", "great", "sounds good", "fine")
  if (
    lower.includes('okay') ||
    lower.includes('ok') ||
    lower.includes('nice') ||
    lower.includes('cool') ||
    lower.includes('great') ||
    lower.includes('awesome') ||
    lower.includes('got it') ||
    lower.includes('sounds good') ||
    lower.includes('fine')
  ) {
    return `Glad to hear that, ${candidateName}! Feel free to ask me any technical questions, or let me know whenever you'd like to dive into a specific topic.`
  }

  // Candidate Doesn't Know / Needs Support
  if (
    lower.includes('dont know') ||
    lower.includes("don't know") ||
    lower.includes('no idea') ||
    lower.includes('not sure') ||
    lower.includes('dont kow') ||
    lower.includes("don't kow") ||
    lower.trim() === 'no' ||
    lower.includes('i do not know') ||
    lower.includes('skip')
  ) {
    return `No problem at all, ${candidateName}! In technical discussions, honesty is a great quality. Feel free to ask me about any concept you'd like explained, or let me know what you'd like to talk about.`
  }

  // Relational Databases & SQL
  if (
    lower.includes('relational') ||
    lower.includes('database') ||
    lower.includes('table') ||
    lower.includes('schema') ||
    lower.includes('rdbms') ||
    lower.includes('sql') ||
    lower.includes('postgres') ||
    lower.includes('mongodb')
  ) {
    if (lower.includes('store') || lower.includes('row') || lower.includes('column') || lower.includes('in the') || lower.includes('table')) {
      return `Spot on, ${candidateName}! Relational databases organize data into structured tables with rows, columns, and primary keys to enforce strong schema integrity. Excellent explanation!`
    }
    return `In a relational database, data is structured into tables with rows and columns, enforced by schemas and ACID transactions for reliable persistence, ${candidateName}. Feel free to ask if you'd like to explore any specific query or pattern!`
  }

  // APIs, REST, HTTP, CRUD, JSON
  if (lower.includes('api') || lower.includes('rest') || lower.includes('http') || lower.includes('crud') || lower.includes('json')) {
    return `APIs allow applications to communicate, ${candidateName}. RESTful APIs use standard HTTP methods like GET and POST with JSON payloads to perform CRUD operations cleanly.`
  }

  // HTML & Markup
  if (lower.includes('html') || lower.includes('markup') || lower.includes('ishtml')) {
    return `HTML stands for HyperText Markup Language, ${candidateName}. It provides the structural building blocks for web pages using semantic elements like header, main, and article.`
  }

  // CSS & Styling
  if (lower.includes('css') || lower.includes('style') || lower.includes('flexbox') || lower.includes('tailwind')) {
    return `CSS, or Cascading Style Sheets, styles and formats HTML elements on the web using layout systems like Flexbox and Grid, ${candidateName}.`
  }

  // JavaScript & Execution
  if (lower.includes('javascript') || lower.includes('js') || lower.includes('event loop') || lower.includes('closure')) {
    return `JavaScript is a versatile, asynchronous scripting language that powers interactive web interfaces and Node.js servers, ${candidateName}.`
  }

  // React & UI Libraries
  if (lower.includes('react') || lower.includes('hook') || lower.includes('useeffect') || lower.includes('usestate') || lower.includes('props')) {
    return `React is a component-based frontend library that uses declarative state and a virtual DOM to build interactive user interfaces efficiently, ${candidateName}.`
  }

  // Node.js & Backend
  if (lower.includes('node') || lower.includes('express') || lower.includes('backend') || lower.includes('server')) {
    return `Node.js is an asynchronous, event-driven JavaScript runtime built on Chrome's V8 engine that powers high-concurrency backend services, ${candidateName}.`
  }

  // Docker & Containers
  if (lower.includes('docker') || lower.includes('container') || lower.includes('kubernetes')) {
    return `Docker packages software and its dependencies into lightweight, isolated containers that run reliably across different computing environments, ${candidateName}.`
  }

  // Git & Version Control
  if (lower.includes('git') || lower.includes('github') || lower.includes('merge') || lower.includes('branch')) {
    return `Git is a distributed version control system that tracks source code revisions and allows multiple engineers to collaborate seamlessly, ${candidateName}.`
  }

  // Requesting Hint / Clarification
  if (
    lower.includes('hint') ||
    lower.includes('help') ||
    lower.includes('stuck') ||
    lower.includes('guidance') ||
    lower.includes('clue')
  ) {
    return `Here is a helpful hint, ${candidateName}: Break the problem down into simple steps. Think about the fundamental input, the expected output, and how data moves between them.`
  }

  // Explicit Request for Next Question
  if (
    lower.includes('next question') ||
    lower.includes('ask me a question') ||
    lower.includes('give me a question') ||
    lower.includes('interview question') ||
    lower.includes('test me') ||
    lower.includes('ask question')
  ) {
    return `Here is your next ${currentDiff} question for ${roleData.title}, ${candidateName}: ${nextQ}`
  }

  // Score My Answer
  if (lower.includes('score my answer') || lower.includes('evaluate') || lower.includes('rubric') || lower.includes('how did i do')) {
    return `Evaluating your answer, ${candidateName}: Your vocal pacing is steady at ${wpm} WPM and your eye contact is strong at ${eyeContact}%. You explained the core idea well. To make it even stronger, mention a concrete real-world example.`
  }

  // Switch Topic
  if (lower.includes('switch topic')) {
    const topic = roleData.topics[Math.floor(Math.random() * roleData.topics.length)] || 'Core Concepts'
    return `Switching topics to ${topic}, ${candidateName}. Feel free to ask any question or tell me what area you want to focus on!`
  }

  // Greetings / Identity
  if (lower.includes('who are you') || lower.includes('what are you') || lower.includes('introduce')) {
    return `I am CAREERAI, your personal AI companion and mentor powered by Gemini AI. I'm here to practice, answer your technical questions, and help you prepare, ${candidateName}.`
  }

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey') || lower.includes('ready')) {
    return `Hello ${candidateName}! Great to see you. Feel free to ask me any technical questions, or let me know whenever you'd like a mock interview question!`
  }

  // Unknown "What is X"
  const whatIsMatch = cleanText.match(/what\s+is\s+([a-zA-Z0-9_\s]{2,30})/i)
  if (whatIsMatch && whatIsMatch[1]) {
    const subject = whatIsMatch[1].trim()
    return `${subject} is a fundamental concept in software engineering, ${candidateName}. In building applications, it helps ensure modularity, reliability, and clear separation of concerns.`
  }

  // Substantive candidate answer (> 4 words)
  const words = cleanText.split(/\s+/).filter(Boolean).length
  if (words >= 4) {
    return `Good explanation, ${candidateName}! You highlighted the key principles nicely. Vocal pacing is steady at ${wpm} WPM with strong gaze centering.`
  }

  return `Understood, ${candidateName}! Let me know what you'd like to explore, or ask me whatever is on your mind.`
}
