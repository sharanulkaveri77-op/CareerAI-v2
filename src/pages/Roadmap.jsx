import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Route, MapPinned, Zap, CheckCircle2, Target } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner, ErrorState } from '../components/Feedback'
import { generateRoadmap } from '../api/roadmap'

export default function Roadmap() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [plan, setPlan] = useState(null)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = async (data) => {
    setLoading(true)
    setError('')
    setPlan(null)
    try {
      const res = await generateRoadmap(data)
      setPlan(res.data?.roadmap || res.data || null)
    } catch (e) {
      setError(e.userMessage || 'Could not generate roadmap')
    } finally {
      setLoading(false)
    }
  }

  const stages = plan?.stages || plan

  return (
    <AppShell>
      <PageHeader
        icon={Route}
        title="Career Roadmap"
        subtitle="Plan your step-by-step career transition"
      />

      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1 w-full">
          <label className="label">From (Current Role)</label>
          <input className="input" placeholder="e.g. Junior Developer" {...register('from', { required: 'Required' })} />
          {errors.from && <p className="text-xs text-danger mt-1">{errors.from.message}</p>}
        </div>
        <div className="flex-1 w-full">
          <label className="label">To (Target Role)</label>
          <input className="input" placeholder="e.g. Engineering Manager" {...register('to', { required: 'Required' })} />
          {errors.to && <p className="text-xs text-danger mt-1">{errors.to.message}</p>}
        </div>
        <button type="submit" disabled={loading} className="btn-primary mt-6">
          {loading ? <Spinner /> : <><Zap size={16} /> Generate Roadmap</>}
        </button>
      </form>

      {error && <ErrorState message={error} className="mt-6" />}

      {!loading && !plan && (
        <div className="card mt-6">
          <div className="flex flex-col items-center justify-center py-14 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <MapPinned size={32} className="text-accent-light" />
            </div>
            <p className="text-white font-semibold">No roadmap generated yet</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Enter your current role and target role, then let AI create a
              personalized step-by-step career transition plan.
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
        <div className="mt-8 relative pl-8">
          {/* vertical line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-accent/30" />
          {(Array.isArray(stages) ? stages : []).map((stage, i) => (
            <div key={i} className="relative mb-8">
              <div className="absolute -left-8 top-0 flex items-center justify-center w-8 h-8 rounded-full bg-gradient-purple text-white">
                <CheckCircle2 size={16} />
              </div>
              <div className="card p-5">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <h3 className="font-semibold text-white">{stage.title}</h3>
                  {stage.duration && (
                    <span className="badge bg-accent/15 text-accent-light">
                      {stage.duration}
                    </span>
                  )}
                </div>
                {stage.description && (
                  <p className="text-sm text-gray-400 mt-2">{stage.description}</p>
                )}
                {stage.skills && stage.skills.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">
                      Skills to gain
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {stage.skills.map((s, j) => (
                        <span key={j} className="badge bg-white/5 text-gray-300 border border-white/10">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {stage.milestones && stage.milestones.length > 0 && (
                  <ul className="mt-3 space-y-1">
                    {stage.milestones.map((m, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-gray-300">
                        <Target size={14} className="text-accent-light mt-0.5 shrink-0" />
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </AppShell>
  )
}
