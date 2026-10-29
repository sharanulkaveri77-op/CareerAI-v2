import { useState, useEffect } from 'react'
import { Moon, Sun, Menu, Download } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'

export default function TopBar({ onToggleMobile }) {
  const { user, profile } = useAuth()
  const { isLight, toggleTheme } = useTheme()
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setDeferredPrompt(null)
    })
    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setDeferredPrompt(null)
    }
  }

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
    <div className="flex items-center justify-between md:justify-end h-14 border-b border-white/5 px-4 sm:px-8">
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={onToggleMobile}
        className="md:hidden flex items-center justify-center w-9 h-9 rounded-xl border border-white/10 text-gray-400 hover:text-heading hover:bg-white/5 transition"
        title="Open Navigation"
        aria-label="Open Navigation"
      >
        <Menu size={18} />
      </button>

      <div className="flex items-center gap-3">
        {/* Install App Button when available */}
        {deferredPrompt && !isInstalled && (
          <button
            onClick={handleInstallClick}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-accent/15 border border-accent/40 text-accent-light text-xs font-semibold hover:bg-accent/25 transition shadow-glow-purple"
            title="Install CareerAI on your PC"
          >
            <Download size={13} />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

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
