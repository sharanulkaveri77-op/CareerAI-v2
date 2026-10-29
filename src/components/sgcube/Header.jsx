import React from 'react'
import {
  Home,
  Eye,
  Database,
  Clock,
  Users,
  Activity,
  Settings,
  Shield,
  ArrowLeft,
  RotateCw,
} from 'lucide-react'

const TABS = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'vision', label: 'Vision', icon: Eye },
  { id: 'memory', label: 'Memory', icon: Database },
  { id: 'history', label: 'History', icon: Clock },
  { id: 'people', label: 'People', icon: Users },
]

export const Header = ({
  activeTab = 'home',
  onSelectTab,
  state = 'IDLE',
  isConnected = true,
  onOpenSettings,
  onOpenVault,
  onBackToApp,
}) => {
  return (
    <header className="w-full h-16 px-4 py-2 flex items-center justify-between border-b border-purple-500/20 bg-[#0F081E]/85 backdrop-blur-md z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        {onBackToApp && (
          <button
            onClick={onBackToApp}
            className="w-8 h-8 rounded-lg border border-purple-500/30 bg-[#170E2E] flex items-center justify-center text-gray-400 hover:text-purple-300 hover:border-purple-400 transition"
            title="Return to CareerAI Dashboard"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}

        {/* Futuristic 3D mini cube glyph */}
        <div className="w-10 h-10 rounded-md border border-purple-400/40 bg-purple-950/40 flex items-center justify-center shadow-[0_0_12px_rgba(131,62,239,0.35)]">
          <div className="w-5 h-5 border border-purple-300 rotate-45 flex items-center justify-center">
            <div className="w-2.5 h-2.5 bg-purple-500 shadow-[0_0_6px_#833EEF]" />
          </div>
        </div>

        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-wider text-white">CAREERAI</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-400/30 text-purple-300 font-mono">
              v3.8.0
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-text-muted">
            <span className="text-text-secondary">Personal AI Companion</span>
            <span>•</span>
            <span className="text-purple-400">Seeing</span>
            <span className="text-purple-300">•</span>
            <span className="text-purple-400">Understanding</span>
            <span className="text-purple-300">•</span>
            <span className="text-purple-400">Helping</span>
          </div>
        </div>
      </div>

      {/* Navigation Pills */}
      <nav className="hidden md:flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-purple-500/20 shadow-inner">
        {TABS.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab && onSelectTab(tab.id)}
              className={`relative px-4 py-1.5 rounded-lg flex items-center gap-2 transition-all duration-200 text-sm font-medium ${
                isActive
                  ? 'bg-[#170E2E] text-white border border-purple-400/50 shadow-[0_0_12px_rgba(131,62,239,0.3)]'
                  : 'text-text-muted hover:text-purple-200 hover:bg-purple-950/20 border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-purple-400' : 'text-text-muted'}`} />
              <span>{tab.label}</span>
              {isActive && (
                <div className="absolute bottom-0 left-3 right-3 h-[2px] bg-[#833EEF] shadow-[0_0_8px_#833EEF] rounded-full" />
              )}
            </button>
          )
        })}
      </nav>

      {/* Status Pill & Settings */}
      <div className="flex items-center gap-2.5">
        {/* Status Pill */}
        <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#170E2E] border border-purple-500/30 shadow-[0_0_10px_rgba(131,62,239,0.2)]">
          <Activity className="w-4 h-4 text-purple-400 animate-pulse" />
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-purple-400 shadow-[0_0_8px_#833EEF]' : 'bg-amber-400 shadow-[0_0_8px_#F59E0B]'
            }`}
          />
          <span className="text-xs font-mono font-medium text-white tracking-wide">
            {state === 'SAFETY_ALERT' ? 'ALERT' : state}
          </span>
        </div>

        {/* Live Reload / Refresh App */}
        <button
          onClick={() => window.location.reload()}
          title="Reload & Sync Updates"
          className="w-9 h-9 rounded-lg border border-purple-500/30 bg-[#170E2E] flex items-center justify-center text-text-muted hover:text-purple-300 hover:border-purple-400 active:rotate-180 transition-all duration-300 shadow-sm"
        >
          <RotateCw className="w-4 h-4" />
        </button>

        {/* Secure Password Vault button */}
        <button
          onClick={onOpenVault}
          title="Secure Password Vault (AES-256-GCM)"
          className="w-9 h-9 rounded-lg border border-purple-500/30 bg-[#170E2E] flex items-center justify-center text-text-muted hover:text-purple-300 hover:border-purple-400 transition-colors shadow-sm"
        >
          <Shield className="w-4 h-4" />
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          title="Settings & System Tools"
          className="w-9 h-9 rounded-lg border border-purple-500/30 bg-[#170E2E] flex items-center justify-center text-text-muted hover:text-purple-300 hover:border-purple-400 transition-colors shadow-sm"
        >
          <Settings className="w-4 h-4 hover:rotate-45 transition-transform duration-300" />
        </button>
      </div>
    </header>
  )
}

export default Header
