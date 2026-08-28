import { useState } from 'react'
import { Settings as SettingsIcon, Sun, Moon, Sparkles, Bell, Shield, Key } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { useTheme } from '../context/ThemeContext'

export default function Settings() {
  const { isLight, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [aiAssist, setAiAssist] = useState(true)

  return (
    <AppShell>
      <PageHeader
        icon={SettingsIcon}
        title="Settings & Preferences"
        subtitle="Customize application theme, notification alerts, and AI configuration"
      />

      <div className="max-w-3xl space-y-6">
        {/* Appearance Settings */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
            {isLight ? <Sun size={18} className="text-orange" /> : <Moon size={18} className="text-accent-light" />}{' '}
            Appearance & Theme
          </h3>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium text-heading">Interface Mode</p>
              <p className="text-[11px] text-gray-400">Switch between dark SaaS mode and light high-contrast mode.</p>
            </div>
            <button
              onClick={toggleTheme}
              className="btn-ghost border border-white/10 px-4 py-2 text-xs flex items-center gap-2"
            >
              {isLight ? <Moon size={14} /> : <Sun size={14} />}
              {isLight ? 'Switch to Dark' : 'Switch to Light'}
            </button>
          </div>
        </div>

        {/* AI Preferences */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
            <Sparkles size={18} className="text-accent-light" /> AI Intelligence Configuration
          </h3>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium text-heading">AI Model Status</p>
              <p className="text-[11px] text-teal font-medium">Google Gemini API (`gemini-2.5-flash`) Active</p>
            </div>
            <span className="badge bg-teal/20 text-teal text-xs font-bold">Enabled ✓</span>
          </div>

          <div className="flex items-center justify-between border-t border-white/5 pt-3">
            <div>
              <p className="text-xs font-medium text-heading">Real-Time STAR Coaching Tips</p>
              <p className="text-[11px] text-gray-400">Receive live feedback during mock video interviews.</p>
            </div>
            <input
              type="checkbox"
              checked={aiAssist}
              onChange={(e) => setAiAssist(e.target.checked)}
              className="accent-accent w-4 h-4 rounded"
            />
          </div>
        </div>

        {/* Notifications */}
        <div className="card p-6 space-y-4">
          <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
            <Bell size={18} className="text-teal" /> Notifications & Reminders
          </h3>
          <div className="flex items-center justify-between pt-2">
            <div>
              <p className="text-xs font-medium text-heading">Weekly Career Growth Summary</p>
              <p className="text-[11px] text-gray-400">Receive weekly DSA and skill progress reports.</p>
            </div>
            <input
              type="checkbox"
              checked={notifications}
              onChange={(e) => setNotifications(e.target.checked)}
              className="accent-teal w-4 h-4 rounded"
            />
          </div>
        </div>
      </div>
    </AppShell>
  )
}
