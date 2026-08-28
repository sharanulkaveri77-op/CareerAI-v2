import { supabase } from './supabase'
import { invokeAi } from './ai'

const LOCAL_SKILLS_KEY = 'careeriq_skills'

export const ROLE_SKILL_BENCHMARKS = {
  'Full Stack Developer': [
    { name: 'React', level: 'advanced', category: 'Frontend' },
    { name: 'JavaScript', level: 'advanced', category: 'Frontend' },
    { name: 'Node.js', level: 'advanced', category: 'Backend' },
    { name: 'TypeScript', level: 'intermediate', category: 'Frontend' },
    { name: 'SQL & PostgreSQL', level: 'intermediate', category: 'Database' },
    { name: 'Tailwind CSS', level: 'advanced', category: 'Frontend' },
    { name: 'REST & GraphQL APIs', level: 'intermediate', category: 'Backend' },
    { name: 'Docker & Containers', level: 'intermediate', category: 'DevOps' },
    { name: 'Git & GitHub', level: 'advanced', category: 'Tools' },
    { name: 'System Design', level: 'intermediate', category: 'Architecture' },
  ],
  'Frontend Developer': [
    { name: 'React', level: 'expert', category: 'Frontend' },
    { name: 'JavaScript (ES6+)', level: 'expert', category: 'Frontend' },
    { name: 'TypeScript', level: 'advanced', category: 'Frontend' },
    { name: 'HTML5 & CSS3', level: 'expert', category: 'Frontend' },
    { name: 'Tailwind CSS', level: 'advanced', category: 'Frontend' },
    { name: 'State Management (Redux/Zustand)', level: 'advanced', category: 'Frontend' },
    { name: 'Web Performance Optimization', level: 'intermediate', category: 'Frontend' },
    { name: 'Testing (Jest/RTL)', level: 'intermediate', category: 'Testing' },
    { name: 'REST APIs', level: 'advanced', category: 'Frontend' },
    { name: 'Git & Version Control', level: 'advanced', category: 'Tools' },
  ],
  'Backend Engineer': [
    { name: 'Node.js / Express', level: 'expert', category: 'Backend' },
    { name: 'Python / Java', level: 'advanced', category: 'Backend' },
    { name: 'SQL (PostgreSQL / MySQL)', level: 'expert', category: 'Database' },
    { name: 'NoSQL (MongoDB / Redis)', level: 'advanced', category: 'Database' },
    { name: 'REST & Microservices', level: 'advanced', category: 'Architecture' },
    { name: 'Docker & Kubernetes', level: 'intermediate', category: 'DevOps' },
    { name: 'System Design & Scalability', level: 'advanced', category: 'Architecture' },
    { name: 'CI/CD Pipelines', level: 'intermediate', category: 'DevOps' },
    { name: 'API Security & OAuth2', level: 'advanced', category: 'Security' },
    { name: 'Git', level: 'advanced', category: 'Tools' },
  ],
  'AI / ML Engineer': [
    { name: 'Python', level: 'expert', category: 'AI/ML' },
    { name: 'PyTorch / TensorFlow', level: 'advanced', category: 'AI/ML' },
    { name: 'Machine Learning Algorithms', level: 'advanced', category: 'AI/ML' },
    { name: 'Data Preprocessing (Pandas/NumPy)', level: 'expert', category: 'AI/ML' },
    { name: 'Prompt Engineering & LLMs', level: 'advanced', category: 'AI/ML' },
    { name: 'LangChain & Vector Databases', level: 'intermediate', category: 'AI/ML' },
    { name: 'SQL', level: 'intermediate', category: 'Database' },
    { name: 'MLOps & Model Deployment', level: 'intermediate', category: 'DevOps' },
    { name: 'Git', level: 'advanced', category: 'Tools' },
  ],
  'DevOps Engineer': [
    { name: 'Docker & Containers', level: 'expert', category: 'DevOps' },
    { name: 'Kubernetes', level: 'advanced', category: 'DevOps' },
    { name: 'Linux Administration', level: 'expert', category: 'OS' },
    { name: 'AWS / Cloud Platforms', level: 'advanced', category: 'Cloud' },
    { name: 'CI/CD (GitHub Actions / Jenkins)', level: 'expert', category: 'DevOps' },
    { name: 'Infrastructure as Code (Terraform)', level: 'advanced', category: 'DevOps' },
    { name: 'Shell Scripting (Bash/Python)', level: 'advanced', category: 'Scripting' },
    { name: 'Monitoring (Prometheus/Grafana)', level: 'intermediate', category: 'Monitoring' },
  ],
}

