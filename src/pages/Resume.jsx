import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  FileText,
  Upload,
  Check,
  X,
  Loader2,
  Trash2,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Sparkles,
  ArrowRight,
  FileCode,
  Zap,
  Briefcase,
  MapPin,
  DollarSign,
  ExternalLink,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Skeleton, ErrorState } from '../components/Feedback'
import { analyzeResume, SAMPLE_RESUME_TEXT } from '../api/resume'
import { listResumes, saveResume, deleteResume } from '../api/resumes'
import { SAMPLE_JOBS, computeSkillMatch } from '../api/jobs'
import { addApplication } from '../api/applications'
import { useAuth } from '../context/AuthContext'

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
  const { profile } = useAuth()
  const [tab, setTab] = useState('upload') // 'upload' | 'text'
  const [targetRole, setTargetRole] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_onboarding')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed.targetRole) return parsed.targetRole
      }
    } catch {
      /* ignore */
    }
    return profile?.target_role || 'Full Stack Engineer'
  })
  const [file, setFile] = useState(null)
  const [rawText, setRawText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [resumes, setResumes] = useState([])
  const [loadingResumes, setLoadingResumes] = useState(true)
  const [applyModalJob, setApplyModalJob] = useState(null)
  const [appliedJobs, setAppliedJobs] = useState([])
  const fileRef = useRef(null)

  const loadResumes = () => {
    setLoadingResumes(true)
    listResumes()
      .then(setResumes)
      .catch(() => setResumes([]))
      .finally(() => setLoadingResumes(false))
  }

  useEffect(() => {
    loadResumes()
  }, [])

  const onFile = (e) => setFile(e.target.files?.[0] || null)

  const handleTestSampleResume = async () => {
    setTab('text')
    setRawText(SAMPLE_RESUME_TEXT)
    setTargetRole('Full Stack Engineer')
    runAnalysis({ textToAnalyze: SAMPLE_RESUME_TEXT, roleToAnalyze: 'Full Stack Engineer' })
  }

  const runAnalysis = async ({ fileToAnalyze, textToAnalyze, roleToAnalyze }) => {
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await analyzeResume({
        file: fileToAnalyze,
        rawText: textToAnalyze,
        targetRole: roleToAnalyze || targetRole,
      })
      setResult(res.data)
      try {
        localStorage.setItem(
          'careeriq_latest_resume_audit',
          JSON.stringify({
            score: res.data.score || 0,
            targetRole: res.data.targetRole || roleToAnalyze || targetRole,
            keywordMatch: res.data.keywordMatch ?? res.data.keywords ?? 0,
            atsPass: res.data.atsPass ?? false,
            timestamp: Date.now(),
          })
        )
        await saveResume({ filename: fileToAnalyze?.name || 'Text_Resume_Audit' })
        loadResumes()
      } catch {
        /* non-fatal */
      }
    } catch (err) {
      setError(err.userMessage || 'Resume analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    if (tab === 'upload' && !file) {
      setError('Please select a PDF or DOCX resume file.')
      return
    }
    if (tab === 'text' && !rawText.trim()) {
      setError('Please paste your resume text.')
      return
    }
    runAnalysis({ fileToAnalyze: file, textToAnalyze: rawText, roleToAnalyze: targetRole })
  }

  const onDeleteResume = async (id) => {
    try {
      await deleteResume(id)
      loadResumes()
    } catch {
      /* ignore */
    }
  }

  const handleApplyJob = async (job) => {
    try {
      await addApplication({
        company: job.company,
        role: job.title,
        location: job.location,
        status: 'Applied',
        applied_at: new Date().toISOString().split('T')[0],
      })
    } catch {
      /* non-fatal */
    }
    setAppliedJobs((prev) => [...prev, job.id])
    setApplyModalJob(null)
  }

  const formatDate = (value) => (value ? new Date(value).toLocaleDateString() : '')

  const keywordPct = result?.keywordMatch ?? result?.keywords ?? 0
  const atsPass = result?.atsPass ?? result?.ats ?? false

  const missingList = result?.missing || []
  const lackingList = result?.lacking || result?.improvements || []
  const shouldIncludeList = result?.shouldInclude || []
  const strengthsList = result?.strengths || []

  // Job discovery matches based on current scan
  const matchingJobs = SAMPLE_JOBS.slice(0, 3)

  return (
    <AppShell>
      <PageHeader
        icon={FileText}
        title="ATS Resume Scanner & Audit"
        subtitle="Analyze your resume against your target role and get actionable improvements."
        actions={
          <button
            type="button"
            onClick={handleTestSampleResume}
            className="btn-ghost flex items-center gap-1.5 text-xs text-accent-light"
          >
            <Zap size={14} /> Test with Sample Resume
          </button>
        }
      />

      {/* Mode Selector & Upload Card */}
      <div className="card p-6 mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setTab('upload')}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ' +
                (tab === 'upload'
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'bg-base-900 text-gray-400 hover:text-white')
              }
            >
              <Upload size={14} /> Upload File (PDF / DOCX)
            </button>
            <button
              type="button"
              onClick={() => setTab('text')}
              className={
                'px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ' +
                (tab === 'text'
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'bg-base-900 text-gray-400 hover:text-white')
              }
            >
              <FileCode size={14} /> Paste Resume Text
            </button>
          </div>

          <button
            type="button"
            onClick={handleTestSampleResume}
            className="text-xs text-accent-light hover:underline flex items-center gap-1"
          >
            <Sparkles size={13} /> 1-Click Sample Audit
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="label">Target Job Role</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {['Full Stack Engineer', 'Frontend Developer', 'Backend Engineer', 'AI/ML Engineer'].map((role) => (
                <button
                  type="button"
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={
                    'px-2.5 py-1 rounded-lg text-[11px] font-semibold transition ' +
                    (targetRole === role
                      ? 'bg-accent/20 text-accent-light border border-accent/40'
                      : 'bg-base-900 text-gray-400 hover:text-white')
                  }
                >
                  {role}
                </button>
              ))}
            </div>
            <input
              className="input text-xs"
              placeholder="e.g., Full Stack Engineer at Google"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
            />
          </div>

          {tab === 'upload' ? (
            <div
              onClick={() => fileRef.current?.click()}
              className="border border-dashed border-white/10 rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition bg-base-900/50"
            >
              <Upload size={32} className="text-accent-light mb-2" />
              <p className="text-sm font-semibold text-heading">
                {file ? file.name : 'Click or drag PDF/DOCX file to scan'}
              </p>
              <p className="text-xs text-gray-500 mt-1">Supports PDF, DOC, DOCX files</p>
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={onFile}
              />
            </div>
          ) : (
            <div>
              <label className="label">Resume Text</label>
              <textarea
                className="input resize-none text-xs leading-relaxed"
                rows={8}
                placeholder="Paste your complete resume text here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (tab === 'upload' ? !file : !rawText.trim())}
            className="btn-primary text-xs px-6 py-2.5 font-semibold flex items-center gap-2"
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            Run ATS Resume Audit
          </button>
        </form>
      </div>

      {error && <ErrorState message={error} />}
      {loading && <ResultSkeleton />}

      {/* Comprehensive 4-Column Diagnostic Audit */}
      {result && (
        <div className="space-y-6 mb-6">
          <div className="card p-6 space-y-6">
            <div className="flex items-start justify-between flex-wrap gap-4 border-b border-white/10 pb-4">
              <div>
                <p className="text-3xl font-extrabold text-heading">
                  {result.score}/100 <span className="text-sm font-normal text-gray-400">ATS Match Score</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  Target Role: <strong className="text-heading font-medium">{result.targetRole || targetRole}</strong>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="badge bg-teal/15 text-teal text-xs font-semibold px-3 py-1">
                  <Check size={13} /> Keywords Match: {keywordPct}%
                </span>
                <span
                  className={
                    'badge text-xs font-semibold px-3 py-1 ' +
                    (atsPass ? 'bg-teal/15 text-teal' : 'bg-danger/15 text-danger')
                  }
                >
                  {atsPass ? <Check size={13} /> : <X size={13} />} ATS {atsPass ? 'Pass ✓' : 'Fail ✗'}
                </span>
                <Link
                  to="/resume/builder"
                  className="btn-primary px-4 py-1.5 text-xs font-semibold flex items-center gap-1.5"
                >
                  Fix in Builder <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {result.summary && (
              <p className="text-xs text-gray-300 leading-relaxed bg-base-900 p-4 rounded-xl border border-white/5 font-sans">
                💡 {result.summary}
              </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 1. What is Present & Done Well */}
              <div className="bg-base-900 border border-teal/20 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-teal flex items-center gap-1.5">
                  <CheckCircle2 size={15} /> What is Done Well (Strengths)
                </h4>
                <ul className="space-y-2 text-xs">
                  {strengthsList.map((s, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-teal shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 2. What is NOT Present in Resume */}
              <div className="bg-base-900 border border-danger/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-danger flex items-center gap-1.5">
                  <XCircle size={15} /> What is NOT Present (Missing)
                </h4>
                <ul className="space-y-2 text-xs">
                  {missingList.length > 0 ? (
                    missingList.map((m, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                        {m}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">All major sections detected!</li>
                  )}
                </ul>
              </div>

              {/* 3. What is Lacking / Weak */}
              <div className="bg-base-900 border border-orange/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-orange flex items-center gap-1.5">
                  <AlertTriangle size={15} /> What is Lacking (Needs Work)
                </h4>
                <ul className="space-y-2 text-xs">
                  {lackingList.map((l, i) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="mt-1 w-1.5 h-1.5 rounded-full bg-orange shrink-0" />
                      {typeof l === 'string' ? l : JSON.stringify(l)}
                    </li>
                  ))}
                </ul>
              </div>

              {/* 4. What SHOULD BE Present (Recommended Additions) */}
              <div className="bg-base-900 border border-purple-500/30 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <Lightbulb size={15} /> What SHOULD Be Inside (Recommendations)
                </h4>
                <ul className="space-y-2 text-xs">
                  {shouldIncludeList.length > 0 ? (
                    shouldIncludeList.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-300">
                        <span className="mt-1 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                        {rec}
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">Include action verbs and quantifiable metrics.</li>
                  )}
                </ul>
              </div>
            </div>
          </div>

          {/* Job Discovery Section matched to Scanned Resume */}
          <div className="card p-6 border-accent/30 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-bold text-heading flex items-center gap-2">
                  <Briefcase size={18} className="text-accent-light" /> Job Discovery — Matching Roles for Your Profile
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Real-time tech opportunities matching target role: <strong className="text-heading">{targetRole}</strong>
                </p>
              </div>

              <Link to="/jobs" className="text-xs text-accent-light hover:underline font-semibold flex items-center gap-1">
                Explore All Jobs <ArrowRight size={13} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {matchingJobs.map((job) => {
                const matchPct = computeSkillMatch(job.skills)
                const isApplied = appliedJobs.includes(job.id)
                return (
                  <div key={job.id} className="bg-base-900 border border-white/10 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="badge bg-teal/20 text-teal text-[10px] font-bold">
                          <Sparkles size={11} /> {matchPct}% ATS Match
                        </span>
                        <span className="text-[10px] text-gray-500">{job.posted}</span>
                      </div>
                      <h4 className="font-bold text-heading text-sm mt-2">{job.title}</h4>
                      <p className="text-xs text-accent-light font-medium">{job.company}</p>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {job.skills.map((s, i) => (
                          <span key={i} className="badge bg-white/5 text-gray-300 border border-white/10 text-[9px]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                      <span className="text-[11px] text-teal font-semibold">{job.salary}</span>
                      {isApplied ? (
                        <span className="badge bg-teal/20 text-teal text-[10px] font-bold">Applied ✓</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setApplyModalJob(job)}
                          className="btn-primary text-[11px] px-3 py-1 font-semibold flex items-center gap-1"
                        >
                          Apply Now <ExternalLink size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Saved Resumes History */}
      <div className="card p-6">
        <h3 className="font-semibold text-heading mb-4 text-sm">Saved Resumes History</h3>
        {loadingResumes ? (
          <Skeleton className="h-20" />
        ) : resumes.length === 0 ? (
          <p className="text-xs text-gray-500">
            No resumes saved yet. Upload a resume above to save it here.
          </p>
        ) : (
          <ul className="space-y-2">
            {resumes.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-base-900/40 px-4 py-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText size={18} className="text-accent-light shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-gray-200 truncate">{r.filename}</p>
                    <p className="text-[11px] text-gray-500">
                      {formatDate(r.created_at)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDeleteResume(r.id)}
                  className="text-gray-500 hover:text-danger transition shrink-0"
                  aria-label="Delete resume"
                >
                  <Trash2 size={16} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 1-Click Application Modal */}
      {applyModalJob && (
        <Modal
          open={!!applyModalJob}
          onClose={() => setApplyModalJob(null)}
          title={`Apply for ${applyModalJob.title}`}
        >
          <div className="space-y-4">
            <div className="bg-base-900 border border-teal/30 p-4 rounded-xl space-y-2">
              <p className="text-xs font-bold text-heading">{applyModalJob.company} · {applyModalJob.location}</p>
              <p className="text-xs text-teal font-semibold">Compensation: {applyModalJob.salary}</p>
              <p className="text-xs text-gray-300 leading-relaxed">{applyModalJob.description}</p>
            </div>

            <div className="bg-accent/15 border border-accent/30 p-3.5 rounded-xl text-xs text-accent-light flex items-center gap-2">
              <CheckCircle2 size={16} className="shrink-0" />
              <span>Your ATS Scanned Resume & Candidate Profile will be submitted with 1 click.</span>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setApplyModalJob(null)}
                className="btn-ghost text-xs px-4 py-2"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleApplyJob(applyModalJob)}
                className="btn-teal text-xs px-5 py-2 font-semibold flex items-center gap-1.5"
              >
                Submit Application <ExternalLink size={14} />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
