import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Sparkles,
  Brain,
  FileText,
  ArrowRight,
  LineChart as LineIcon,
  Briefcase,
  Target,
  AlertTriangle,
  Code2,
  HelpCircle,
  MessageSquare,
  Video,
  CheckCircle2,
  Upload,
  Calendar,
  BookOpen,
  Clock,
  ChevronRight,
  FolderKanban,
  CheckSquare,
  Square,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import MarketTrends from '../components/MarketTrends'
import Modal from '../components/Modal'
import { Skeleton, ErrorState } from '../components/Feedback'
import { getSummary, getTrends } from '../api/dashboard'
import { getApplications } from '../api/applications'
import { getSolvedProblems, SAMPLE_DSA_PROBLEMS } from '../api/dsa'
import { getSkills, ROLE_SKILL_BENCHMARKS } from '../api/skills'
import { upsertProfile } from '../api/profiles'
import { useAuth } from '../context/AuthContext'

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
  const { user, profile, refreshProfile } = useAuth()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [applications, setApplications] = useState([])
  const [userSkills, setUserSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // First-time setup modal state
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

  const [activeLearning, setActiveLearning] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_active_learning')
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })

  const [upcomingEvents, setUpcomingEvents] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_upcoming_events')
      return raw ? JSON.parse(raw) : []
    } catch {
      return []
    }
  })

  // Task completion state for Today's Plan
  const [completedTasks, setCompletedTasks] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_todays_plan_completed')
      return raw ? JSON.parse(raw) : {}
    } catch {
      return {}
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

    // Check first-time setup
    const done = localStorage.getItem('careeriq_onboarding')
    if (!done) {
      setShowSetupModal(true)
    }

    // Load applications
    getApplications()
      .then((apps) => active && setApplications(apps || []))
      .catch(() => {})

    // Load user skills
    getSkills()
      .then((res) => {
        if (active) setUserSkills(res.data?.skills || [])
      })
      .catch(() => {})

    return () => {
      active = false
    }
  }, [])

  const handleSaveSetup = async (e) => {
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
    try {
      await upsertProfile({
        full_name: setupForm.fullName,
        usn: setupForm.usn,
        target_role: setupForm.targetRole,
      })
      if (refreshProfile) await refreshProfile()
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

  const toggleTaskCompleted = (taskId) => {
    setCompletedTasks((prev) => {
      const next = { ...prev, [taskId]: !prev[taskId] }
      try {
        localStorage.setItem('careeriq_todays_plan_completed', JSON.stringify(next))
      } catch {
        /* noop */
      }
      return next
    })
  }

  // DSA Solved Progress
  const solvedProblemIds = getSolvedProblems()
  const solvedCount = solvedProblemIds.length

  // Aptitude Score Progress
  let storedAptitude = null
  try {
    const raw = localStorage.getItem('careeriq_aptitude_score')
    if (raw !== null) storedAptitude = JSON.parse(raw)
  } catch {
    /* noop */
  }

  // Derived user details
  const userName = onboardingData?.fullName || profile?.full_name || user?.user_metadata?.full_name || 'Student'
  const targetRole = onboardingData?.targetRole || profile?.target_role || summary?.targetRole || 'Full Stack Engineer'

  // Career Health Breakdown (Dynamic calculation)
  const hasProfileSetup = !!onboardingData || (profile?.target_role && profile.target_role !== 'Not Set')
  const profilePoints = hasProfileSetup ? 25 : 0
  const resumePoints = resumeAudit ? Math.round(((resumeAudit.score || 0) / 100) * 30) : 0
  const dsaPoints = Math.min(25, Math.round((solvedCount / 10) * 25))
  const aptitudePoints = storedAptitude !== null ? Math.round((storedAptitude / 100) * 20) : 0
  const careerHealthScore = Math.min(100, profilePoints + resumePoints + dsaPoints + aptitudePoints)

  // Dynamic Readiness Label
  const readinessLabel =
    careerHealthScore >= 75
      ? 'High readiness'
      : careerHealthScore >= 45
      ? 'Moderate readiness'
      : 'Getting started'

  // Dynamic Today's Plan Tasks
  const rawPlanTasks = []

  if (!resumeAudit) {
    rawPlanTasks.push({
      id: 'task-resume',
      title: 'Upload resume for ATS audit',
      category: 'Resume',
      estTime: '10 min',
      priority: 'High priority',
      route: '/resume',
      btnText: 'Upload',
      ctaText: 'Upload & Analyze',
      reason: 'Your resume score represents 30% of your career readiness score.',
    })
  }

  if (solvedCount < 5) {
    rawPlanTasks.push({
      id: 'task-dsa',
      title: 'Solve 2 DSA problems (Arrays & Two Pointers)',
      category: 'DSA',
      estTime: '20 min',
      priority: 'High priority',
      route: '/dsa',
      btnText: 'Start',
      ctaText: 'Start Practice',
      reason: 'DSA is currently one of your top growth areas for your target role.',
    })
  } else {
    rawPlanTasks.push({
      id: 'task-dsa-adv',
      title: 'Solve 1 Medium DSA problem',
      category: 'DSA',
      estTime: '25 min',
      priority: 'Medium priority',
      route: '/dsa',
      btnText: 'Solve',
      ctaText: 'Start Practice',
      reason: 'Consistent problem solving boosts technical interview readiness.',
    })
  }

  if (storedAptitude === null) {
    rawPlanTasks.push({
      id: 'task-aptitude',
      title: 'Take 5-minute Quantitative & Logic test',
      category: 'Aptitude',
      estTime: '10 min',
      priority: 'Medium priority',
      route: '/aptitude',
      btnText: 'Take Test',
      ctaText: 'Take Test',
      reason: 'Aptitude testing is required for initial screening rounds.',
    })
  }

  rawPlanTasks.push({
    id: 'task-comm',
    title: 'Practice 2-minute self-introduction',
    category: 'Communication',
    estTime: '10 min',
    priority: 'Medium priority',
    route: '/communication',
    btnText: 'Practice',
    ctaText: 'Start Practice',
    reason: 'Refine your verbal intro with instant speech feedback.',
  })

  // Pick top 3 tasks for Today's Plan
  const planTasks = rawPlanTasks.slice(0, 3)
  const completedCount = planTasks.filter((t) => completedTasks[t.id]).length
  const nextStepTask = planTasks.find((t) => !completedTasks[t.id]) || planTasks[0]

  // Dynamic Target Role Skills breakdown based on ROLE_SKILL_BENCHMARKS & user skills
  const benchmarkKeyMap = {
    'Full Stack Engineer': 'Full Stack Developer',
    'Frontend Engineer': 'Frontend Developer',
    'Backend Engineer': 'Backend Engineer',
    'AI / Machine Learning Engineer': 'AI / ML Engineer',
    'Data Scientist': 'AI / ML Engineer',
    'Cloud & DevOps Engineer': 'DevOps Engineer',
    'Mobile App Developer': 'Frontend Developer',
  }
  const mappedKey = benchmarkKeyMap[targetRole] || targetRole
  const benchmarkSkills = ROLE_SKILL_BENCHMARKS[mappedKey] || ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer']

  const userSkillMap = new Map()
  userSkills.forEach((s) => {
    if (s.name) userSkillMap.set(s.name.toLowerCase().trim(), s.level || 'beginner')
  })

  const roleSkillBreakdown = benchmarkSkills.slice(0, 6).map((req) => {
    const userLevel = userSkillMap.get(req.name.toLowerCase().trim())
    let status = 'Weak'
    let color = 'text-danger bg-danger/10 border-danger/20'

    if (userLevel === 'advanced' || userLevel === 'expert') {
      status = 'Strong'
      color = 'text-teal bg-teal/10 border-teal/20'
    } else if (userLevel === 'intermediate') {
      status = 'Good'
      color = 'text-blue bg-blue/10 border-blue/20'
    } else if (userLevel === 'beginner') {
      status = 'Needs work'
      color = 'text-orange bg-orange/10 border-orange/20'
    }

    return {
      name: req.name,
      status,
      color,
    }
  })

  // Dynamic Tracked Skill Gaps
  const missingOrWeak = benchmarkSkills.filter((req) => {
    const lvl = userSkillMap.get(req.name.toLowerCase().trim())
    return !lvl || lvl === 'beginner'
  })

  const skillGapsList =
    missingOrWeak.length > 0
      ? missingOrWeak.slice(0, 3).map((sk) => {
          const lvl = userSkillMap.get(sk.name.toLowerCase().trim())
          const isMissing = !lvl
          return {
            title: sk.name,
            priority: isMissing ? 'High priority' : 'Medium priority',
            note: isMissing ? `Required for ${targetRole}` : `Current level: Beginner → Needs: ${sk.level}`,
            route: '/skills',
            action: isMissing ? 'Add Skill' : 'Improve',
          }
        })
      : [
          {
            title: 'System Design',
            priority: 'High priority',
            note: 'Critical for mid/senior technical interviews',
            route: '/skills',
            action: 'Practice',
          },
          {
            title: 'Data Structures & Algorithms',
            priority: 'High priority',
            note: `${solvedCount} problems solved so far`,
            route: '/dsa',
            action: 'Practice',
          },
        ]

  // Recent Activity Feed
  const recentActivities = []
  if (resumeAudit) {
    recentActivities.push({
      title: `Resume scanned (${resumeAudit.score}% match)`,
      time: 'Recently',
      route: '/resume',
    })
  }
  if (solvedCount > 0) {
    recentActivities.push({
      title: `${solvedCount} DSA problems completed`,
      time: 'Active',
      route: '/dsa',
    })
  }
  if (storedAptitude !== null) {
    recentActivities.push({
      title: `Aptitude test completed (${storedAptitude}% score)`,
      time: 'Completed',
      route: '/aptitude',
    })
  }
  if (onboardingData) {
    recentActivities.push({
      title: `Target role updated to ${targetRole}`,
      time: 'Setup complete',
      route: '/settings',
    })
  }

  return (
    <AppShell>
      {/* 1. Header / Greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
            Good morning, {userName} 👋
          </h1>
          <p className="text-sm text-gray-400 mt-1 flex items-center gap-2">
            <span className="font-medium text-gray-200">{targetRole}</span>
            <span className="text-gray-600">·</span>
            <span className="text-teal font-semibold">{careerHealthScore}% career ready</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-gray-400">
              {readinessLabel}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {!resumeAudit && (
            <button
              onClick={() => navigate('/resume')}
              className="btn-primary text-xs px-3.5 py-2 flex items-center gap-1.5"
            >
              <Upload size={14} /> Upload Resume
            </button>
          )}
          <button
            onClick={() => setShowSetupModal(true)}
            className="btn-ghost border border-white/10 text-xs px-3 py-2 text-gray-300 hover:text-white"
          >
            Edit Goal
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Left 2 Columns: Actionable Focus Area */}
        <div className="lg:col-span-2 space-y-6">

          {/* 2. TODAY'S PLAN */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  TODAY'S PLAN
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {planTasks.length} tasks · ~45 min estimated
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-teal/10 border border-teal/20 text-teal">
                {completedCount} / {planTasks.length} completed
              </span>
            </div>

            <div className="space-y-2.5">
              {planTasks.map((task) => {
                const done = !!completedTasks[task.id]
                return (
                  <div
                    key={task.id}
                    className={
                      'p-3.5 rounded-xl border transition flex items-center justify-between gap-4 ' +
                      (done
                        ? 'bg-base-950/40 border-white/5 opacity-60'
                        : 'bg-base-850/80 border-white/10 hover:border-white/20')
                    }
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskCompleted(task.id)}
                        className="mt-0.5 text-gray-400 hover:text-teal transition shrink-0"
                        title={done ? 'Mark as incomplete' : 'Mark as completed'}
                      >
                        {done ? <CheckSquare size={18} className="text-teal" /> : <Square size={18} />}
                      </button>
                      <div className="min-w-0">
                        <p className={'text-xs font-semibold ' + (done ? 'line-through text-gray-500' : 'text-heading')}>
                          {task.title}
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-2">
                          <span className="text-gray-300 font-medium">{task.category}</span>
                          <span>·</span>
                          <span>{task.estTime}</span>
                          <span>·</span>
                          <span className="text-gray-400">{task.priority}</span>
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(task.route)}
                      className="btn-ghost text-xs px-3 py-1.5 border border-white/10 hover:border-white/20 text-gray-300 shrink-0 flex items-center gap-1"
                    >
                      {task.btnText} <ArrowRight size={13} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* 3. NEXT BEST ACTION */}
          {nextStepTask && (
            <div className="p-5 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/10 via-base-900 to-base-900">
              <p className="text-[11px] font-bold uppercase tracking-wider text-accent-light mb-1">
                YOUR NEXT STEP
              </p>
              <h3 className="text-base font-bold text-heading">{nextStepTask.title}</h3>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                <strong className="text-gray-300 font-medium">Why:</strong> {nextStepTask.reason}
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  onClick={() => navigate(nextStepTask.route)}
                  className="btn-primary text-xs !py-2 !px-4 flex items-center gap-1.5"
                >
                  {nextStepTask.ctaText || 'Start Practice'} <ArrowRight size={14} />
                </button>
                <span className="text-xs text-gray-500">
                  {nextStepTask.estTime} · {nextStepTask.priority}
                </span>
              </div>
            </div>
          )}

          {/* 5. TARGET ROLE & SKILL MATCH */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  TARGET ROLE SKILLS
                </h2>
                <p className="text-sm font-semibold text-heading mt-0.5">{targetRole}</p>
              </div>
              <button
                onClick={() => navigate('/roadmap')}
                className="text-xs text-accent-light hover:underline flex items-center gap-1"
              >
                View Career Roadmap <ChevronRight size={14} />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {roleSkillBreakdown.map((item) => (
                <div key={item.name} className="p-3 rounded-xl border border-white/5 bg-base-950/60">
                  <p className="text-xs font-medium text-heading">{item.name}</p>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium border ${item.color}`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 6. SKILL GAPS */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  SKILL GAPS
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">3 key skills need attention for your goal</p>
              </div>
              <button
                onClick={() => navigate('/skills')}
                className="text-xs text-accent-light hover:underline flex items-center gap-1"
              >
                All Skills <ChevronRight size={14} />
              </button>
            </div>

            <div className="space-y-2.5">
              {skillGapsList.map((gap) => (
                <div
                  key={gap.title}
                  className="p-3.5 rounded-xl border border-white/5 bg-base-950/60 flex items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs font-semibold text-heading">{gap.title}</p>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      <span className="text-orange font-medium">{gap.priority}</span> · {gap.note}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate(gap.route)}
                    className="btn-ghost text-xs px-3 py-1.5 border border-white/10 hover:border-white/20 text-gray-300 shrink-0"
                  >
                    {gap.action} →
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column: Career Readiness & Widgets */}
        <div className="space-y-6">

          {/* 4. CAREER READINESS */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                CAREER READINESS
              </h2>
            </div>

            <div className="flex items-baseline gap-2 my-2">
              <span className="text-3xl font-extrabold text-heading">{careerHealthScore}</span>
              <span className="text-xs text-gray-400">/ 100</span>
              <span className="text-xs font-medium text-teal ml-auto">{readinessLabel}</span>
            </div>

            <div className="h-2 rounded-full bg-base-950 overflow-hidden mb-4 border border-white/5">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-teal rounded-full transition-all duration-500"
                style={{ width: `${careerHealthScore}%` }}
              />
            </div>

            {careerHealthScore === 0 ? (
              <div className="p-3.5 rounded-xl bg-base-950 border border-white/5 text-xs space-y-3">
                <p className="text-gray-300 leading-relaxed">
                  You're just getting started. Complete your profile and upload your resume to begin building your readiness score.
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    onClick={() => setShowSetupModal(true)}
                    className="btn-teal text-xs !py-1.5 !px-3 font-semibold"
                  >
                    Complete Profile
                  </button>
                  <button
                    onClick={() => navigate('/resume')}
                    className="btn-ghost text-xs !py-1.5 !px-3 border border-white/10 text-gray-300 hover:text-white"
                  >
                    Upload Resume
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Score Breakdown */}
                <div className="space-y-2 pt-2 border-t border-white/5 text-xs">
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Profile / Target Role</span>
                    <span className="font-semibold text-heading">{profilePoints} / 25</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Resume ATS Audit</span>
                    <span className={resumeAudit ? 'font-semibold text-teal' : 'text-gray-500 font-medium'}>
                      {resumePoints} / 30
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">DSA Practice ({solvedCount} solved)</span>
                    <span className="font-semibold text-heading">{dsaPoints} / 25</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-gray-400">Aptitude Assessment</span>
                    <span className="font-semibold text-heading">{aptitudePoints} / 20</span>
                  </div>
                </div>

                {/* Biggest Opportunity */}
                <div className="mt-4 p-3 rounded-xl bg-base-950 border border-white/5 text-xs">
                  <p className="text-[11px] font-medium text-gray-400 uppercase tracking-wider">
                    BIGGEST OPPORTUNITY
                  </p>
                  <p className="font-semibold text-heading mt-0.5">
                    {!resumeAudit ? 'Upload Resume (+30 pts)' : 'Improve DSA + System Design (+25 pts)'}
                  </p>
                  <button
                    onClick={() => navigate(!resumeAudit ? '/resume' : '/dsa')}
                    className="btn-teal w-full text-xs !py-1.5 mt-2.5 font-semibold"
                  >
                    Improve readiness →
                  </button>
                </div>
              </>
            )}
          </div>

          {/* 7. JOB SEARCH WIDGET */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  JOB APPLICATION TRACKER
                </h2>
              </div>
              <button
                onClick={() => navigate('/applications')}
                className="text-xs text-accent-light hover:underline flex items-center gap-1"
              >
                View all <ChevronRight size={14} />
              </button>
            </div>

            {applications.length > 0 ? (
              <div className="space-y-2">
                {applications.slice(0, 3).map((app) => (
                  <div key={app.id} className="p-3 rounded-xl border border-white/5 bg-base-950/60 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-semibold text-heading">{app.company}</p>
                      <p className="text-[11px] text-gray-400">{app.role}</p>
                    </div>
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-blue/10 border border-blue/20 text-blue">
                      {app.status}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 px-4 border border-dashed border-white/10 rounded-xl bg-base-950/40">
                <FolderKanban size={24} className="mx-auto text-gray-600 mb-2" />
                <p className="text-xs font-medium text-gray-300">No applications tracked yet</p>
                <p className="text-[11px] text-gray-500 mt-0.5">Keep track of your job search progress</p>
                <button
                  onClick={() => navigate('/applications')}
                  className="btn-ghost text-xs px-3 py-1.5 mt-3 border border-white/10 text-gray-300"
                >
                  Start Tracking Jobs →
                </button>
              </div>
            )}
          </div>

          {/* 10. CONTINUE LEARNING */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                CONTINUE LEARNING
              </h2>
              <BookOpen size={16} className="text-gray-500" />
            </div>

            {activeLearning ? (
              <div className="p-3.5 rounded-xl border border-white/5 bg-base-950/60 space-y-2">
                <p className="text-xs font-semibold text-heading">{activeLearning.title}</p>
                <p className="text-[11px] text-gray-400">{activeLearning.subtitle || activeLearning.lessonInfo || 'In Progress'}</p>
                <div className="h-1.5 rounded-full bg-base-900 overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all"
                    style={{ width: `${activeLearning.progressPct || 0}%` }}
                  />
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[10px] text-gray-500">{activeLearning.progressPct || 0}% completed</span>
                  <button
                    onClick={() => navigate('/learning')}
                    className="text-xs text-accent-light font-medium hover:underline"
                  >
                    Continue →
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 bg-base-950/40 text-center py-5">
                <p className="text-xs font-medium text-gray-300">No active learning paths</p>
                <p className="text-[11px] text-gray-500 mt-1">Explore curated materials to build your skills</p>
                <button
                  onClick={() => navigate('/learning')}
                  className="btn-ghost text-xs px-3 py-1.5 mt-3 border border-white/10 text-gray-300"
                >
                  Explore Learning →
                </button>
              </div>
            )}
          </div>

          {/* 9. UPCOMING DEADLINES */}
          <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                UPCOMING
              </h2>
              <Calendar size={16} className="text-gray-500" />
            </div>

            {upcomingEvents && upcomingEvents.length > 0 ? (
              <div className="space-y-2 text-xs">
                {upcomingEvents.map((evt, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl border border-white/5 bg-base-950/60 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-heading">{evt.title}</p>
                      <p className="text-[10px] text-gray-500">{evt.subtitle || evt.type}</p>
                    </div>
                    <span className="text-[10px] font-semibold text-teal bg-teal/10 px-2 py-0.5 rounded border border-teal/20">
                      {evt.date || evt.status || 'Upcoming'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-white/10 bg-base-950/40 text-center py-5">
                <p className="text-xs font-medium text-gray-300">No upcoming events</p>
                <p className="text-[11px] text-gray-500 mt-1">Schedule a mock interview to practice</p>
                <button
                  onClick={() => navigate('/interview')}
                  className="btn-ghost text-xs px-3 py-1.5 mt-3 border border-white/10 text-gray-300"
                >
                  Schedule Interview →
                </button>
              </div>
            )}
          </div>

          {/* 12. RECENT ACTIVITY */}
          {recentActivities.length > 0 && (
            <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90">
              <h2 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">
                RECENT ACTIVITY
              </h2>
              <div className="space-y-2 text-xs">
                {recentActivities.map((act, i) => (
                  <div
                    key={i}
                    onClick={() => navigate(act.route)}
                    className="p-2.5 rounded-xl border border-white/5 bg-base-950/40 hover:bg-base-950 transition cursor-pointer flex items-center justify-between"
                  >
                    <span className="text-gray-300 font-medium">✓ {act.title}</span>
                    <span className="text-[10px] text-gray-500">{act.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* 13. MARKET TRENDS (Positioned lower on dashboard) */}
      <div className="p-5 rounded-2xl border border-white/10 bg-base-900/90 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue/15 text-blue">
            <LineIcon size={16} />
          </div>
          <div>
            <h3 className="font-semibold text-heading text-sm">Tech Market Trends</h3>
            <p className="text-xs text-gray-500">Industry hiring demand and average salary benchmark</p>
          </div>
        </div>
        {loading ? (
          <Skeleton className="h-48" />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <MarketTrends data={trends} />
        )}
      </div>

      {/* First Time User Setup Modal */}
      <Modal
        open={showSetupModal}
        onClose={() => setShowSetupModal(false)}
        title="Set Up Your Career Profile"
      >
        <form onSubmit={handleSaveSetup} className="space-y-4">
          <p className="text-xs text-gray-400 leading-relaxed">
            Specify your target role and academic details so CareerAI can calculate your Career Health.
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
                        ? 'bg-gradient-purple text-white border-transparent'
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
              <Sparkles size={14} /> Save Goal
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}


