import { invokeAi } from './ai'

export const SAMPLE_JOBS = [
  {
    id: 'job-1',
    title: 'Full Stack Software Engineer',
    company: 'TechCorp Innovations',
    location: 'Bangalore, India (Hybrid)',
    type: 'Full-Time',
    experience: '0-2 Years',
    salary: '₹12,000,00 - ₹18,000,00 / yr',
    skills: ['React', 'Node.js', 'TypeScript', 'SQL', 'System Design'],
    description:
      'We are looking for a passionate Full Stack Software Engineer to build scalable web applications, REST APIs, and microservices.',
    posted: '2 days ago',
  },
  {
    id: 'job-2',
    title: 'AI / Machine Learning Engineer',
    company: 'DataMind Labs',
    location: 'Remote',
    type: 'Full-Time',
    experience: '0-1 Years',
    salary: '₹14,000,00 - ₹22,000,00 / yr',
    skills: ['Python', 'PyTorch', 'LLMs', 'Docker', 'REST APIs'],
    description:
      'Join our AI research team to train fine-tuned neural models, build generative AI pipelines, and deploy scalable AI APIs.',
    posted: '1 day ago',
  },
  {
    id: 'job-3',
    title: 'Frontend React Developer',
    company: 'Nexus SaaS Systems',
    location: 'Hyderabad, India',
    type: 'Full-Time',
    experience: '0-2 Years',
    salary: '₹10,000,00 - ₹15,000,00 / yr',
    skills: ['React', 'JavaScript', 'Tailwind CSS', 'Redux', 'Git'],
    description:
      'Craft beautiful, responsive UI components and interactive dashboards for global Enterprise SaaS products.',
    posted: '3 days ago',
  },
  {
    id: 'job-4',
    title: 'Backend Node.js Developer',
    company: 'CloudScale Infrastructure',
    location: 'Pune, India (Remote)',
    type: 'Full-Time',
    experience: '1-3 Years',
    salary: '₹13,000,00 - ₹20,000,00 / yr',
    skills: ['Node.js', 'Express', 'PostgreSQL', 'Docker', 'AWS'],
    description:
      'Design RESTful microservices, optimize database queries, and maintain high-throughput backend APIs.',
    posted: 'Just now',
  },
  {
    id: 'job-5',
    title: 'DevOps & Cloud Infrastructure Engineer',
    company: 'Apex Cloud Solutions',
    location: 'Bangalore, India (Remote)',
    type: 'Full-Time',
    experience: '1-3 Years',
    salary: '₹15,000,00 - ₹24,000,00 / yr',
    skills: ['Docker', 'Kubernetes', 'AWS', 'Terraform', 'CI/CD'],
    description:
      'Manage cloud infrastructure automation, maintain Kubernetes clusters, and build automated CI/CD deployment pipelines.',
    posted: '4 days ago',
  },
]

export function computeSkillMatch(jobSkills, userSkills = ['React', 'JavaScript', 'Tailwind CSS', 'Node.js', 'SQL']) {
  if (!jobSkills || !jobSkills.length) return 80
  const normalizedUser = userSkills.map((s) => s.toLowerCase())
  const matched = jobSkills.filter((s) => normalizedUser.includes(s.toLowerCase()))
  return Math.min(98, Math.max(50, Math.round((matched.length / jobSkills.length) * 100)))
}

export async function searchJobs({ query = '', location = '' }) {
  if (import.meta.env.VITE_GEMINI_API_KEY && query.trim()) {
    try {
      const res = await invokeAi('roles-search', { q: query })
      const aiRoles = res.data?.roles || []
      if (aiRoles.length > 0) {
        return aiRoles.map((r, i) => ({
          id: `ai-job-${i}`,
          title: r.title,
          company: 'Tech Talent Network',
          location: location || 'Remote / Hybrid',
          type: 'Full-Time',
          experience: '0-2 Years',
          salary: r.salary || 'Competitive',
          skills: ['React', 'Python', 'Node.js', 'System Design'],
          description: r.summary,
          posted: 'Recently Added',
        }))
      }
    } catch {
      /* fallback to local sample jobs */
    }
  }

  const q = query.toLowerCase()
  return SAMPLE_JOBS.filter(
    (j) =>
      j.title.toLowerCase().includes(q) ||
      j.company.toLowerCase().includes(q) ||
      j.skills.some((s) => s.toLowerCase().includes(q))
  )
}
