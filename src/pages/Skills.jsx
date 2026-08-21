import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { Brain, Plus, Sparkles, Zap, AlertTriangle } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import ProgressBar from '../components/ProgressBar'
import Modal from '../components/Modal'
import { Spinner, ErrorState, Skeleton } from '../components/Feedback'
import { getSkills, addSkill, analyzeSkills } from '../api/skills'

const LEVELS = ['beginner', 'intermediate', 'advanced', 'expert']
const LEVEL_PCT = {
  beginner: 25,
  intermediate: 50,
  advanced: 75,
  expert: 100,
}

export default function Skills() {
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [adding, setAdding] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [gaps, setGaps] = useState(null)
  const [analyzeError, setAnalyzeError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: { category: 'Technical', level: 'beginner' } })

  useEffect(() => {
    let active = true
    getSkills()
      .then((res) => active && setSkills(res.data?.skills || res.data || []))
      .catch((e) => active && setError(e.userMessage || 'Failed to load skills'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const grouped = useMemo(() => {
    return skills.reduce((acc, s) => {
      const cat = s.category || 'Other'
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

  const onAnalyze = async () => {
    setAnalyzing(true)
    setAnalyzeError('')
    setGaps(null)
    try {
      const res = await analyzeSkills()
      setGaps(res.data?.gaps || res.data || null)
    } catch (e) {
      setAnalyzeError(e.userMessage || 'Skill analysis unavailable')
    } finally {
      setAnalyzing(false)
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={Brain}
        title="Skill Analyzer"
        subtitle="Track your skills and find the gaps to close"
        actions={
          <>
            <button onClick={onAnalyze} disabled={analyzing} className="btn-ghost">
              {analyzing ? <Spinner /> : <Sparkles size={16} />} AI Analyze
            </button>
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <Plus size={16} /> Add Skill
            </button>
          </>
        }
      />

      {error && <ErrorState message={error} />}

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <Brain size={32} className="text-accent-light" />
            </div>
            <p className="text-white font-semibold">No skills yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Add your first skill or run AI Analyze to discover gaps.
            </p>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([category, list]) => (
          <div key={category} className="mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-3">
              {category}
            </h3>
            <div className="card divide-y divide-white/5">
              {list.map((s, i) => (
                <div key={s._id || i} className="p-4 flex items-center gap-4">
                  <span className="flex-1 text-sm font-medium text-gray-100">
                    {s.name}
                  </span>
                  <div className="flex-1 max-w-md">
                    <ProgressBar value={LEVEL_PCT[s.level] || 25} />
                  </div>
                  <span className="w-24 text-right text-xs text-gray-500 capitalize">
                    {s.level}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* AI gaps callout */}
      {analyzing && (
        <div className="card p-5 flex items-center gap-3">
          <Spinner /> <span className="text-sm text-gray-400">Analyzing your skills…</span>
        </div>
      )}
      {analyzeError && (
        <div className="card p-5 flex items-start gap-3 border-danger/30">
          <AlertTriangle size={18} className="text-danger mt-0.5" />
          <p className="text-sm text-gray-300">{analyzeError}</p>
        </div>
      )}
      {gaps && (
        <div className="card p-5 border-accent/30 bg-gradient-to-br from-accent/10 to-transparent">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-accent-light" />
            <h3 className="font-semibold text-white">AI Suggested Skill Gaps</h3>
          </div>
          {Array.isArray(gaps) ? (
            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
              {gaps.map((g, i) => (
                <li key={i}>{typeof g === 'string' ? g : g.name || JSON.stringify(g)}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-gray-300">{JSON.stringify(gaps)}</p>
          )}
        </div>
      )}

      {/* Add skill modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add Skill">
        <form onSubmit={handleSubmit(onAdd)} className="space-y-4">
          <div>
            <label className="label">Skill name</label>
            <input
              className="input"
              placeholder="e.g. React, Public Speaking"
              {...register('name', { required: 'Skill name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-danger mt-1">{errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">Category</label>
            <select className="input" {...register('category')}>
              {['Technical', 'Soft', 'Tool'].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Level</label>
            <select className="input" {...register('level')}>
              {LEVELS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Cancel
            </button>
            <button type="submit" disabled={adding} className="btn-primary">
              {adding ? <Spinner /> : <Plus size={16} />} Add
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
