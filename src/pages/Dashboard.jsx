import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Sparkles,
  Brain,
  FileText,
  Search,
  ArrowRight,
  LineChart as LineIcon,
  HeartPulse,
  Briefcase,
  Target,
  AlertTriangle,
  Code2,
  HelpCircle,
  MessageSquare,
  Video,
  CheckCircle2,
  Award,
  FilePlus,
  Upload,
  GraduationCap,
  User,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import MarketTrends from '../components/MarketTrends'
import CareerHealth from '../components/CareerHealth'
import Modal from '../components/Modal'
import { Skeleton, ErrorState } from '../components/Feedback'
import { getSummary, getTrends } from '../api/dashboard'
import { getSolvedProblems, SAMPLE_DSA_PROBLEMS } from '../api/dsa'
import { useAuth } from '../context/AuthContext'

const quickActions = [
  { to: '/dsa', icon: Code2, title: 'DSA Practice', caption: 'Arrays & Trees', color: 'blue' },
  { to: '/aptitude', icon: HelpCircle, title: 'Aptitude Tests', caption: 'Quant & Logic', color: 'orange' },
  { to: '/communication', icon: MessageSquare, title: 'Communication', caption: 'HR & Intro Prep', color: 'teal' },
  { to: '/interview', icon: Video, title: 'Mock Interview', caption: 'Voice & Video AI', color: 'pink' },
  { to: '/resume', icon: FileText, title: 'Resume ATS Scanner', caption: 'Audit & Keyword Score', color: 'purple' },
]

const TARGET_ROLE_OPTIONS = [
  'Full Stack Engineer',
  'Frontend Engineer',
  'Backend Engineer',
  'AI / Machine Learning Engineer',
  'Data Scientist',
  'Cloud & DevOps Engineer',
  'Mobile App Developer',
]

const POPULAR_SKILLS = [
  'React',
  'JavaScript',
  'TypeScript',
  'Python',
  'Java',
  'Node.js',
  'SQL',
  'System Design',
  'Docker',
]

