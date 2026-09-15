import { supabase } from './supabase'

// Primary path: Google Gemini API (gemini-3.6-flash).
// Fallback: Built-in question bank + rule-based coaching engine.

const QUESTION_BANK = {
  Technical: [
    'Walk me through the most technically challenging architecture you built recently. What trade-offs did you make?',
    'How do you debug a production memory leak or CPU spike in a distributed Node/Java web service?',
    'Explain the internal workings of the event loop or database indexing to a junior engineer.',
    'How do you design REST APIs to handle concurrent write spikes and race conditions safely?',
    'Tell me about a complex bug that took days to resolve. How did you isolate the root cause?',
    'How do you evaluate whether to write a custom microservice versus adopting a 3rd party SaaS tool?',
    'What strategy do you use for database migrations with zero downtime in production?',
    'Explain how WebSockets or Server-Sent Events (SSE) compare to standard HTTP long polling.',
    'How does garbage collection work in V8 or the JVM, and how do you prevent memory retention leaks?',
    'Explain how indexing (B-Tree vs Hash) improves SQL SELECT performance, and when an index slows down writes.',
    'What is the difference between synchronous vs asynchronous I/O operations under heavy server load?',
    'How do CORS (Cross-Origin Resource Sharing) headers work, and how do you resolve CORS errors securely?',
    'Explain how JWT authentication works compared to Session-based auth. What are the security tradeoffs?',
    'How do you handle database transaction isolation levels (Read Committed vs Serializable) to prevent dirty reads?',
  ],
  Behavioral: [
    'Tell me about a time you disagreed with a senior engineer on technical architecture. How did you resolve it?',
    'Describe a scenario where a critical deadline was approaching and requirements changed mid-sprint.',
    'Tell me about a technical project that failed or missed its target metrics. What key lesson did you learn?',
    'Give an example of a time you stepped up to lead a project or mentor an intern outside your explicit job scope.',
    'Describe a situation where you received tough performance feedback. What actionable steps did you take?',
    'Tell me about a time you had to explain complex technical trade-offs to non-technical stakeholders.',
    'Describe a time when you had to work with a difficult teammate who was uncooperative. How did you handle it?',
    'Give an example of a time you took ownership of a high-severity production bug during off-hours.',
    'Tell me about a time when you pushed back against management to protect software quality or technical debt.',
    'Describe how you stay productive when assigned an underspecified project with high ambiguity.',
  ],
  'System Design': [
    'Design a scalable URL shortener like Bitly capable of handling 100,000 requests per second.',
    'How would you design a real-time notification service for millions of mobile devices?',
    'Walk me through designing a ride-sharing driver location tracking system (like Uber).',
    'How would you architect a global collaborative document editor (like Google Docs)? What are the concurrency challenges?',
    'Design a real-time leaderboard system for a multiplayer gaming platform with millions of active users.',
    'Design a distributed rate limiter that throttles API requests per IP or user ID across a microservice cluster.',
    'How would you design a Video Streaming platform like YouTube or Netflix (CDN, encoding, video chunking)?',
    'Design a web crawler capable of scanning 1 billion web pages while avoiding duplicate URL loops.',
    'How would you design a distributed Key-Value store like Redis or DynamoDB with data replication?',
    'Design an E-Commerce Checkout & Inventory reservation system that prevents overselling during flash sales.',
  ],
  HR: [
    'Tell me about your career journey, top technical achievements, and what brings you to this interview today.',
    'Why are you targeting this specific engineering role, and what field of technology excites you most?',
    'Where do you see your technical leadership or individual contributor path evolving in 3 years?',
    'What team dynamics and engineering culture help you do your best work?',
    'What are your top 3 technical strengths, and how do you continuously overcome your weaknesses?',
    'Why are you considering leaving your current role, and what does success look like for your next step?',
    'How do you maintain work-life balance and avoid burnout when managing high-pressure delivery sprints?',
    'What is your expected salary compensation range, and what factors matter most to you in an offer package?',
    'Describe the accomplishment you are most proud of in your career so far.',
    'Why should our company hire you over other qualified candidates applying for this role?',
  ],
}

const STAR_HINTS = [
  'structure it as Situation → Task → Action → Result',
  'lead with the outcome, then explain how you got there',
  'quantify the impact if you can — numbers make it memorable',
]

