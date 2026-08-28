import { useState } from 'react'
import {
  Shield,
  LogOut,
  Users,
  Video,
  BookOpen,
  HelpCircle,
  ClipboardList,
  ArrowUpRight,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from '../components/Logo'
import { Moon, Sun } from 'lucide-react'
import { Spinner, Skeleton, ErrorState, EmptyState } from '../components/Feedback'
import {
  getAdminSummary,
  getStudents,
  getInterviews,
  getMaterials,
  getQuizzes,
  getAssignments,
  getPerformance,
} from '../api/admin'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'students', label: 'Students' },
  { key: 'interviews', label: 'Interviews' },
  { key: 'materials', label: 'Materials' },
  { key: 'quizzes', label: 'Quizzes' },
  { key: 'assignments', label: 'Assignments' },
  { key: 'performance', label: 'Performance' },
]

function AdminShell({ children }) {
  const { logout } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const navigate = useNavigate()
  return (
    <div className="min-h-screen flex">
      <aside className="fixed inset-y-0 left-0 w-60 bg-base-850 border-r border-white/5 flex flex-col">
        <div className="flex items-center gap-3 px-5 py-5">
          <Logo size={42} withWordmark subtitle="Admin" />
        </div>
        <nav className="px-3">
          <div className="nav-item nav-item-active">
            <Shield size={18} />
            <span>Admin</span>
          </div>
        </nav>
        <div className="mt-auto p-3">
          <button
            onClick={() => {
              logout()
              navigate('/login')
            }}
            className="nav-item w-full text-left hover:text-danger"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>
      <div className="pl-60 flex-1">
        <header className="flex items-center justify-between px-8 h-16 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-purple">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-heading font-semibold leading-tight">Admin Portal</h1>
              <p className="text-xs text-gray-500">Manage students, interviews, and learning content</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-400 hover:text-heading hover:bg-white/5 transition"
            title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
            aria-label="Toggle theme"
          >
            {isLight ? <Moon size={16} /> : <Sun size={16} />}
          </button>
        </header>
        <main className="p-8">{children}</main>
      </div>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, color }) {
  const colors = {
    purple: 'bg-gradient-purple',
    teal: 'bg-teal',
    blue: 'bg-blue',
    orange: 'bg-orange',
    danger: 'bg-danger',
  }
  return (
    <div className="card p-5">
      <div className={'flex items-center justify-center w-11 h-11 rounded-xl ' + (colors[color] || colors.purple)}>
        <Icon size={20} className="text-white" />
      </div>
      <p className="mt-4 text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </div>
  )
}

function useList(fetcher) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const reload = () => {
    setLoading(true)
    fetcher()
      .then((res) => setData(res.data))
      .catch((e) => setError(e.userMessage || 'Failed to load'))
      .finally(() => setLoading(false))
  }
  useEffect(() => reload(), []) // eslint-disable-line
  return { data, loading, error, reload }
}

function ListStub({ fetcher, emptyText, columns }) {
  const { data, loading, error } = useList(fetcher)
  if (loading) return <Skeleton className="h-40" />
  if (error) return <ErrorState message={error} />
  const rows = data?.items || data?.data || data || []
  if (!rows.length)
    return (
      <EmptyState icon={HelpCircle} title="Nothing here yet" caption={emptyText} />
    )
  return (
    <div className="card divide-y divide-white/5">
      {rows.map((r, i) => (
        <div key={i} className="p-4 flex items-center justify-between">
          <div>
            <p className="text-sm text-heading font-medium">{r.name || r.title || r.student || 'Item'}</p>
            {r.subtitle && <p className="text-xs text-gray-500">{r.subtitle}</p>}
          </div>
          {r.meta && <span className="text-xs text-gray-400">{r.meta}</span>}
        </div>
      ))}
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  useEffect(() => {
    getAdminSummary()
      .then((res) => setSummary(res.data))
      .catch(() => {})
      .finally(() => setSummaryLoading(false))
  }, []) // eslint-disable-line

  const stats = [
    { icon: Users, label: 'Students', value: summary?.students ?? '—', color: 'purple' },
    { icon: Video, label: 'Interviews', value: summary?.interviews ?? '—', color: 'teal' },
    { icon: BookOpen, label: 'Materials', value: summary?.materials ?? '—', color: 'blue' },
    { icon: HelpCircle, label: 'Quizzes', value: summary?.quizzes ?? '—', color: 'orange' },
    { icon: ClipboardList, label: 'Assignments', value: summary?.assignments ?? '—', color: 'danger' },
  ]

  const fetchers = {
    students: getStudents,
    interviews: getInterviews,
    materials: getMaterials,
    quizzes: getQuizzes,
    assignments: getAssignments,
    performance: getPerformance,
  }

  return (
    <AdminShell>
      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={
              'px-4 py-2 rounded-xl text-sm font-medium transition ' +
              (tab === t.key
                ? 'bg-gradient-purple text-white shadow-glow-purple'
                : 'bg-white/5 text-gray-400 hover:text-heading')
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            {summaryLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28" />)
              : stats.map((s) => <StatTile key={s.label} {...s} />)}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
            <div className="card p-6">
              <h3 className="font-semibold text-heading mb-3">Upcoming Interviews</h3>
              <ListStub
                fetcher={getInterviews}
                emptyText="No upcoming interviews scheduled."
              />
            </div>
            <div className="card p-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-heading">Recent Students</h3>
                <ArrowUpRight size={16} className="text-gray-500" />
              </div>
              {summaryLoading ? (
                <Skeleton className="h-32" />
              ) : (
                <ListStub fetcher={getStudents} emptyText="No students yet." />
              )}
            </div>
          </div>
        </>
      )}

      {tab === 'interviews' && <ListStub fetcher={fetchers.interviews} emptyText="No interviews." />}
      {tab === 'materials' && <ListStub fetcher={fetchers.materials} emptyText="No materials." />}
      {tab === 'quizzes' && <ListStub fetcher={fetchers.quizzes} emptyText="No quizzes." />}
      {tab === 'assignments' && <ListStub fetcher={fetchers.assignments} emptyText="No assignments." />}
      {tab === 'performance' && <ListStub fetcher={fetchers.performance} emptyText="No performance data." />}
      {tab === 'students' && <ListStub fetcher={fetchers.students} emptyText="No students yet." />}
    </AdminShell>
  )
}
