import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Sparkles,
  Brain,
  FileText,
  Search,
  ArrowRight,
  LineChart as LineIcon,
  HeartPulse,
  Briefcase,
  Target,
  AlertTriangle,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import MarketTrends from '../components/MarketTrends'
import CareerHealth from '../components/CareerHealth'
import { Skeleton, ErrorState } from '../components/Feedback'
import { getSummary, getTrends } from '../api/dashboard'

const quickActions = [
  { to: '/advisor', icon: Sparkles, title: 'Talk to AI Advisor', caption: 'Get personalized guidance', color: 'purple' },
  { to: '/skills', icon: Brain, title: 'Analyze Skills', caption: 'Identify your gaps', color: 'teal' },
  { to: '/resume', icon: FileText, title: 'Scan Resume', caption: 'Get AI feedback', color: 'orange' },
  { to: '/roles', icon: Search, title: 'Explore Roles', caption: 'Discover opportunities', color: 'blue' },
]

export default function Dashboard() {
  const navigate = useNavigate()
  const [summary, setSummary] = useState(null)
  const [trends, setTrends] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([getSummary(), getTrends()])
      .then(([s, t]) => {
        if (!active) return
        setSummary(s.data)
        setTrends(t.data?.trends || t.data || [])
      })
      .catch((e) => active && setError(e.userMessage || 'Failed to load dashboard'))
      .finally(() => active && setLoading(false))
    return () => {
      active = false
    }
  }, [])

  const profileComplete = summary?.profileComplete ?? !!summary?.currentRole

  const stats = [
    {
      icon: Briefcase,
      label: 'Current Role',
      value: summary?.currentRole || 'Not set',
      caption: summary?.currentRole ? 'Active profile' : 'Set up your profile',
      accent: 'purple',
    },
    {
      icon: AlertTriangle,
      label: 'Skill Gaps',
      value: summary?.skillGaps ?? '—',
      caption: summary ? `${summary.skillGaps || 0} high-demand skills tracked` : '',
      accent: 'teal',
    },
    {
      icon: Search,
      label: 'Saved Roles',
      value: summary?.savedRoles ?? '—',
      caption: summary ? 'Roles you’re tracking' : '',
      accent: 'blue',
    },
    {
      icon: Target,
      label: 'Target',
      value: summary?.targetRole || 'Not set',
      caption: summary?.targetRole ? 'Goal defined' : 'Define your goal',
      accent: 'orange',
    },
  ]

  return (
    <AppShell>
      <PageHeader
        icon={LayoutGrid}
        title="Career Intelligence"
        subtitle="Your AI-powered career command center"
      />

      {/* Welcome card */}
      {!loading && !profileComplete && (
        <div className="card p-6 mb-6 border-accent/20 bg-gradient-to-br from-accent/10 to-transparent">
          <h2 className="text-lg font-semibold text-white">Welcome to CareerIQ</h2>
          <p className="text-sm text-gray-400 mt-1 max-w-2xl">
            Set up your career profile to unlock personalized AI insights, skill
            gap analysis, and curated role recommendations.
          </p>
          <button
            onClick={() => navigate('/advisor')}
            className="btn-primary mt-4"
          >
            <Sparkles size={16} /> Get Started with AI Advisor
          </button>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {quickActions.map(({ to, icon: Icon, title, caption, color }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="card card-hover p-5 text-left relative group"
          >
            <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-purple shadow-glow-purple">
              <Icon size={20} className="text-white" />
            </div>
            <p className="mt-3 font-semibold text-white">{title}</p>
            <p className="text-xs text-gray-500">{caption}</p>
            <ArrowRight
              size={18}
              className="absolute bottom-4 right-4 text-gray-600 group-hover:text-white transition"
            />
          </button>
        ))}
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))
          : stats.map((s) => <StatCard key={s.label} {...s} />)}
      </div>

      {/* Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue/20">
              <LineIcon size={18} className="text-blue" />
            </div>
            <h3 className="font-semibold text-white">Market Trends</h3>
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : error ? (
            <ErrorState message={error} />
          ) : (
            <MarketTrends data={trends} />
          )}
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-teal/20">
              <HeartPulse size={18} className="text-teal" />
            </div>
            <h3 className="font-semibold text-white">Career Health</h3>
          </div>
          {loading ? (
            <Skeleton className="h-64" />
          ) : (
            <CareerHealth score={summary?.careerHealth ?? 0} />
          )}
        </div>
      </div>
    </AppShell>
  )
}
