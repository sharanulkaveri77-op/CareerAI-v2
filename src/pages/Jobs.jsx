import { useState, useEffect } from 'react'
import {
  Search,
  MapPin,
  Briefcase,
  DollarSign,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Bookmark,
  Sparkles,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { Spinner } from '../components/Feedback'
import { SAMPLE_JOBS, searchJobs, computeSkillMatch } from '../api/jobs'
import { addApplication } from '../api/applications'

export default function Jobs() {
  const [query, setQuery] = useState('')
  const [location, setLocation] = useState('')
  const [jobs, setJobs] = useState(SAMPLE_JOBS)
  const [searching, setSearching] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [savedJobIds, setSavedJobIds] = useState([])
  const [applied, setApplied] = useState(false)

  const handleSearch = async (e) => {
    e?.preventDefault()
    setSearching(true)
    try {
      const results = await searchJobs({ query, location })
      setJobs(results.length ? results : SAMPLE_JOBS)
    } catch {
      setJobs(SAMPLE_JOBS)
    } finally {
      setSearching(false)
    }
  }

  const toggleSaveJob = (id) => {
    setSavedJobIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  return (
    <AppShell>
      <PageHeader
        icon={Briefcase}
        title="Job Discovery & Skill Matching"
        subtitle="Explore curated tech opportunities matched directly to your skill profile"
      />

      {/* Search & Filter Bar */}
      <form onSubmit={handleSearch} className="card p-4 mb-6 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-10 text-xs"
            placeholder="Search role title, company, or tech skill (e.g. 'React', 'AI', 'Node.js')..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="relative w-full sm:w-60">
          <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input pl-10 text-xs"
            placeholder="Location / Remote"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <button type="submit" disabled={searching} className="btn-primary text-xs px-6 py-2.5">
          {searching ? <Spinner size={14} /> : 'Search Jobs'}
        </button>
      </form>

      {/* Job cards list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => {
          const matchScore = computeSkillMatch(job.skills)
          const isSaved = savedJobIds.includes(job.id)
          return (
            <div key={job.id} className="card card-hover p-5 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="badge bg-teal/15 text-teal text-[10px] font-bold">
                      <Sparkles size={11} /> {matchScore}% Skill Match
                    </span>
                    <h3 className="font-bold text-heading text-base mt-1">{job.title}</h3>
                    <p className="text-xs text-accent-light font-medium">{job.company}</p>
                  </div>
                  <button
                    onClick={() => toggleSaveJob(job.id)}
                    className={
                      'p-2 rounded-lg transition ' +
                      (isSaved ? 'text-accent-light bg-accent/20' : 'text-gray-500 hover:text-heading')
                    }
                  >
                    <Bookmark size={18} />
                  </button>
                </div>

                <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                  {job.description}
                </p>

                <div className="flex flex-wrap items-center gap-2 mt-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <MapPin size={13} className="text-gray-500" /> {job.location}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <Briefcase size={13} className="text-gray-500" /> {job.experience}
                  </span>
                  <span>·</span>
                  <span className="flex items-center gap-1 text-teal font-medium">
                    <DollarSign size={13} /> {job.salary}
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mt-4">
                  {job.skills.map((s, i) => (
                    <span key={i} className="badge bg-white/5 text-gray-300 border border-white/10 text-[10px]">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                <span className="text-[11px] text-gray-500">{job.posted}</span>
                <button
                  onClick={() => {
                    setSelectedJob(job)
                    setApplied(false)
                  }}
                  className="btn-primary px-4 py-1.5 text-xs font-semibold"
                >
                  View Details
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Job Details Modal */}
      {selectedJob && (
        <Modal
          open={!!selectedJob}
          onClose={() => setSelectedJob(null)}
          title={selectedJob.title}
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-accent-light">{selectedJob.company}</p>
                <p className="text-xs text-gray-400">{selectedJob.location}</p>
              </div>
              <span className="badge bg-teal/20 text-teal text-xs font-bold">
                {computeSkillMatch(selectedJob.skills)}% Match Score
              </span>
            </div>

            <div className="bg-base-900 border border-white/5 rounded-xl p-4 text-xs text-gray-300 leading-relaxed">
              <h4 className="font-semibold text-heading mb-1 text-sm">Role Description</h4>
              <p>{selectedJob.description}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-2">
                Required Tech Stack
              </p>
              <div className="flex flex-wrap gap-2">
                {selectedJob.skills.map((s, i) => (
                  <span key={i} className="badge bg-accent/15 text-accent-light border border-accent/30 text-xs">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-xs text-teal font-semibold">{selectedJob.salary}</span>
              {applied ? (
                <span className="badge bg-teal/20 text-teal text-xs px-4 py-2 font-bold flex items-center gap-1">
                  <CheckCircle2 size={14} /> Application Submitted!
                </span>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      await addApplication({
                        company: selectedJob.company,
                        role: selectedJob.title,
                        location: selectedJob.location,
                        status: 'Applied',
                        applied_at: new Date().toISOString().split('T')[0],
                      })
                    } catch {
                      /* non-fatal */
                    }
                    setApplied(true)
                  }}
                  className="btn-teal px-6 py-2 text-xs font-semibold flex items-center gap-1.5"
                >
                  Apply Now <ExternalLink size={14} />
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
