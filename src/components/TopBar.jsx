import { Moon, Sun } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function TopBar() {
  const { user, profile } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const name =
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    user?.email ||
    'User'
  const role = user?.user_metadata?.role || profile?.role || 'student'
  const initials = name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <div className="flex items-center justify-end h-12 border-b border-white/5 px-8">
      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-400 hover:text-heading hover:bg-white/5 transition"
          title={isLight ? 'Switch to dark theme' : 'Switch to light theme'}
          aria-label="Toggle theme"
        >
          {isLight ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-sm text-gray-300 leading-tight">{name}</p>
          <p className="text-[11px] text-gray-500 capitalize">{role}</p>
        </div>
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-purple text-white text-xs font-semibold">
          {initials}
        </div>
      </div>
    </div>
  )
}