function getLocalSkills() {
  try {
    const raw = localStorage.getItem(LOCAL_SKILLS_KEY)
    return raw
      ? JSON.parse(raw)
      : [
          { _id: 'local-1', name: 'React', category: 'Technical', level: 'advanced' },
          { _id: 'local-2', name: 'JavaScript', category: 'Technical', level: 'advanced' },
          { _id: 'local-3', name: 'Tailwind CSS', category: 'Technical', level: 'intermediate' },
        ]
  } catch {
    return []
  }
}

function saveLocalSkills(list) {
  try {
    localStorage.setItem(LOCAL_SKILLS_KEY, JSON.stringify(list))
  } catch {
    /* noop */
  }
}

export async function getSkills() {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: true })

    if (error) throw error
    const skills = (data || []).map((s) => ({
      _id: s.id,
      name: s.name,
      category: s.category,
      level: s.level,
    }))
    return { data: { skills } }
  } catch {
    return { data: { skills: getLocalSkills() } }
  }
}

export async function addSkill(data) {
  let createdSkill = null
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user) {
      const { data: created, error } = await supabase
        .from('skills')
        .insert({ user_id: user.id, name: data.name, category: data.category, level: data.level })
        .select()
        .single()

      if (!error && created) {
        createdSkill = { _id: created.id, name: created.name, category: created.category, level: created.level }
      }
    }
  } catch {
    /* fallback */
  }

  if (!createdSkill) {
    createdSkill = {
      _id: 'skill-' + Date.now(),
      name: data.name,
      category: data.category || 'Technical',
      level: data.level || 'beginner',
    }
    const current = getLocalSkills()
    current.push(createdSkill)
    saveLocalSkills(current)
  }

  return { data: { skill: createdSkill } }
}

export async function deleteSkill(id) {
  try {
    await supabase.from('skills').delete().eq('id', id)
  } catch {
    /* fallback */
  }
  const current = getLocalSkills()
  const updated = current.filter((s) => s._id !== id)
  saveLocalSkills(updated)
  return { data: { success: true } }
}

export async function analyzeSkills(targetRole = 'Full Stack Developer') {
  let userSkills = []
  try {
    const res = await getSkills()
    userSkills = res.data?.skills || []
  } catch {
    userSkills = getLocalSkills()
  }

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const skillList = userSkills.map((s) => `${s.name} (${s.level})`).join(', ')
      const prompt = `User's tracked skills: [${skillList || 'None'}].
Target Role: "${targetRole}".

Perform a detailed Skill Gap Analysis comparing candidate's profile to target role "${targetRole}".
Identify:
1. Missing high-priority skills required for "${targetRole}"
2. Skills where user proficiency needs upgrading (e.g. from beginner to advanced)
3. Actionable learning priority roadmap

Return JSON object matching structure:
{
  "gaps": ["Missing Skill 1", "Missing Skill 2", "Missing Skill 3", "Missing Skill 4"],
  "lackingProficiency": ["Skill X (needs Advanced)", "Skill Y (needs Expert)"],
  "matchPercentage": 70,
  "summary": "2-sentence executive summary comparing candidate profile to target role."
}`

      const res = await invokeAi('chat', { message: prompt })
      const rawText = res.data?.reply || ''
      const cleaned = rawText.replace(/^```[a-z]*\n?/i, '').replace(/\n?```$/i, '').trim()
      try {
        return { data: JSON.parse(cleaned) }
      } catch {
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) return { data: JSON.parse(match[0]) }
      }
    } catch (e) {
      console.warn('Gemini skill gap analysis fallback:', e)
    }
  }

  // Local calculation engine against ROLE_SKILL_BENCHMARKS
  const benchmark = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer']
  const userSkillMap = new Map()
  userSkills.forEach((s) => userSkillMap.set((s.name || '').toLowerCase().trim(), s.level))

  const missingGaps = []
  const lackingProficiency = []
  let matchedCount = 0

  benchmark.forEach((req) => {
    const userLevel = userSkillMap.get(req.name.toLowerCase().trim())
    if (!userLevel) {
      missingGaps.push(req.name)
    } else {
      matchedCount++
      if (userLevel === 'beginner' && (req.level === 'advanced' || req.level === 'expert')) {
        lackingProficiency.push(`${req.name} (Current: Beginner → Needs: ${req.level})`)
      }
    }
  })

  const matchPercentage = Math.round((matchedCount / benchmark.length) * 100)

  return {
    data: {
      gaps: missingGaps,
      lackingProficiency,
      matchPercentage,
      summary: `You match ${matchPercentage}% of the benchmark skills for ${targetRole}. Focus on filling the ${missingGaps.length} missing skill gaps to maximize candidate readiness.`,
    },
  }
}
