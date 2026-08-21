// Dev-only mock API adapter. Active only when VITE_MOCK === 'true'.
// Lets you click through the UI without a running backend. No real data.

const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms))

const SKILLS = [
  { _id: 's1', name: 'React', category: 'Technical', level: 'advanced' },
  { _id: 's2', name: 'Node.js', category: 'Technical', level: 'intermediate' },
  { _id: 's3', name: 'Docker', category: 'Tool', level: 'beginner' },
  { _id: 's4', name: 'Communication', category: 'Soft', level: 'expert' },
]

const ROLES = [
  {
    _id: 'r1',
    title: 'AI Engineer',
    summary: 'Build and deploy machine-learning models that power intelligent products.',
    demand: 'High',
    salary: '$140k',
  },
  {
    _id: 'r2',
    title: 'Data Scientist',
    summary: 'Turn raw data into insights using statistics, ML, and storytelling.',
    demand: 'Very High',
    salary: '$130k',
  },
  {
    _id: 'r3',
    title: 'Product Manager',
    summary: 'Own the vision and roadmap for customer-facing products.',
    demand: 'Medium',
    salary: '$150k',
  },
]

const MATERIALS = [
  { _id: 'm1', type: 'course', category: 'Frontend', title: 'Modern React with Hooks', description: 'Master functional components, effects, and context.', url: 'https://example.com/react' },
  { _id: 'm2', type: 'article', category: 'System Design', title: 'Designing Rate Limiters', description: 'A practical guide to throttling at scale.', url: 'https://example.com/ratelimit' },
  { _id: 'm3', type: 'video', category: 'Behavioral', title: 'Acing the Behavioral Interview', description: 'Use STAR to tell compelling stories.', url: 'https://example.com/behavioral' },
]

const STUDENTS = [
  { name: 'Aarav Sharma', subtitle: '1MS22CS001 · AI Engineer track', meta: 'Active' },
  { name: 'Diya Nair', subtitle: '1MS22CS014 · Data Science track', meta: 'Active' },
  { name: 'Kabir Reddy', subtitle: '1MS22CS022 · PM track', meta: 'Active' },
]

const INTERVIEWS = [
  { name: 'Aarav Sharma', subtitle: 'Technical · AI Engineer', meta: 'Today' },
  { name: 'Diya Nair', subtitle: 'Behavioral · Data Scientist', meta: 'Tomorrow' },
]

function respond(config, data) {
  return Promise.resolve({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config,
    request: {},
  })
}

function reject(config, message) {
  const err = new Error(message)
  err.response = { data: { message }, status: 400, statusText: 'Bad Request', headers: {}, config }
  return Promise.reject(err)
}

