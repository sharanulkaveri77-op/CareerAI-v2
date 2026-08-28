import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import {
  TrendingUp,
  Award,
  Brain,
  Code2,
  HelpCircle,
  Video,
  FileText,
  Flame,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'

const readinessBreakdown = [
  { name: 'Technical Skills', score: 85, color: '#a855f7' },
  { name: 'ATS Resume', score: 88, color: '#10b981' },
  { name: 'DSA Solved', score: 70, color: '#3b82f6' },
  { name: 'Aptitude Tests', score: 90, color: '#f59e0b' },
  { name: 'Mock Interviews', score: 75, color: '#ec4899' },
  { name: 'Communication', score: 82, color: '#06b6d4' },
]

const skillGrowthData = [
  { month: 'Jan', Technical: 45, ProblemSolving: 30, Communication: 50 },
  { month: 'Feb', Technical: 58, ProblemSolving: 45, Communication: 60 },
  { month: 'Mar', Technical: 70, ProblemSolving: 60, Communication: 72 },
  { month: 'Apr', Technical: 78, ProblemSolving: 68, Communication: 78 },
  { month: 'May', Technical: 85, ProblemSolving: 75, Communication: 82 },
]

const dsaCategoryData = [
  { name: 'Easy', count: 12, fill: '#10b981' },
  { name: 'Medium', count: 8, fill: '#f59e0b' },
  { name: 'Hard', count: 2, fill: '#ef4444' },
]

export default function Analytics() {
  return (
    <AppShell>
      <PageHeader
        icon={TrendingUp}
        title="Career Analytics & Growth Metrics"
        subtitle="Track your overall readiness score, skill growth velocity, and preparation streaks"
      />

      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card p-5 border-purple-500/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Overall Readiness</span>
            <Award size={18} className="text-purple-400" />
          </div>
          <p className="text-3xl font-extrabold text-heading mt-2">82%</p>
          <p className="text-xs text-teal font-medium mt-1">Ready for Tier-1 Placement</p>
        </div>

        <div className="card p-5 border-blue/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">DSA Solved</span>
            <Code2 size={18} className="text-blue" />
          </div>
          <p className="text-3xl font-extrabold text-heading mt-2">22 Problems</p>
          <p className="text-xs text-blue font-medium mt-1">+4 this week</p>
        </div>

        <div className="card p-5 border-teal/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Aptitude Accuracy</span>
            <HelpCircle size={18} className="text-teal" />
          </div>
          <p className="text-3xl font-extrabold text-heading mt-2">90%</p>
          <p className="text-xs text-teal font-medium mt-1">High accuracy rank</p>
        </div>

        <div className="card p-5 border-orange/20">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-400">Learning Streak</span>
            <Flame size={18} className="text-orange" />
          </div>
          <p className="text-3xl font-extrabold text-heading mt-2">5 Days 🔥</p>
          <p className="text-xs text-accent-light font-medium mt-1">Keep it up!</p>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Readiness Breakdown Bar Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-heading mb-4 text-sm flex items-center gap-2">
            <Award size={16} className="text-accent-light" /> Career Readiness Breakdown
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={readinessBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="name" stroke="#6b7280" fontSize={10} />
              <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#151320',
                  border: '1px solid #ffffff10',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Bar dataKey="score" fill="#a855f7" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Skill Growth Velocity Line Chart */}
        <div className="card p-6">
          <h3 className="font-semibold text-heading mb-4 text-sm flex items-center gap-2">
            <TrendingUp size={16} className="text-teal" /> Skill Growth Velocity (Monthly)
          </h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={skillGrowthData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="month" stroke="#6b7280" fontSize={11} />
              <YAxis stroke="#6b7280" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: '#151320',
                  border: '1px solid #ffffff10',
                  borderRadius: 12,
                  color: '#fff',
                }}
              />
              <Line type="monotone" dataKey="Technical" stroke="#a855f7" strokeWidth={2.5} />
              <Line type="monotone" dataKey="ProblemSolving" stroke="#10b981" strokeWidth={2.5} />
              <Line type="monotone" dataKey="Communication" stroke="#3b82f6" strokeWidth={2.5} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DSA Breakdown & Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6">
          <h3 className="font-semibold text-heading mb-4 text-sm flex items-center gap-2">
            <Code2 size={16} className="text-blue" /> DSA Difficulty Distribution
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={dsaCategoryData}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
              >
                {dsaCategoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#151320', borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs mt-2">
            <span className="text-teal font-medium">● Easy ({dsaCategoryData[0].count})</span>
            <span className="text-orange font-medium">● Medium ({dsaCategoryData[1].count})</span>
            <span className="text-danger font-medium">● Hard ({dsaCategoryData[2].count})</span>
          </div>
        </div>

        <div className="card p-6 lg:col-span-2 space-y-4">
          <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
            <Award size={16} className="text-accent-light" /> Target Milestones Checklist
          </h3>
          <div className="space-y-2.5 text-xs">
            {[
              { label: 'Complete 20+ DSA Problems', done: true },
              { label: 'Pass ATS Resume Score above 80%', done: true },
              { label: 'Complete 3 AI Voice Mock Interviews', done: true },
              { label: 'Master System Design & Database Optimization', done: false },
              { label: 'Apply to 5 High-Match Target Roles', done: false },
            ].map((m, i) => (
              <div
                key={i}
                className={
                  'p-3 rounded-xl border flex items-center justify-between ' +
                  (m.done
                    ? 'border-teal/30 bg-teal/10 text-heading font-medium'
                    : 'border-white/5 bg-base-900/50 text-gray-400')
                }
              >
                <span>{m.label}</span>
                <span className={m.done ? 'text-teal font-bold' : 'text-gray-600'}>
                  {m.done ? 'Completed ✓' : 'In Progress'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
