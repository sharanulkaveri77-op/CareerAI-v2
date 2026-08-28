import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Sparkles,
  Map,
  Target,
  BookOpen,
  Code2,
  Brain,
  MessageSquare,
  Video,
  FileText,
  FileCode,
  Briefcase,
  LogOut,
} from 'lucide-react'
import { supabase } from '../api/supabase'
import Logo from './Logo'

const navGroups = [
  {
    title: 'Core Platform',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/advisor', label: 'AI Advisor', icon: Sparkles },
      { to: '/roadmap', label: 'Career Roadmap', icon: Map },
      { to: '/skills', label: 'Skill Gap Analysis', icon: Target },
      { to: '/learning', label: 'Learning Hub', icon: BookOpen },
    ],
  },
  {
    title: 'Practice & Prep',
    items: [
      { to: '/dsa', label: 'DSA Practice', icon: Code2 },
      { to: '/aptitude', label: 'Aptitude Tests', icon: Brain },
      { to: '/communication', label: 'Communication', icon: MessageSquare },
      { to: '/interview', label: 'Mock Interviews', icon: Video },
    ],
  },
  {
    title: 'Tools & Jobs',
    items: [
      { to: '/resume', label: 'ATS Resume Scanner', icon: FileText },
      { to: '/resume/builder', label: 'AI Resume Builder', icon: FileCode },
      { to: '/jobs', label: 'Job Discovery', icon: Briefcase },
    ],
  },
]

export default function Sidebar() {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
    } catch {
      /* ignore */
    }
    navigate('/login')
  }

  return (
    <aside className="w-64 h-screen sticky top-0 border-r border-white/5 bg-base-900/80 backdrop-blur-md flex flex-col shrink-0 z-30">
      {/* Brand header */}
      <div className="h-16 flex items-center px-5 border-b border-white/5">
        <Link to="/dashboard">
          <Logo />
        </Link>
      </div>

      {/* Nav list */}
      <nav className="flex-1 px-3 space-y-5 overflow-y-auto py-4">
        {navGroups.map((group) => (
          <div key={group.title} className="space-y-1">
            <p className="px-3 text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5">
              {group.title}
            </p>
            {group.items.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  'nav-item text-xs ' + (isActive ? 'nav-item-active font-semibold' : '')
                }
              >
                <Icon size={16} />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        ))}

        <div className="pt-2 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-left text-xs hover:text-danger"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>

      {/* Footer card */}
      <div className="m-3 p-3 rounded-xl border border-white/5 bg-base-800">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">
          Powered by
        </p>
        <p className="text-xs font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Google Gemini 2.5 Flash
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Real-time market intelligence
        </p>
      </div>
    </aside>
  )
}
