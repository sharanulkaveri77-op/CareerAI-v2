import { invokeAi } from './ai'
import { getSkills, ROLE_SKILL_BENCHMARKS } from './skills'

export function buildRoleSpecificFallback(from, to, userSkillsList = []) {
  const targetLower = (to || '').toLowerCase()

  // Find benchmark skills for target role
  const benchmarkKey =
    Object.keys(ROLE_SKILL_BENCHMARKS).find((k) => k.toLowerCase().includes(targetLower)) ||
    'Full Stack Developer'
  const benchmark = ROLE_SKILL_BENCHMARKS[benchmarkKey] || ROLE_SKILL_BENCHMARKS['Full Stack Developer']

  const userSkillSet = new Set(
    (userSkillsList || []).map((s) => (typeof s === 'string' ? s : s.name || '').toLowerCase().trim())
  )
  const missingGaps = benchmark
    .filter((b) => !userSkillSet.has(b.name.toLowerCase().trim()))
    .map((b) => b.name)

  let phase1Skills = missingGaps.slice(0, 2)
  if (phase1Skills.length === 0) phase1Skills = ['Core Data Structures', 'Git & GitHub Workflow']
  if (!phase1Skills.includes('Clean Code Practices')) phase1Skills.push('Clean Code Practices')

  let phase2Skills = missingGaps.slice(2, 4)
  if (phase2Skills.length === 0) phase2Skills = ['System Architecture', 'Database Management']
  if (!phase2Skills.includes('REST API Design')) phase2Skills.push('REST API Design')

  let phase3Skills = ['Cloud Deployment (AWS/Vercel)', 'CI/CD Pipelines', 'Performance Optimization']

  if (targetLower.includes('frontend') || targetLower.includes('react')) {
    if (phase1Skills.length < 3) phase1Skills = ['JavaScript ES6+', 'React.js', 'Tailwind CSS', 'TypeScript']
    phase3Skills = ['Jest / React Testing Library', 'GraphQL & Micro-frontends', 'Vercel Deployment']
  } else if (targetLower.includes('backend') || targetLower.includes('node') || targetLower.includes('java')) {
    if (phase1Skills.length < 3) phase1Skills = ['Java / Node.js', 'Spring Boot / Express.js', 'PostgreSQL & SQL Queries']
    phase3Skills = ['AWS ECS / Kubernetes', 'API Security & OAuth2', 'Load Testing & Monitoring']
  } else if (targetLower.includes('ai') || targetLower.includes('machine learning') || targetLower.includes('data')) {
    if (phase1Skills.length < 3) phase1Skills = ['Python', 'Pandas & NumPy', 'Linear Algebra & Statistics']
    phase3Skills = ['LLM Fine-Tuning & RAG', 'LangChain / LlamaIndex', 'FastAPI & Model Deployment']
  } else if (targetLower.includes('devops') || targetLower.includes('cloud')) {
    if (phase1Skills.length < 3) phase1Skills = ['Linux Administration', 'Shell Scripting', 'Docker Containerization']
    phase3Skills = ['Jenkins / GitHub Actions CI/CD', 'Prometheus & Grafana', 'DevSecOps & IAM']
  }

  const gapSummary = missingGaps.length > 0 ? ` (Targeting gaps: ${missingGaps.slice(0, 3).join(', ')})` : ''

  return {
    roadmap: {
      stages: [
        {
          title: `Phase 1: Priority Skill Gaps & Foundations (${from} → ${to})`,
          duration: '1 - 2 Months',
          description: `Master essential programming fundamentals and prioritize key missing gaps (${phase1Skills.slice(0, 2).join(', ')}) required for ${to}.`,
          skills: phase1Skills,
          milestones: [
            `Complete ${to} coursework focusing on ${phase1Skills[0] || 'fundamentals'}`,
            `Build mini-project applying ${phase1Skills[0] || 'core concepts'} and ${phase1Skills[1] || 'tools'}`,
          ],
        },
        {
          title: `Phase 2: Advanced ${to} Architecture & Projects`,
          duration: '2 - 3 Months',
          description: `Build complex end-to-end applications showcasing database management, API design, and system architecture${gapSummary}.`,
          skills: phase2Skills,
          milestones: [
            `Develop a production-grade project incorporating ${phase2Skills[0] || 'system design'} and ${phase2Skills[1] || 'databases'}`,
            'Implement comprehensive automated unit and integration tests',
          ],
        },
        {
          title: `Phase 3: Cloud Deployment & Specialization`,
          duration: '1 - 2 Months',
          description: `Deploy your projects to cloud infrastructure, optimize runtime performance, and write clean documentation.`,
          skills: phase3Skills,
          milestones: [
            `Deploy full-stack ${to} application using ${phase3Skills[0]}`,
            'Achieve 90%+ score on lighthouse/performance benchmarks',
          ],
        },
        {
          title: `Phase 4: Resume Optimization & Interview Mastery`,
          duration: '1 Month',
          description: `Prepare for technical screenings, system design interviews, and behavioral STAR questions for ${to} roles.`,
          skills: ['ATS Resume Polish', 'System Design Interview Practice', 'STAR Behavioral Coaching'],
          milestones: [
            `Pass ATS resume scan with >85% match for ${to}`,
            `Complete 3 mock interviews specifically for ${to}`,
          ],
        },
      ],
    },
  }
}

export const generateRoadmap = async (data) => {
  const from = (data?.from && data.from.trim()) || 'Student'
  const to = (data?.to && data.to.trim()) || 'Full Stack Engineer'

  let userSkillsList = data?.userSkills || []
  if (!userSkillsList.length) {
    try {
      const sRes = await getSkills()
      userSkillsList = sRes.data?.skills || sRes.data || []
    } catch {
      /* ignore */
    }
  }

  try {
    const result = await invokeAi('roadmap', { from, to, userSkills: userSkillsList.map((s) => s.name || s) })
    if (result.data?.roadmap?.stages || result.data?.stages) {
      return result
    }
  } catch (e) {
    console.warn('AI Roadmap API call fallback:', e)
  }

  return { data: buildRoleSpecificFallback(from, to, userSkillsList) }
}
