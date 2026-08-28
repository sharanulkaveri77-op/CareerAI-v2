// Supabase Edge Function: shared AI features backed by a local Ollama instance.
//
// SECURITY: No secrets are hardcoded. The Ollama base URL / model / optional
// token are read from Function environment variables (set via the Supabase
// Dashboard or `supabase secrets set`), never from source control.

const OLLAMA_URL = Deno.env.get('OLLAMA_URL') || 'http://localhost:11434'
const OLLAMA_MODEL = Deno.env.get('OLLAMA_MODEL') || 'llama3'
const OLLAMA_TOKEN = Deno.env.get('OLLAMA_TOKEN') || ''

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

interface Skill {
  name?: string
  category?: string
  level?: string
}

interface ReqBody {
  action:
    | 'chat'
    | 'roadmap'
    | 'skills-analyze'
    | 'roles-search'
    | 'resume-analyze'
    | 'learning'
    | 'trends'
  message?: string
  history?: ChatMessage[]
  from?: string
  to?: string
  skills?: Skill[]
  q?: string
  text?: string
  targetRole?: string
  topic?: string
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

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value
    .map((v) =>
      typeof v === 'string' ? v : v && typeof v === 'object' ? String((v as { name?: unknown }).name ?? JSON.stringify(v)) : String(v)
    )
    .filter(Boolean)
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

/* --------------------------------- Advisor -------------------------------- */

async function handleChat(body: ReqBody): Promise<Record<string, unknown>> {
  const history = Array.isArray(body.history) ? body.history : []
  const transcript = history
    .slice(-8)
    .map((m) => `${m.role === 'user' ? 'Candidate' : 'Advisor'}: ${m.content}`)
    .join('\n')
  const system =
    'You are CareerIQ, a concise, encouraging career advisor for students ' +
    'and early-career professionals. Give practical, specific advice. ' +
    'Respond with JSON only: {"reply": "..."} where reply is plain text.'
  const prompt =
    (transcript ? `Conversation so far:\n${transcript}\n\n` : '') +
    `Candidate: ${body.message || ''}\n` +
    `Respond with JSON only: {"reply": "..."}`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  return {
    reply:
      typeof parsed.reply === 'string' && parsed.reply.trim()
        ? parsed.reply
        : 'Could you share a bit more about your goals so I can give better advice?',
  }
}

/* --------------------------------- Roadmap -------------------------------- */

interface Stage {
  title?: string
  duration?: string
  description?: string
  skills?: unknown
  milestones?: unknown
}

async function handleRoadmap(body: ReqBody): Promise<Record<string, unknown>> {
  const from = body.from || 'Student'
  const to = body.to || 'Software Engineer'
  const system =
    'You are a career coach that builds realistic transition roadmaps. ' +
    'Respond with JSON only: {"roadmap": {"stages": [{"title": "...", ' +
    '"duration": "e.g. 3 months", "description": "...", "skills": ["..."], ' +
    '"milestones": ["..."]}]}} with 3 to 5 stages.'
  const prompt =
    `Create a step-by-step roadmap for moving from "${from}" to "${to}". ` +
    `Return JSON only matching the schema.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  const roadmap = (parsed.roadmap && typeof parsed.roadmap === 'object'
    ? parsed.roadmap
    : {}) as Record<string, unknown>
  const stages = Array.isArray(roadmap.stages)
    ? (roadmap.stages as Stage[]).map((s) => ({
        title: typeof s?.title === 'string' ? s.title : 'Stage',
        duration: typeof s?.duration === 'string' ? s.duration : '',
        description: typeof s?.description === 'string' ? s.description : '',
        skills: asStringArray(s?.skills),
        milestones: asStringArray(s?.milestones),
      }))
    : []
  return { roadmap: { stages } }
}

/* ----------------------------- Skills analysis ---------------------------- */

async function handleSkillsAnalyze(
  body: ReqBody
): Promise<Record<string, unknown>> {
  const skills = Array.isArray(body.skills) ? body.skills : []
  const list = skills
    .map((s) => `- ${s.name ?? 'Unknown'} (${s.category ?? 'General'}, ${s.level ?? 'beginner'})`)
    .join('\n')
  const system =
    'You are a technical career coach. Identify the most important skill gaps ' +
    'for the candidate. Respond with JSON only: {"gaps": ["Skill — reason"]}.'
  const prompt =
    `The candidate lists these skills:\n${list || '(none yet)'}\n\n` +
    `Return 3-6 high-demand missing or weak skills. JSON only.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  return { gaps: asStringArray(parsed.gaps) }
}

/* ------------------------------- Roles search ----------------------------- */

interface RoleResult {
  title?: string
  summary?: string
  demand?: string
  salary?: string
}

async function handleRolesSearch(
  body: ReqBody
): Promise<Record<string, unknown>> {
  const q = body.q || ''
  const system =
    'You are a careers researcher. Suggest real-world job roles matching the query. ' +
    'Respond with JSON only: {"roles": [{"title": "...", "summary": "one sentence", ' +
    '"demand": "Low|Medium|High|Very High", "salary": "e.g. $120k"}]} with 4-6 roles.'
  const prompt =
    `Suggest job roles related to: "${q}". Return JSON only matching the schema.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  const roles = Array.isArray(parsed.roles)
    ? (parsed.roles as RoleResult[])
        .filter((r) => r && typeof r.title === 'string')
        .map((r, i) => ({
          _id: `ai-${Date.now()}-${i}`,
          title: r.title,
          summary: typeof r.summary === 'string' ? r.summary : '',
          demand: typeof r.demand === 'string' ? r.demand : null,
          salary: typeof r.salary === 'string' ? r.salary : null,
        }))
    : []
  return { roles }
}

/* ----------------------------- Resume analysis ---------------------------- */

async function handleResumeAnalyze(
  body: ReqBody
): Promise<Record<string, unknown>> {
  const text = (body.text || '').slice(0, 12000)
  const targetRole = body.targetRole || ''
  const system =
    'You are an expert technical recruiter and ATS system. Analyze the resume text. ' +
    'Respond with JSON only: {"score": <0-100>, "keywordMatch": <0-100>, ' +
    '"atsPass": <boolean>, "summary": "...", "strengths": ["..."], ' +
    '"improvements": ["..."]}.'
  const prompt =
    `Target role: ${targetRole || 'General'}\n\n` +
    `Resume:\n${text}\n\n` +
    `Return JSON only with score, keywordMatch, atsPass, summary, strengths, improvements.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  const num = (v: unknown, fallback: number) =>
    typeof v === 'number' ? v : typeof v === 'string' ? Number(v) || fallback : fallback
  return {
    score: Math.max(0, Math.min(100, num(parsed.score, 70))),
    targetRole,
    keywordMatch: Math.max(0, Math.min(100, num(parsed.keywordMatch, num(parsed.keywords, 70)))),
    atsPass: parsed.atsPass === true || parsed.atsPass === 'true' || parsed.ats === true,
    summary: typeof parsed.summary === 'string' ? parsed.summary : '',
    strengths: asStringArray(parsed.strengths),
    improvements: asStringArray(parsed.improvements),
  }
}

/* -------------------------------- Learning -------------------------------- */

interface Material {
  type?: string
  category?: string
  title?: string
  description?: string
  url?: string
}

async function handleLearning(body: ReqBody): Promise<Record<string, unknown>> {
  const topic = body.topic || ''
  const system =
    'You are a learning curator. Recommend high-quality, well-known free learning resources. ' +
    'Respond with JSON only: {"materials": [{"type": "course|article|video", ' +
    '"category": "...", "title": "...", "description": "one sentence", ' +
    '"url": "https://..."}]} with 6 items. Only suggest URLs you are confident exist ' +
    '(e.g. freeCodeCamp, MDN, CS50, Khan Academy, official docs).'
  const prompt =
    `Recommend learning materials${topic ? ` about "${topic}"` : ' for early-career tech candidates'}. ` +
    `Return JSON only matching the schema.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  const materials = Array.isArray(parsed.materials)
    ? (parsed.materials as Material[])
        .filter((m) => m && typeof m.title === 'string')
        .map((m) => ({
          _id: `ai-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          type: typeof m.type === 'string' ? m.type : 'article',
          category: typeof m.category === 'string' ? m.category : '',
          title: m.title,
          description: typeof m.description === 'string' ? m.description : '',
          url: typeof m.url === 'string' ? m.url : '',
        }))
    : []
  return { materials }
}

