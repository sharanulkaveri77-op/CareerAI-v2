import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import {
  Bot,
  Video,
  Mic,
  Send,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import {
  startInterview,
  submitAnswer,
  getInterviewSummary,
} from '../api/interview'

const TYPES = ['Technical', 'Behavioral', 'System Design', 'HR']

export default function InterviewAI() {
  const [started, setStarted] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState([])
  const [answering, setAnswering] = useState(false)
  const [ended, setEnded] = useState(false)
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  const videoRef = useRef(null)
  const streamRef = useRef(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ defaultValues: { type: 'Technical' } })

  // stop camera on unmount
  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      streamRef.current = stream
      if (videoRef.current) videoRef.current.srcObject = stream
    } catch {
      // no camera permission — placeholder avatar shows instead
    }
  }

  const onSubmitSetup = async (data) => {
    setError('')
    try {
      const res = await startInterview(data)
      const { sessionId: sid, question: q } = res.data
      setSessionId(sid)
      setQuestion(q || 'Tell me about yourself.')
      setStarted(true)
      startCamera()
    } catch (e) {
      setError(e.userMessage || 'Could not start interview')
    }
  }

  const onNext = async () => {
    if (!answer.trim()) return
    setAnswering(true)
    try {
      const res = await submitAnswer({ sessionId, question, answer })
      const fb = res.data?.feedback || res.data?.coachTip || ''
      setFeedback((prev) => [...prev, { question, answer, tip: fb }])
      setQuestion(res.data?.nextQuestion || '')
      setAnswer('')
    } catch (e) {
      setError(e.userMessage || 'Failed to submit answer')
    } finally {
      setAnswering(false)
    }
  }

  const onEnd = async () => {
    try {
      const res = await getInterviewSummary(sessionId)
      setSummary(res.data)
    } catch (e) {
      setError(e.userMessage || 'Could not load summary')
    } finally {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      setEnded(true)
    }
  }

  return (
    <AppShell>
      <PageHeader
        icon={Bot}
        title="AI Interviewer"
        subtitle="Real-time AI mock interview"
      />
      {error && <p className="text-xs text-danger mb-3">{error}</p>}

      {!started && !ended && (
        <form onSubmit={handleSubmit(onSubmitSetup)} className="card p-6 max-w-xl space-y-4">
          <div>
            <label className="label">Role</label>
            <input
              className="input"
              placeholder="e.g. Senior Software Engineer"
              {...register('role', { required: 'Role is required' })}
            />
            {errors.role && (
              <p className="text-xs text-danger mt-1">{errors.role.message}</p>
            )}
          </div>
          <div>
            <label className="label">Interview type</label>
            <select className="input" {...register('type')}>
              {TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="btn-primary">
            <Video size={16} /> Start Interview
          </button>
        </form>
      )}

      {started && !ended && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Video + controls */}
          <div className="card p-4 flex flex-col">
            <div className="relative w-full aspect-video rounded-xl bg-base-900 overflow-hidden flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
              />
              {!streamRef.current && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-purple">
                    <Bot size={28} className="text-white" />
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 mt-4">
              <span className="badge bg-teal/15 text-teal"><Mic size={12} /> Mic</span>
              <span className="badge bg-blue/15 text-blue"><Video size={12} /> Camera</span>
            </div>
            <button onClick={onEnd} className="btn-ghost mt-3 text-danger border-danger/30">
              End interview
            </button>
          </div>

          {/* Question + answer */}
          <div className="card p-5 lg:col-span-2 flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-purple">
                <Bot size={18} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-white">AI Interviewer</span>
            </div>
            <div className="bg-base-750 border-l-2 border-accent rounded-xl p-4 text-sm text-gray-100">
              {question || 'Waiting for question…'}
            </div>

            <textarea
              className="input mt-4 resize-none"
              rows={3}
              placeholder="Type or record your answer…"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
            />
            <div className="flex justify-end gap-3 mt-3">
              <button onClick={onNext} disabled={answering || !answer.trim()} className="btn-primary">
                {answering ? <Spinner /> : <>Next question <ArrowRight size={16} /></>}
              </button>
            </div>

            {feedback.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-semibold text-white mb-2 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-teal" /> AI Feedback
                </h4>
                <ul className="space-y-2">
                  {feedback.map((f, i) => (
                    <li key={i} className="text-sm text-gray-300 bg-white/5 rounded-lg p-3">
                      <p className="text-gray-400 text-xs mb-1">Q: {f.question}</p>
                      <p>A: {f.answer}</p>
                      <p className="text-accent-light mt-1">Coach: {f.tip}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {ended && summary && (
        <div className="card p-6 max-w-2xl">
          <h3 className="text-lg font-semibold text-white">Interview Report</h3>
          <p className="text-3xl font-bold text-accent-light mt-2">
            {summary.score}/100
          </p>
          <p className="text-sm text-gray-400 mt-1">{summary.overall}</p>
          {summary.strengths?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-teal mb-2">Strengths</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {summary.strengths.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {summary.improvements?.length > 0 && (
            <div className="mt-5">
              <h4 className="text-sm font-semibold text-orange mb-2">Improvements</h4>
              <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                {summary.improvements.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          <button onClick={() => { setEnded(false); setStarted(false); setSummary(null); setFeedback([]); }} className="btn-ghost mt-6">
            <RotateCcw size={16} /> New interview
          </button>
        </div>
      )}
    </AppShell>
  )
}
