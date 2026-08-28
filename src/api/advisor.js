import { invokeAi } from './ai'

export const sendChat = async (message, history = []) => {
  const trimmed = (message || '').trim()

  // 1. Primary path: Call Google Gemini API
  try {
    const res = await invokeAi('chat', {
      message: trimmed,
      history,
    })
    if (res.data?.reply) {
      return res
    }
  } catch (e) {
    console.warn('AI Advisor API call fallback:', e)
  }

  // 2. Intelligent Topic-Specific Fallback Engine (No Repetitive Fallbacks!)
  const lower = trimmed.toLowerCase()
  const todayDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  let reply = ''

  if (/^(hi|hey|hello|hlo|greetings|good morning|good afternoon|good evening)\b/i.test(lower)) {
    reply = `Hello! 👋 I am your CareerAI Advisor. How can I help you today? Ask me any technical question about software engineering, coding algorithms, resume ATS audits, interview prep, or career roadmaps!`
  } else if (lower.includes('interview') || lower.includes('prepsre') || lower.includes('prepare') || lower.includes('behavioral') || lower.includes('hr')) {
    reply = `To prepare effectively for technical and behavioral software engineering interviews, follow this 4-step prep strategy:\n\n1. 🎯 Master the STAR Method (Situation, Task, Action, Result) for behavioral & HR questions. Quantify your achievements (e.g. 'Improved query performance by 35%').\n2. 💻 Core DSA Practice: Focus on Arrays, Two Pointers, Sliding Window, Trees, and Graphs. Practice 2 problems daily on our DSA Practice tab!\n3. 🏗️ System Design Architecture: Master Load Balancing, Caching (Redis), Database Sharding, and Microservices for high-throughput systems.\n4. 🎥 Live Practice: Run a 5-minute interactive mock interview on our Mock Interviews tab for instant voice & content evaluation!`
  } else if (lower.includes('date') || lower.includes('time') || lower.includes('day is today')) {
    reply = `Today is ${todayDate}. How can I assist with your technical learning or interview prep today?`
  } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) {
    reply = `To optimize your resume for ATS scanners and tech recruiters:\n1. Use clean single-column layouts with clear section headers.\n2. Quantify achievements with metrics (e.g. 'Reduced latency by 40% using Redis caching').\n3. Include target technical keywords matching the job description.\nVisit our ATS Resume Scanner tab for a full 4-column diagnostic audit!`
  } else if (lower.includes('dsa') || lower.includes('algo') || lower.includes('code') || lower.includes('array') || lower.includes('tree')) {
    reply = `To excel in Data Structures & Algorithms (DSA):\n1. Master core patterns: Two Pointers, Sliding Window, Tree Traversals, and Graph BFS/DFS.\n2. Practice on our DSA Practice tab where we have 28 core challenges with hints and solutions.\n3. Always explain time (O(N)) and space complexity out loud while solving!`
  } else if (lower.includes('system design') || lower.includes('architecture') || lower.includes('scale')) {
    reply = `For System Design interviews:\n1. Clarify functional & non-functional requirements (QPS, latency, data scale).\n2. Calculate high-level throughput & storage bandwidth.\n3. Diagram core components: API Gateway, Microservices, Caching Layer (Redis), Load Balancer, DB Sharding, and Message Queues (Kafka).`
  } else if (lower.includes('skill') || lower.includes('learn') || lower.includes('react') || lower.includes('node') || lower.includes('python')) {
    reply = `Focus your learning on high-demand technical competencies for your target role. Visit our Skill Gap Analysis tab to compare your current skills against top benchmarks for Full Stack, Frontend, Backend, AI/ML, and DevOps roles!`
  } else if (lower.includes('salary') || lower.includes('pay') || lower.includes('negotiate')) {
    reply = `Tech salary packages depend on role level, location, and demonstrated technical expertise. Research benchmarks on our Job Discovery tab and highlight specialized skills in System Design or AI Engineering!`
  } else if (lower.includes('roadmap') || lower.includes('plan') || lower.includes('path')) {
    reply = `A structured 4-phase path is key: Phase 1 (Foundations & Core Language), Phase 2 (Frameworks & Database Systems), Phase 3 (Projects & Specialization), Phase 4 (Interview Prep & Applications). Visit the Career Roadmap tab for a customized plan!`
  } else {
    reply = `Great question regarding "${trimmed}". As your Career Copilot, I recommend focusing on building hands-on portfolio projects, refining your target role skills, and practicing mock interviews regularly. Is there a specific technical topic or career goal you'd like to dive into next?`
  }

  return { data: { reply } }
}
