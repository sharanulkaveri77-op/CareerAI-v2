import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  Sparkles,
  Brain,
  Search,
  FileText,
  Video,
  GraduationCap,
  Route,
  LogOut,
  Zap,
  Shield,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/advisor', label: 'AI Advisor', icon: Sparkles },
  { to: '/skills', label: 'Skills', icon: Brain },
  { to: '/roles', label: 'Explore Roles', icon: Search },
  { to: '/resume', label: 'Resume', icon: FileText },
  { to: '/interview', label: 'Interview Practice', icon: Video },
  { to: '/learning', label: 'Learning', icon: GraduationCap },
  { to: '/roadmap', label: 'Roadmap', icon: Route },
]

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-base-850 border-r border-white/5 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-purple shadow-glow-purple">
          <Zap size={22} className="text-white" />
        </div>
        <div>
          <p className="text-white font-bold leading-tight">CareerIQ</p>
          <p className="text-[10px] tracking-widest text-accent-light/80">
            INTELLIGENCE PLATFORM
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              'nav-item ' + (isActive ? 'nav-item-active' : '')
            }
          >
            <Icon size={18} />
            <span>{label}</span>
          </NavLink>
        ))}

        <button
          onClick={handleLogout}
          className="nav-item w-full text-left mt-2 hover:text-danger"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </nav>

      {/* Footer card */}
      <div className="m-3 p-3 rounded-xl border border-white/5 bg-base-800">
        <p className="text-[10px] uppercase tracking-wider text-gray-500">
          Powered by
        </p>
        <p className="text-sm font-semibold bg-gradient-purple bg-clip-text text-transparent">
          Advanced AI Models
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">
          Real-time market intelligence
        </p>
      </div>
    </aside>
  )
}
