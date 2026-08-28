import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Brain,
  Plus,
  Sparkles,
  Zap,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Trash2,
  Target,
  BookOpen,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import { Spinner, ErrorState, Skeleton } from '../components/Feedback'
import {
  getSkills,
  addSkill,
  deleteSkill,
  analyzeSkills,
  ROLE_SKILL_BENCHMARKS,
} from '../api/skills'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
const LEVEL_PCT = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
}

const TARGET_ROLES = [
  'Full Stack Developer',
  'Frontend Developer',
  'Backend Engineer',
  'AI / ML Engineer',
  'DevOps Engineer',
]

export default function Skills() {
  const [targetRole, setTargetRole] = useState('Full Stack Developer')
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [gapsData, setGapsData] = useState(null)
  const [analyzeError, setAnalyzeError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { category: 'Technical', level: 'beginner' } })

  const fetchUserSkills = async () => {
    try {
      const res = await getSkills()
      setSkills(res.data?.skills || res.data || [])
    } catch (e) {
      setError(e.userMessage || 'Failed to load skills')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUserSkills()
  }, [])

  // Auto-run gap analysis when skills or targetRole change
  useEffect(() => {
    let active = true
    setAnalyzing(true)
    analyzeSkills(targetRole)
      .then((res) => {
        if (active) setGapsData(res.data || null)
      })
      .catch((e) => {
        if (active) setAnalyzeError(e.userMessage || 'Skill analysis unavailable')
      })
      .finally(() => {
        if (active) setAnalyzing(false)
      })
    return () => {
      active = false
    }
  }, [targetRole, skills.length])

  const grouped = useMemo(() => {
    return skills.reduce((acc, s) => {
      const cat = s.category || 'Technical'
      acc[cat] = acc[cat] || []
      acc[cat].push(s)
      return acc
    }, {})
  }, [skills])

  const onAdd = async (data) => {
    setAdding(true)
    try {
      const res = await addSkill(data)
      const created = res.data?.skill || res.data
      setSkills((prev) => [...prev, created])
      setModalOpen(false)
      reset({ category: 'Technical', level: 'beginner' })
    } catch (e) {
      setError(e.userMessage || 'Could not add skill')
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (id) => {
    setSkills((prev) => prev.filter((s) => s._id !== id))
    await deleteSkill(id)
  }

  const handleQuickAddSkill = async (skillName) => {
    const newSkill = { name: skillName, category: 'Technical', level: 'intermediate' }
    const res = await addSkill(newSkill)
    const created = res.data?.skill || res.data
    setSkills((prev) => [...prev, created])
  }

  // Calculate Match % against benchmark
  const benchmarkSkills = ROLE_SKILL_BENCHMARKS[targetRole] || ROLE_SKILL_BENCHMARKS['Full Stack Developer']
  const userSkillSet = useMemo(() => {
    return new Set(skills.map((s) => (s.name || '').toLowerCase().trim()))
  }, [skills])

  const matchedCount = benchmarkSkills.filter((b) => userSkillSet.has(b.name.toLowerCase().trim())).length
  const matchPct = Math.round((matchedCount / (benchmarkSkills.length || 1)) * 100)

  return (
    <AppShell>
      <PageHeader
        icon={Brain}
        title="Skill Gap Analyzer"
        subtitle="Benchmark your profile against target roles & discover missing skill gaps"
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <Plus size={16} /> Add Skill
          </button>
        }
      />

      {error && <ErrorState message={error} />}

      {/* Target Role Selector & Overall Match Banner */}
      <div className="card p-6 mb-6 bg-gradient-to-r from-base-850 via-base-800 to-purple-950/30 border-purple-500/20">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Target size={18} className="text-accent-light" />
              <span className="text-xs uppercase tracking-wider text-accent-light font-bold">
                Target Role Benchmark
              </span>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="bg-base-900 border border-accent/40 rounded-xl px-4 py-2 text-sm font-bold text-heading focus:outline-none focus:border-accent shadow-glow-purple"
              >
                {TARGET_ROLES.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Comparing your {skills.length} tracked skills against industry requirements for{' '}
              <strong className="text-heading">{targetRole}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-4 bg-base-900/80 border border-white/10 p-4 rounded-2xl shrink-0">
            <div className="text-right">
              <p className="text-2xl font-black text-teal">{matchPct}% Match</p>
              <p className="text-[11px] text-gray-400 font-medium">
                {matchedCount} of {benchmarkSkills.length} Required Skills
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-teal/15 flex items-center justify-center text-teal">
              <TrendingUp size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* AI Gap Analysis Diagnostics Panel */}
      {analyzing ? (
        <div className="card p-6 mb-8 flex items-center gap-3">
          <Spinner />
          <span className="text-xs font-semibold text-gray-300">
            Running Google Gemini 2.5 Flash skill gap analysis for {targetRole}...
          </span>
        </div>
      ) : gapsData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Missing Gaps (Lacking Skills) */}
          <div className="card p-5 border-danger/30 bg-danger/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                <AlertCircle size={15} /> Missing Skill Gaps ({gapsData.gaps?.length || 0})
              </h4>
            </div>
            <p className="text-[11px] text-gray-400">Skills required for {targetRole} not found in your profile:</p>

            <div className="space-y-2">
              {(gapsData.gaps || []).map((gap, i) => {
                const gapName = typeof gap === 'string' ? gap : gap.name || gap.skill
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-base-900 border border-white/5 text-xs"
                  >
                    <span className="font-semibold text-gray-200">{gapName}</span>
                    <button
                      onClick={() => handleQuickAddSkill(gapName)}
                      className="text-[11px] text-teal hover:underline flex items-center gap-1 font-medium"
                      title="Add to my skills"
                    >
                      <Plus size={12} /> Add
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lacking Proficiency */}
          <div className="card p-5 border-orange/30 bg-orange/5 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                <Zap size={15} /> Level Up Required ({gapsData.lackingProficiency?.length || 0})
              </h4>
            </div>
            <p className="text-[11px] text-gray-400">Skills you have that need higher proficiency:</p>

            <div className="space-y-2">
              {(gapsData.lackingProficiency || []).length > 0 ? (
                (gapsData.lackingProficiency || []).map((item, i) => (
                  <div key={i} className="p-2.5 rounded-xl bg-base-900 border border-white/5 text-xs text-gray-300">
                    💡 {typeof item === 'string' ? item : item.name || item.skill}
                  </div>
                ))
              ) : (
                <p className="text-xs text-teal font-medium">All acquired skills match required baseline levels! ✓</p>
              )}
            </div>
          </div>

          {/* AI Executive Summary */}
          <div className="card p-5 border-accent/30 bg-gradient-to-br from-accent/10 via-base-850 to-transparent space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-accent-light flex items-center gap-1.5">
              <Sparkles size={15} /> AI Career Assessment
            </h4>
            <p className="text-xs text-gray-300 leading-relaxed">
              {gapsData.summary || `Focus on closing your top ${gapsData.gaps?.length || 0} skill gaps to boost your hiring readiness.`}
            </p>
            <div className="pt-2 border-t border-white/10 flex items-center justify-between">
              <span className="text-[11px] text-gray-400 font-medium">Engine: Gemini 2.5 Flash</span>
              <span className="badge bg-teal/20 text-teal text-[11px]">Real-Time Market Sync</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Main Content: My Skills vs Target Role Benchmark */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tracked Skills List */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-heading uppercase tracking-wider">
              My Tracked Skills ({skills.length})
            </h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : skills.length === 0 ? (
            <div className="card p-8 text-center space-y-3">
              <Brain size={36} className="mx-auto text-gray-500" />
              <p className="text-sm font-semibold text-heading">No skills tracked yet</p>
              <p className="text-xs text-gray-400">
                Click "Add Skill" above or use the quick add options in the gap analysis panel.
              </p>
            </div>
          ) : (
            Object.entries(grouped).map(([category, list]) => (
              <div key={category} className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                  {category}
                </h4>
                <div className="card divide-y divide-white/5">
                  {list.map((s) => (
                    <div key={s._id} className="p-4 flex items-center justify-between gap-4">
                      <div className="w-1/3">
                        <p className="text-xs font-bold text-heading">{s.name}</p>
                        <span className="text-[10px] text-gray-500 uppercase">{s.category}</span>
                      </div>

                      <div className="flex-1 max-w-xs">
                        <ProgressBar value={LEVEL_PCT[s.level] || 25} />
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="badge bg-white/5 text-gray-300 text-[11px] capitalize">
                          {s.level}
                        </span>
                        <button
                          onClick={() => handleDelete(s._id)}
                          className="text-gray-500 hover:text-danger p-1 transition"
                          title="Remove Skill"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Target Role Benchmark Checklist */}
        <div className="space-y-4">
          <div className="card p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-heading flex items-center gap-2">
              <BookOpen size={16} className="text-accent-light" /> {targetRole} Skills Needed
            </h3>

            <div className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-1">
              {benchmarkSkills.map((req, i) => {
                const acquired = userSkillSet.has(req.name.toLowerCase().trim())
                return (
                  <div
                    key={i}
                    className={
                      'p-3 rounded-xl border text-xs flex items-center justify-between ' +
                      (acquired
                        ? 'bg-teal/10 border-teal/20 text-gray-200'
                        : 'bg-base-900 border-white/5 text-gray-400')
                    }
                  >
                    <div className="flex items-center gap-2">
                      {acquired ? (
                        <CheckCircle2 size={16} className="text-teal shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-gray-600 shrink-0" />
                      )}
                      <span className={acquired ? 'font-semibold text-heading' : ''}>
                        {req.name}
                      </span>
                    </div>
                    <span className="badge bg-white/5 text-[10px] uppercase text-gray-400">
                      {req.level}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add New Skill">
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <div>
            <label className="label">Skill Name</label>
            <input
              className="input"
              placeholder="e.g. Docker, TypeScript, System Design"
              {...register('name', { required: 'Skill name is required' })}
            />
            {errors.name && <p className="text-xs text-danger mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category')}>
              {['Technical', 'Frontend', 'Backend', 'Database', 'DevOps', 'Soft Skills'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Proficiency Level</label>
            <select className="input" {...register('level')}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l.toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? <Spinner /> : <Plus size={16} />} Save Skill
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
