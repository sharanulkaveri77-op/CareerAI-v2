import { invokeAi } from './ai'

export const COMMUNICATION_TOPICS = [
  {
    id: 'self-intro',
    title: 'Self-Introduction',
    prompt: 'Deliver a concise 90-second professional self-introduction covering your background, top skills, and career focus.',
    sample: 'Hi, I am a final-year Computer Science student passionate about full-stack web development and AI. I have built projects using React, Node.js, and SQL, and I am seeking a Software Engineering role where I can drive impact.',
    keywords: ['intro', 'background', 'student', 'experience', 'skills', 'developer', 'engineer', 'built', 'project', 'passion', 'seeking', 'role'],
  },
  {
    id: 'star-behavioral',
    title: 'HR Behavioral Challenge',
    prompt: 'Tell me about a time you faced a major technical challenge or conflict in a team project. How did you resolve it?',
    sample: 'During my capstone project, our team had conflicting opinions on database architecture. I organized a benchmark test, compared performance metrics, and led the consensus to adopt PostgreSQL with Redis caching, resulting in 40% faster query speeds.',
    keywords: ['challenge', 'conflict', 'team', 'project', 'resolved', 'problem', 'issue', 'decision', 'result', 'benchmark', 'agreed', 'led'],
  },
  {
    id: 'gd-topic',
    title: 'Group Discussion & Tech Trends',
    prompt: 'What is your perspective on the impact of Artificial Intelligence and Automation on entry-level Software Engineering jobs?',
    sample: 'AI is shifting the role of developers from writing boilerplate code to higher-level system architecture, problem solving, and prompt engineering. Engineers who leverage AI tools effectively will increase productivity by 3x.',
    keywords: ['ai', 'automation', 'impact', 'developer', 'engineering', 'jobs', 'tools', 'future', 'tech', 'productivity', 'software'],
  },
  {
    id: 'non-tech-explain',
    title: 'Explaining Tech to Non-Tech Audience',
    prompt: 'How would you explain the concept of an API (Application Programming Interface) to a non-technical stakeholder or client?',
    sample: 'An API is like a waiter at a restaurant. You look at the menu, tell the waiter your order, the waiter takes it to the kitchen, and brings back your meal without you needing to know how the kitchen prepared it.',
    keywords: ['api', 'interface', 'waiter', 'restaurant', 'order', 'kitchen', 'client', 'server', 'analogy', 'request', 'response', 'explain'],
  },
  {
    id: 'handling-feedback',
    title: 'Handling Tough Feedback',
    prompt: 'Describe a situation where a code review or project feedback was critical of your work. How did you respond and improve?',
    sample: 'During a code review, a senior engineer pointed out that my API queries were creating N+1 query bottlenecks. I thanked them, refactored the database joins, and added automated performance tests to prevent regression.',
    keywords: ['feedback', 'review', 'senior', 'code', 'improved', 'criticism', 'learned', 'refactored', 'thanked', 'bottleneck', 'change'],
  },
  {
    id: 'system-design-debate',
    title: 'System Architecture Debate',
    prompt: 'Defend your choice between Monolithic vs Microservices architecture for an early-stage startup with 3 developers.',
    sample: 'For a 3-person team, a Modular Monolith is superior to Microservices. It eliminates network latency overhead, simplifies CI/CD deployment pipelines, and allows fast iteration before domain boundaries stabilize.',
    keywords: ['monolith', 'microservices', 'architecture', 'startup', 'latency', 'deployment', 'tradeoff', 'scale', 'modular'],
  },
  {
    id: 'team-leadership',
    title: 'Leading Under Pressure',
    prompt: 'How do you prioritize features and delegate tasks when a critical release date is cut in half?',
    sample: 'I conduct an immediate triage to identify P0 MVP requirements versus nice-to-have P2 features. I communicate transparently with stakeholders to cut scope, reassign blocked tasks, and ensure core user flows pass testing.',
    keywords: ['prioritize', 'release', 'deadline', 'p0', 'scope', 'triage', 'stakeholders', 'communicate', 'delegate'],
  },
  {
    id: 'agile-conflict',
    title: 'Agile & Scrum Process Conflict',
    prompt: 'How do you handle scope creep when a Product Manager adds new requirements mid-sprint?',
    sample: 'I evaluate the technical effort required for the new feature and explain the velocity trade-off to the PM. If the feature is critical for current sprint goals, we deprioritize an equivalent story point task to the backlog.',
    keywords: ['sprint', 'scope', 'pm', 'agile', 'backlog', 'velocity', 'tradeoff', 'story', 'points', 'priority'],
  },
  {
    id: 'salary-negotiation',
    title: 'Professional Salary Negotiation',
    prompt: 'How do you professionally communicate your salary expectations during a final round offer discussion?',
    sample: 'Based on market research for Senior Full Stack roles in this region, my target compensation range is $125k-$140k based on my proven experience scaling production React/Node applications and leading technical projects.',
    keywords: ['compensation', 'salary', 'market', 'research', 'offer', 'target', 'experience', 'negotiate', 'range'],
  },
  {
    id: 'crisis-outage',
    title: 'Production Outage Communication',
    prompt: 'You are the engineer on call when a primary database goes down during peak traffic. How do you communicate status to the team?',
    sample: 'I post an immediate P0 incident alert in Slack, initiate failover to the read-replica database, and update the status page every 15 minutes with root cause investigation progress while keeping stakeholders informed.',
    keywords: ['outage', 'incident', 'database', 'p0', 'failover', 'slack', 'status', 'replica', 'investigation', 'communicated'],
  },
  {
    id: 'cross-functional',
    title: 'Working with Designers & QA',
    prompt: 'How do you collaborate with UI/UX designers to bridge design handoffs and technical feasibility?',
    sample: 'I review Figma designs during early wireframe stages to flag expensive CSS animations or layout constraints. We establish a shared design token system in Tailwind to ensure 100% pixel perfection and fast implementation.',
    keywords: ['designer', 'figma', 'ui', 'ux', 'qa', 'tokens', 'feasibility', 'collaboration', 'handoff', 'component'],
  },
  {
    id: 'mentoring-juniors',
    title: 'Mentoring & Pair Programming',
    prompt: 'How do you guide a junior developer who is stuck on a debugging problem without doing the work for them?',
    sample: 'I ask guiding questions about expected vs actual behavior, walk through console logs together, and encourage them to set breakpoints. This builds their problem-solving muscle while helping them unblock themselves.',
    keywords: ['junior', 'mentor', 'pair', 'debug', 'guiding', 'questions', 'logs', 'breakpoints', 'unblock', 'teaching'],
  },
  {
    id: 'pitching-refactor',
    title: 'Pitching Technical Debt Refactoring',
    prompt: 'How do you convince engineering managers to allocate 20% of sprint time to technical debt and refactoring?',
    sample: 'I present metric data showing that legacy code complexity has increased bug turnaround time by 30%. I frame technical debt reduction as a direct accelerator for feature velocity and system stability.',
    keywords: ['technical', 'debt', 'refactor', 'sprint', 'manager', 'velocity', 'bugs', 'metrics', 'stability', 'pitch'],
  },
  {
    id: 'remote-work-sync',
    title: 'Async Communication & Remote Work',
    prompt: 'How do you ensure effective asynchronous communication across multiple time zones in a distributed team?',
    sample: 'I write detailed PR descriptions with context, screenshots, and loom video walkthroughs. I document decisions in Notion and leave actionable comments so teammates in opposite time zones can review independently.',
    keywords: ['async', 'remote', 'timezone', 'documentation', 'pr', 'context', 'loom', 'notion', 'distributed', 'written'],
  },
  {
    id: 'career-goals',
    title: '5-Year Technical Vision',
    prompt: 'Where do you see your technical trajectory evolving over the next 3 to 5 years?',
    sample: 'Over the next 3 years, I plan to deepen my expertise in distributed systems and AI architecture, progressing from a Staff Engineer role into a Technical Lead where I can architect scalable infrastructure and mentor engineering teams.',
    keywords: ['5-year', 'trajectory', 'vision', 'growth', 'lead', 'architect', 'distributed', 'tech', 'career', 'goals'],
  },
]