export function mockAdapter(config) {
  const url = config.url || ''
  const method = (config.method || 'get').toLowerCase()
  const m = (verb, path) => method === verb && url.startsWith(path)

  // Auth
  if (m('post', '/auth/student/login') || m('post', '/auth/student/signup')) {
    const body = safeBody(config)
    const user = {
      role: 'student',
      name: body.name || 'Demo Student',
      email: body.email || 'student@demo.com',
      usn: body.usn || body.identifier || '1MS22CS001',
    }
    return delay().then(() => respond(config, { token: 'mock-jwt-student', user }))
  }
  if (m('post', '/auth/admin/login') || m('post', '/auth/admin/signup')) {
    const body = safeBody(config)
    const user = { role: 'admin', name: body.name || 'Demo Admin', email: body.email || 'admin@demo.com' }
    return delay().then(() => respond(config, { token: 'mock-jwt-admin', user }))
  }

  // Dashboard
  if (m('get', '/dashboard/summary')) {
    return delay().then(() =>
      respond(config, {
        profileComplete: true,
        currentRole: 'Junior Developer',
        skillGaps: 6,
        savedRoles: 2,
        targetRole: 'Engineering Manager',
        careerHealth: 68,
      })
    )
  }
  if (m('get', '/dashboard/trends')) {
    return delay().then(() =>
      respond(config, {
        trends: [
          { month: 'Jan', demand: 40, salary: 60 },
          { month: 'Feb', demand: 52, salary: 62 },
          { month: 'Mar', demand: 48, salary: 65 },
          { month: 'Apr', demand: 61, salary: 68 },
          { month: 'May', demand: 70, salary: 72 },
          { month: 'Jun', demand: 78, salary: 75 },
        ],
      })
    )
  }

  // Advisor
  if (m('post', '/advisor/chat')) {
    return delay(600).then(() =>
      respond(config, {
        reply:
          "Great question! Based on your profile, I'd focus on strengthening system-design fundamentals and a couple of in-demand skills like Docker and system design. Want a step-by-step plan?",
      })
    )
  }

  // Skills
  if (m('get', '/skills')) {
    return delay().then(() => respond(config, { skills: SKILLS }))
  }
  if (m('post', '/skills')) {
    const body = safeBody(config)
    const created = { _id: 's' + Date.now(), ...body }
    SKILLS.push(created)
    return delay().then(() => respond(config, { skill: created }))
  }
  if (m('post', '/skills/analyze')) {
    return delay(800).then(() =>
      respond(config, {
        gaps: [
          'System Design — needed for senior roles',
          'Kubernetes — high demand in your target track',
          'GraphQL — appears in many job postings',
        ],
      })
    )
  }

  // Roles
  if (m('get', '/roles/search')) {
    return delay().then(() => respond(config, { roles: ROLES }))
  }
  if (m('get', '/roles/saved')) {
    return delay().then(() => respond(config, { roles: ROLES.slice(0, 2) }))
  }
  if (m('post', '/roles/saved')) {
    const body = safeBody(config)
    return delay().then(() => respond(config, { role: body }))
  }
  if (m('delete', '/roles/saved/')) {
    return delay().then(() => respond(config, { ok: true }))
  }

  // Resume
  if (m('post', '/resume/analyze')) {
    return delay(1200).then(() =>
      respond(config, {
        score: 78,
        targetRole: 'Senior Product Manager',
        keywordMatch: 82,
        atsPass: true,
        summary:
          'Strong product framing and measurable outcomes. Tighten the leadership narrative and add more metrics to your impact bullets.',
        strengths: [
          'Clear, quantified achievements',
          'Clean, ATS-friendly structure',
          'Relevant domain keywords present',
        ],
        improvements: [
          'Add 2–3 more metrics per role',
          'Shorten the summary to 3 lines',
          'Include system-design keywords',
        ],
      })
    )
  }

  // Interview AI
  if (m('post', '/interview/ai/start')) {
    return delay().then(() =>
      respond(config, {
        sessionId: 'sess-' + Date.now(),
        question: 'Tell me about a challenging project you shipped recently.',
      })
    )
  }
  if (m('post', '/interview/ai/answer')) {
    return delay(500).then(() =>
      respond(config, {
        feedback: 'Solid answer — you structured it well. Next time, lead with the outcome.',
        nextQuestion: 'How would you design a URL shortener at scale?',
      })
    )
  }
  if (m('get', '/interview/ai/summary')) {
    return delay().then(() =>
      respond(config, {
        score: 74,
        overall: 'Good performance with room to tighten technical depth.',
        strengths: ['Clear communication', 'Structured answers'],
        improvements: ['Go deeper on edge cases', 'Use more metrics'],
      })
    )
  }

  // Rooms
  if (m('post', '/rooms/create')) {
    return delay().then(() => respond(config, { roomCode: genCode() }))
  }
  if (m('post', '/rooms/join')) {
    return delay().then(() => respond(config, { ok: true }))
  }

  // Learning
  if (m('get', '/learning')) {
    return delay().then(() => respond(config, { materials: MATERIALS }))
  }

  // Roadmap
  if (m('post', '/roadmap/generate')) {
    return delay(900).then(() =>
      respond(config, {
        roadmap: {
          stages: [
            { title: 'Solidify fundamentals', duration: '3 months', description: 'Deepen core engineering skills.', skills: ['System Design', 'Testing'], milestones: ['Ship a backend service', 'Write design docs'] },
            { title: 'Lead small initiatives', duration: '6 months', description: 'Take ownership of a feature end-to-end.', skills: ['Mentoring', 'Project Planning'], milestones: ['Lead a 2-person project'] },
            { title: 'Step into management', duration: '12 months', description: 'Transition toward EM responsibilities.', skills: ['People Management', 'Roadmapping'], milestones: ['Manage an intern', 'Own a team roadmap'] },
          ],
        },
      })
    )
  }

  // Admin
  if (m('get', '/admin/summary')) {
    return delay().then(() =>
      respond(config, {
        students: 128,
        interviews: 24,
        materials: 56,
        quizzes: 18,
        assignments: 9,
      })
    )
  }
  if (m('get', '/admin/students')) {
    return delay().then(() => respond(config, { items: STUDENTS }))
  }
  if (m('get', '/admin/interviews')) {
    return delay().then(() => respond(config, { items: INTERVIEWS }))
  }
  if (m('get', '/admin/materials')) {
    return delay().then(() => respond(config, { items: MATERIALS.map((m) => ({ name: m.title, subtitle: m.category, meta: m.type })) }))
  }
  if (m('get', '/admin/quizzes')) {
    return delay().then(() => respond(config, { items: [{ name: 'React Basics', subtitle: '10 questions', meta: 'Active' }] }))
  }
  if (m('get', '/admin/assignments')) {
    return delay().then(() => respond(config, { items: [{ name: 'Build a REST API', subtitle: 'Due next week', meta: '12 submissions' }] }))
  }
  if (m('get', '/admin/performance')) {
    return delay().then(() => respond(config, { items: [{ name: 'Cohort 2022', subtitle: 'Avg score 72', meta: 'Improving' }] }))
  }

  return reject(config, `Mock: no handler for ${method.toUpperCase()} ${url}`)
}

function safeBody(config) {
  try {
    return JSON.parse(config.data || '{}')
  } catch {
    return {}
  }
}

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  let s = ''
  for (let i = 0; i < 6; i++) s += chars[Math.floor(Math.random() * chars.length)]
  return s
}
