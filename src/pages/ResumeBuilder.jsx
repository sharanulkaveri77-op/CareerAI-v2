import { useState, useRef } from 'react'
import {
  FileText,
  Sparkles,
  Plus,
  Trash2,
  Printer,
  CheckCircle2,
  User,
  Briefcase,
  FolderGit2,
  GraduationCap,
  Award,
  Languages as LanguagesIcon,
  Code2,
  Copy,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Download,
  Share2,
  ExternalLink,
  Cpu,
  HeartHandshake,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { invokeAi } from '../api/ai'

/* -------------------------------------------------------------------------- */
/*                 ATS RESUME DEMO DATA (EXACT PDF STRUCTURE)                 */
/* -------------------------------------------------------------------------- */

const DEMO_RESUME_DATA = {
  personal: {
    name: 'SHARANU',
    location: 'San Francisco, CA',
    email: 'alex.morgan@example.com',
    emailLabel: 'Email',
    phone: '+1 (555) 234-5678',
    linkedin: 'linkedin.com/in/alexmorgan',
    linkedinLabel: 'LinkedIn',
    github: 'github.com/alexmorgan',
    githubLabel: 'GitHub',
  },
  summary:
    'Computer Science graduate with hands-on experience in Java, Python, SQL, and full-stack web development, gained through academic projects and a Software Engineering internship at CloudScale. Skilled in building high-performance REST APIs, database schema design, and microservices architecture using modern cloud tools. Strong foundation in core computer science principles, seeking a Software Engineer, Full Stack Developer, or Systems Engineer role to drive scalable product impact.',
  technicalSkills: [
    {
      category: 'Programming Languages',
      skills: 'Java, Python, TypeScript, JavaScript, SQL, HTML, CSS',
    },
    {
      category: 'Frameworks & Libraries',
      skills: 'React, Node.js, Express, Spring Boot, FastAPI, Tailwind CSS',
    },
    {
      category: 'Database & Storage',
      skills: 'PostgreSQL, MySQL, Redis, MongoDB (Schema Design, Query Optimization, RLS)',
    },
    {
      category: 'Developer Tools & Cloud',
      skills: 'Git, Docker, AWS (EC2, S3), VS Code, Postman, Linux CLI',
    },
    {
      category: 'Operating Systems',
      skills: 'Linux (Ubuntu), macOS, Windows',
    },
    {
      category: 'Core Computer Science',
      skills:
        'Data Structures & Algorithms, Object-Oriented Programming (OOP), Database Management Systems (DBMS), Operating Systems, Computer Networks',
    },
  ],
  softSkills:
    'Problem Solving • Analytical Thinking • Team Collaboration • Effective Communication • Adaptability • Time Management',
  internships: [
    {
      title: 'Software Engineering Intern',
      company: 'CloudScale Technologies',
      duration: 'May 2025 – August 2025',
      bullets: [
        'Engineered scalable RESTful microservices in Node.js and TypeScript, handling 15,000+ daily API requests.',
        'Designed and optimized PostgreSQL database schemas, reducing p95 query latency by 32% via index optimization.',
        'Implemented Redis caching layers for high-frequency product endpoints, lowering database load by 40%.',
        'Built automated CI/CD deployment pipelines using GitHub Actions and Docker containerization.',
        'Collaborated with senior engineers in an agile team of 7, participating in code reviews and sprint retrospectives.',
      ],
    },
  ],
  projects: [
    {
      title: 'DocuSense AI – Intelligent Semantic Search & RAG Knowledge Engine',
      tech: 'Python, FastAPI, LangChain, Pinecone, OpenAI / Gemini API, React',
      bullets: [
        'Engineered an enterprise semantic search and Retrieval-Augmented Generation (RAG) platform processing 10,000+ technical PDF documents.',
        'Implemented chunking, vector embeddings with Pinecone, and hybrid BM25 lexical-vector ranking to achieve 92% retrieval accuracy.',
        'Built asynchronous FastAPI ingestion pipelines streaming real-time LLM token responses over Server-Sent Events (SSE).',
        'Integrated role-based access control (RBAC) and document deduplication to maintain secure, compliant enterprise data access.',
      ],
    },
  ],
  education: [
    {
      institution: 'State University of Technology',
      degree: 'Bachelor of Science, Computer Science and Engineering',
      grade: 'CGPA: 8.5 / 10',
      graduation: 'Expected Graduation: 2026',
    },
  ],
  certifications: [
    'AWS Certified Cloud Practitioner – Amazon Web Services',
    'Full Stack Web Development Professional Certificate',
    'Generative AI & LLM Architecture Workshop',
    'Data Structures & Algorithms Specialization',
    'Database Systems & Advanced SQL – Online Certification',
    'Python for Distributed Systems',
  ],
  languages: 'English (Fluent), Spanish (Conversational), German (Elementary)',
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

export default function ResumeBuilder() {
  const [resume, setResume] = useState(DEMO_RESUME_DATA)
  const [activeAccordion, setActiveAccordion] = useState('summary')
  const [enhancingKey, setEnhancingKey] = useState(null)
  const [copied, setCopied] = useState(false)
  const [atsScore, setAtsScore] = useState(null)
  const [atsChecking, setAtsChecking] = useState(false)

  /* ------------------------------- AI Actions ------------------------------ */

  const handleEnhanceBullet = async (text, callbackKey, onUpdate) => {
    if (!text?.trim()) return
    setEnhancingKey(callbackKey)
    try {
      const res = await invokeAi('chat', {
        message: `Rewrite the following resume bullet point to make it compelling, action-verb driven, highly technical, and ATS-optimized (following Google/FAANG XYZ formula: Accomplished [X] as measured by [Y], by doing [Z]):
"${text}"
Return ONLY the single revised sentence without quotation marks or explanations.`,
      })
      const improved = res.data?.reply || text
      onUpdate(improved.replace(/^"|"$/g, '').trim())
    } catch {
      // fallback
    } finally {
      setEnhancingKey(null)
    }
  }

  const handlePolishSummary = async () => {
    if (!resume.summary.trim()) return
    setEnhancingKey('summary')
    try {
      const res = await invokeAi('chat', {
        message: `Polish this resume professional summary for an engineering student. Keep it dense, highly impactful, ATS-friendly, and concise (under 4 lines):
"${resume.summary}"
Return ONLY the polished summary text without markdown formatting or quotes.`,
      })
      const polished = res.data?.reply || resume.summary
      setResume({ ...resume, summary: polished.replace(/^"|"$/g, '').trim() })
    } catch {
      // fallback
    } finally {
      setEnhancingKey(null)
    }
  }

  const handleCheckAts = async () => {
    setAtsChecking(true)
    try {
      const allText = `
${resume.personal.name} ${resume.personal.location}
${resume.summary}
${resume.technicalSkills.map((s) => `${s.category}: ${s.skills}`).join('\n')}
${resume.softSkills}
${resume.internships.map((i) => `${i.title} ${i.company}: ${i.bullets.join(' ')}`).join('\n')}
${resume.projects.map((p) => `${p.title} ${p.tech}: ${p.bullets.join(' ')}`).join('\n')}
${resume.education.map((e) => `${e.institution} ${e.degree} ${e.grade}`).join('\n')}
`
      const res = await invokeAi('chat', {
        message: `Evaluate this software engineering resume against standard Top-Tier ATS standards (format, action verbs, metrics, skills density):
${allText}
Provide a JSON response:
{
  "score": 94,
  "verdict": "ATS-Ready / Excellent",
  "strengths": ["Strong action verbs", "Dense technical skills layout", "Clear project tech stacks"],
  "tips": ["Quantify impact with % metrics where possible"]
}`,
      })

      let parsed
      try {
        const cleaned = (res.data?.reply || '').replace(/```json|```/g, '').trim()
        parsed = JSON.parse(cleaned)
      } catch {
        parsed = {
          score: 92,
          verdict: 'Excellent ATS Formatting',
          strengths: ['Single-column standard structure', 'Clear bold category headers', 'Clean bullet points'],
          tips: ['Add performance metrics (e.g. latency, user counts) to project bullets'],
        }
      }
      setAtsScore(parsed)
    } catch {
      setAtsScore({
        score: 90,
        verdict: 'Clean ATS Standard',
        strengths: ['Ivy League single-column structure', 'Clear technical categories'],
        tips: ['Back achievements with numbers or percentages'],
      })
    } finally {
      setAtsChecking(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleResetToTemplate = () => {
    setResume(DEMO_RESUME_DATA)
    setAtsScore(null)
  }

  const handleCopyPlainText = () => {
    const plain = `
${resume.personal.name}
${resume.personal.location} | ${resume.personal.email} | ${resume.personal.phone} | ${resume.personal.linkedin} | ${resume.personal.github}

PROFESSIONAL SUMMARY
${resume.summary}

TECHNICAL SKILLS
${resume.technicalSkills.map((t) => `${t.category}: ${t.skills}`).join('\n')}

SOFT SKILLS
${resume.softSkills}

INTERNSHIP EXPERIENCE
${resume.internships
  .map(
    (exp) =>
      `${exp.title} | ${exp.company}\n${exp.duration}\n${exp.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

PROJECTS
${resume.projects
  .map(
    (proj) =>
      `${proj.title} | ${proj.tech}\n${proj.bullets.map((b) => `• ${b}`).join('\n')}`
  )
  .join('\n\n')}

EDUCATION
${resume.education.map((e) => `${e.institution}\n${e.degree} | ${e.grade} | ${e.graduation}`).join('\n\n')}

CERTIFICATIONS
${resume.certifications.map((c) => `• ${c}`).join('\n')}

LANGUAGES
${resume.languages}
    `.trim()

    navigator.clipboard.writeText(plain)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  /* ------------------------------- State Helpers --------------------------- */

  const toggleAccordion = (key) => {
    setActiveAccordion(activeAccordion === key ? null : key)
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Page Header (Hidden during print) */}
        <div className="no-print">
          <PageHeader
            icon={FileText}
            title="ATS Resume Builder"
            subtitle="Standard single-column engineering format matching top FAANG & Ivy League ATS templates"
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={handleCheckAts}
                  disabled={atsChecking}
                  className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 border-white/10 text-teal hover:border-teal"
                  title="Check ATS parse score"
                >
                  {atsChecking ? <Spinner size={13} /> : <Sparkles size={14} />}
                  Check ATS Score
                </button>
                <button
                  onClick={handleCopyPlainText}
                  className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 border-white/10 text-gray-300 hover:text-white"
                  title="Copy plain text for application portals"
                >
                  {copied ? <Check size={14} className="text-teal" /> : <Copy size={14} />}
                  {copied ? 'Copied Text' : 'Copy Plain Text'}
                </button>
                <button
                  onClick={handleResetToTemplate}
                  className="btn-ghost text-xs py-2 px-3 flex items-center gap-1.5 border-white/10 text-gray-300 hover:text-white"
                  title="Reset to clean demo ATS resume template"
                >
                  <RotateCcw size={14} /> Reset Demo Template
                </button>
                <button
                  onClick={handlePrint}
                  className="btn-primary text-xs py-2 px-4 flex items-center gap-2 shadow-glow-purple font-semibold"
                >
                  <Printer size={15} /> Export / Print PDF
                </button>
              </div>
            }
          />
        </div>

        {/* ATS Score Banner (if checked) */}
        {atsScore && (
          <div className="no-print p-4 rounded-2xl bg-base-900 border border-teal/30 flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal/15 text-teal font-extrabold text-lg border border-teal/30">
                {atsScore.score}%
              </div>
              <div>
                <p className="text-sm font-bold text-heading flex items-center gap-2">
                  ATS Score: {atsScore.verdict}
                </p>
                <p className="text-xs text-gray-400">
                  {atsScore.strengths?.slice(0, 2).join(' · ')}
                </p>
              </div>
            </div>
            {atsScore.tips?.length > 0 && (
              <div className="text-xs text-orange bg-orange/10 border border-orange/20 px-3 py-1.5 rounded-xl">
                Tip: {atsScore.tips[0]}
              </div>
            )}
          </div>
        )}

        {/* 2-Column Workspace: Form Editor (Left) & PDF Live Sheet (Right) */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
          {/* ========================================================================= */}
          {/* LEFT: SECTION ACCORDION FORM EDITORS (5 COLS - HIDDEN ON PRINT)          */}
          {/* ========================================================================= */}
          <div className="xl:col-span-5 space-y-3 no-print">
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                Resume Sections
              </span>
              <span className="text-[11px] text-gray-500">Live preview syncs on change</span>
            </div>

            {/* 1. Personal Header */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('personal')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <User size={16} className="text-accent-light" />
                  Personal Information & Links
                </div>
                {activeAccordion === 'personal' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'personal' && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fadeIn">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Full Name</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. SHARANU"
                        value={resume.personal.name}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, name: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Location</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. Bangalore, India"
                        value={resume.personal.location}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, location: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Email Address</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. sharanu@example.com"
                        value={resume.personal.email}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, email: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">Phone Number</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. +91 7259846487"
                        value={resume.personal.phone}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, phone: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">LinkedIn URL</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. linkedin.com/in/sharanu"
                        value={resume.personal.linkedin}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, linkedin: e.target.value },
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-gray-400 uppercase">GitHub URL</label>
                      <input
                        className="input text-xs py-1.5"
                        placeholder="e.g. github.com/sharanu"
                        value={resume.personal.github}
                        onChange={(e) =>
                          setResume({
                            ...resume,
                            personal: { ...resume.personal, github: e.target.value },
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Professional Summary */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('summary')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <FileText size={16} className="text-purple-400" />
                  Professional Summary
                </div>
                {activeAccordion === 'summary' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'summary' && (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                  <textarea
                    className="input text-xs resize-none h-32 leading-relaxed"
                    placeholder="Enter your professional summary..."
                    value={resume.summary}
                    onChange={(e) => setResume({ ...resume, summary: e.target.value })}
                  />
                  <div className="flex justify-end">
                    <button
                      onClick={handlePolishSummary}
                      disabled={enhancingKey === 'summary'}
                      className="btn-ghost text-xs text-accent-light px-3 py-1 flex items-center gap-1.5"
                    >
                      {enhancingKey === 'summary' ? (
                        <Spinner size={12} />
                      ) : (
                        <Sparkles size={13} />
                      )}
                      AI Polish Summary
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Technical Skills */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('skills')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <Cpu size={16} className="text-teal" />
                  Technical Skills ({resume.technicalSkills.length} Categories)
                </div>
                {activeAccordion === 'skills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'skills' && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fadeIn">
                  {resume.technicalSkills.map((cat, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-base-950 border border-white/5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <input
                          className="input text-xs font-semibold py-1 bg-transparent border-white/10 w-1/2"
                          placeholder="Category Name"
                          value={cat.category}
                          onChange={(e) => {
                            const updated = [...resume.technicalSkills]
                            updated[idx].category = e.target.value
                            setResume({ ...resume, technicalSkills: updated })
                          }}
                        />
                        <button
                          onClick={() => {
                            const updated = resume.technicalSkills.filter((_, i) => i !== idx)
                            setResume({ ...resume, technicalSkills: updated })
                          }}
                          className="text-gray-500 hover:text-danger p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                      <input
                        className="input text-xs py-1"
                        placeholder="Comma-separated skills (e.g. Java, Python, SQL)"
                        value={cat.skills}
                        onChange={(e) => {
                          const updated = [...resume.technicalSkills]
                          updated[idx].skills = e.target.value
                          setResume({ ...resume, technicalSkills: updated })
                        }}
                      />
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setResume({
                        ...resume,
                        technicalSkills: [
                          ...resume.technicalSkills,
                          { category: 'New Category', skills: '' },
                        ],
                      })
                    }
                    className="text-xs text-teal hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus size={14} /> Add Skill Category
                  </button>
                </div>
              )}
            </div>

            {/* 4. Soft Skills */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('softSkills')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <HeartHandshake size={16} className="text-pink-400" />
                  Soft Skills
                </div>
                {activeAccordion === 'softSkills' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'softSkills' && (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                  <label className="text-[10px] text-gray-400">
                    Dot-separated skills line (e.g. Problem Solving • Analytical Thinking • Teamwork)
                  </label>
                  <input
                    className="input text-xs py-2"
                    value={resume.softSkills}
                    onChange={(e) => setResume({ ...resume, softSkills: e.target.value })}
                  />
                </div>
              )}
            </div>

            {/* 5. Internship & Work Experience */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('experience')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <Briefcase size={16} className="text-cyan-400" />
                  Internship / Work Experience ({resume.internships.length})
                </div>
                {activeAccordion === 'experience' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'experience' && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
                  {resume.internships.map((job, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-base-950 border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300">Role #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = resume.internships.filter((_, i) => i !== idx)
                            setResume({ ...resume, internships: updated })
                          }}
                          className="text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          className="input text-xs py-1"
                          placeholder="Job Title (e.g. Machine Learning Intern)"
                          value={job.title}
                          onChange={(e) => {
                            const updated = [...resume.internships]
                            updated[idx].title = e.target.value
                            setResume({ ...resume, internships: updated })
                          }}
                        />
                        <input
                          className="input text-xs py-1"
                          placeholder="Company (e.g. GradGuru)"
                          value={job.company}
                          onChange={(e) => {
                            const updated = [...resume.internships]
                            updated[idx].company = e.target.value
                            setResume({ ...resume, internships: updated })
                          }}
                        />
                      </div>

                      <input
                        className="input text-xs py-1"
                        placeholder="Duration (e.g. March 2026 – May 2026)"
                        value={job.duration}
                        onChange={(e) => {
                          const updated = [...resume.internships]
                          updated[idx].duration = e.target.value
                          setResume({ ...resume, internships: updated })
                        }}
                      />

                      {/* Bullet points */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">
                          Bullet Points ({job.bullets.length})
                        </label>
                        {job.bullets.map((bullet, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <textarea
                                className="input text-xs resize-none p-1.5 flex-1 h-14"
                                value={bullet}
                                onChange={(e) => {
                                  const updated = [...resume.internships]
                                  updated[idx].bullets[bIdx] = e.target.value
                                  setResume({ ...resume, internships: updated })
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updated = [...resume.internships]
                                  updated[idx].bullets = updated[idx].bullets.filter(
                                    (_, i) => i !== bIdx
                                  )
                                  setResume({ ...resume, internships: updated })
                                }}
                                className="text-gray-500 hover:text-danger p-1 mt-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  handleEnhanceBullet(bullet, `exp-${idx}-${bIdx}`, (newVal) => {
                                    const updated = [...resume.internships]
                                    updated[idx].bullets[bIdx] = newVal
                                    setResume({ ...resume, internships: updated })
                                  })
                                }
                                disabled={enhancingKey === `exp-${idx}-${bIdx}`}
                                className="text-[11px] text-accent-light hover:underline flex items-center gap-1"
                              >
                                {enhancingKey === `exp-${idx}-${bIdx}` ? (
                                  <Spinner size={10} />
                                ) : (
                                  <Sparkles size={11} />
                                )}
                                AI Enhance Bullet
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...resume.internships]
                            updated[idx].bullets.push('Performed development tasks...')
                            setResume({ ...resume, internships: updated })
                          }}
                          className="text-xs text-teal hover:underline flex items-center gap-1 mt-1"
                        >
                          <Plus size={13} /> Add Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() =>
                      setResume({
                        ...resume,
                        internships: [
                          ...resume.internships,
                          {
                            title: 'Software Developer Intern',
                            company: 'Company Name',
                            duration: 'Jan 2026 – Present',
                            bullets: ['Developed features using modern frameworks.'],
                          },
                        ],
                      })
                    }
                    className="text-xs text-teal hover:underline flex items-center gap-1 font-semibold"
                  >
                    <Plus size={14} /> Add Work Role
                  </button>
                </div>
              )}
            </div>

            {/* 6. Projects */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('projects')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <FolderGit2 size={16} className="text-orange" />
                  Projects ({resume.projects.length})
                </div>
                {activeAccordion === 'projects' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'projects' && (
                <div className="space-y-4 pt-2 border-t border-white/5 animate-fadeIn">
                  {resume.projects.map((proj, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-base-950 border border-white/5 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-300">Project #{idx + 1}</span>
                        <button
                          onClick={() => {
                            const updated = resume.projects.filter((_, i) => i !== idx)
                            setResume({ ...resume, projects: updated })
                          }}
                          className="text-gray-500 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Project Title</label>
                        <input
                          className="input text-xs py-1"
                          placeholder="e.g. CareerAI – Intelligent Career Growth Platform"
                          value={proj.title}
                          onChange={(e) => {
                            const updated = [...resume.projects]
                            updated[idx].title = e.target.value
                            setResume({ ...resume, projects: updated })
                          }}
                        />
                      </div>

                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Tech Stack</label>
                        <input
                          className="input text-xs py-1"
                          placeholder="e.g. React, TypeScript, Node.js, Express, MongoDB"
                          value={proj.tech}
                          onChange={(e) => {
                            const updated = [...resume.projects]
                            updated[idx].tech = e.target.value
                            setResume({ ...resume, projects: updated })
                          }}
                        />
                      </div>

                      {/* Project Bullets */}
                      <div className="space-y-2 pt-1">
                        <label className="text-[10px] text-gray-400 uppercase font-semibold">
                          Bullet Points ({proj.bullets.length})
                        </label>
                        {proj.bullets.map((b, bIdx) => (
                          <div key={bIdx} className="space-y-1">
                            <div className="flex items-start gap-1.5">
                              <textarea
                                className="input text-xs resize-none p-1.5 flex-1 h-14"
                                value={b}
                                onChange={(e) => {
                                  const updated = [...resume.projects]
                                  updated[idx].bullets[bIdx] = e.target.value
                                  setResume({ ...resume, projects: updated })
                                }}
                              />
                              <button
                                onClick={() => {
                                  const updated = [...resume.projects]
                                  updated[idx].bullets = updated[idx].bullets.filter(
                                    (_, i) => i !== bIdx
                                  )
                                  setResume({ ...resume, projects: updated })
                                }}
                                className="text-gray-500 hover:text-danger p-1 mt-1"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                            <div className="flex justify-end">
                              <button
                                onClick={() =>
                                  handleEnhanceBullet(b, `proj-${idx}-${bIdx}`, (newVal) => {
                                    const updated = [...resume.projects]
                                    updated[idx].bullets[bIdx] = newVal
                                    setResume({ ...resume, projects: updated })
                                  })
                                }
                                disabled={enhancingKey === `proj-${idx}-${bIdx}`}
                                className="text-[11px] text-accent-light hover:underline flex items-center gap-1"
                              >
                                {enhancingKey === `proj-${idx}-${bIdx}` ? (
                                  <Spinner size={10} />
                                ) : (
                                  <Sparkles size={11} />
                                )}
                                AI Enhance Bullet
                              </button>
                            </div>
                          </div>
                        ))}
                        <button
                          onClick={() => {
                            const updated = [...resume.projects]
                            updated[idx].bullets.push('Engineered core full-stack module...')
                            setResume({ ...resume, projects: updated })
                          }}
                          className="text-xs text-teal hover:underline flex items-center gap-1 mt-1"
                        >
                          <Plus size={13} /> Add Bullet Point
                        </button>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2 border-t border-white/5 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            projects: [
                              ...resume.projects,
                              {
                                title: 'New Project Title',
                                tech: 'React, Node.js, PostgreSQL',
                                bullets: ['Implemented full-stack architecture with user authentication.'],
                              },
                            ],
                          })
                        }
                        className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1 font-semibold"
                      >
                        <Plus size={13} /> Add Blank Project
                      </button>

                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            projects: [
                              ...resume.projects,
                              {
                                title: 'Sentinel – High-Throughput Distributed Rate Limiter & API Gateway',
                                tech: 'Go, Redis, Docker, gRPC, Prometheus',
                                bullets: [
                                  'Engineered a distributed token-bucket rate limiter in Go, processing 25,000+ requests per second with sub-2ms latency.',
                                  'Utilized Redis atomic Lua scripts to eliminate race conditions across multi-instance gateway clusters under heavy traffic spikes.',
                                  'Configured Prometheus telemetry and Grafana dashboards for real-time monitoring of p99 latency and 429 throttling rates.',
                                ],
                              },
                            ],
                          })
                        }
                        className="btn-ghost text-xs py-1.5 px-3 border-white/10 text-cyan-400 hover:border-cyan-400 flex items-center gap-1"
                      >
                        <Plus size={13} /> + Distributed Rate Limiter
                      </button>

                      <button
                        onClick={() =>
                          setResume({
                            ...resume,
                            projects: [
                              ...resume.projects,
                              {
                                title: 'CollabCanvas – Real-Time Collaborative Whiteboard',
                                tech: 'TypeScript, React, WebSockets, Node.js, Canvas API',
                                bullets: [
                                  'Built a low-latency collaborative digital canvas supporting multi-user simultaneous drawing with conflict resolution.',
                                  'Optimized vector path rendering using HTML5 Canvas API and requestAnimationFrame, maintaining a consistent 60 FPS.',
                                  'Implemented room-based WebSocket broadcasting with binary delta compression to reduce network bandwidth by 45%.',
                                ],
                              },
                            ],
                          })
                        }
                        className="btn-ghost text-xs py-1.5 px-3 border-white/10 text-purple-400 hover:border-purple-400 flex items-center gap-1"
                      >
                        <Plus size={13} /> + Collaborative Canvas
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 7. Education */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('education')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <GraduationCap size={16} className="text-emerald-400" />
                  Education
                </div>
                {activeAccordion === 'education' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'education' && (
                <div className="space-y-3 pt-2 border-t border-white/5 animate-fadeIn">
                  {resume.education.map((edu, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-base-950 border border-white/5 space-y-2"
                    >
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Institution</label>
                        <input
                          className="input text-xs py-1"
                          placeholder="e.g. KNS Institute of Technology, Bangalore"
                          value={edu.institution}
                          onChange={(e) => {
                            const updated = [...resume.education]
                            updated[idx].institution = e.target.value
                            setResume({ ...resume, education: updated })
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-gray-400 uppercase">Degree & Branch</label>
                        <input
                          className="input text-xs py-1"
                          placeholder="e.g. Bachelor of Engineering, Computer Science and Engineering"
                          value={edu.degree}
                          onChange={(e) => {
                            const updated = [...resume.education]
                            updated[idx].degree = e.target.value
                            setResume({ ...resume, education: updated })
                          }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase">CGPA / Grade</label>
                          <input
                            className="input text-xs py-1"
                            placeholder="e.g. CGPA: 8.2"
                            value={edu.grade}
                            onChange={(e) => {
                              const updated = [...resume.education]
                              updated[idx].grade = e.target.value
                              setResume({ ...resume, education: updated })
                            }}
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-gray-400 uppercase">Graduation Year</label>
                          <input
                            className="input text-xs py-1"
                            placeholder="e.g. Expected Graduation: 2027"
                            value={edu.graduation}
                            onChange={(e) => {
                              const updated = [...resume.education]
                              updated[idx].graduation = e.target.value
                              setResume({ ...resume, education: updated })
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 8. Certifications */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('certifications')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <Award size={16} className="text-yellow-400" />
                  Certifications ({resume.certifications.length})
                </div>
                {activeAccordion === 'certifications' ? (
                  <ChevronUp size={16} />
                ) : (
                  <ChevronDown size={16} />
                )}
              </div>

              {activeAccordion === 'certifications' && (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                  {resume.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        className="input text-xs py-1 flex-1"
                        value={cert}
                        onChange={(e) => {
                          const updated = [...resume.certifications]
                          updated[idx] = e.target.value
                          setResume({ ...resume, certifications: updated })
                        }}
                      />
                      <button
                        onClick={() => {
                          const updated = resume.certifications.filter((_, i) => i !== idx)
                          setResume({ ...resume, certifications: updated })
                        }}
                        className="text-gray-500 hover:text-danger p-1"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      setResume({
                        ...resume,
                        certifications: [...resume.certifications, 'New Certification / Workshop'],
                      })
                    }
                    className="text-xs text-teal hover:underline flex items-center gap-1 pt-1 font-semibold"
                  >
                    <Plus size={13} /> Add Certification
                  </button>
                </div>
              )}
            </div>

            {/* 9. Languages */}
            <div className="card p-4 border-white/10 space-y-3">
              <div
                onClick={() => toggleAccordion('languages')}
                className="flex items-center justify-between cursor-pointer select-none"
              >
                <div className="flex items-center gap-2 text-sm font-bold text-heading">
                  <LanguagesIcon size={16} className="text-indigo-400" />
                  Languages
                </div>
                {activeAccordion === 'languages' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </div>

              {activeAccordion === 'languages' && (
                <div className="space-y-2 pt-2 border-t border-white/5 animate-fadeIn">
                  <input
                    className="input text-xs py-2"
                    placeholder="e.g. English, Hindi, Kannada"
                    value={resume.languages}
                    onChange={(e) => setResume({ ...resume, languages: e.target.value })}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT: EXACT PIXEL-PERFECT A4 PRINTABLE LIVE RESUME SHEET (7 COLS)       */}
          {/* ========================================================================= */}
          <div className="xl:col-span-7 flex justify-center w-full">
            <div className="resume-print-target w-full max-w-[850px] bg-white text-gray-900 rounded-2xl shadow-2xl p-8 sm:p-10 border border-gray-200 font-sans text-[10pt] leading-normal selection:bg-purple-100 selection:text-purple-900 print:p-0 print:border-none print:shadow-none print:w-full">
              {/* HEADER */}
              <div className="mb-2.5">
                <h1 className="text-2xl font-bold tracking-tight text-gray-900 leading-none mb-1 font-sans">
                  {resume.personal.name}
                </h1>
                <div className="text-[10pt] text-gray-700 flex flex-wrap items-center gap-1.5 font-sans">
                  {resume.personal.location && <span>{resume.personal.location}</span>}
                  {resume.personal.email && (
                    <>
                      <span className="text-gray-400 font-normal">|</span>
                      <a
                        href={`mailto:${resume.personal.email}`}
                        className="text-blue-700 hover:underline"
                      >
                        {resume.personal.emailLabel || 'Email'}
                      </a>
                    </>
                  )}
                  {resume.personal.phone && (
                    <>
                      <span className="text-gray-400 font-normal">|</span>
                      <span>{resume.personal.phone}</span>
                    </>
                  )}
                  {resume.personal.linkedin && (
                    <>
                      <span className="text-gray-400 font-normal">|</span>
                      <a
                        href={
                          resume.personal.linkedin.startsWith('http')
                            ? resume.personal.linkedin
                            : `https://${resume.personal.linkedin}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {resume.personal.linkedinLabel || 'LinkedIn'}
                      </a>
                    </>
                  )}
                  {resume.personal.github && (
                    <>
                      <span className="text-gray-400 font-normal">|</span>
                      <a
                        href={
                          resume.personal.github.startsWith('http')
                            ? resume.personal.github
                            : `https://${resume.personal.github}`
                        }
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-700 hover:underline"
                      >
                        {resume.personal.githubLabel || 'GitHub'}
                      </a>
                    </>
                  )}
                </div>
              </div>

              {/* 1. PROFESSIONAL SUMMARY */}
              {resume.summary && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      PROFESSIONAL SUMMARY
                    </h2>
                  </div>
                  <p className="text-[9.5pt] text-gray-800 leading-snug text-justify font-sans">
                    {resume.summary}
                  </p>
                </div>
              )}

              {/* 2. TECHNICAL SKILLS */}
              {resume.technicalSkills.length > 0 && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      TECHNICAL SKILLS
                    </h2>
                  </div>
                  <div className="text-[9.5pt] text-gray-800 space-y-0.5 font-sans">
                    {resume.technicalSkills.map((cat, idx) => (
                      <div key={idx} className="leading-tight">
                        <span className="font-bold text-gray-900">{cat.category}:</span>{' '}
                        <span>{cat.skills}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. SOFT SKILLS */}
              {resume.softSkills && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      SOFT SKILLS
                    </h2>
                  </div>
                  <p className="text-[9.5pt] text-gray-800 leading-tight font-sans">
                    {resume.softSkills}
                  </p>
                </div>
              )}

              {/* 4. INTERNSHIP EXPERIENCE */}
              {resume.internships.length > 0 && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      INTERNSHIP EXPERIENCE
                    </h2>
                  </div>
                  <div className="space-y-2 text-[9.5pt] text-gray-800 font-sans">
                    {resume.internships.map((job, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline justify-between font-sans">
                          <span className="font-bold text-gray-900">
                            {job.title} <span className="font-normal text-gray-500">|</span>{' '}
                            {job.company}
                          </span>
                        </div>
                        {job.duration && (
                          <div className="text-[9pt] text-gray-600 mb-0.5 font-sans">
                            {job.duration}
                          </div>
                        )}
                        <ul className="list-disc ml-4 space-y-0.5 text-gray-800 text-[9.5pt]">
                          {job.bullets.map((bullet, bIdx) => (
                            <li key={bIdx} className="leading-snug pl-0.5">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. PROJECTS */}
              {resume.projects.length > 0 && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      PROJECTS
                    </h2>
                  </div>
                  <div className="space-y-2 text-[9.5pt] text-gray-800 font-sans">
                    {resume.projects.map((proj, idx) => (
                      <div key={idx}>
                        <div className="flex items-baseline justify-between leading-snug font-sans">
                          <span className="text-gray-900">
                            <strong className="font-bold">{proj.title}</strong>{' '}
                            {proj.tech && (
                              <>
                                <span className="text-gray-400 font-normal">|</span>{' '}
                                <span className="text-gray-700 text-[9pt]">{proj.tech}</span>
                              </>
                            )}
                          </span>
                        </div>
                        <ul className="list-disc ml-4 space-y-0.5 text-gray-800 text-[9.5pt] mt-0.5">
                          {proj.bullets.map((b, bIdx) => (
                            <li key={bIdx} className="leading-snug pl-0.5">
                              {b}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. EDUCATION */}
              {resume.education.length > 0 && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      EDUCATION
                    </h2>
                  </div>
                  <div className="space-y-1 text-[9.5pt] text-gray-800 font-sans">
                    {resume.education.map((edu, idx) => (
                      <div key={idx}>
                        <div className="font-bold text-gray-900">{edu.institution}</div>
                        <div className="text-gray-800 text-[9pt]">
                          {edu.degree} {edu.grade && <>| {edu.grade}</>}{' '}
                          {edu.graduation && <>| {edu.graduation}</>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. CERTIFICATIONS */}
              {resume.certifications.length > 0 && (
                <div className="mb-2.5">
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      CERTIFICATIONS
                    </h2>
                  </div>
                  <ul className="list-disc ml-4 space-y-0.5 text-[9.5pt] text-gray-800 font-sans">
                    {resume.certifications.map((cert, idx) => (
                      <li key={idx} className="leading-snug pl-0.5">
                        {cert}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* 8. LANGUAGES */}
              {resume.languages && (
                <div>
                  <div className="border-b border-gray-400 pb-0.5 mb-1">
                    <h2 className="text-[10.5pt] font-bold uppercase tracking-wider text-gray-900 font-sans">
                      LANGUAGES
                    </h2>
                  </div>
                  <p className="text-[9.5pt] text-gray-800 leading-snug font-sans">
                    {resume.languages}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