function pickQuestion(type, index, asked = []) {
  const bank = QUESTION_BANK[type] || QUESTION_BANK.Technical
  const remaining = bank.filter((q) => !asked.includes(q))
  if (remaining.length > 0) {
    return remaining[index % remaining.length]
  }
  return bank[index % bank.length]
}

function heuristicFeedback(answer) {
  const words = answer.trim() ? answer.trim().split(/\s+/).length : 0
  const hasNumbers = /\d/.test(answer)
  const structured = /(situation|task|action|result|first|then|finally|because|so that|as a result)/i.test(answer)
  const ownership = /(i led|i owned|i built|i designed|i drove|i initiated|i took)/i.test(answer)
  const teamwork = /\b(we|team|collaborat|pair)/i.test(answer)

  const tips = []
  if (words < 40) tips.push('Expand a little — aim for 2–3 minutes with a concrete example.')
  else tips.push('Good depth — your answer had enough substance to evaluate.')

  tips.push(
    structured
      ? 'Nice structure; your answer was easy to follow.'
      : `Next time, ${STAR_HINTS[Math.floor(Math.random() * STAR_HINTS.length)]}.`
  )
  if (!hasNumbers) tips.push('Try adding a metric or number to show impact.')
  else tips.push('Backing your point with a number lands well.')
  if (ownership || teamwork) tips.push('Clear ownership/teamwork signal — interviewers look for that.')

  return tips.slice(0, 3).join(' ')
}

function heuristicSummary(history) {
  const count = history.length
  const avgWords = count
    ? Math.round(history.reduce((a, h) => a + (h.answer.trim().split(/\s+/).length), 0) / count)
    : 0
  const fillers = history.reduce(
    (a, h) => a + (h.answer.match(/\b(um+|uh+|like|basically|actually)\b/gi)?.length || 0),
    0
  )
  const structured = history.filter((h) =>
    /(situation|task|action|result|because|as a result|first)/i.test(h.answer)
  ).length

  const score = Math.max(
    35,
    Math.min(
      90,
      40 +
        Math.min(20, Math.round(avgWords / 6)) +
        structured * 8 -
        fillers * 2
    )
  )

  const strengths = []
  const improvements = []
  if (avgWords >= 60) strengths.push('Answers were detailed and substantive')
  else improvements.push('Give fuller answers — aim for 100+ words per response')
  if (structured >= Math.ceil(count / 2)) strengths.push('Consistently well-structured responses')
  else improvements.push('Use the STAR structure more deliberately')
  if (fillers <= 2) strengths.push('Minimal filler words')
  else improvements.push(`Reduce filler words (${fillers} detected across answers)`)

  return {
    score,
    overall:
      score >= 75
        ? 'Strong performance — your answers were clear and well supported by examples.'
        : score >= 55
          ? 'Decent performance with clear room to sharpen structure and examples.'
          : 'A useful first run — focus on structured storytelling with measurable outcomes.',
    strengths: strengths.length ? strengths : ['You completed the full interview'],
    improvements: improvements.length ? improvements : ['Keep practising to build consistency'],
  }
}

function cleanJsonText(rawText) {
  let cleaned = (rawText || '').trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
  }
  return cleaned
}