/* --------------------------------- Trends --------------------------------- */

async function handleTrends(): Promise<Record<string, unknown>> {
  const system =
    'You are a labor-market analyst producing an illustrative 6-month trend series ' +
    'for tech hiring. Respond with JSON only: {"trends": [{"month": "Jan", ' +
    '"demand": <0-100>, "salary": <index 50-100>}]}. Demand and salary should both ' +
    'rise gently over the six months starting in January.'
  const prompt = `Generate the 6-month trend series. Return JSON only matching the schema.`
  const raw = await ollamaGenerate(prompt, system)
  const parsed = parseJson(raw)
  const trends = Array.isArray(parsed.trends)
    ? (parsed.trends as { month?: unknown; demand?: unknown; salary?: unknown }[]).map(
        (t) => ({
          month: typeof t.month === 'string' ? t.month : '',
          demand: Number(t.demand) || 0,
          salary: Number(t.salary) || 0,
        })
      )
    : []
  return { trends }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as ReqBody
    let result: Record<string, unknown>
    switch (body.action) {
      case 'chat':
        result = await handleChat(body)
        break
      case 'roadmap':
        result = await handleRoadmap(body)
        break
      case 'skills-analyze':
        result = await handleSkillsAnalyze(body)
        break
      case 'roles-search':
        result = await handleRolesSearch(body)
        break
      case 'resume-analyze':
        result = await handleResumeAnalyze(body)
        break
      case 'learning':
        result = await handleLearning(body)
        break
      case 'trends':
        result = await handleTrends()
        break
      default:
        throw new Error('Unknown action')
    }

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
