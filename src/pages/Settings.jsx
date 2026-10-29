import { useState, useEffect } from 'react'
import {
  Settings as SettingsIcon,
  Sun,
  Moon,
  Sparkles,
  Bell,
  HardDrive,
  Download,
  Upload,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Database,
  FileCode,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { useTheme } from '../context/ThemeContext'

const CAREERAI_STORAGE_PREFIX = 'careeriq_'

export default function Settings() {
  const { isLight, toggleTheme } = useTheme()
  const [notifications, setNotifications] = useState(true)
  const [aiAssist, setAiAssist] = useState(true)
  const [storageStats, setStorageStats] = useState({ count: 0, sizeKb: '0' })
  const [storedKeys, setStoredKeys] = useState([])
  const [backupSuccess, setBackupSuccess] = useState('')

  const inspectLocalStorage = () => {
    try {
      const keys = []
      let totalBytes = 0
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith(CAREERAI_STORAGE_PREFIX) || key.startsWith('careerai_'))) {
          keys.push(key)
          const val = localStorage.getItem(key) || ''
          totalBytes += (key.length + val.length) * 2 // UTF-16
        }
      }
      setStoredKeys(keys)
      setStorageStats({
        count: keys.length,
        sizeKb: (totalBytes / 1024).toFixed(2),
      })
    } catch {
      /* noop */
    }
  }

  useEffect(() => {
    inspectLocalStorage()
  }, [])

  const handleExportBackup = () => {
    try {
      const exportData = {}
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (key && (key.startsWith(CAREERAI_STORAGE_PREFIX) || key.startsWith('careerai_'))) {
          exportData[key] = localStorage.getItem(key)
        }
      }
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `careerai-local-storage-backup-${new Date().toISOString().slice(0, 10)}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setBackupSuccess('Local storage backup successfully exported to your device!')
      setTimeout(() => setBackupSuccess(''), 4000)
    } catch {
      alert('Failed to export local storage backup.')
    }
  }

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result)
        Object.entries(parsed).forEach(([k, v]) => {
          localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))
        })
        inspectLocalStorage()
        setBackupSuccess('Local storage backup restored successfully! Reloading...')
        setTimeout(() => window.location.reload(), 1500)
      } catch {
        alert('Invalid backup JSON file.')
      }
    }
    reader.readAsText(file)
  }

  const handleClearLocalStorage = () => {
    const ok = window.confirm(
      'Are you sure you want to clear all CareerAI local storage data? This will reset your profile, saved resumes, applications, and test scores.'
    )
    if (!ok) return

    const keysToRemove = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.startsWith(CAREERAI_STORAGE_PREFIX) || key.startsWith('careerai_'))) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach((k) => localStorage.removeItem(k))
    inspectLocalStorage()
    setBackupSuccess('All local storage data cleared.')
    setTimeout(() => window.location.reload(), 1000)
  }

  return (
    <AppShell>
      <PageHeader
        icon={SettingsIcon}
        title="Settings & Preferences"
        subtitle="Customize application theme, notification alerts, and local storage data persistence"
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

        {/* Local Storage Engine & Data Management */}
        <div className="card p-6 space-y-5 border border-accent/20">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-heading text-sm flex items-center gap-2">
              <HardDrive size={18} className="text-teal" /> Local Storage Data Engine
            </h3>
            <span className="badge bg-teal/20 text-teal text-xs font-bold flex items-center gap-1">
              <CheckCircle2 size={12} /> Local-First Active
            </span>
          </div>

          <p className="text-xs text-gray-400 leading-relaxed">
            All your CareerAI data—including student profile, tracked skills, ATS resumes, resume builder, job applications,
            DSA solutions, aptitude tests, and interview records—is stored directly in your browser&apos;s{' '}
            <strong className="text-white">localStorage</strong> for instantaneous offline capability and zero cloud dependency.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-3 rounded-lg bg-base-800/80 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Stored Modules</p>
              <p className="text-lg font-bold text-teal mt-1">{storageStats.count} Keys</p>
            </div>
            <div className="p-3 rounded-lg bg-base-800/80 border border-white/5">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Storage Used</p>
              <p className="text-lg font-bold text-accent mt-1">{storageStats.sizeKb} KB</p>
            </div>
            <div className="p-3 rounded-lg bg-base-800/80 border border-white/5 col-span-2 sm:col-span-1">
              <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Persistence</p>
              <p className="text-lg font-bold text-emerald-400 mt-1">Permanent</p>
            </div>
          </div>

          {backupSuccess && (
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 size={14} />
              {backupSuccess}
            </div>
          )}

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={handleExportBackup}
              className="btn-primary text-xs flex items-center gap-2 px-3 py-2"
            >
              <Download size={14} /> Export Local Storage (.JSON)
            </button>

            <label className="btn-ghost border border-white/10 text-xs flex items-center gap-2 px-3 py-2 cursor-pointer hover:border-white/30">
              <Upload size={14} /> Import Backup File
              <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
            </label>

            <button
              onClick={handleClearLocalStorage}
              className="btn-ghost text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-red-500/20 text-xs flex items-center gap-2 px-3 py-2 ml-auto"
            >
              <Trash2 size={14} /> Clear Local Data
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
              <p className="text-[11px] text-teal font-medium">Google Gemini API (`gemini-3.8-flash`) Active</p>
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
