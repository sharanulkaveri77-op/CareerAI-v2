import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Video,
  Bot,
  Users,
  ArrowRight,
  Mic,
  Radio,
  Zap,
  Award,
  BarChart2,
  CheckCircle2,
  Sparkles,
  Calendar,
  ChevronRight,
  FileText,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import Modal from '../components/Modal'

function Pill({ children }) {
  return (
    <span className="badge bg-white/5 text-gray-300 border border-white/10 text-xs">
      {children}
    </span>
  )
}

const RECENT_INTERVIEW_SESSIONS = [
  {
    id: 'sess-101',
    role: 'Full Stack Engineer (React & Node.js)',
    date: 'Yesterday, 4:30 PM',
    duration: '18 mins',
    overallScore: 88,
    type: 'AI Mock Session',
    metrics: {
      technicalAccuracy: '90%',
      communicationConfidence: '85%',
      systemArchitecture: '88%',
    },
    aiFeedback:
      'Strong explanation of React Virtual DOM and async event loops. Next time, elaborate more on database transaction isolation levels.',
  },
  {
    id: 'sess-102',
    role: 'Backend Architect (System Design)',
    date: '3 days ago',
    duration: '25 mins',
    overallScore: 82,
    type: 'Peer Mock Session',
    metrics: {
      technicalAccuracy: '84%',
      communicationConfidence: '80%',
      systemArchitecture: '82%',
    },
    aiFeedback:
      'Excellent choice of Redis caching layer and Kafka message queues. Ensure to specify fallback policies during cache invalidation.',
  },
]

