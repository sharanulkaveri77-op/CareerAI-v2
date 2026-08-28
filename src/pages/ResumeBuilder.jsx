import { useState } from 'react'
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
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { invokeAi } from '../api/ai'

export default function ResumeBuilder() {
  const [personal, setPersonal] = useState({
    name: 'Alex Kumar',
    email: 'alex.kumar@example.com',
    phone: '+91 98765 43210',
    location: 'Bangalore, India',
    linkedin: 'linkedin.com/in/alexkumar',
    github: 'github.com/alexkumar',
    summary:
      'Motivated Computer Science student with hands-on experience building full-stack web applications using React, Node.js, and Cloud APIs. Seeking a Software Engineer role.',
  })

  const [experience, setExperience] = useState([
    {
      company: 'TechCorp Solutions',
      role: 'Software Engineering Intern',
      duration: 'Jun 2025 - Aug 2025',
      details: 'Built REST APIs and optimized database queries in PostgreSQL.',
    },
  ])

  const [projects, setProjects] = useState([
    {
      title: 'CareerAI Intelligence Platform',
      tech: 'React, Vite, Node.js, Tailwind CSS, Gemini API',
      description: 'Built an AI-powered career guidance platform with ATS resume scanner and voice interview practice.',
    },
  ])

  const [enhancingIdx, setEnhancingIdx] = useState(null)

  const handleEnhanceBullet = async (textToEnhance, type, index) => {
    if (!textToEnhance.trim()) return
    setEnhancingIdx(`${type}-${index}`)
    try {
      const res = await invokeAi('chat', {
        message: `Rewrite the following resume bullet point to make it compelling, action-verb driven, ATS-friendly, and quantifiable:
"${textToEnhance}"
Return only the improved single paragraph without quote marks.`,
      })
      const improved = res.data?.reply || textToEnhance
      if (type === 'exp') {
        const next = [...experience]
        next[index].details = improved
        setExperience(next)
      } else if (type === 'proj') {
        const next = [...projects]
        next[index].description = improved
        setProjects(next)
      }
    } catch {
      /* fallback */
    } finally {
      setEnhancingIdx(null)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="AI Resume Builder"
        subtitle="Craft an ATS-optimized professional resume with AI-enhanced bullet points"
        actions={
          <button onClick={handlePrint} className="btn-primary flex items-center gap-2">
            <Printer size={16} /> Export / Print PDF
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Editor Form Side */}
        <div className="space-y-6">
          {/* Personal Info */}
          <div className="card p-5 space-y-3">
            <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
              <User size={16} className="text-accent-light" /> Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                className="input text-xs"
                placeholder="Full Name"
                value={personal.name}
                onChange={(e) => setPersonal({ ...personal, name: e.target.value })}
              />
              <input
                className="input text-xs"
                placeholder="Email"
                value={personal.email}
                onChange={(e) => setPersonal({ ...personal, email: e.target.value })}
              />
              <input
                className="input text-xs"
                placeholder="Phone"
                value={personal.phone}
                onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              />
              <input
                className="input text-xs"
                placeholder="Location"
                value={personal.location}
                onChange={(e) => setPersonal({ ...personal, location: e.target.value })}
              />
            </div>
            <textarea
              className="input text-xs resize-none"
              rows={2}
              placeholder="Professional Summary"
              value={personal.summary}
              onChange={(e) => setPersonal({ ...personal, summary: e.target.value })}
            />
          </div>

          {/* Experience */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
                <Briefcase size={16} className="text-teal" /> Work Experience
              </h3>
              <button
                onClick={() =>
                  setExperience([
                    ...experience,
                    { company: '', role: '', duration: '', details: '' },
                  ])
                }
                className="text-xs text-accent-light flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Role
              </button>
            </div>

            {experience.map((exp, idx) => (
              <div key={idx} className="bg-base-900 border border-white/5 rounded-xl p-3 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    className="input text-xs"
                    placeholder="Company Name"
                    value={exp.company}
                    onChange={(e) => {
                      const next = [...experience]
                      next[idx].company = e.target.value
                      setExperience(next)
                    }}
                  />
                  <input
                    className="input text-xs"
                    placeholder="Role Title"
                    value={exp.role}
                    onChange={(e) => {
                      const next = [...experience]
                      next[idx].role = e.target.value
                      setExperience(next)
                    }}
                  />
                </div>
                <textarea
                  className="input text-xs resize-none"
                  rows={2}
                  placeholder="Key accomplishments..."
                  value={exp.details}
                  onChange={(e) => {
                    const next = [...experience]
                    next[idx].details = e.target.value
                    setExperience(next)
                  }}
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleEnhanceBullet(exp.details, 'exp', idx)}
                    disabled={enhancingIdx === `exp-${idx}`}
                    className="btn-ghost text-xs text-accent-light px-2.5 py-1 flex items-center gap-1"
                  >
                    {enhancingIdx === `exp-${idx}` ? <Spinner size={12} /> : <Sparkles size={12} />} AI Enhance Bullet
                  </button>
                  <button
                    onClick={() => setExperience(experience.filter((_, i) => i !== idx))}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Projects */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
                <FolderGit2 size={16} className="text-orange" /> Key Projects
              </h3>
              <button
                onClick={() =>
                  setProjects([...projects, { title: '', tech: '', description: '' }])
                }
                className="text-xs text-accent-light flex items-center gap-1 hover:underline"
              >
                <Plus size={14} /> Add Project
              </button>
            </div>

            {projects.map((proj, idx) => (
              <div key={idx} className="bg-base-900 border border-white/5 rounded-xl p-3 space-y-2">
                <input
                  className="input text-xs"
                  placeholder="Project Title"
                  value={proj.title}
                  onChange={(e) => {
                    const next = [...projects]
                    next[idx].title = e.target.value
                    setProjects(next)
                  }}
                />
                <textarea
                  className="input text-xs resize-none"
                  rows={2}
                  placeholder="Project description & achievements..."
                  value={proj.description}
                  onChange={(e) => {
                    const next = [...projects]
                    next[idx].description = e.target.value
                    setProjects(next)
                  }}
                />
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleEnhanceBullet(proj.description, 'proj', idx)}
                    disabled={enhancingIdx === `proj-${idx}`}
                    className="btn-ghost text-xs text-accent-light px-2.5 py-1 flex items-center gap-1"
                  >
                    {enhancingIdx === `proj-${idx}` ? <Spinner size={12} /> : <Sparkles size={12} />} AI Enhance Bullet
                  </button>
                  <button
                    onClick={() => setProjects(projects.filter((_, i) => i !== idx))}
                    className="text-xs text-danger hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Resume Printable Preview Side */}
        <div className="bg-white text-gray-900 rounded-2xl p-8 shadow-2xl space-y-6 font-sans text-xs print:p-0 print:shadow-none print:bg-white print:text-black">
          <div className="border-b pb-4">
            <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">{personal.name || 'Your Name'}</h1>
            <p className="text-gray-600 mt-1">
              {personal.email} · {personal.phone} · {personal.location}
            </p>
          </div>

          {personal.summary && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">{personal.summary}</p>
            </div>
          )}

          {experience.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
                Experience
              </h2>
              <div className="space-y-3">
                {experience.map((exp, i) => (
                  <div key={i}>
                    <div className="flex justify-between font-bold text-gray-900">
                      <span>{exp.role || 'Role'}</span>
                      <span className="font-normal text-gray-600">{exp.duration}</span>
                    </div>
                    <p className="italic text-gray-600 mb-1">{exp.company}</p>
                    <p className="text-gray-700 leading-relaxed">• {exp.details}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {projects.length > 0 && (
            <div>
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-800 border-b pb-1 mb-2">
                Projects
              </h2>
              <div className="space-y-3">
                {projects.map((proj, i) => (
                  <div key={i}>
                    <p className="font-bold text-gray-900">{proj.title}</p>
                    <p className="text-gray-700 leading-relaxed">• {proj.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
