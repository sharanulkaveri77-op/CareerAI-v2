import React, { useState } from 'react'
import { X, Users, UserCheck, Shield, Sparkles, Check, Cpu, Award } from 'lucide-react'

export const INTERVIEWER_PERSONAS = [
  {
    id: 'career-ai',
    name: 'CAREERAI',
    title: 'Personal AI Companion (Gemini 3.8 Flash)',
    avatar: 'CA',
    tag: 'Core Companion',
    focus: 'Role-Adaptive Technical Interviewer (Basic → Medium → Difficult)',
    difficulty: 'Adaptive (Basic to Difficult)',
    greeting: 'Welcome Sharanu! I am CAREERAI, your personal AI interview companion. We will start with simple, basic questions and progress step-by-step.',
    starterQuestion: 'Let’s begin with a warm-up basic question calibrated to your role.',
  },
  {
    id: 'sarah-vance',
    name: 'Sarah Vance',
    title: 'Principal Cloud & Distributed Systems Architect',
    avatar: 'SV',
    tag: 'Cloud & Scale',
    focus: 'Microservices, Database Sharding, CAP Theorem, Fault Tolerance, Kafka',
    difficulty: 'Senior / Staff',
    greeting: 'Hello Sharanu, I’m Sarah. Today we’ll explore high-availability architecture, distributed consensus, and resilience under network partitions.',
    starterQuestion: 'When three nodes in a five-node Raft consensus cluster become isolated during a split-brain network partition, how does your system guarantee linearizable writes without state corruption?',
  },
  {
    id: 'david-chen',
    name: 'David Chen',
    title: 'Staff Software Engineer & Algorithms Lead',
    avatar: 'DC',
    tag: 'Algorithms & LeetCode',
    focus: 'Data Structures, Concurrency, Lock-Free Structures, Big-O Optimization',
    difficulty: 'Senior Engineer',
    greeting: 'Hi Sharanu, I’m David. We’re going to focus on rigorous algorithmic trade-offs, optimal memory access patterns, and clean code principles.',
    starterQuestion: 'Can you walk me through the design and implementation of a thread-safe, lock-free bounded queue using atomic CAS operations and memory barriers?',
  },
  {
    id: 'elena-rostova',
    name: 'Elena Rostova',
    title: 'Director of Engineering & Behavioral Talent Lead',
    avatar: 'ER',
    tag: 'Behavioral & Leadership',
    focus: 'STAR Framework, Technical Leadership, Conflict Resolution, Ownership',
    difficulty: 'Lead / Manager',
    greeting: 'Welcome Sharanu! I’m Elena. Technical skill is critical, but great engineering leaders excel at cross-functional communication, handling failure, and team influence.',
    starterQuestion: 'Tell me about a high-stakes technical disagreement you had with another senior team member or stakeholder. How did you structure the debate and drive consensus?',
  },
]