export default function InterviewHub() {
  const navigate = useNavigate()
  const [selectedReport, setSelectedReport] = useState(null)

  return (
    <AppShell>
      <PageHeader
        icon={Video}
        title="Interview Practice & Intelligence"
        subtitle="Sharpen your interview readiness with AI mock evaluators and live peer rooms"
      />

      {/* Hero Mode Selection Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* AI Interviewer */}
        <div className="card p-6 flex flex-col justify-between border-purple-500/20 hover:border-purple-500/40 transition group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-purple shadow-glow-purple">
                <Bot size={24} className="text-white" />
              </div>
              <span className="badge bg-purple/15 text-purple font-semibold text-xs">
                AI Evaluator
              </span>
            </div>
            <h3 className="text-xl font-bold text-heading mt-4 group-hover:text-purple transition">
              AI Virtual Interviewer
            </h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Step into an immersive video-call interview room with an AI technical lead. Answer real-time questions with voice input, get instant scoring, and receive targeted coaching.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill><Zap size={12} className="text-purple" /> Instant Setup</Pill>
              <Pill><Mic size={12} className="text-teal" /> Voice Recognition</Pill>
              <Pill><Radio size={12} className="text-blue" /> Live Feedback</Pill>
            </div>
          </div>
          <button
            onClick={() => navigate('/interview/ai')}
            className="btn-primary mt-6 self-start flex items-center gap-2 py-2.5 px-5 font-medium shadow-glow-purple"
          >
            Start AI Interview <ArrowRight size={16} />
          </button>
        </div>

        {/* Live Human Room */}
        <div className="card p-6 flex flex-col justify-between border-teal/20 hover:border-teal/40 transition group">
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal">
                <Users size={24} className="text-white" />
              </div>
              <span className="badge bg-teal/15 text-teal font-semibold text-xs">
                Peer-to-Peer Call
              </span>
            </div>
            <h3 className="text-xl font-bold text-heading mt-4 group-hover:text-teal transition">
              Live Peer Room & AI Co-pilot
            </h3>
            <p className="text-sm text-gray-400 mt-2 leading-relaxed">
              Create a custom interview room and invite a peer or mentor over high-definition WebRTC video. An embedded AI co-pilot sits in the side panel to provide live hint prompts.
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Pill><Video size={12} className="text-teal" /> HD Video Call</Pill>
              <Pill><Bot size={12} className="text-purple" /> AI In-call Assistance</Pill>
              <Pill>Room Codes</Pill>
            </div>
          </div>
          <button
            onClick={() => navigate('/interview/live')}
            className="btn-teal mt-6 self-start flex items-center gap-2 py-2.5 px-5 font-medium"
          >
            Create Peer Room <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Recent Session Performance History */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-heading text-lg">Recent Session Evaluation Reports</h3>
            <p className="text-xs text-gray-400">Review your past performance, AI scorecards, and coaching advice</p>
          </div>
          <span className="text-xs text-purple font-semibold flex items-center gap-1">
            <Award size={14} /> Overall Readiness: 85%
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {RECENT_INTERVIEW_SESSIONS.map((sess) => (
            <div
              key={sess.id}
              className="card p-5 border border-white/5 hover:border-white/10 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-purple bg-purple/10 px-2.5 py-0.5 rounded-full border border-purple/20">
                    {sess.type}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <Calendar size={12} /> {sess.date}
                  </span>
                </div>
                <h4 className="font-bold text-heading text-base mb-1">{sess.role}</h4>
                <p className="text-xs text-gray-400 mb-4">Duration: {sess.duration}</p>

                {/* Metric Pills */}
                <div className="grid grid-cols-3 gap-2 mb-4 text-center">
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Accuracy</p>
                    <p className="text-xs font-bold text-teal mt-0.5">{sess.metrics.technicalAccuracy}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Confidence</p>
                    <p className="text-xs font-bold text-purple mt-0.5">{sess.metrics.communicationConfidence}</p>
                  </div>
                  <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                    <p className="text-[10px] text-gray-400">Score</p>
                    <p className="text-xs font-bold text-heading mt-0.5">{sess.overallScore}/100</p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-xs text-gray-400 truncate max-w-[240px]">
                  💡 {sess.aiFeedback}
                </span>
                <button
                  onClick={() => setSelectedReport(sess)}
                  className="text-xs font-semibold text-purple hover:underline flex items-center gap-1 shrink-0"
                >
                  Full Report <ChevronRight size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Report Modal */}
      {selectedReport && (
        <Modal
          open={!!selectedReport}
          onClose={() => setSelectedReport(null)}
          title={`Interview Evaluation Report: ${selectedReport.role}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="badge bg-purple/15 text-purple font-semibold">{selectedReport.type}</span>
              <span className="text-xs text-gray-400">{selectedReport.date}</span>
            </div>

            <div className="p-4 rounded-xl bg-gradient-purple/10 border border-purple/30 text-center">
              <p className="text-xs uppercase tracking-wider text-purple font-semibold">Overall Readiness Score</p>
              <p className="text-4xl font-extrabold text-heading mt-1">{selectedReport.overallScore} / 100</p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-base-900 border border-white/5">
                <p className="text-xs text-gray-400">Technical Accuracy</p>
                <p className="text-lg font-bold text-teal mt-1">{selectedReport.metrics.technicalAccuracy}</p>
              </div>
              <div className="p-3 rounded-xl bg-base-900 border border-white/5">
                <p className="text-xs text-gray-400">Communication</p>
                <p className="text-lg font-bold text-purple mt-1">{selectedReport.metrics.communicationConfidence}</p>
              </div>
              <div className="p-3 rounded-xl bg-base-900 border border-white/5">
                <p className="text-xs text-gray-400">Architecture</p>
                <p className="text-lg font-bold text-heading mt-1">{selectedReport.metrics.systemArchitecture}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-base-900 border border-white/5 space-y-2">
              <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold flex items-center gap-1">
                <Sparkles size={14} className="text-purple" /> AI Coach Detailed Feedback
              </p>
              <p className="text-xs text-gray-200 leading-relaxed">{selectedReport.aiFeedback}</p>
            </div>

            <button
              onClick={() => setSelectedReport(null)}
              className="w-full btn-primary py-2 text-xs"
            >
              Close Evaluation Report
            </button>
          </div>
        </Modal>
      )}
    </AppShell>
  )
}
