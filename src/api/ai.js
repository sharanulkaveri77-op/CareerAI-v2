import { supabase } from './supabase'

// Primary AI Provider: Google Gemini API (gemini-3.6-flash) via VITE_GEMINI_API_KEY
// Fallback 1: Supabase Edge Function (`career-ai`)
// Fallback 2: Intelligent Local AI Engine

function cleanJsonText(rawText) {
  let cleaned = (rawText || '').trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
  }
  return cleaned
}

async function callGemini(contents, systemInstruction = '') {
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY
  if (!apiKey) throw new Error('No VITE_GEMINI_API_KEY configured')

  const body = {
    contents: typeof contents === 'string'
      ? [{ parts: [{ text: contents }] }]
      : Array.isArray(contents)
        ? contents
        : [{ parts: [{ text: String(contents) }] }],
  }

  if (systemInstruction) {
    body.systemInstruction = {
      parts: [{ text: systemInstruction }],
    }
  }

  if (systemInstruction.toLowerCase().includes('json')) {
    body.generationConfig = {
      responseMimeType: 'application/json',
    }
  }

  const model = 'gemini-3.6-flash'
  let lastErr = null

  // Retry loop for rate-limits (HTTP 429)
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        return rawText.trim()
      }

      if (res.status === 429 && attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 1500))
        continue
      }

      const errJson = await res.json().catch(() => ({}))
      lastErr = new Error(errJson.error?.message || `Gemini ${model} error ${res.status}`)
    } catch (e) {
      lastErr = e
    }
  }

  throw lastErr || new Error('Gemini API call failed')
}

