import { useState } from 'react'
import {
  User,
  GraduationCap,
  Target,
  Brain,
  FileText,
  Edit2,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'
import { useAuth } from '../context/AuthContext'

export default function Profile() {
  const { user, profile } = useAuth()
  const [modalOpen, setModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: profile?.full_name || user?.user_metadata?.full_name || 'Alex Kumar',
    usn: profile?.usn || user?.user_metadata?.usn || '1MS22CS001',
    degree: 'B.E. Computer Science',
    college: 'VTU Technological University',
    targetRole: 'Full Stack Engineer',
  })

  return (
    <AppShell>
      <PageHeader
        icon={User}
        title="Student Profile & Career Goal"
        subtitle="Manage your personal background, education, and target career goal"
        actions={
          <button onClick={() => setModalOpen(true)} className="btn-primary text-xs flex items-center gap-2">
            <Edit2 size={14} /> Edit Profile
          </button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="card p-6 flex flex-col items-center text-center space-y-4">
          <div className="w-24 h-24 rounded-full bg-gradient-purple shadow-glow-purple flex items-center justify-center text-white text-3xl font-extrabold">
            {(formData.name || 'U').charAt(0)}
          </div>
          <div>
            <h2 className="text-xl font-bold text-heading">{formData.name}</h2>
            <p className="text-xs text-accent-light mt-0.5">{formData.usn}</p>
            <p className="text-xs text-gray-400 mt-1">{user?.email || 'user@example.com'}</p>
          </div>

          <div className="w-full pt-4 border-t border-white/10 text-left space-y-2 text-xs">
            <div className="flex items-center justify-between text-gray-400">
              <span>Account Type:</span>
              <span className="badge bg-teal/15 text-teal font-semibold">Student</span>
            </div>
            <div className="flex items-center justify-between text-gray-400">
              <span>Status:</span>
              <span className="text-teal font-medium">Active Student</span>
            </div>
          </div>
        </div>

        {/* Details & Target Goal */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
              <GraduationCap size={18} className="text-teal" /> Academic & Target Role Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="bg-base-900 border border-white/5 rounded-xl p-4">
                <p className="text-gray-500 uppercase tracking-wider text-[10px]">Degree / Major</p>
                <p className="font-bold text-heading mt-1 text-sm">{formData.degree}</p>
              </div>

              <div className="bg-base-900 border border-white/5 rounded-xl p-4">
                <p className="text-gray-500 uppercase tracking-wider text-[10px]">University / College</p>
                <p className="font-bold text-heading mt-1 text-sm">{formData.college}</p>
              </div>

              <div className="bg-base-900 border border-white/5 rounded-xl p-4 sm:col-span-2">
                <p className="text-gray-500 uppercase tracking-wider text-[10px]">Target Career Goal</p>
                <p className="font-bold text-accent-light mt-1 text-base flex items-center gap-2">
                  <Target size={18} /> {formData.targetRole}
                </p>
              </div>
            </div>
          </div>

          {/* Tracked Skills Summary */}
          <div className="card p-6 space-y-3">
            <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
              <Brain size={18} className="text-purple-400" /> Active Verified Skills
            </h3>
            <div className="flex flex-wrap gap-2 pt-1">
              {['React', 'JavaScript', 'TypeScript', 'Node.js', 'SQL', 'Tailwind CSS'].map((s) => (
                <span key={s} className="badge bg-purple-500/15 text-purple-300 border border-purple-500/30 text-xs px-3 py-1">
                  <CheckCircle2 size={12} /> {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {modalOpen && (
        <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Edit Profile Details">
          <form
            onSubmit={(e) => {
              e.preventDefault()
              setModalOpen(false)
            }}
            className="space-y-4"
          >
            <div>
              <label className="label">Full Name</label>
              <input
                className="input text-xs"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">USN</label>
              <input
                className="input text-xs"
                value={formData.usn}
                onChange={(e) => setFormData({ ...formData, usn: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Degree</label>
              <input
                className="input text-xs"
                value={formData.degree}
                onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Target Career Goal</label>
              <input
                className="input text-xs"
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost text-xs">
                Cancel
              </button>
              <button type="submit" className="btn-primary text-xs px-5">
                Save Profile
              </button>
            </div>
          </form>
        </Modal>
      )}
    </AppShell>
  )
}