export async function evaluateCommunication({ topicId, text }) {
  const trimmed = (text || '').trim()
  const wordCount = trimmed.split(/\s+/).filter(Boolean).length

  // Check for trivial or extremely short responses right away
  const isTrivial = wordCount < 8 || /^(hi|hey|hello|ok|yes|no|test|n\/a|greetings|\s*)$/i.test(trimmed)

  if (isTrivial) {
    return {
      clarityScore: 10,
      professionalismRating: 'Needs Polish',
      topicRelevance: 'Off-Topic / Incorrect',
      grammarFeedback: 'Your response is far too short or incomplete for an interview response. A single greeting or short word does not answer the prompt. Please provide a full response (~75-150 words).',
      modelAnswer: `A strong response for "${topicId}" should open with your background, describe a concrete situation using the STAR framework, and conclude with measurable impact.`,
    }
  }

  if (import.meta.env.VITE_GEMINI_API_KEY) {
    try {
      const res = await invokeAi('communication-evaluate', { topicId, text: trimmed })
      if (res.data && res.data.clarityScore !== undefined) {
        return res.data
      }
    } catch (e) {
      console.warn('Gemini communication evaluation fallback:', e)
    }
  }

  // Local topic relevance check
  const topicObj = COMMUNICATION_TOPICS.find((t) => t.title === topicId) || COMMUNICATION_TOPICS[0]
  const lowerText = trimmed.toLowerCase()
  const matchedKeywords = (topicObj.keywords || []).filter((kw) => lowerText.includes(kw))
  const keywordRatio = topicObj.keywords?.length ? matchedKeywords.length / topicObj.keywords.length : 0.5

  let topicRelevance = 'Relevant & Correct'
  if (keywordRatio === 0 && wordCount < 20) {
    topicRelevance = 'Off-Topic / Incorrect'
  } else if (keywordRatio < 0.15) {
    topicRelevance = 'Partially Relevant'
  }

  let clarityScore = 80
  if (topicRelevance === 'Off-Topic / Incorrect') {
    clarityScore = Math.min(30, Math.max(15, wordCount * 0.5))
  } else if (topicRelevance === 'Partially Relevant') {
    clarityScore = Math.min(65, Math.max(40, wordCount * 0.6))
  } else {
    const hasMetrics = /\d+/.test(trimmed)
    const hasSTAR = /(situation|task|action|result|because|led|built|resolved|achieved|improved)/i.test(trimmed)
    clarityScore = Math.min(96, Math.max(55, wordCount * 0.5 + (hasMetrics ? 15 : 5) + (hasSTAR ? 15 : 5)))
  }

  clarityScore = Math.round(clarityScore)

  let professionalismRating = 'Needs Polish'
  if (clarityScore >= 75) professionalismRating = 'High'
  else if (clarityScore >= 55) professionalismRating = 'Moderate'

  let grammarFeedback = ''
  if (topicRelevance === 'Off-Topic / Incorrect') {
    grammarFeedback = `Your response appears off-topic or incorrect for the prompt "${topicId}". Make sure to address the specific scenario requested.`
  } else if (topicRelevance === 'Partially Relevant') {
    grammarFeedback = `Your response touches on the prompt but lacks specific details. Expand with concrete technical examples.`
  } else {
    grammarFeedback = `Your response is highly relevant and well structured. To maximize impact, introduce specific quantitative metrics.`
  }

  const modelAnswer = `${trimmed} In summary, my technical foundation, clear communication, and focus on measurable outcomes enable me to collaborate effectively and deliver business value.`

  return {
    clarityScore,
    professionalismRating,
    topicRelevance,
    grammarFeedback,
    modelAnswer,
  }
}
