import React, { useState, useEffect } from 'react'
import {
  X,
  Sliders,
  Volume2,
  Shield,
  Key,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'

export const SettingsModal = ({
  isOpen,
  onClose,
  config = {},
  onSaveConfig,
}) => {
  const [activeTab, setActiveTab] = useState('general')
  const [userName, setUserName] = useState(config.userName || 'Sharanu')
  const [targetRole, setTargetRole] = useState(config.targetRole || 'Full Stack Engineer')
  const [difficulty, setDifficulty] = useState(config.difficulty || 'Basic')
  const [speechRate, setSpeechRate] = useState(config.speechRate || 1.0)
  const [speechPitch, setSpeechPitch] = useState(config.speechPitch || 0.95)
  const [sensitivity, setSensitivity] = useState(config.sensitivity || 80)
  const [apiKey, setApiKey] = useState(config.apiKey || '')
  const [savedAlert, setSavedAlert] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setUserName(config.userName || 'Sharanu')
      setTargetRole(config.targetRole || 'Full Stack Engineer')
      setDifficulty(config.difficulty || 'Basic')
      setSpeechRate(config.speechRate || 1.0)
      setSpeechPitch(config.speechPitch || 0.95)
      setSensitivity(config.sensitivity || 80)
      setApiKey(config.apiKey || '')
    }
  }, [isOpen, config])

  if (!isOpen) return null

  const handleSave = () => {
    if (onSaveConfig) {
      onSaveConfig({
        userName,
        targetRole,
        difficulty,
        speechRate,
        speechPitch,
        sensitivity,
        apiKey,
      })
    }
    setSavedAlert(true)
    setTimeout(() => {
      setSavedAlert(false)
      onClose()
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-2xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-5 text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Sliders className="w-5 h-5 text-purple-400" />
            <h3 className="text-base font-bold tracking-wider font-mono">
              CAREERAI SYSTEM CONFIGURATION
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div className="flex gap-2 border-b border-purple-500/15 pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'general'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            General
          </button>
          <button
            onClick={() => setActiveTab('audio')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'audio'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            Voice & Audio
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'api'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'border-transparent text-text-muted hover:text-white'
            }`}
          >
            AI Models & API
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[220px] text-xs font-mono space-y-4">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-muted">Candidate Display Name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted">Target Interview Role</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-black/80 border border-purple-500/30 rounded px-3 py-1.5 text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="Frontend Engineer">Frontend Engineer (HTML, CSS, JS, React)</option>
                  <option value="Backend Engineer">Backend Engineer (APIs, Node, DBs, Auth)</option>
                  <option value="Full Stack Engineer">Full Stack Engineer (Client + Server + DB)</option>
                  <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer (ML, Python, Models)</option>
                  <option value="Data Scientist">Data Scientist (EDA, Stats, Pandas, Metrics)</option>
                  <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer (Docker, K8s, CI/CD)</option>
                  <option value="Mobile App Developer">Mobile App Developer (Flutter, React Native, Mobile)</option>
                  <option value="Cybersecurity Specialist">Cybersecurity Specialist (OWASP, Networks, Security)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-text-muted">Question Difficulty Progression</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="w-full bg-black/80 border border-purple-500/30 rounded px-3 py-1.5 text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer"
                >
                  <option value="Basic">🟢 Basic / Simple (Warm-up & Core Fundamentals)</option>
                  <option value="Medium">🟡 Medium / Practical (State, Async, Error Handling)</option>
                  <option value="Difficult">🔴 Difficult / Advanced (Architecture, Scale, Internals)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Computer Vision Gaze Sensitivity</span>
                  <span className="text-purple-400">{sensitivity}%</span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="100"
                  value={sensitivity}
                  onChange={(e) => setSensitivity(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'audio' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">CAREERAI Speech Synthesis Rate</span>
                  <span className="text-purple-400">{speechRate}x</span>
                </div>
                <input
                  type="range"
                  min="0.8"
                  max="1.3"
                  step="0.05"
                  value={speechRate}
                  onChange={(e) => setSpeechRate(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-text-muted">Voice Pitch Modulation</span>
                  <span className="text-purple-400">{speechPitch}</span>
                </div>
                <input
                  type="range"
                  min="0.7"
                  max="1.3"
                  step="0.05"
                  value={speechPitch}
                  onChange={(e) => setSpeechPitch(Number(e.target.value))}
                  className="w-full accent-purple-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-text-muted flex items-center gap-1.5">
                  <Key size={13} className="text-purple-400" />
                  Gemini API Key (Optional override)
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy... (leave blank to use default system key)"
                  className="w-full bg-black/50 border border-purple-500/30 rounded px-3 py-1.5 text-white focus:outline-none focus:border-purple-400"
                />
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">
                CAREERAI uses Gemini 3.8 Flash for multimodal vision understanding, system architecture interviewing, and real-time audio reasoning.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-purple-500/15">
          {savedAlert ? (
            <span className="text-xs font-mono text-emerald-300 flex items-center gap-1">
              <CheckCircle2 size={13} /> Settings saved successfully
            </span>
          ) : (
            <span className="text-[11px] text-text-muted">All changes apply dynamically</span>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded bg-black/40 border border-white/10 text-xs text-text-muted hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded bg-purple-500/20 border border-purple-400 text-purple-300 hover:bg-purple-500/30 text-xs font-mono font-bold"
            >
              Save Configuration
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsModal
