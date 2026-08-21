import { useRef, useState } from 'react'
import { FileText, Upload, Check, X, Loader2 } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Skeleton, ErrorState } from '../components/Feedback'
import { analyzeResume } from '../api/resume'

function ResultSkeleton() {
  return (
    <div className="card p-6 space-y-4">
      <Skeleton className="h-8 w-32" />
      <Skeleton className="h-4 w-48" />
      <div className="grid grid-cols-2 gap-4 pt-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    </div>
  )
}

export default function Resume() {
  const [targetRole, setTargetRole] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const fileRef = useRef(null)

  const onFile = (e) => setFile(e.target.files?.[0] || null)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (!file) {
      setError('Please select a resume file.')
      return
    }
    setLoading(true)
    setError('')
    setResult(null)
    const formData = new FormData()
    formData.append('resume', file)
    if (targetRole.trim()) formData.append('targetRole', targetRole.trim())
    try {
      const res = await analyzeResume(formData)
      setResult(res.data)
    } catch (err) {
      setError(err.userMessage || 'Resume analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const keywordPct = result?.keywordMatch ?? result?.keywords ?? 0
  const atsPass = result?.atsPass ?? result?.ats ?? false

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="Resume Analyzer"
        subtitle="Get instant AI feedback on your resume"
      />

      {/* Upload card */}
      <form onSubmit={onSubmit} className="card p-6 mb-6">
        <label className="label">Target Role (optional)</label>
        <input
          className="input mb-4"
          placeholder="e.g., Senior Product Manager at Google"
          value={targetRole}
          onChange={(e) => setTargetRole(e.target.value)}
        />
        <div
          onClick={() => fileRef.current?.click()}
          className="border border-dashed border-white/10 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition"
        >
          <Upload size={26} className="text-accent-light mb-2" />
          <p className="text-sm text-gray-300">
            {file ? file.name : 'Click to upload your resume'}
          </p>
          <input
            ref={fileRef}
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={onFile}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">Supports PDF, DOC, DOCX files</p>
        <button type="submit" disabled={loading || !file} className="btn-primary mt-4">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          Upload Resume
        </button>
      </form>

      {error && <ErrorState message={error} />}
      {loading && <ResultSkeleton />}

      {result && (
        <div className="card p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-3xl font-bold text-accent-light">
                {result.score}/100
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Target: {result.targetRole || 'General'}
              </p>
            </div>
            <div className="flex gap-2">
              <span className="badge bg-teal/15 text-teal">
                <Check size={12} /> Keywords {keywordPct}%
              </span>
              <span
                className={
                  'badge ' +
                  (atsPass
                    ? 'bg-teal/15 text-teal'
                    : 'bg-danger/15 text-danger')
                }
              >
                {atsPass ? <Check size={12} /> : <X size={12} />} ATS{' '}
                {atsPass ? 'Pass' : 'Fail'}
              </span>
            </div>
          </div>

          {result.summary && (
            <p className="text-sm text-gray-300 mt-5 leading-relaxed">
              {result.summary}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <h4 className="text-sm font-semibold text-teal mb-3 flex items-center gap-2">
                <Check size={16} /> Strengths
              </h4>
              <ul className="space-y-2">
                {(result.strengths || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                    {s}
                  </li>
                ))}
                {(!result.strengths || result.strengths.length === 0) && (
                  <li className="text-sm text-gray-500">No data yet.</li>
                )}
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-orange mb-3 flex items-center gap-2">
                <X size={16} /> Improvements
              </h4>
              <ul className="space-y-2">
                {(result.improvements || []).map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                    <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                    {s}
                  </li>
                ))}
                {(!result.improvements || result.improvements.length === 0) && (
                  <li className="text-sm text-gray-500">No data yet.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {!loading && !result && !error && (
        <div className="card">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex items-center justify-center w-20 h-20 rounded-full bg-accent/10 mb-4">
              <FileText size={32} className="text-accent-light" />
            </div>
            <p className="text-white font-semibold">No analysis yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Upload your resume to get an AI-powered breakdown.
            </p>
          </div>
        </div>
      )}
    </AppShell>
  )
}
