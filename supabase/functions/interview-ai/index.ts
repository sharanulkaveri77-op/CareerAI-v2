// Supabase Edge Function: AI interviewer backed by a local Ollama instance.
//
// SECURITY: No secrets are hardcoded. The Ollama base URL / model / optional
// token are read from Function environment variables (set via the Supabase
// Dashboard or `supabase secrets set`), never from source control.
//
// Local Ollama typically runs unauthenticated at http://localhost:11434 and
// needs no token. If your Ollama sits behind a proxy that requires a bearer
// token, set the OLLAMA_TOKEN secret.

const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'http://localhost:11434'
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'llama3'
const OLLAMA_TOKEN = Deno.env.get('OLLAMA_TOKEN') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface HistoryItem {
  question: string
  answer: string
  tip: string
}

interface ReqBody {
  action: 'start' | 'answer' | 'summary'
  type?: string
  role?: string
  question?: string
  answer?: string
  history?: HistoryItem[]
  sessionId?: string
}

function parseJson(text: string): Record<string, unknown> {
  try {
    return JSON.parse(text)
  } catch {
    const match = text.match(/\{[\s\S]*\}/)
    if (match) {
      try {
        return JSON.parse(match[0])
      } catch {
        return {}
      }
    }
    return {}
  }
}

async function ollamaGenerate(prompt: string, system: string): Promise<string> {
  const res = await fetch(`${OLLAMA_URL}/api/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(OLLAMA_TOKEN ? { Authorization: `Bearer ${OLLAMA_TOKEN}` } : {}),
    },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      system,
      stream: false,
      format: 'json',
    }),
  })

  if (!res.ok) {
    const detail = await res.text()
    throw new Error(`Ollama responded ${res.status}: ${detail}`)
  }

  const data = await res.json()
  return typeof data.response === 'string' ? data.response : ''
}

async function handleStart(body: ReqBody): Promise<Record<string, unknown>> {
  const role = body.role || 'Software Engineer'
  const type = body.type || 'Technical'
  const system =
    'You are a professional interview coach running a mock interview. ' +
    'Ask exactly ONE clear, role-appropriate interview question. ' +
    'Respond with JSON only: {"question": "..."}.'
  const prompt =
    `Conduct a ${type} interview question for the role "${role}". ` +
    `Return JSON only: {"question": "..."}`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  return {
    sessionId: crypto.randomUUID(),
    question:
      typeof parsed.question === 'string' && parsed.question.trim()
        ? parsed.question
        : 'Tell me about a challenging project you shipped recently.',
  }
}

async function handleAnswer(body: ReqBody): Promise<Record<string, unknown>> {
  const question = body.question || ''
  const answer = body.answer || ''
  const system =
    'You are an interview coach. Give concise, supportive coaching feedback ' +
    'on the candidate answer, then ask the next question. ' +
    'Respond with JSON only: {"feedback": "...", "nextQuestion": "..."}.'
  const prompt =
    `Interview question: ${question}\n` +
    `Candidate answer: ${answer}\n` +
    `Return JSON only: {"feedback": "...", "nextQuestion": "..."}`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  return {
    feedback:
      typeof parsed.feedback === 'string' && parsed.feedback.trim()
        ? parsed.feedback
        : 'Solid attempt — keep your answers structured with a short example.',
    nextQuestion:
      typeof parsed.nextQuestion === 'string' && parsed.nextQuestion.trim()
        ? parsed.nextQuestion
        : 'Why do you want this role?',
  }
}

async function handleSummary(body: ReqBody): Promise<Record<string, unknown>> {
  const history = Array.isArray(body.history) ? body.history : []
  const transcript = history
    .map((h, i) => `Q${i + 1}: ${h.question}\nA${i + 1}: ${h.answer}`)
    .join('\n')
  const system =
    'You are an interview coach evaluating a candidate mock interview. ' +
    'Respond with JSON only: ' +
    '{"score": <0-100>, "overall": "...", "strengths": ["..."], ' +
    '"improvements": ["..."]}.'
  const prompt =
    `Interview transcript:\n${transcript}\n\n` +
    `Return JSON only with score, overall, strengths, improvements.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  return {
    score:
      typeof parsed.score === 'number'
        ? parsed.score
        : typeof parsed.score === 'string'
          ? Number(parsed.score) || 70
          : 70,
    overall:
      typeof parsed.overall === 'string' && parsed.overall.trim()
        ? parsed.overall
        : 'Good performance with room to tighten technical depth.',
    strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
    improvements: Array.isArray(parsed.improvements)
      ? parsed.improvements
      : [],
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as ReqBody
    let result: Record<string, unknown>
    if (body.action === 'start') result = await handleStart(body)
    else if (body.action === 'answer') result = await handleAnswer(body)
    else if (body.action === 'summary') result = await handleSummary(body)
    else throw new Error('Unknown action')

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unexpected error'
    return new Response(JSON.stringify({ error: message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
