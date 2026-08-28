import { invokeAi } from './ai'

export const SAMPLE_RESUME_TEXT = `John Doe
Email: john.doe@example.com | Phone: (555) 123-4567 | Location: New York, NY
GitHub: github.com/johndoe | LinkedIn: linkedin.com/in/johndoe

PROFESSIONAL SUMMARY
Full Stack Software Engineer with 3+ years of experience building scalable web applications using React, Node.js, and SQL. Passionate about system design, web performance optimization, and developer tooling.

EDUCATION
Bachelor of Science in Computer Science | State University (2020 - 2024)
GPA: 3.8 / 4.0

TECHNICAL SKILLS
- Languages: JavaScript, TypeScript, Python, SQL, HTML5, CSS3
- Frameworks & Libraries: React.js, Node.js, Express.js, Redux, Tailwind CSS
- Databases & Tools: PostgreSQL, MongoDB, Redis, Git, Docker, Webpack

WORK EXPERIENCE
Software Engineering Intern | TechCorp Inc. (June 2023 - Present)
- Developed and maintained 12+ reusable React components, improving UI page render speeds by 35%.
- Architected RESTful API endpoints in Node.js/Express, handling over 50,000 daily active requests.
- Optimized PostgreSQL database queries with indexes, cutting query latency from 450ms to 80ms.

PROJECTS
CareerIQ - Intelligent Career Growth SaaS
- Built a full-stack career platform using React, Vite, Supabase, and Google Gemini 2.5 Flash API.
- Implemented real-time ATS resume scanning, DSA practice engine, and voice communication coaching.`

async function extractPdfText(file) {
  const [{ default: workerUrl }, pdfjsLib] = await Promise.all([
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
    import('pdfjs-dist'),
  ])
  pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl
  const buffer = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise
  const pages = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const content = await page.getTextContent()
    pages.push(content.items.map((item) => item.str).join(' '))
  }
  return pages.join('\n')
}

async function extractDocxText(file) {
  const { default: mammoth } = await import('mammoth/mammoth.browser')
  const arrayBuffer = await file.arrayBuffer()
  const { value } = await mammoth.extractRawText({ arrayBuffer })
  return value
}

async function extractText(file) {
  const name = (file.name || '').toLowerCase()
  if (name.endsWith('.pdf')) return extractPdfText(file)
  if (name.endsWith('.docx')) return extractDocxText(file)
  return file.text()
}

export async function analyzeResume({ file, rawText, targetRole }) {
  let text = ''
  if (rawText && rawText.trim()) {
    text = rawText.trim()
  } else if (file) {
    try {
      text = await extractText(file)
    } catch {
      const err = new Error('Could not read the resume file')
      err.userMessage = 'Could not read this file. Try exporting it as PDF or plain text.'
      throw err
    }
  } else {
    const err = new Error('No resume file or text provided')
    err.userMessage = 'Please select a resume file or paste your resume text.'
    throw err
  }

  if (!text.trim()) {
    const err = new Error('Empty document')
    err.userMessage = 'This document contains no extractable text.'
    throw err
  }

  try {
    const res = await invokeAi('resume-analyze', { text, targetRole: targetRole || 'Software Engineer' })
    if (res.data && res.data.score !== undefined) {
      return res
    }
    return { data: localAnalyze(text, targetRole) }
  } catch (err) {
    return { data: localAnalyze(text, targetRole) }
  }
}

/* --------------------------- local heuristic engine ----------------------- */

const ROLE_KEYWORDS = {
  engineer: ['javascript', 'python', 'java', 'react', 'node', 'api', 'sql', 'git', 'testing', 'cloud', 'docker', 'algorithms'],
  developer: ['javascript', 'typescript', 'react', 'html', 'css', 'api', 'git', 'rest', 'database', 'agile'],
  data: ['python', 'sql', 'pandas', 'machine learning', 'statistics', 'visualization', 'excel', 'tableau', 'model'],
  manager: ['led', 'stakeholder', 'roadmap', 'cross-functional', 'strategy', 'metrics', 'delivered', 'team', 'prioritized'],
  designer: ['figma', 'user research', 'wireframe', 'prototype', 'usability', 'design system', 'accessibility'],
  analyst: ['sql', 'excel', 'dashboard', 'reporting', 'insights', 'data', 'kpi', 'trends'],
}