async function invokeGeminiInterview(action, payload) {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('No Gemini API key')

  const models = ['gemini-3.6-flash']

  const call = async (prompt, systemInstruction = '') => {
    let lastErr = null
    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            systemInstruction: systemInstruction ? { parts: [{ text: systemInstruction }] } : undefined,
            generationConfig: { responseMimeType: 'application/json' },
          }),
        })
        if (res.ok) {
          const json = await res.json()
          const text = json.candidates?.[0]?.content?.parts?.[0]?.text || ''
          return JSON.parse(cleanJsonText(text))
        }
        const errJson = await res.json().catch(() => ({}))
        lastErr = new Error(errJson.error?.message || `Gemini ${model} status ${res.status}`)
      } catch (e) {
        lastErr = e
      }
    }
    throw lastErr || new Error('Gemini interview call failed across all models')
  }

  if (action === 'start') {
    const { role = 'Software Engineer', type = 'Technical' } = payload
    const prompt = `Generate a highly unique, specific, and realistic interview question for a ${type} interview for role "${role}".
Ensure the question tests practical real-world scenario engineering skills.
Return JSON object: { "sessionId": "${crypto.randomUUID()}", "question": "the question text" }`
    return await call(prompt, 'You are a Senior Technical Hiring Manager. Return valid JSON.')
  }

  if (action === 'answer') {
    const { question, answer, type = 'Technical', history = [], role = 'Software Engineer' } = payload
    const previousQuestions = history.map((h) => h.question)
    const prompt = `You are a real Senior Engineering Hiring Manager interviewing a candidate for the role "${role}".
Current Question Asked: "${question}"
Candidate's Spoken/Typed Answer: "${answer}"

Your job is to respond naturally and interactively like a real human interviewer.
1. Formulate "aiResponse": A 1-2 sentence conversational spoken response directly addressing what the candidate said (e.g., "That's an insightful point about handling microservice failures with circuit breakers...").
2. Formulate "feedback": A 1-2 sentence constructive STAR coaching feedback tip evaluating their technical depth and clarity.
3. Formulate "rating": Assess answer quality as one of: "Strong", "Good", or "Needs Depth".
4. Formulate "nextQuestion": A contextual follow-up or next ${type} interview question building on their response. Do NOT repeat previous questions: [${previousQuestions.join(' | ')}].

Return JSON object:
{
  "aiResponse": "Conversational interviewer response directly engaging with candidate's specific answer details",
  "feedback": "Constructive STAR coaching feedback tip",
  "rating": "Strong",
  "nextQuestion": "Contextual follow-up question text"
}`
    return await call(prompt, 'You are an Expert Tech Interviewer & Coach. Return valid JSON.')
  }

  if (action === 'summary') {
    const { history = [] } = payload
    const transcript = history.map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}\nAI Feedback: ${h.tip || h.feedback}`).join('\n\n')
    const prompt = `Evaluate candidate's full interview performance transcript:
${transcript || 'No answers provided'}

Return JSON object:
{
  "score": 75,
  "overall": "2-sentence overall evaluation summary",
  "strengths": ["strength 1", "strength 2"],
  "improvements": ["improvement 1", "improvement 2"]
}`
    return await call(prompt, 'You are an Expert Tech Interviewer & Senior Hiring Manager. Return valid JSON.')
  }

  throw new Error('Unknown action')
}

async function invoke(action, payload) {
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      return await invokeGeminiInterview(action, payload)
    } catch (e) {
      console.warn('Gemini interview call failed, falling back to Supabase/local:', e)
    }
  }

  const { data: body, error } = await supabase.functions.invoke('interview-ai', {
    body: { action, ...payload },
  })
  if (error) throw error
  return body
}

const sessions = new Map()

export const startInterview = async (data) => {
  let body
  try {
    body = await invoke('start', data)
    sessions.set(body.sessionId, { type: data?.type || 'Technical', role: data?.role || 'Software Engineer', index: 1, asked: [body.question] })
  } catch {
    const sessionId = crypto.randomUUID()
    const firstQ = pickQuestion(data?.type || 'Technical', 0)
    sessions.set(sessionId, { type: data?.type || 'Technical', role: data?.role || 'Software Engineer', index: 1, asked: [firstQ] })
    body = {
      sessionId,
      question: firstQ,
      source: 'local',
    }
  }
  return { data: body }
}

export const submitAnswer = async (data) => {
  const state = sessions.get(data?.sessionId) || { type: 'Technical', role: 'Software Engineer', index: 0, asked: [] }
  try {
    const body = await invoke('answer', { ...data, role: state.role, history: state.asked.map((q) => ({ question: q })) })
    if (body?.nextQuestion) {
      sessions.set(data?.sessionId, { ...state, asked: [...state.asked, body.nextQuestion] })
    }
    return { data: body }
  } catch {
    const words = (data?.answer || '').trim().split(/\s+/).filter(Boolean).length
    const rating = words >= 50 ? 'Strong' : words >= 25 ? 'Good' : 'Needs Depth'
    const aiResponse = words >= 40
      ? `Great explanation! You brought up key engineering details in your answer.`
      : `Thanks for that summary. Let's delve a bit deeper into your implementation details.`
    const nextQ = pickQuestion(state.type, state.index, state.asked)
    const result = {
      aiResponse,
      feedback: heuristicFeedback(data?.answer || ''),
      rating,
      nextQuestion: nextQ,
      source: 'local',
    }
    sessions.set(data?.sessionId, { ...state, index: state.index + 1, asked: [...state.asked, nextQ] })
    return { data: result }
  }
}

export const getInterviewSummary = async ({ sessionId, history }) => {
  try {
    const body = await invoke('summary', { sessionId, history })
    return { data: body }
  } catch {
    return { data: { ...heuristicSummary(history || []), source: 'local' } }
  }
}
