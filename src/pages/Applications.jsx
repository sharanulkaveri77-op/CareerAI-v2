import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FolderKanban,
  Plus,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Calendar,
  Building2,
  MapPin,
  CheckCircle2,
  X,
  FileText,
  Briefcase,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import Modal from '../components/Modal'
import { Skeleton, ErrorState } from '../components/Feedback'
import {
  getApplications,
  addApplication,
  updateApplication,
  deleteApplication,
} from '../api/applications'

const STATUS_OPTIONS = ['Saved', 'Applied', 'Assessment', 'Interview', 'Offer', 'Rejected']

const STATUS_COLORS = {
  Saved: 'bg-gray-500/10 text-gray-400 border-gray-500/20',
  Applied: 'bg-blue/10 text-blue border-blue/20',
  Assessment: 'bg-orange/10 text-orange border-orange/20',
  Interview: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  Offer: 'bg-teal/10 text-teal border-teal/20',
  Rejected: 'bg-danger/10 text-danger border-danger/20',
}

export default function Applications() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('All')

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingApp, setEditingApp] = useState(null)
  const [form, setForm] = useState({
    company: '',
    role: '',
    location: '',
    job_url: '',
    status: 'Applied',
    applied_at: new Date().toISOString().split('T')[0],
    deadline: '',
    notes: '',
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const data = await getApplications()
      setApplications(data || [])
    } catch {
      setError('Could not load applications')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenAdd = () => {
    setEditingApp(null)
    setForm({
      company: '',
      role: 'Full Stack Engineer',
      location: 'Remote / Hybrid',
      job_url: '',
      status: 'Applied',
      applied_at: new Date().toISOString().split('T')[0],
      deadline: '',
      notes: '',
    })
    setShowModal(true)
  }

  const handleOpenEdit = (app) => {
    setEditingApp(app)
    setForm({
      company: app.company || '',
      role: app.role || '',
      location: app.location || '',
      job_url: app.job_url || '',
      status: app.status || 'Applied',
      applied_at: app.applied_at || new Date().toISOString().split('T')[0],
      deadline: app.deadline || '',
      notes: app.notes || '',
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.company.trim() || !form.role.trim()) return

    if (editingApp) {
      const updated = await updateApplication(editingApp.id, form)
      setApplications((prev) => prev.map((a) => (a.id === editingApp.id ? { ...a, ...updated } : a)))
    } else {
      const created = await addApplication(form)
      setApplications((prev) => [created, ...prev])
    }

    setShowModal(false)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application record?')) return
    await deleteApplication(id)
    setApplications((prev) => prev.filter((a) => a.id !== id))
  }

  // Filtered applications list
  const filteredApps = applications.filter((app) => {
    const matchesTab = activeTab === 'All' || app.status === activeTab
    const q = searchQuery.toLowerCase().trim()
    const matchesQuery =
      !q ||
      app.company.toLowerCase().includes(q) ||
      app.role.toLowerCase().includes(q) ||
      (app.location && app.location.toLowerCase().includes(q))
    return matchesTab && matchesQuery
  })

  // Summary counts
  const counts = {
    Saved: applications.filter((a) => a.status === 'Saved').length,
    Applied: applications.filter((a) => a.status === 'Applied').length,
    Interviews: applications.filter((a) => a.status === 'Interview').length,
    Offers: applications.filter((a) => a.status === 'Offer').length,
  }

  return (
    <AppShell>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-white/5">
        <div>
          <h1 className="text-2xl font-bold text-heading flex items-center gap-2">
            <FolderKanban className="text-accent-light" size={24} /> Applications
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Track where you applied, interview status, and next deadlines.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="btn-primary text-xs font-semibold px-4 py-2.5 flex items-center gap-2 shrink-0"
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-xl border border-white/5 bg-base-900/80">
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Saved</p>
          <p className="text-2xl font-extrabold text-heading mt-1">{counts.Saved}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-base-900/80">
          <p className="text-[11px] font-semibold text-blue uppercase tracking-wider">Applied</p>
          <p className="text-2xl font-extrabold text-heading mt-1">{counts.Applied}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-base-900/80">
          <p className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Interviews</p>
          <p className="text-2xl font-extrabold text-heading mt-1">{counts.Interviews}</p>
        </div>
        <div className="p-4 rounded-xl border border-white/5 bg-base-900/80">
          <p className="text-[11px] font-semibold text-teal uppercase tracking-wider">Offers</p>
          <p className="text-2xl font-extrabold text-heading mt-1">{counts.Offers}</p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
          {['All', ...STATUS_OPTIONS].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={
                'px-3 py-1.5 rounded-lg text-xs font-medium transition border ' +
                (activeTab === tab
                  ? 'bg-accent/15 text-accent-light border-accent/30 font-semibold'
                  : 'bg-base-900/80 text-gray-400 border-white/5 hover:border-white/10 hover:text-white')
              }
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            className="input text-xs pl-8 py-2 w-full"
            placeholder="Search company or role..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Applications Content Table / Cards */}
      {loading ? (
        <Skeleton className="h-64" />
      ) : error ? (
        <ErrorState message={error} />
      ) : filteredApps.length === 0 ? (
        <div className="text-center py-16 px-4 border border-dashed border-white/10 rounded-2xl bg-base-900/40">
          <FolderKanban size={36} className="mx-auto text-gray-600 mb-3" />
          <h3 className="text-sm font-bold text-heading">
            {searchQuery || activeTab !== 'All' ? 'No applications found' : 'Start your job search'}
          </h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            {searchQuery || activeTab !== 'All'
              ? 'No applications match your filter or search query.'
              : 'Find roles that match your skills and track every application in one place.'}
          </p>
          <div className="flex items-center justify-center gap-3 mt-5">
            <button
              onClick={() => navigate('/jobs')}
              className="btn-primary text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5"
            >
              <Briefcase size={14} /> Find Jobs
            </button>
            <button
              onClick={handleOpenAdd}
              className="btn-ghost text-xs font-semibold px-4 py-2 inline-flex items-center gap-1.5"
            >
              <Plus size={14} /> Add Application
            </button>
          </div>
        </div>
      ) : (
        <div className="border border-white/10 rounded-2xl bg-base-900/90 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-base-950/60 border-b border-white/5 text-gray-400 font-semibold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="py-3 px-4">Company & Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Applied Date</th>
                  <th className="py-3 px-4">Deadline</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredApps.map((app) => (
                  <tr key={app.id} className="hover:bg-base-850/50 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-base-800 border border-white/5 flex items-center justify-center text-gray-300 font-bold shrink-0">
                          {app.company[0]?.toUpperCase() || 'C'}
                        </div>
                        <div>
                          <p className="font-semibold text-heading text-xs flex items-center gap-1.5">
                            {app.company}
                            {app.job_url && (
                              <a
                                href={app.job_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-gray-500 hover:text-accent-light transition"
                                title="Open Job URL"
                              >
                                <ExternalLink size={12} />
                              </a>
                            )}
                          </p>
                          <p className="text-[11px] text-gray-400">{app.role}</p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={
                          'inline-block px-2.5 py-0.5 rounded text-[11px] font-medium border ' +
                          (STATUS_COLORS[app.status] || STATUS_COLORS.Applied)
                        }
                      >
                        {app.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {app.applied_at || 'Not set'}
                    </td>

                    <td className="py-3.5 px-4 text-gray-400 font-mono">
                      {app.deadline ? (
                        <span className="text-orange">{app.deadline}</span>
                      ) : (
                        <span className="text-gray-600">-</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(app)}
                          className="p-1.5 rounded-lg border border-white/5 hover:border-white/20 text-gray-400 hover:text-white transition"
                          title="Edit application"
                        >
                          <Edit2 size={13} />
                        </button>
                        <button
                          onClick={() => handleDelete(app.id)}
                          className="p-1.5 rounded-lg border border-white/5 hover:border-danger/30 text-gray-400 hover:text-danger transition"
                          title="Delete application"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Application Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title={editingApp ? 'Edit Job Application' : 'Add New Job Application'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Company Name *</label>
            <input
              className="input text-xs"
              placeholder="e.g. Google, Razorpay, Infosys"
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="label">Role Title *</label>
            <input
              className="input text-xs"
              placeholder="e.g. Frontend Engineer, Full Stack Developer"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Status</label>
              <select
                className="input text-xs font-medium"
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st}>{st}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Location</label>
              <input
                className="input text-xs"
                placeholder="e.g. Remote, Bangalore"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Applied Date</label>
              <input
                type="date"
                className="input text-xs"
                value={form.applied_at}
                onChange={(e) => setForm({ ...form, applied_at: e.target.value })}
              />
            </div>

            <div>
              <label className="label">Deadline (Optional)</label>
              <input
                type="date"
                className="input text-xs"
                value={form.deadline}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="label">Job Listing URL (Optional)</label>
            <input
              type="url"
              className="input text-xs"
              placeholder="https://..."
              value={form.job_url}
              onChange={(e) => setForm({ ...form, job_url: e.target.value })}
            />
          </div>

          <div>
            <label className="label">Notes / Referral Info (Optional)</label>
            <textarea
              rows={2}
              className="input text-xs"
              placeholder="Recruiter contact, referral status, or preparation notes..."
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="btn-ghost text-xs px-4 py-2"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary text-xs font-semibold px-5 py-2">
              {editingApp ? 'Save Changes' : 'Add Application'}
            </button>
          </div>
        </form>
      </Modal>
    </AppShell>
  )
}