function roleBucket(targetRole) {
  const t = (targetRole || '').toLowerCase()
  if (/data scien/.test(t)) return ROLE_KEYWORDS.data
  if (/product|project|program/.test(t)) return ROLE_KEYWORDS.manager
  if (/design|ux|ui/.test(t)) return ROLE_KEYWORDS.designer
  if (/analyst/.test(t)) return ROLE_KEYWORDS.analyst
  return ROLE_KEYWORDS.engineer
}

function localAnalyze(text, targetRole) {
  const lower = text.toLowerCase()
  const words = text.trim() ? text.trim().split(/\s+/).length : 0

  const checks = {
    contact: /[\w.+-]+@[\w-]+\.[\w.]+/.test(lower) || /(\+?\d[\d\s()-]{7,})/.test(lower),
    education: /(education|b\.?tech|bachelor|master|university|college|degree)/.test(lower),
    experience: /(experience|internship|employment|work history)/.test(lower),
    skills: /(skills|technologies|technical)/.test(lower),
    projects: /(project|portfolio|built|developed|created)/.test(lower),
    bullets: (text.match(/[•·▪]|^\s*[-*]/gm) || []).length >= 5,
    lengthOk: words >= 200 && words <= 900,
    metrics: /\d+%|\d+x|\$\d|\d+\+/.test(lower),
    github: /(github\.com|linkedin\.com)/.test(lower),
  }

  const keywords = roleBucket(targetRole)
  const matched = keywords.filter((k) => lower.includes(k))
  const keywordMatch = Math.round((matched.length / keywords.length) * 100)

  const sectionScore =
    Object.entries(checks).filter(([k, v]) => k !== 'lengthOk' && v).length /
    (Object.keys(checks).length - 1)
  const score = Math.round(
    Math.min(100, sectionScore * 55 + keywordMatch * 0.25 + (checks.lengthOk ? 15 : 6) + (checks.metrics ? 8 : 0))
  )

  const strengths = []
  const missing = []
  const lacking = []
  const shouldInclude = []

  if (checks.contact) strengths.push('Clear contact details and email present')
  else missing.push('Contact Information (Email / Phone) not found')

  if (checks.github) strengths.push('GitHub / LinkedIn profile links present')
  else missing.push('GitHub / LinkedIn portfolio links not present')

  if (checks.skills) strengths.push('Dedicated Technical Skills section present')
  else missing.push('Technical Skills section is missing')

  if (checks.education) strengths.push('Education details present')
  else missing.push('Education / Degree details not present')

  if (checks.projects) strengths.push('Projects section present')
  else missing.push('Key Projects section not present')

  if (checks.metrics) strengths.push('Quantified metrics (percentages/numbers) included in bullets')
  else lacking.push('Bullet points lack measurable outcomes (e.g., %, $, speed improvements)')

  if (!checks.bullets) lacking.push('Formatting relies on dense paragraphs instead of scannable bullet points')

  if (words < 200) lacking.push('Resume length is too short (< 200 words)')

  const unmentioned = keywords.filter((k) => !lower.includes(k)).slice(0, 4)
  if (unmentioned.length) missing.push(`Target keywords missing: ${unmentioned.join(', ')}`)

  shouldInclude.push('Add 2-3 bullet points with quantifiable results (e.g., "improved performance by 30%")')
  shouldInclude.push(`Include target role keywords: ${unmentioned.join(', ')}`)
  shouldInclude.push('Add GitHub and LinkedIn URLs at the header for ATS verification')

  return {
    score,
    targetRole,
    keywordMatch,
    atsPass: score >= 60 && checks.contact && checks.skills,
    summary:
      `Audit for ${targetRole || 'Software Engineer'}: ` +
      `${matched.length}/${keywords.length} keywords found, ${words} words. ` +
      `${score >= 70 ? 'Solid base — address missing sections below.' : 'Major sections missing — see recommendations below.'}`,
    strengths: strengths.slice(0, 4),
    missing: missing.slice(0, 5),
    lacking: lacking.slice(0, 4),
    shouldInclude: shouldInclude.slice(0, 4),
    improvements: lacking.concat(missing).slice(0, 6),
    source: 'local',
  }
}
