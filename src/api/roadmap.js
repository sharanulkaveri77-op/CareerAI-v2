import { invokeAi } from './ai'

function buildRoleSpecificFallback(from, to) {
  const targetLower = (to || '').toLowerCase()
  const fromLower = (from || '').toLowerCase()

  let phase1Skills = ['Core Data Structures', 'Git & GitHub Workflow', 'Clean Code Practices']
  let phase2Skills = ['System Architecture', 'Database Management', 'REST API Design']
  let phase3Skills = ['Cloud Deployment (AWS/Vercel)', 'CI/CD Pipelines', 'Performance Optimization']

  if (targetLower.includes('frontend') || targetLower.includes('react')) {
    phase1Skills = ['JavaScript ES6+', 'React.js', 'Tailwind CSS', 'TypeScript']
    phase2Skills = ['Next.js App Router', 'Redux Toolkit / Zustand', 'Web Vitals & Performance']
    phase3Skills = ['Jest / React Testing Library', 'GraphQL & Micro-frontends', 'Vercel Deployment']
  } else if (targetLower.includes('backend') || targetLower.includes('node') || targetLower.includes('java')) {
    phase1Skills = ['Java / Node.js', 'Spring Boot / Express.js', 'PostgreSQL & SQL Queries']
    phase2Skills = ['Redis Caching', 'Kafka / RabbitMQ Messaging', 'Docker & Microservices']
    phase3Skills = ['AWS ECS / Kubernetes', 'API Security & OAuth2', 'Load Testing & Monitoring']
  } else if (targetLower.includes('ai') || targetLower.includes('machine learning') || targetLower.includes('data')) {
    phase1Skills = ['Python', 'Pandas & NumPy', 'Linear Algebra & Statistics', 'Scikit-Learn']
    phase2Skills = ['PyTorch / TensorFlow', 'Neural Networks & Deep Learning', 'NLP & Computer Vision']
    phase3Skills = ['LLM Fine-Tuning & RAG', 'LangChain / LlamaIndex', 'FastAPI & Model Deployment']
  } else if (targetLower.includes('devops') || targetLower.includes('cloud')) {
    phase1Skills = ['Linux Administration', 'Shell Scripting', 'Docker Containerization']
    phase2Skills = ['Kubernetes Orchestration', 'Terraform (IaC)', 'AWS / Azure Cloud Services']
    phase3Skills = ['Jenkins / GitHub Actions CI/CD', 'Prometheus & Grafana', 'DevSecOps & IAM']
  }

  return {
    roadmap: {
      stages: [
        {
          title: `Phase 1: Foundations (${from} → ${to})`,
          duration: '1 - 2 Months',
          description: `Master core programming syntax, fundamentals, and essential developer tools required for ${to}.`,
          skills: phase1Skills,
          milestones: [
            `Complete ${to} foundational coursework & exercises`,
            `Build first mini-project applying ${phase1Skills[0]} and ${phase1Skills[1]}`,
          ],
        },
        {
          title: `Phase 2: Advanced ${to} Architecture & Projects`,
          duration: '2 - 3 Months',
          description: `Build complex end-to-end applications showcasing database management, API design, and system architecture.`,
          skills: phase2Skills,
          milestones: [
            `Develop a production-grade project incorporating ${phase2Skills[0]} and ${phase2Skills[1]}`,
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
            `Complete 3 live or AI mock interviews specifically for ${to}`,
          ],
        },
      ],
    },
  }
}

export const generateRoadmap = async (data) => {
  const from = data?.from || 'Current Role'
  const to = data?.to || 'Target Role'

  try {
    const result = await invokeAi('roadmap', { from, to })
    if (result.data?.roadmap?.stages || result.data?.stages) {
      return result
    }
  } catch (e) {
    console.warn('AI Roadmap API call fallback:', e)
  }

  return { data: buildRoleSpecificFallback(from, to) }
}
