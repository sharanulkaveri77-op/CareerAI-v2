import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { Video, Bot, Users, ArrowRight, Mic, Radio, Zap } from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'

function Pill({ children }) {
  return (
    <span className="badge bg-white/5 text-gray-300 border border-white/10">
      {children}
    </span>
  )
}

export default function InterviewHub() {
  const navigate = useNavigate()

  return (
    <AppShell>
      <PageHeader
        icon={Video}
        title="Interview Practice"
        subtitle="Sharpen your skills with AI or live peers"
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* AI Interviewer */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-purple shadow-glow-purple">
            <Bot size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-heading mt-4">AI Interviewer</h3>
          <p className="text-sm text-gray-400 mt-2 flex-1">
            Hop on a video-call-style interview with an AI interviewer. It asks
            real questions, evaluates your answers, and coaches you to crack
            each one.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Pill><Zap size={12} /> Instant</Pill>
            <Pill><Mic size={12} /> Voice + Video</Pill>
            <Pill><Radio size={12} /> Real-time feedback</Pill>
          </div>
          <button
            onClick={() => navigate('/interview/ai')}
            className="btn-primary mt-5 self-start"
          >
            Start now <ArrowRight size={16} />
          </button>
        </div>

        {/* Live Human Room */}
        <div className="card p-6 flex flex-col">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-teal">
            <Users size={24} className="text-white" />
          </div>
          <h3 className="text-lg font-semibold text-heading mt-4">Live Human Room</h3>
          <p className="text-sm text-gray-400 mt-2 flex-1">
            Create a room and invite a real interviewer over a live
            peer-to-peer video call with in-call chat. An AI coach sits on the
            side to help you crack it.
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            <Pill>Room code</Pill>
            <Pill><Video size={12} /> Live video</Pill>
            <Pill><Bot size={12} /> AI coach</Pill>
          </div>
          <button
            onClick={() => navigate('/interview/live')}
            className="btn-teal mt-5 self-start"
          >
            Start now <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </AppShell>
  )
}
