import { useState, useEffect, useMemo } from 'react'
import {
  Shield,
  LogOut,
  Users,
  Video,
  BookOpen,
  HelpCircle,
  ClipboardList,
  Plus,
  Search,
  Filter,
  Trash2,
  ExternalLink,
  Calendar,
  CheckCircle2,
  Clock,
  Award,
  TrendingUp,
  X,
  FileText,
  Sparkles,
  BarChart2,
  ChevronRight,
  Sun,
  Moon,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Logo from '../components/Logo'
import { Spinner, Skeleton, EmptyState } from '../components/Feedback'
import {
  getAdminSummary,
  getStudents,
  getInterviews,
  getMaterials,
  getQuizzes,
  getAssignments,
  getPerformance,
  addMaterial,
  deleteMaterial,
  createQuiz,
  deleteQuiz,
  scheduleInterview,
  createAssignment,
  deleteAssignment,
} from '../api/admin'

const TABS = [
  { key: 'overview', label: 'Overview', icon: BarChart2 },
  { key: 'students', label: 'Students', icon: Users },
  { key: 'interviews', label: 'Interviews', icon: Video },
  { key: 'materials', label: 'Materials', icon: BookOpen },
  { key: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { key: 'assignments', label: 'Assignments', icon: ClipboardList },
  { key: 'performance', label: 'Performance', icon: TrendingUp },
]

function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="card w-full max-w-lg p-6 relative bg-base-850 border border-white/10 shadow-2xl">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-white/5">
          <h3 className="text-lg font-bold text-heading">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-gray-400 hover:text-heading hover:bg-white/5 transition"
          >
            <X size={18} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

function AdminShell({ children, onOpenAction }) {
  const { logout } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen flex bg-base-900 text-gray-200">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 bg-base-850 border-r border-white/5 flex flex-col z-30">
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <Logo size={40} withWordmark subtitle="Admin Portal" />
        </div>

        <div className="p-4">
          <button
            onClick={() => onOpenAction('material')}
            className="w-full btn-primary flex items-center justify-center gap-2 py-2.5 text-sm font-medium shadow-glow-purple"
          >
            <Plus size={16} /> Quick Action
          </button>
        </div>

        <nav className="px-3 space-y-1 py-2 flex-1">
          {TABS.map((t) => {
            const Icon = t.icon
            return (
              <div
                key={t.key}
                className="hidden" // Handled by inline tabs in main view
              />
            )
          })}
          <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Management
          </div>
          <div className="nav-item nav-item-active">
            <Shield size={18} />
            <span>Admin Control Panel</span>
          </div>
        </nav>

        <div className="p-4 border-t border-white/5 space-y-2">
          <button
            onClick={toggleTheme}
            className="nav-item w-full text-left justify-between"
          >
            <span className="flex items-center gap-2">
              {isLight ? <Sun size={18} /> : <Moon size={18} />} Theme Mode
            </span>
            <span className="text-xs text-gray-400 capitalize">{isLight ? 'Light' : 'Dark'}</span>
          </button>
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

      {/* Main Content Area */}
      <div className="pl-64 flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between px-8 h-16 bg-base-900/80 backdrop-blur-md border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-purple">
              <Shield size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-heading leading-tight">CareerAI Administration</h1>
              <p className="text-xs text-gray-400">Placement cell & curriculum management portal</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAction('interview')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-heading border border-white/10 transition flex items-center gap-1.5"
            >
              <Video size={14} className="text-purple" /> Schedule Interview
            </button>
            <button
              onClick={() => onOpenAction('quiz')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-heading border border-white/10 transition flex items-center gap-1.5"
            >
              <HelpCircle size={14} className="text-teal" /> Create Quiz
            </button>
            <button
              onClick={() => onOpenAction('assignment')}
              className="px-3 py-1.5 rounded-xl text-xs font-medium bg-white/5 hover:bg-white/10 text-heading border border-white/10 transition flex items-center gap-1.5"
            >
              <ClipboardList size={14} className="text-orange" /> Create Assignment
            </button>
          </div>
        </header>

        <main className="p-8 flex-1 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  )
}

function StatTile({ icon: Icon, label, value, color, change }) {
  const colors = {
    purple: 'bg-purple/20 text-purple border-purple/30',
    teal: 'bg-teal/20 text-teal border-teal/30',
    blue: 'bg-blue/20 text-blue border-blue/30',
    orange: 'bg-orange/20 text-orange border-orange/30',
    danger: 'bg-danger/20 text-danger border-danger/30',
  }
  return (
    <div className="card p-5 border border-white/5 hover:border-white/10 transition shadow-sm">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl border ${colors[color] || colors.purple}`}>
          <Icon size={20} />
        </div>
        {change && (
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-teal/10 text-teal border border-teal/20">
            {change}
          </span>
        )}
      </div>
      <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">{label}</p>
      <p className="mt-1 text-2xl font-bold text-heading">{value}</p>
    </div>
  )
}

export default function Admin() {
  const [tab, setTab] = useState('overview')
  const [summary, setSummary] = useState(null)
  const [summaryLoading, setSummaryLoading] = useState(true)

  // Data lists state
  const [students, setStudents] = useState([])
  const [interviews, setInterviews] = useState([])
  const [materials, setMaterials] = useState([])
  const [quizzes, setQuizzes] = useState([])
  const [assignments, setAssignments] = useState([])
  const [performance, setPerformance] = useState(null)
  const [loadingList, setLoadingList] = useState(false)

  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('All')

  // Modals state
  const [activeModal, setActiveModal] = useState(null) // 'material' | 'interview' | 'quiz' | 'assignment' | 'student'
  const [selectedStudent, setSelectedStudent] = useState(null)

  // Form states
  const [materialForm, setMaterialForm] = useState({ title: '', category: 'DSA', type: 'PDF', url: '' })
  const [interviewForm, setInterviewForm] = useState({
    student_name: '',
    usn: '',
    type: 'AI Mock',
    role: 'Full Stack Engineer',
    scheduled_at: '',
    interviewer: 'AI Copilot Engine',
  })
  const [quizForm, setQuizForm] = useState({
    title: '',
    description: '',
    category: 'DSA',
    duration_mins: 30,
    question_count: 15,
  })
  const [assignmentForm, setAssignmentForm] = useState({
    title: '',
    description: '',
    target_batch: '2025 Batch',
    due_date: '',
  })

  // Load summary & initial tab data
  const loadSummary = async () => {
    setSummaryLoading(true)
    try {
      const res = await getAdminSummary()
      setSummary(res.data)
    } catch {
      /* fallback */
    } finally {
      setSummaryLoading(false)
    }
  }

  const loadTabData = async () => {
    setLoadingList(true)
    try {
      const [st, int, mat, qz, asg, perf] = await Promise.all([
        getStudents(),
        getInterviews(),
        getMaterials(),
        getQuizzes(),
        getAssignments(),
        getPerformance(),
      ])
      setStudents(st.data?.items || [])
      setInterviews(int.data?.items || [])
      setMaterials(mat.data?.items || [])
      setQuizzes(qz.data?.items || [])
      setAssignments(asg.data?.items || [])
      setPerformance(perf.data || null)
    } catch {
      /* fallback */
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    loadSummary()
    loadTabData()
  }, [])

  // Action Handlers
  const handleAddMaterial = async (e) => {
    e.preventDefault()
    if (!materialForm.title) return
    await addMaterial(materialForm)
    setMaterialForm({ title: '', category: 'DSA', type: 'PDF', url: '' })
    setActiveModal(null)
    loadTabData()
    loadSummary()
  }

  const handleDeleteMaterial = async (id) => {
    await deleteMaterial(id)
    loadTabData()
    loadSummary()
  }

  const handleScheduleInterview = async (e) => {
    e.preventDefault()
    if (!interviewForm.student_name) return
    await scheduleInterview(interviewForm)
    setInterviewForm({
      student_name: '',
      usn: '',
      type: 'AI Mock',
      role: 'Full Stack Engineer',
      scheduled_at: '',
      interviewer: 'AI Copilot Engine',
    })
    setActiveModal(null)
    loadTabData()
    loadSummary()
  }

  const handleCreateQuiz = async (e) => {
    e.preventDefault()
    if (!quizForm.title) return
    await createQuiz(quizForm)
    setQuizForm({ title: '', description: '', category: 'DSA', duration_mins: 30, question_count: 15 })
    setActiveModal(null)
    loadTabData()
    loadSummary()
  }

  const handleDeleteQuiz = async (id) => {
    await deleteQuiz(id)
    loadTabData()
    loadSummary()
  }

  const handleCreateAssignment = async (e) => {
    e.preventDefault()
    if (!assignmentForm.title) return
    await createAssignment(assignmentForm)
    setAssignmentForm({ title: '', description: '', target_batch: '2025 Batch', due_date: '' })
    setActiveModal(null)
    loadTabData()
    loadSummary()
  }

  const handleDeleteAssignment = async (id) => {
    await deleteAssignment(id)
    loadTabData()
    loadSummary()
  }

  // Filtered Lists
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchSearch =
        s.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.usn?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.current_role?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchFilter = filterCategory === 'All' || s.status === filterCategory
      return matchSearch && matchFilter
    })
  }, [students, searchQuery, filterCategory])

  const filteredMaterials = useMemo(() => {
    return materials.filter((m) => {
      const matchSearch = m.title?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchFilter = filterCategory === 'All' || m.category === filterCategory
      return matchSearch && matchFilter
    })
  }, [materials, searchQuery, filterCategory])

  const filteredInterviews = useMemo(() => {
    return interviews.filter((i) => {
      const matchSearch =
        i.student_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        i.role?.toLowerCase().includes(searchQuery.toLowerCase())
      const matchFilter = filterCategory === 'All' || i.status === filterCategory
      return matchSearch && matchFilter
    })
  }, [interviews, searchQuery, filterCategory])

  const stats = [
    { icon: Users, label: 'Active Students', value: summary?.students ?? '—', color: 'purple', change: '+12%' },
    { icon: Video, label: 'Mock Interviews', value: summary?.interviews ?? '—', color: 'teal', change: '+24%' },
    { icon: BookOpen, label: 'Study Resources', value: summary?.materials ?? '—', color: 'blue', change: 'New' },
    { icon: HelpCircle, label: 'Active Quizzes', value: summary?.quizzes ?? '—', color: 'orange' },
    { icon: ClipboardList, label: 'Assignments', value: summary?.assignments ?? '—', color: 'danger' },
  ]

  return (
    <AdminShell onOpenAction={(modalName) => setActiveModal(modalName)}>
      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 mb-8 border-b border-white/5 pb-4 overflow-x-auto">
        {TABS.map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => {
                setTab(t.key)
                setSearchQuery('')
                setFilterCategory('All')
              }}
              className={
                'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition whitespace-nowrap ' +
                (tab === t.key
                  ? 'bg-gradient-purple text-white shadow-glow-purple'
                  : 'bg-white/5 text-gray-400 hover:text-heading hover:bg-white/10')
              }
            >
              <Icon size={16} />
              <span>{t.label}</span>
            </button>
          )
        })}
      </div>

      {/* OVERVIEW TAB */}
      {tab === 'overview' && (
        <div className="space-y-8">
          {/* Summary Stat Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {summaryLoading
              ? Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)
              : stats.map((s) => <StatTile key={s.label} {...s} />)}
          </div>

          {/* Performance Trend Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-bold text-heading text-lg">Cohort Readiness & Interview Volume</h3>
                  <p className="text-xs text-gray-400">Average readiness score vs monthly completed interviews</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs text-purple font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple inline-block" /> Avg Score
                  </span>
                  <span className="flex items-center gap-1 text-xs text-teal font-medium">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal inline-block" /> Interviews
                  </span>
                </div>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={performance?.monthlyTrends || []}>
                    <defs>
                      <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                    <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                    <YAxis stroke="#9CA3AF" fontSize={12} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1E1E2D',
                        borderColor: '#ffffff15',
                        borderRadius: '12px',
                        color: '#fff',
                      }}
                    />
                    <Area type="monotone" dataKey="avgScore" stroke="#8B5CF6" strokeWidth={3} fillOpacity={1} fill="url(#scoreGrad)" />
                    <Bar dataKey="interviews" fill="#0D9488" radius={[4, 4, 0, 0]} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Quick Actions Panel */}
            <div className="card p-6 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-heading text-lg mb-1">Quick Management</h3>
                <p className="text-xs text-gray-400 mb-6">Instantly publish content or schedule interviews</p>
                <div className="space-y-3">
                  <button
                    onClick={() => setActiveModal('material')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-blue/20 text-blue">
                        <BookOpen size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">Upload Material</p>
                        <p className="text-xs text-gray-400">PDFs, videos, cheatsheets</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => setActiveModal('interview')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-purple/20 text-purple">
                        <Video size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">Schedule Mock Interview</p>
                        <p className="text-xs text-gray-400">AI or Expert reviewer</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-0.5 transition" />
                  </button>

                  <button
                    onClick={() => setActiveModal('quiz')}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition text-left group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-teal/20 text-teal">
                        <HelpCircle size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">Publish Quiz</p>
                        <p className="text-xs text-gray-400">DSA or System Design</p>
                      </div>
                    </div>
                    <ChevronRight size={16} className="text-gray-500 group-hover:translate-x-0.5 transition" />
                  </button>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 mt-6 flex items-center justify-between text-xs text-gray-400">
                <span>Placement Cell Status:</span>
                <span className="font-semibold text-teal flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active Recruitment Drive
                </span>
              </div>
            </div>
          </div>

          {/* Recent Activity Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-heading">Upcoming Scheduled Interviews</h3>
                <button onClick={() => setTab('interviews')} className="text-xs text-purple hover:underline">
                  View All ({interviews.length})
                </button>
              </div>
              <div className="space-y-3">
                {interviews.slice(0, 4).map((i) => (
                  <div key={i.id} className="p-3.5 rounded-xl bg-white/5 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-heading">{i.student_name}</p>
                      <p className="text-xs text-gray-400">
                        {i.role} · <span className="text-purple font-medium">{i.type}</span>
                      </p>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-purple/10 text-purple font-medium">
                      {new Date(i.scheduled_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-heading">Recent Registered Students</h3>
                <button onClick={() => setTab('students')} className="text-xs text-purple hover:underline">
                  View All ({students.length})
                </button>
              </div>
              <div className="space-y-3">
                {students.slice(0, 4).map((s) => (
                  <div key={s.id} className="p-3.5 rounded-xl bg-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gradient-purple flex items-center justify-center font-bold text-xs text-white">
                        {s.full_name?.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-heading">{s.full_name}</p>
                        <p className="text-xs text-gray-400">{s.usn} · {s.current_role}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold text-teal bg-teal/10 px-2.5 py-1 rounded-full border border-teal/20">
                      Score {s.readiness_score}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STUDENTS TAB */}
      {tab === 'students' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="card p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by Name, USN, or Role..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-sm py-2"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter size={16} className="text-gray-400" />
              {['All', 'Active', 'Placed', 'In Training'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition ' +
                    (filterCategory === cat
                      ? 'bg-purple text-white'
                      : 'bg-white/5 text-gray-400 hover:text-heading')
                  }
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Student Table */}
          {filteredStudents.length === 0 ? (
            <EmptyState icon={Users} title="No students found" caption="Try adjusting your search query or filters." />
          ) : (
            <div className="card overflow-hidden">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5 text-xs text-gray-400 uppercase tracking-wider">
                    <th className="p-4">Student</th>
                    <th className="p-4">USN</th>
                    <th className="p-4">Target Role</th>
                    <th className="p-4">Readiness Score</th>
                    <th className="p-4">DSA Solved</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-white/5 transition">
                      <td className="p-4 font-semibold text-heading flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-purple flex items-center justify-center font-bold text-white text-xs">
                          {s.full_name?.charAt(0)}
                        </div>
                        <div>
                          <p>{s.full_name}</p>
                          <p className="text-xs font-normal text-gray-400">{s.email}</p>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-gray-300 text-xs">{s.usn}</td>
                      <td className="p-4 text-gray-300">{s.current_role}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-white/10 h-2 rounded-full overflow-hidden">
                            <div
                              className="bg-gradient-purple h-full"
                              style={{ width: `${s.readiness_score}%` }}
                            />
                          </div>
                          <span className="font-bold text-heading text-xs">{s.readiness_score}%</span>
                        </div>
                      </td>
                      <td className="p-4 text-gray-300 font-medium">{s.dsa_solved} problems</td>
                      <td className="p-4">
                        <span
                          className={
                            'px-2.5 py-1 rounded-full text-xs font-semibold border ' +
                            (s.status === 'Placed'
                              ? 'bg-teal/10 text-teal border-teal/20'
                              : s.status === 'In Training'
                              ? 'bg-orange/10 text-orange border-orange/20'
                              : 'bg-purple/10 text-purple border-purple/20')
                          }
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => {
                            setSelectedStudent(s)
                            setActiveModal('student')
                          }}
                          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs text-heading font-medium transition border border-white/10"
                        >
                          View Profile
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* INTERVIEWS TAB */}
      {tab === 'interviews' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="relative w-full max-w-xs">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search interviews..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-sm py-2"
              />
            </div>
            <button
              onClick={() => setActiveModal('interview')}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              <Plus size={16} /> Schedule Interview
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredInterviews.map((i) => (
              <div key={i.id} className="card p-5 border border-white/5 hover:border-white/10 transition">
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <Video size={16} className="text-purple" />
                    <span className="font-bold text-heading text-sm">{i.student_name}</span>
                    <span className="text-xs text-gray-400 font-mono">({i.usn})</span>
                  </div>
                  <span
                    className={
                      'px-2.5 py-0.5 rounded-full text-xs font-semibold ' +
                      (i.status === 'Completed'
                        ? 'bg-teal/20 text-teal'
                        : i.status === 'Feedback Pending'
                        ? 'bg-orange/20 text-orange'
                        : 'bg-purple/20 text-purple')
                    }
                  >
                    {i.status}
                  </span>
                </div>
                <div className="space-y-1 text-xs text-gray-300">
                  <p><span className="text-gray-500">Target Role:</span> {i.role}</p>
                  <p><span className="text-gray-500">Session Type:</span> {i.type}</p>
                  <p><span className="text-gray-500">Interviewer:</span> {i.interviewer}</p>
                  <p className="flex items-center gap-1 pt-1 text-gray-400">
                    <Calendar size={13} /> {new Date(i.scheduled_at).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MATERIALS TAB */}
      {tab === 'materials' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search study resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field pl-10 text-sm py-2"
              />
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              {['All', 'DSA', 'System Design', 'Resume', 'HR & Soft Skills', 'Aptitude'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={
                    'px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ' +
                    (filterCategory === cat ? 'bg-purple text-white' : 'bg-white/5 text-gray-400')
                  }
                >
                  {cat}
                </button>
              ))}
              <button
                onClick={() => setActiveModal('material')}
                className="btn-primary flex items-center gap-2 text-xs py-2 px-3 whitespace-nowrap ml-2"
              >
                <Plus size={14} /> Add Resource
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMaterials.map((m) => (
              <div key={m.id} className="card p-5 flex flex-col justify-between group">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue/10 text-blue border border-blue/20">
                      {m.category}
                    </span>
                    <span className="text-xs text-gray-500">{m.type}</span>
                  </div>
                  <h4 className="font-bold text-heading text-base leading-snug mb-2 group-hover:text-purple transition">
                    {m.title}
                  </h4>
                  <p className="text-xs text-gray-400">Published by {m.author} · {m.created_at}</p>
                </div>
                <div className="flex items-center justify-between pt-4 mt-4 border-t border-white/5">
                  <a
                    href={m.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-purple font-semibold hover:underline flex items-center gap-1"
                  >
                    Open Resource <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => handleDeleteMaterial(m.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-danger hover:bg-danger/10 transition"
                    title="Delete Resource"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* QUIZZES TAB */}
      {tab === 'quizzes' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-heading text-lg">Curriculum Quizzes</h3>
            <button
              onClick={() => setActiveModal('quiz')}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              <Plus size={16} /> Create Quiz
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quizzes.map((q) => (
              <div key={q.id} className="card p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-teal/10 text-teal border border-teal/20">
                      {q.category}
                    </span>
                    <span className="text-xs text-teal font-semibold flex items-center gap-1">
                      <CheckCircle2 size={12} /> Active
                    </span>
                  </div>
                  <h4 className="font-bold text-heading text-base mb-2">{q.title}</h4>
                  <p className="text-xs text-gray-400 leading-relaxed mb-4">{q.description}</p>
                </div>
                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="text-xs text-gray-400 space-x-2">
                    <span>{q.question_count} Questions</span>
                    <span>·</span>
                    <span>{q.duration_mins} mins</span>
                  </div>
                  <button
                    onClick={() => handleDeleteQuiz(q.id)}
                    className="p-1.5 rounded-lg text-gray-500 hover:text-danger transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ASSIGNMENTS TAB */}
      {tab === 'assignments' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-heading text-lg">Student Assignments</h3>
            <button
              onClick={() => setActiveModal('assignment')}
              className="btn-primary flex items-center gap-2 text-sm py-2 px-4"
            >
              <Plus size={16} /> Create Assignment
            </button>
          </div>

          <div className="space-y-4">
            {assignments.map((a) => (
              <div key={a.id} className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange/20 text-orange">
                      {a.target_batch}
                    </span>
                    <h4 className="font-bold text-heading text-base">{a.title}</h4>
                  </div>
                  <p className="text-xs text-gray-400">{a.description}</p>
                  <p className="text-xs text-gray-500 pt-1 flex items-center gap-1">
                    <Clock size={12} /> Due: {new Date(a.due_date).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-6 w-full md:w-auto justify-between">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-heading">
                      Submissions: {a.submitted_count}/{a.total_students}
                    </p>
                    <div className="w-32 bg-white/10 h-2 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-orange h-full"
                        style={{ width: `${(a.submitted_count / a.total_students) * 100}%` }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteAssignment(a.id)}
                    className="p-2 rounded-lg text-gray-500 hover:text-danger transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PERFORMANCE ANALYTICS TAB */}
      {tab === 'performance' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card p-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Cohort Average Score</p>
              <p className="text-3xl font-extrabold text-heading mt-2">{performance?.cohortReadinessAvg}%</p>
              <p className="text-xs text-teal mt-1 flex items-center gap-1">
                <TrendingUp size={12} /> Top 10% in Placement Readiness
              </p>
            </div>
            <div className="card p-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Total Students Placed</p>
              <p className="text-3xl font-extrabold text-heading mt-2">{performance?.totalPlaced}</p>
              <p className="text-xs text-purple mt-1">Highest Offer: $120,000 /yr</p>
            </div>
            <div className="card p-6">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-medium">Interviews Completed</p>
              <p className="text-3xl font-extrabold text-heading mt-2">{performance?.interviewsCompletedThisMonth}</p>
              <p className="text-xs text-gray-400 mt-1">This month alone</p>
            </div>
          </div>

          {/* Bar Chart Domain Mastery */}
          <div className="card p-6">
            <h3 className="font-bold text-heading text-lg mb-2">Domain Mastery Breakdown</h3>
            <p className="text-xs text-gray-400 mb-6">Actual student average vs placement target readiness</p>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performance?.domainReadiness || []}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="domain" stroke="#9CA3AF" fontSize={12} />
                  <YAxis stroke="#9CA3AF" fontSize={12} domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1E1E2D',
                      borderColor: '#ffffff15',
                      borderRadius: '12px',
                      color: '#fff',
                    }}
                  />
                  <Bar dataKey="score" name="Actual Score" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" name="Target Readiness" fill="#0D9488" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Material Modal */}
      <Modal
        isOpen={activeModal === 'material'}
        onClose={() => setActiveModal(null)}
        title="Upload Study Material"
      >
        <form onSubmit={handleAddMaterial} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Resource Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Master Class Dynamic Programming"
              value={materialForm.title}
              onChange={(e) => setMaterialForm({ ...materialForm, title: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
              <select
                value={materialForm.category}
                onChange={(e) => setMaterialForm({ ...materialForm, category: e.target.value })}
                className="input-field"
              >
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
                <option value="Resume">Resume</option>
                <option value="HR & Soft Skills">HR & Soft Skills</option>
                <option value="Aptitude">Aptitude</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Resource Type</label>
              <select
                value={materialForm.type}
                onChange={(e) => setMaterialForm({ ...materialForm, type: e.target.value })}
                className="input-field"
              >
                <option value="PDF">PDF</option>
                <option value="Video">Video</option>
                <option value="Article">Article</option>
                <option value="Cheatsheet">Cheatsheet</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">URL / Link</label>
            <input
              type="url"
              placeholder="https://example.com/document.pdf"
              value={materialForm.url}
              onChange={(e) => setMaterialForm({ ...materialForm, url: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" className="w-full btn-primary py-2.5 mt-2">
            Publish Resource
          </button>
        </form>
      </Modal>

      {/* 2. Schedule Interview Modal */}
      <Modal
        isOpen={activeModal === 'interview'}
        onClose={() => setActiveModal(null)}
        title="Schedule Mock Interview"
      >
        <form onSubmit={handleScheduleInterview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Candidate Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Aarav Sharma"
              value={interviewForm.student_name}
              onChange={(e) => setInterviewForm({ ...interviewForm, student_name: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">USN</label>
              <input
                type="text"
                placeholder="1MS22CS001"
                value={interviewForm.usn}
                onChange={(e) => setInterviewForm({ ...interviewForm, usn: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Interview Type</label>
              <select
                value={interviewForm.type}
                onChange={(e) => setInterviewForm({ ...interviewForm, type: e.target.value })}
                className="input-field"
              >
                <option value="AI Mock">AI Mock</option>
                <option value="Peer Mock">Peer Mock</option>
                <option value="Expert Review">Expert Review</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Target Role</label>
            <input
              type="text"
              placeholder="Full Stack Engineer"
              value={interviewForm.role}
              onChange={(e) => setInterviewForm({ ...interviewForm, role: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Date & Time</label>
            <input
              type="datetime-local"
              required
              value={interviewForm.scheduled_at}
              onChange={(e) => setInterviewForm({ ...interviewForm, scheduled_at: e.target.value })}
              className="input-field"
            />
          </div>
          <button type="submit" className="w-full btn-primary py-2.5 mt-2">
            Confirm Schedule
          </button>
        </form>
      </Modal>

      {/* 3. Create Quiz Modal */}
      <Modal
        isOpen={activeModal === 'quiz'}
        onClose={() => setActiveModal(null)}
        title="Create New Quiz"
      >
        <form onSubmit={handleCreateQuiz} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Quiz Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Data Structures Screening"
              value={quizForm.title}
              onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Short description..."
              value={quizForm.description}
              onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Category</label>
              <select
                value={quizForm.category}
                onChange={(e) => setQuizForm({ ...quizForm, category: e.target.value })}
                className="input-field"
              >
                <option value="DSA">DSA</option>
                <option value="System Design">System Design</option>
                <option value="Aptitude">Aptitude</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Duration (min)</label>
              <input
                type="number"
                value={quizForm.duration_mins}
                onChange={(e) => setQuizForm({ ...quizForm, duration_mins: e.target.value })}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Questions</label>
              <input
                type="number"
                value={quizForm.question_count}
                onChange={(e) => setQuizForm({ ...quizForm, question_count: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-2.5 mt-2">
            Publish Quiz
          </button>
        </form>
      </Modal>

      {/* 4. Create Assignment Modal */}
      <Modal
        isOpen={activeModal === 'assignment'}
        onClose={() => setActiveModal(null)}
        title="Publish Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Assignment Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Build System Design Rate Limiter"
              value={assignmentForm.title}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, title: e.target.value })}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Description</label>
            <textarea
              rows={2}
              placeholder="Instructions and requirements..."
              value={assignmentForm.description}
              onChange={(e) => setAssignmentForm({ ...assignmentForm, description: e.target.value })}
              className="input-field"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Target Batch</label>
              <select
                value={assignmentForm.target_batch}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, target_batch: e.target.value })}
                className="input-field"
              >
                <option value="2025 Batch">2025 Batch</option>
                <option value="2026 Batch">2026 Batch</option>
                <option value="All Batches">All Batches</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase mb-1">Due Date</label>
              <input
                type="datetime-local"
                required
                value={assignmentForm.due_date}
                onChange={(e) => setAssignmentForm({ ...assignmentForm, due_date: e.target.value })}
                className="input-field"
              />
            </div>
          </div>
          <button type="submit" className="w-full btn-primary py-2.5 mt-2">
            Publish Assignment
          </button>
        </form>
      </Modal>

      {/* 5. Student Detail Modal */}
      {selectedStudent && (
        <Modal
          isOpen={activeModal === 'student'}
          onClose={() => {
            setActiveModal(null)
            setSelectedStudent(null)
          }}
          title="Student Profile Overview"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-white/5">
              <div className="w-12 h-12 rounded-full bg-gradient-purple flex items-center justify-center font-bold text-white text-lg">
                {selectedStudent.full_name?.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-heading text-lg">{selectedStudent.full_name}</h4>
                <p className="text-xs text-gray-400">{selectedStudent.usn} · {selectedStudent.email}</p>
                <span className="inline-block mt-1 text-xs px-2.5 py-0.5 rounded-full bg-purple/10 text-purple font-semibold">
                  Target: {selectedStudent.current_role}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Readiness</p>
                <p className="text-xl font-bold text-heading mt-1">{selectedStudent.readiness_score}%</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">Resume Score</p>
                <p className="text-xl font-bold text-heading mt-1">{selectedStudent.resume_score}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-xs text-gray-400">DSA Solved</p>
                <p className="text-xl font-bold text-heading mt-1">{selectedStudent.dsa_solved}</p>
              </div>
            </div>

            <div className="pt-2 text-xs text-gray-400 space-y-1">
              <p><span className="text-gray-500">Completed Mock Interviews:</span> {selectedStudent.mock_interviews_completed}</p>
              <p><span className="text-gray-500">Account Status:</span> {selectedStudent.status}</p>
              <p><span className="text-gray-500">Registered Date:</span> {selectedStudent.joined_date}</p>
            </div>
          </div>
        </Modal>
      )}
    </AdminShell>
  )
}