export const PeopleModal = ({
  isOpen,
  onClose,
  activeInterviewerId = 'career-ai',
  onSelectInterviewer,
}) => {
  const [activeTab, setActiveTab] = useState('interviewers') // 'interviewers' | 'biometrics'
  const [selectedId, setSelectedId] = useState(activeInterviewerId)

  if (!isOpen) return null

  const handleSelect = (persona) => {
    setSelectedId(persona.id)
    if (onSelectInterviewer) {
      onSelectInterviewer(persona)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 select-none animate-fadeIn">
      <div className="hud-panel w-full max-w-3xl bg-[#0F081E]/95 border border-purple-400/50 p-6 rounded-xl shadow-[0_0_40px_rgba(131,62,239,0.35)] flex flex-col gap-4 text-white max-h-[88vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
          <div className="flex items-center gap-2.5 text-purple-400">
            <Users className="w-5 h-5 text-purple-400" />
            <div>
              <h3 className="text-base font-bold tracking-wider font-mono">
                INTERVIEWER PERSONAS & BIOMETRIC PROFILES
              </h3>
              <p className="text-[11px] text-text-muted font-sans">
                Select your specialized AI interviewer or inspect facial biometric enrollment
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-white hover:border-purple-400 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 border-b border-purple-500/15 pb-2 text-xs font-mono">
          <button
            onClick={() => setActiveTab('interviewers')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'interviewers'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-black/40 border-purple-500/10 text-text-muted hover:text-white'
            }`}
          >
            AI Interviewer Personas (4)
          </button>
          <button
            onClick={() => setActiveTab('biometrics')}
            className={`px-3 py-1.5 rounded-lg border transition ${
              activeTab === 'biometrics'
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-black/40 border-purple-500/10 text-text-muted hover:text-white'
            }`}
          >
            Candidate Biometrics (Face ID)
          </button>
        </div>

        {/* Tab 1: Interviewers */}
        {activeTab === 'interviewers' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[55vh]">
            {INTERVIEWER_PERSONAS.map((p) => {
              const isCurrent = selectedId === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelect(p)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2.5 ${
                    isCurrent
                      ? 'bg-purple-950/40 border-purple-400/80 shadow-[0_0_20px_rgba(131,62,239,0.25)]'
                      : 'bg-black/40 border-purple-500/20 hover:border-purple-400/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-900/50 border border-purple-400/40 flex items-center justify-center font-mono font-bold text-sm text-purple-200">
                        {p.avatar}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-sm">{p.name}</span>
                          <span className="px-2 py-0.2 rounded-full text-[10px] font-mono bg-purple-500/20 border border-purple-400/30 text-purple-300">
                            {p.tag}
                          </span>
                        </div>
                        <p className="text-xs text-text-muted">{p.title}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/60 border border-purple-500/30 text-purple-300">
                        {p.difficulty}
                      </span>
                      {isCurrent ? (
                        <span className="px-2.5 py-1 rounded bg-purple-500 text-white font-mono text-xs flex items-center gap-1 font-bold shadow-[0_0_10px_#833EEF]">
                          <Check className="w-3.5 h-3.5" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <button className="px-2.5 py-1 rounded bg-black/60 border border-purple-500/30 text-text-muted hover:text-white text-xs font-mono">
                          Select
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-gray-300 font-sans leading-relaxed">
                    <strong className="text-purple-300 font-mono text-[11px]">Specialization: </strong>
                    {p.focus}
                  </p>

                  <div className="p-2.5 rounded-lg bg-black/50 border border-purple-500/10 text-xs font-sans text-purple-200/90 italic">
                    "{p.starterQuestion}"
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Tab 2: Biometrics */}
        {activeTab === 'biometrics' && (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 max-h-[55vh] text-xs font-mono">
            <div className="p-4 rounded-xl bg-black/40 border border-purple-500/20 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-purple-950/40 border border-purple-400/40 flex items-center justify-center text-purple-300">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-white font-bold text-sm">Candidate: Sharanu</span>
                    <p className="text-text-muted text-[11px]">Optical Gaze Centering & Facial Telemetry</p>
                  </div>
                </div>
                <span className="px-2 py-1 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-bold">
                  AUTHENTICATED
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-500/10 text-[11px]">
                <div className="flex justify-between py-1 border-b border-purple-500/10">
                  <span className="text-text-muted">Centroid Stability:</span>
                  <span className="text-purple-300">Locked (Delta &lt; 8px)</span>
                </div>
                <div className="flex justify-between py-1 border-b border-purple-500/10">
                  <span className="text-text-muted">Gaze Tracking:</span>
                  <span className="text-purple-300">Direct Frontal 97%</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">Feature Vector:</span>
                  <span className="text-purple-300">128-D L2 Normalized</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-text-muted">DirectShow Sync:</span>
                  <span className="text-purple-300">30 FPS Continuous</span>
                </div>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/20 flex items-center gap-3">
              <Shield className="w-5 h-5 text-purple-400 shrink-0" />
              <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                Biometric verification runs completely client-side in your local browser sandbox. Facial embeddings and eye-contact vectors are never sent to external servers.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-500/10">
          <span className="text-[11px] font-mono text-text-muted">
            {activeTab === 'interviewers' ? 'Switching interviewer adjusts questioning style & AI voice' : 'Face alignment optimal'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-purple-950/60 border border-purple-400/50 text-purple-200 text-xs font-mono hover:bg-purple-900/60 transition-colors"
          >
            Confirm & Close
          </button>
        </div>
      </div>
    </div>
  )
}

export default PeopleModal