export default function Dashboard() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Setup Modal State for First-Time Users
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [setupForm, setSetupForm] = useState({
    fullName: profile?.full_name || user?.user_metadata?.full_name || '',
    usn: profile?.usn || user?.user_metadata?.usn || '',
    degree: 'B.E. Computer Science',
    targetRole: 'Full Stack Engineer',
    gradYear: '2026',
    selectedSkills: ['React', 'JavaScript'],
  })

  // Stored preferences & progress
  const [onboardingData, setOnboardingData] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_onboarding')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [resumeAudit, setResumeAudit] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_latest_resume_audit')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  useEffect(() => {
    let active = true
    Promise.all([getSummary(), getTrends()])
      .then(([s, t]) => {
        if (!active) return
        setSummary(s.data)
        setTrends(t.data?.trends || t.data || [])
      })
      .catch((e) => active && setError(e.userMessage || 'Failed to load dashboard'))
      .finally(() => active && setLoading(false))

    // Check if first-time setup is needed
    const done = localStorage.getItem('careeriq_onboarding')
    if (!done) {
      setShowSetupModal(true)
    }

    return () => {
      active = false
    }
  }, [])

  // Sync state if localStorage changes
  const reloadLocalData = () => {
    try {
      const rawOnb = localStorage.getItem('careeriq_onboarding')
      if (rawOnb) setOnboardingData(JSON.parse(rawOnb))
      const rawRes = localStorage.getItem('careeriq_latest_resume_audit')
      if (rawRes) setResumeAudit(JSON.parse(rawRes))
    } catch {
      /* noop */
    }
  }

  const handleSaveSetup = (e) => {
    e.preventDefault()
    const payload = {
      ...setupForm,
      completedAt: new Date().toISOString(),
    }
    try {
      localStorage.setItem('careeriq_onboarding', JSON.stringify(payload))
    } catch {
      /* noop */
    }
    setOnboardingData(payload)
    setShowSetupModal(false)
  }

  const toggleSkill = (skill) => {
    setSetupForm((prev) => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter((s) => s !== skill)
        : [...prev.selectedSkills, skill],
    }))
  }

  // DSA Solved Progress
  const solvedProblemIds = getSolvedProblems()
  const solvedCount = solvedProblemIds.length
  const solvedProblems = SAMPLE_DSA_PROBLEMS.filter((p) => solvedProblemIds.includes(p.id))
  const easySolved = solvedProblems.filter((p) => p.difficulty === 'Easy').length
  const medSolved = solvedProblems.filter((p) => p.difficulty === 'Medium').length
  const hardSolved = solvedProblems.filter((p) => p.difficulty === 'Hard').length

  // Aptitude Score Progress
  let storedAptitude = null
  try {
    const raw = localStorage.getItem('careeriq_aptitude_score')
    if (raw !== null) storedAptitude = JSON.parse(raw)
  } catch {
    /* noop */
  }

  const userName = onboardingData?.fullName || profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const targetRole = onboardingData?.targetRole || profile?.target_role || summary?.targetRole || 'Full Stack Engineer'
  const skillGapsCount = summary?.skillGaps ?? 0

  // Dynamic Career Health Calculation Breakdown:
  // 1. Profile / Target Role Setup: 25 points
  // 2. Resume ATS Analysis Score: up to 30 points (0 if no resume uploaded)
  // 3. DSA Solved Progress: up to 25 points (based on 10 solved target)
  // 4. Aptitude Score: up to 20 points
  const hasProfileSetup = !!onboardingData || (profile?.target_role && profile.target_role !== 'Not Set')
  const profilePoints = hasProfileSetup ? 25 : 0
  const resumePoints = resumeAudit ? Math.round(((resumeAudit.score || 0) / 100) * 30) : 0
  const dsaPoints = Math.min(25, Math.round((solvedCount / 10) * 25))
  const aptitudePoints = storedAptitude !== null ? Math.round((storedAptitude / 100) * 20) : 0

  const careerHealthScore = Math.min(100, profilePoints + resumePoints + dsaPoints + aptitudePoints)

  const stats = [
    {
      icon: Briefcase,
      label: 'Target Role',
      value: targetRole,
      caption: 'Goal active',
      accent: 'purple',
    },
    {
      icon: FileText,
      label: 'Resume ATS Score',
      value: resumeAudit ? `${resumeAudit.score}% Match` : 'Not Uploaded',
      caption: resumeAudit ? `ATS ${resumeAudit.atsPass ? 'Pass ✓' : 'Audit Complete'}` : 'Upload to boost health +30%',
      accent: 'pink',
    },
    {
      icon: Code2,
      label: 'DSA Solved',
      value: `${solvedCount} Solved`,
      caption: `${easySolved} Easy · ${medSolved} Medium · ${hardSolved} Hard`,
      accent: 'blue',
    },
    {
      icon: Target,
      label: 'Aptitude Score',
      value: storedAptitude !== null ? `${storedAptitude}%` : 'Not Taken',
      caption: storedAptitude !== null ? 'Quant & Logic score' : 'Take a 5-min test',
      accent: 'orange',
    },
    {
      icon: AlertTriangle,
      label: 'Skill Gaps Tracked',
      value: `${skillGapsCount} Tracked`,
      caption: skillGapsCount > 0 ? 'High demand gaps' : 'No gaps tracked yet',
      accent: 'teal',
    },
  ]

  return (
    <AppShell>
      {/* Personalized Welcome Banner */}
      <div className="card p-6 mb-6 border-accent/30 bg-gradient-to-br from-accent/15 via-base-850 to-transparent flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/20 text-accent-light text-xs font-semibold mb-2">
            <Sparkles size={13} /> AI Career Copilot Active
          </div>
          <h1 className="text-2xl font-extrabold text-heading">
            Good morning, {userName} 👋
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl leading-relaxed">
            Here is your career readiness overview. Your current Career Health is{' '}
            <strong className="text-teal font-semibold">{careerHealthScore}% Recruiter Ready</strong> for{' '}
            <strong className="text-heading font-semibold">{targetRole}</strong>.
          </p>

          {!resumeAudit && (
            <div className="mt-3 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-pink-500/10 border border-pink-500/20 text-[11px] text-pink-300">
              <Upload size={13} /> Upload your resume to unlock up to +30% health score boost!
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!resumeAudit && (
            <button
              onClick={() => navigate('/resume')}
              className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
            >
              <Upload size={14} /> Upload Resume
            </button>
          )}
          <button
            onClick={() => setShowSetupModal(true)}
            className="btn-ghost border border-white/10 text-xs px-4 py-2"
          >
            Update Profile Preferences
          </button>
        </div>
      </div>

      {/* Quick Action Hub */}
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
          Daily Career Practice Hub
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {quickActions.map(({ to, icon: Icon, title, caption }) => (
            <button
              key={to}
              onClick={() => navigate(to)}
              className="card card-hover p-4 text-left relative group border-white/5 hover:border-accent/40 transition"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-purple shadow-glow-purple mb-3">
                <Icon size={18} className="text-white" />
              </div>
              <p className="font-semibold text-heading text-sm">{title}</p>
              <p className="text-[11px] text-gray-500 mt-0.5">{caption}</p>
              <ArrowRight
                size={14}
                className="absolute bottom-3 right-3 text-gray-600 group-hover:text-accent-light transition"
              />
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {loading
          ? Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Daily Recommendations & AI Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-heading text-base flex items-center gap-2">
              <Sparkles size={18} className="text-accent-light" /> Today's AI Recommendations
            </h3>
            <span className="badge bg-purple-500/15 text-purple-400 text-xs">
              3 Tasks Suggested
            </span>
          </div>

          <div className="space-y-3">
            {[
              !resumeAudit
                ? {
                    title: 'Upload Resume for ATS Audit',
                    subtitle: 'Extract skills, check formatting, and match target keywords.',
                    route: '/resume',
                    btn: 'Scan Resume',
                  }
                : {
                    title: 'Practice Two Pointers DSA Problems',
                    subtitle: 'Solve "Container With Most Water" to boost algorithm proficiency.',
                    route: '/dsa',
                    btn: 'Solve DSA',
                  },
              {
                title: 'Review System Design Skill Gap',
                subtitle: 'Learn database sharding and caching for target role.',
                route: '/skills',
                btn: 'View Skills',
              },
              {
                title: 'Run 5-minute Mock Interview',
                subtitle: 'Practice technical voice responses with STAR coaching.',
                route: '/interview/ai',
                btn: 'Start Interview',
              },
            ].map((rec, i) => (
              <div
                key={i}
                className="p-4 rounded-xl border border-white/5 bg-base-900/60 flex items-center justify-between gap-4"
              >
                <div>
                  <p className="font-semibold text-heading text-xs">{rec.title}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{rec.subtitle}</p>
                </div>
                <button
                  onClick={() => navigate(rec.route)}
                  className="btn-primary text-xs !py-1.5 !px-3.5 shrink-0"
                >
                  {rec.btn}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Readiness Gauge */}
        <div className="card p-6 flex flex-col justify-between border-teal/30">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                Career Health
              </span>
              <Award size={18} className="text-teal" />
            </div>
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-full border-4 border-teal text-3xl font-extrabold text-heading shadow-glow-teal">
                {careerHealthScore}%
              </div>
              <p className="text-xs font-semibold text-teal mt-3">
                {careerHealthScore >= 70 ? 'High Placement Readiness' : careerHealthScore >= 40 ? 'Moderate Readiness' : 'Getting Started'}
              </p>
              <div className="mt-3 space-y-1 text-[11px] text-left text-gray-400 bg-base-900/60 p-3 rounded-xl border border-white/5">
                <div className="flex justify-between">
                  <span>Target Role Setup:</span>
                  <span className="text-heading font-medium">{profilePoints}/25 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Resume ATS Audit:</span>
                  <span className={resumeAudit ? 'text-teal font-medium' : 'text-danger font-medium'}>
                    {resumePoints}/30 pts
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>DSA Solved Progress:</span>
                  <span className="text-heading font-medium">{dsaPoints}/25 pts</span>
                </div>
                <div className="flex justify-between">
                  <span>Aptitude Assessment:</span>
                  <span className="text-heading font-medium">{aptitudePoints}/20 pts</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/analytics')}
            className="btn-teal w-full text-xs font-semibold !py-2.5 mt-2"
          >
            View Full Analytics
          </button>
        </div>
      </div>

      {/* Market Trends Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue/20">
              <LineIcon size={18} className="text-blue" />
            </div>
            <h3 className="font-semibold text-heading">Tech Market Trends</h3>
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <MarketTrends data={trends} />
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal/20">
              <HeartPulse size={18} className="text-teal" />
            </div>
            <h3 className="font-semibold text-heading">Career Health Score</h3>
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <CareerHealth score={careerHealthScore} />
          )}
        </div>
      </div>

      {/* First Time User Onboarding / Setup Modal */}
      <Modal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="✨ Welcome! Set Up Your Career Profile"
      >
        <form onSubmit={handleSaveSetup} className="space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Please enter your target role and academic details so CareerAI can personalize your AI roadmap and calculate your Career Health.
          </p>

          <div>
            <label className="label">Full Name</label>
            <input
              className="input text-xs"
              placeholder="e.g. Alex Kumar"
              value={setupForm.fullName}
              onChange={(e) => setSetupForm({ ...setupForm, fullName: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">USN / Student ID</label>
              <input
                className="input text-xs"
                placeholder="e.g. 1MS22CS001"
                value={setupForm.usn}
                onChange={(e) => setSetupForm({ ...setupForm, usn: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Graduation Year</label>
              <select
                className="input text-xs"
                value={setupForm.gradYear}
                onChange={(e) => setSetupForm({ ...setupForm, gradYear: e.target.value })}
              >
                {['2024', '2025', '2026', '2027', '2028'].map((y) => (
                  <option key={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="label">Degree / Specialization</label>
            <input
              className="input text-xs"
              placeholder="e.g. B.E. Computer Science"
              value={setupForm.degree}
              onChange={(e) => setSetupForm({ ...setupForm, degree: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Target Job Role</label>
            <select
              className="input text-xs font-semibold"
              value={setupForm.targetRole}
              onChange={(e) => setSetupForm({ ...setupForm, targetRole: e.target.value })}
            >
              {TARGET_ROLE_OPTIONS.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Your Top Skills</label>
            <div className="flex flex-wrap gap-1.5 pt-1">
              {POPULAR_SKILLS.map((sk) => {
                const active = setupForm.selectedSkills.includes(sk)
                return (
                  <button
                    key={sk}
                    type="button"
                    onClick={() => toggleSkill(sk)}
                    className={
                      'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition border flex items-center gap-1 ' +
                      (active
                        ? 'bg-gradient-purple text-white border-transparent shadow-glow-purple'
                        : 'bg-base-900 text-gray-400 border-white/10 hover:border-white/20')
                    }
                  >
                    {active && <CheckCircle2 size={12} />}
                    {sk}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowSetupModal(false)}
              className="btn-ghost text-xs px-3 py-2"
            >
              Skip for Now
            </button>
            <button
              type="submit"
              className="btn-teal text-xs font-semibold px-5 py-2 flex items-center gap-1.5"
            >
              <Sparkles size={14} /> Save & Calculate Career Health
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}

