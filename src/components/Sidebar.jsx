import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
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
  FolderKanban,
  Settings,
  Sparkles,
  LogOut,
} from 'lucide-react'
import { supabase } from '../api/supabase'
import Logo from './Logo'

const navGroups = [
  {
    title: 'CAREER',
    items: [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/roadmap', label: 'Career Roadmap', icon: Map },
      { to: '/skills', label: 'Skills & Gaps', icon: Target },
      { to: '/learning', label: 'Learning Hub', icon: BookOpen },
      { to: '/advisor', label: 'Career Advisor', icon: Sparkles },
    ],
  },
  {
    title: 'PRACTICE',
    items: [
      { to: '/dsa', label: 'DSA Practice', icon: Code2 },
      { to: '/aptitude', label: 'Aptitude Tests', icon: Brain },
      { to: '/communication', label: 'Communication', icon: MessageSquare },
      { to: '/interview', label: 'Mock Interviews', icon: Video },
    ],
  },
  {
    title: 'JOB SEARCH',
    items: [
      { to: '/applications', label: 'Applications', icon: FolderKanban },
      { to: '/jobs', label: 'Find Jobs', icon: Briefcase },
      { to: '/resume', label: 'Resume ATS Scanner', icon: FileText },
      { to: '/resume/builder', label: 'Resume Builder', icon: FileCode },
    ],
  },
  {
    title: 'OTHER',
    items: [
      { to: '/settings', label: 'Settings', icon: Settings },
    ],
  },
]

export default function Sidebar({ onCloseMobile }) {
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
    <aside className="w-64 h-screen sticky top-0 border-r border-white/5 bg-base-900/90 backdrop-blur-md flex flex-col shrink-0 z-30">
      {/* Brand header */}
      <div className="h-16 flex items-center justify-between px-5 border-b border-white/5">
        <Link to="/dashboard" onClick={onCloseMobile}>
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
                onClick={onCloseMobile}
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

        <div className="pt-3 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="nav-item w-full text-left text-xs text-gray-400 hover:text-danger hover:bg-danger/10"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </nav>
    </aside>
  )
}