async function handleGeminiAction(action, payload) {
  if (action === 'chat') {
    const { message, history = [] } = payload
    
    let promptText = ''
    if (history && history.length > 0) {
      const recentHistory = history.slice(-8)
      const formatted = recentHistory
        .map((h) => `${h.role === 'user' ? 'User' : 'Assistant'}: ${h.content}`)
        .join('\n')
      promptText = `Conversation History:\n${formatted}\n\nUser Message: ${message}`
    } else {
      promptText = message
    }

    const todayStr = new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })

    const reply = await callGemini(
      promptText,
      `You are Google Gemini AI, an intelligent, versatile, friendly, and expert AI assistant and career copilot.
[System Context: Today's Date is ${todayStr}]

CRITICAL INSTRUCTION:
- Directly, accurately, and thoroughly answer WHATEVER the user asks (interview prep, coding problems, algorithm explanations, math, general trivia, system design, resume advice, or career roadmap).
- Format your response with clear paragraphs, bold text, bullet points, and code blocks where applicable.`
    )
    return { reply }
  }

  if (action === 'communication-evaluate') {
    const { topicId, text } = payload
    const prompt = `Evaluate candidate's response for communication topic "${topicId}".
Candidate Answer: "${text}"

Perform a strict speech and communication evaluation detailing:
1. Relevance & Correctness: Is candidate's answer actually relevant and correct for topic "${topicId}"?
2. Clarity Score (integer 0-100)
3. Professionalism Rating ("High" | "Moderate" | "Needs Polish")
4. Topic Relevance ("Relevant & Correct" | "Partially Relevant" | "Off-Topic / Incorrect")
5. Vocabulary & Delivery Feedback (2 detailed sentences analyzing sentence structure, relevance, tone, impact, and filler words)
6. AI Polished Model Answer (an executive-level, highly polished, model version of candidate answer using STAR structure)

CRITICAL SCORING & RELEVANCE RULES:
- OFF-TOPIC / INCORRECT RESPONSE: If candidate answer is unrelated, nonsensical, or off-topic for topic "${topicId}" (e.g. food preferences, unrelated random statements, or wrong answers), assign clarityScore between 15 to 30, professionalismRating "Needs Polish", topicRelevance "Off-Topic / Incorrect", and grammarFeedback "Your response is off-topic or incorrect for this prompt. Please address the specific topic."
- TRIVIAL / SHORT RESPONSE: If candidate answer is extremely short, trivial, or a greeting (e.g. "hi", "hey", "hello", "ok", "yes", "test", or under 10 words), assign clarityScore between 5 to 15, professionalismRating "Needs Polish", topicRelevance "Off-Topic / Incorrect", and grammarFeedback "Your response is far too short or incomplete. Please provide a full response (~75-150 words)."
- HIGH RELEVANCE RESPONSE: If candidate provides a relevant, well-structured response with STAR methodology and metrics, assign clarityScore above 80, professionalismRating "High", and topicRelevance "Relevant & Correct".

Return JSON object matching structure:
{
  "clarityScore": 85,
  "professionalismRating": "High",
  "topicRelevance": "Relevant & Correct",
  "grammarFeedback": "Your response is highly relevant, demonstrating strong technical knowledge and good sentence flow. To maximize impact, introduce specific quantitative metrics.",
  "modelAnswer": "Polished executive version of candidate answer."
}`

    const jsonStr = await callGemini(
      prompt,
      'You are an Expert Communication Coach, Speech Analyst, and Executive HR Evaluator. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'resume-analyze') {
    const { text, targetRole } = payload
    const prompt = `Analyze the following resume text for target role: "${targetRole || 'Software Engineer'}".
Perform a strict ATS audit and recruiter evaluation detailing:
1. What is done well (strengths)
2. What is COMPLETELY MISSING / NOT PRESENT (e.g. missing sections, missing links, missing critical keywords)
3. What is LACKING / WEAK (e.g. weak bullet descriptions, lack of metrics, formatting issues)
4. What SHOULD BE PRESENT (recommended additions and specific action items)

Resume Text:
${text}

Return JSON object matching EXACT structure:
{
  "score": 85,
  "targetRole": "${targetRole || 'Software Engineer'}",
  "keywordMatch": 80,
  "atsPass": true,
  "summary": "2-sentence executive summary of resume readiness.",
  "strengths": ["Well-structured education section", "Clean contact details"],
  "missing": ["GitHub / Portfolio URLs not present", "Missing Certifications section", "Missing key target skills: Docker, TypeScript"],
  "lacking": ["Bullet points lack measurable metrics (e.g. '%', '$', numbers)", "Project descriptions are too short"],
  "shouldInclude": ["Add 2-3 bullet points with quantifiable outcomes", "Include a dedicated Projects section with tech stack tags", "Include target role keywords: System Design, Microservices"]
}`

    const jsonStr = await callGemini(
      prompt,
      'You are an expert ATS Resume Auditor and Tech Recruiter. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'skills-analyze') {
    const { skills = [] } = payload
    const skillList = skills.map((s) => `${s.name} (${s.level})`).join(', ')
    const prompt = `User's tracked skills: [${skillList || 'None'}].
Identify 3-5 critical missing high-demand technical skills needed for modern tech roles.
Return JSON object:
{
  "gaps": ["Skill 1", "Skill 2", "Skill 3", "Skill 4"],
  "summary": "Overview of user skill profile and key recommendations."
}`

    const jsonStr = await callGemini(
      prompt,
      'You are a Tech Skill Intelligence Analyzer. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'roles-search') {
    const { q = '' } = payload
    const prompt = `Generate 5 high-demand tech job roles matching search query: "${q}".
Return JSON object:
{
  "roles": [
    {
      "_id": "gemini-role-1",
      "title": "Role Title",
      "summary": "2-sentence role description and tech stack.",
      "demand": "Very High | High | Medium",
      "salary": "$110,000 - $150,000"
    }
  ]
}`

    const jsonStr = await callGemini(
      prompt,
      'You are a Tech Career Intelligence Engine. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'roadmap') {
    const { from = 'Current Role', to = 'Target Role' } = payload
    const prompt = `Create a highly tailored 4-phase technical career transition roadmap from current role "${from}" to target role "${to}".
Include explicit real-world tools, frameworks, programming languages, and actionable projects specifically required for "${to}".

Return JSON object matching EXACT structure:
{
  "roadmap": {
    "stages": [
      {
        "title": "Phase 1: Core Fundamentals for ${to}",
        "duration": "1 - 2 Months",
        "description": "Specific languages, tools, and foundations to master.",
        "skills": ["Specific Tool 1", "Specific Framework 2", "Specific Tech 3"],
        "milestones": ["Actionable Milestone 1", "Actionable Milestone 2"]
      },
      {
        "title": "Phase 2: Advanced ${to} Architecture & Projects",
        "duration": "2 - 3 Months",
        "description": "Building production-ready systems and mastering advanced tech.",
        "skills": ["Advanced Skill 1", "Cloud/DB Tech 2", "Architecture Skill 3"],
        "milestones": ["Build project X", "Implement system Y"]
      },
      {
        "title": "Phase 3: Industry Practice & Technical Specialization",
        "duration": "1 - 2 Months",
        "description": "Solving real-world scenarios and optimizing performance.",
        "skills": ["Specialized Skill 1", "Testing/DevOps Skill 2"],
        "milestones": ["Deploy production app to cloud", "Achieve 90%+ test coverage"]
      },
      {
        "title": "Phase 4: Interview Prep & Landing ${to} Role",
        "duration": "1 Month",
        "description": "ATS resume optimization, system design practice, and mock interviews.",
        "skills": ["System Design Interviews", "ATS Resume Optimization"],
        "milestones": ["Complete 5 mock interviews", "Apply to 10 target roles"]
      }
    ]
  }
}`

    const jsonStr = await callGemini(
      prompt,
      'You are a Senior Tech Architect & Career Roadmap Specialist. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'learning') {
    const { topic = 'Software Development' } = payload
    const prompt = `Recommend 4 top-tier learning resources for topic: "${topic}".
Return JSON object:
{
  "materials": [
    {
      "_id": "learning-1",
      "type": "course | video | article",
      "category": "Web Dev | AI | Systems",
      "title": "Material Title",
      "description": "Brief summary",
      "url": "https://example.com"
    }
  ]
}`

    const jsonStr = await callGemini(
      prompt,
      'You are a Technical Education Curator. Always return valid JSON.'
    )
    return JSON.parse(cleanJsonText(jsonStr))
  }

  if (action === 'trends') {
    const prompt = `Generate 6-month market demand and salary index for tech roles.
Return JSON array of 6 objects:
[
  { "month": "Jan", "Demand": 65, "Salary": 70 },
  { "month": "Feb", "Demand": 72, "Salary": 73 },
  { "month": "Mar", "Demand": 80, "Salary": 78 },
  { "month": "Apr", "Demand": 85, "Salary": 82 },
  { "month": "May", "Demand": 91, "Salary": 88 },
  { "month": "Jun", "Demand": 95, "Salary": 92 }
]`

    const jsonStr = await callGemini(
      prompt,
      'You are a Tech Market Data Analyst. Always return valid JSON.'
    )
    const result = JSON.parse(cleanJsonText(jsonStr))
    return Array.isArray(result) ? result : result.trends || []
  }

  throw new Error(`Unknown action ${action}`)
}

export async function invokeAi(action, payload = {}) {
  // 1. Try Google Gemini API if API key is provided
  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const result = await handleGeminiAction(action, payload)
      return { data: result }
    } catch (e) {
      console.warn('Gemini API call failed, falling back to Supabase/local:', e)
    }
  }

  // 2. Fall back to Supabase Edge Function
  try {
    const { data: body, error } = await supabase.functions.invoke('career-ai', {
      body: { action, ...payload },
    })
    if (!error && body) return { data: body }
  } catch {
    /* proceed to local fallback */
  }

  const err = new Error('AI service unavailable')
  err.userMessage = 'AI service unavailable'
  throw err
}
