import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import {
  Route,
  MapPinned,
  Zap,
  CheckCircle2,
  Target,
  Download,
  Bookmark,
  BookmarkCheck,
  Award,
  Sparkles,
  Share2,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner, ErrorState } from '../components/Feedback'
import { generateRoadmap } from '../api/roadmap'

import { useAuth } from '../context/AuthContext'

const SAVED_ROADMAPS_KEY = 'careeriq_saved_roadmaps'
const COMPLETED_MILESTONES_KEY = 'careeriq_completed_milestones'

function getSavedRoadmaps() {
  try {
    const raw = localStorage.getItem(SAVED_ROADMAPS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    // Filter out invalid/obsolete test items
    return parsed.filter((p) => p.to && !p.to.toLowerCase().includes('google ceo'))
  } catch {
    return []
  }
}

function getCompletedMilestones() {
  try {
    const raw = localStorage.getItem(COMPLETED_MILESTONES_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export default function Roadmap() {
  const { user, profile } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const [roleInfo, setRoleInfo] = useState({ from: '', to: '' })
  const [savedPlans, setSavedPlans] = useState(getSavedRoadmaps())
  const [completedMilestones, setCompletedMilestones] = useState(getCompletedMilestones())

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm()

  // Dynamically resolve target role from user profile / onboarding
  useEffect(() => {
    let onboardingData = null
    try {
      const raw = localStorage.getItem('careeriq_onboarding')
      if (raw) onboardingData = JSON.parse(raw)
    } catch {
      /* ignore */
    }

    const currentRole = profile?.current_role || onboardingData?.currentRole || 'Student'
    const targetRole = onboardingData?.targetRole || profile?.target_role || 'Full Stack Engineer'

    setValue('from', currentRole)
    setValue('to', targetRole)
    setRoleInfo({ from: currentRole, to: targetRole })

    // Auto-generate initial roadmap for user's actual target role
    setLoading(true)
    generateRoadmap({ from: currentRole, to: targetRole })
      .then((res) => {
        const rData = res.data?.roadmap || res.data || null
        setPlan(rData)
      })
      .catch((e) => setError(e.userMessage || 'Could not generate roadmap'))
      .finally(() => setLoading(false))
  }, [profile, setValue])

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setPlan(null)
    setRoleInfo({ from: data.from, to: data.to })
    try {
      const res = await generateRoadmap(data)
      const rData = res.data?.roadmap || res.data || null
      setPlan(rData)
    } catch (e) {
      setError(e.userMessage || 'Could not generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  const toggleMilestone = (key) => {
    const next = completedMilestones.includes(key)
      ? completedMilestones.filter((k) => k !== key)
      : [...completedMilestones, key]

    setCompletedMilestones(next)
    try {
      localStorage.setItem(COMPLETED_MILESTONES_KEY, JSON.stringify(next))
    } catch {
      /* noop */
    }
  }

  const handleSavePlan = () => {
    if (!plan || !roleInfo.to) return
    const newSaved = {
      id: 'plan-' + Date.now(),
      title: `${roleInfo.from || 'Current'} → ${roleInfo.to}`,
      from: roleInfo.from,
      to: roleInfo.to,
      plan,
      createdAt: new Date().toISOString().split('T')[0],
    }
    const updated = [newSaved, ...savedPlans.filter((p) => p.title !== newSaved.title)]
    setSavedPlans(updated)
    try {
      localStorage.setItem(SAVED_ROADMAPS_KEY, JSON.stringify(updated))
    } catch {
      /* noop */
    }
  }

  const handleLoadSavedPlan = (savedItem) => {
    setPlan(savedItem.plan)
    setRoleInfo({ from: savedItem.from, to: savedItem.to })
    setValue('from', savedItem.from)
    setValue('to', savedItem.to)
  }

  const handleExportMarkdown = () => {
    if (!plan) return
    const stages = plan?.stages || plan || []
    let mdContent = `# Career Transition Roadmap: ${roleInfo.from || 'Current Role'} → ${roleInfo.to}\n\n`
    stages.forEach((stg, i) => {
      mdContent += `## ${stg.title}\n`
      if (stg.duration) mdContent += `**Duration:** ${stg.duration}\n\n`
      if (stg.description) mdContent += `${stg.description}\n\n`
      if (stg.skills && stg.skills.length > 0) {
        mdContent += `**Skills to Master:** ${stg.skills.join(', ')}\n\n`
      }
      if (stg.milestones && stg.milestones.length > 0) {
        mdContent += `**Key Milestones:**\n`
        stg.milestones.forEach((m) => {
          mdContent += `- [ ] ${m}\n`
        })
        mdContent += `\n`
      }
    })

    const blob = new Blob([mdContent], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `Career-Roadmap-${(roleInfo.to || 'plan').replace(/\s+/g, '-')}.md`
    a.click()
    URL.revokeObjectURL(url)
  }

  const stages = plan?.stages || plan || []

  // Progress computation
  let totalMilestones = 0
  let completedCount = 0
  if (Array.isArray(stages)) {
    stages.forEach((stg, i) => {
      ;(stg.milestones || []).forEach((_, j) => {
        totalMilestones++
        if (completedMilestones.includes(`stg-${i}-m-${j}`)) {
          completedCount++
        }
      })
    })
  }
  const progressPercent = totalMilestones > 0 ? Math.round((completedCount / totalMilestones) * 100) : 0

  return (
    <AppShell>
      <PageHeader
        icon={Route}
        title="Career Roadmap & Transition Planner"
        subtitle="Step-by-step career path with interactive milestone tracking."
      />

      {/* Input Form & Saved Selector */}
      <div className="space-y-4">
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col sm:flex-row gap-4 items-start">
          <div className="flex-1 w-full">
            <label className="label">From (Current Role)</label>
            <input className="input" placeholder="e.g. Junior Developer" {...register('from', { required: 'Required' })} />
            {errors.from && <p className="text-xs text-danger mt-1">{errors.from.message}</p>}
          </div>
          <div className="flex-1 w-full">
            <label className="label">To (Target Role)</label>
            <input className="input" placeholder="e.g. Engineering Manager / AI Engineer" {...register('to', { required: 'Required' })} />
            {errors.to && <p className="text-xs text-danger mt-1">{errors.to.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary mt-6">
            {loading ? <Spinner /> : <><Zap size={16} /> Generate Roadmap</>}
          </button>
        </form>

        {/* Saved Plans Selector Bar */}
        {savedPlans.length > 0 && (
          <div className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400">
              <Bookmark size={15} className="text-purple" /> Saved Career Paths:
            </div>
            <div className="flex items-center gap-2 overflow-x-auto">
              {savedPlans.map((sp) => (
                <button
                  key={sp.id}
                  onClick={() => handleLoadSavedPlan(sp)}
                  className="px-3 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-heading border border-white/10 transition whitespace-nowrap"
                >
                  {sp.title}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <ErrorState message={error} className="mt-6" />}

      {!loading && !plan && (
        <div className="card mt-6">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <MapPinned size={32} className="text-accent-light" />
            </div>
            <p className="text-heading font-semibold">No roadmap generated yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Enter your current role and target role, then let AI create a personalized step-by-step career transition plan.
            </p>
          </div>
        </div>
      )}

      {loading && (
        <div className="card mt-6 p-6">
          <div className="flex items-center gap-3 text-gray-400">
            <Spinner /> Mapping your path…
          </div>
        </div>
      )}

      {plan && (
        <div className="space-y-6 mt-8">
          {/* Header Action Bar for Roadmap */}
          <div className="card p-5 flex flex-col sm:flex-row items-center justify-between gap-4 border-purple-500/20">
            <div>
              <div className="flex items-center gap-2">
                <span className="badge bg-purple/20 text-purple font-semibold">
                  {roleInfo.from || 'Current'} → {roleInfo.to}
                </span>
                <span className="text-xs text-gray-400">
                  {completedCount} of {totalMilestones} Milestones Completed
                </span>
              </div>
              <div className="w-64 bg-white/10 h-2 rounded-full mt-2 overflow-hidden">
                <div className="bg-gradient-purple h-full transition-all duration-500" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleSavePlan}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-heading border border-white/10 flex items-center gap-1.5 transition"
              >
                <BookmarkCheck size={15} className="text-teal" /> Save Plan
              </button>
              <button
                onClick={handleExportMarkdown}
                className="px-3 py-2 rounded-xl bg-gradient-purple text-white text-xs font-semibold shadow-glow-purple flex items-center gap-1.5 transition"
              >
                <Download size={15} /> Export Markdown
              </button>
            </div>
          </div>

          {/* Interactive Roadmap Timeline */}
          <div className="relative pl-8 space-y-8">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-gradient-to-b from-purple via-teal to-blue opacity-40" />

            {(Array.isArray(stages) ? stages : []).map((stage, i) => (
              <div key={i} className="relative">
                <div className="absolute -left-8 top-1 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-purple text-white shadow-glow-purple">
                  <CheckCircle2 size={16} />
                </div>

                <div className="card p-6 border border-white/5 hover:border-white/10 transition">
                  <div className="flex items-center justify-between flex-wrap gap-2 mb-2">
                    <h3 className="font-bold text-heading text-lg">{stage.title}</h3>
                    {stage.duration && (
                      <span className="badge bg-purple/15 text-purple font-semibold">
                        {stage.duration}
                      </span>
                    )}
                  </div>

                  {stage.description && (
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{stage.description}</p>
                  )}

                  {/* Skills Section */}
                  {stage.skills && stage.skills.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                        Skills & Tools to Master
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {stage.skills.map((s, j) => (
                          <span key={j} className="badge bg-white/5 text-gray-300 border border-white/10 px-2.5 py-1 text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Interactive Milestones Checklist */}
                  {stage.milestones && stage.milestones.length > 0 && (
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-xs uppercase tracking-wider text-gray-500 mb-2 font-semibold">
                        Key Milestones & Action Items
                      </p>
                      <div className="space-y-2">
                        {stage.milestones.map((m, j) => {
                          const mKey = `stg-${i}-m-${j}`
                          const isDone = completedMilestones.includes(mKey)
                          return (
                            <div
                              key={j}
                              onClick={() => toggleMilestone(mKey)}
                              className={
                                'flex items-start gap-3 p-2.5 rounded-xl border transition cursor-pointer ' +
                                (isDone
                                  ? 'bg-teal/10 border-teal/30 text-teal'
                                  : 'bg-white/5 border-white/5 text-gray-300 hover:border-white/10')
                              }
                            >
                              <div className={'mt-0.5 shrink-0 ' + (isDone ? 'text-teal' : 'text-gray-500')}>
                                {isDone ? <CheckCircle2 size={16} /> : <Target size={16} />}
                              </div>
                              <span className={'text-sm ' + (isDone ? 'line-through opacity-80' : '')}>
                                {m}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  )
}
