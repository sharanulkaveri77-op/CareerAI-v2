import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Users,
  Plus,
  ArrowRight,
  Video,
  VideoOff,
  MessageSquare,
  Sparkles,
  Send,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { createRoom, joinRoom } from '../api/rooms'

/* ----------------------------- Create / Join ----------------------------- */
function LiveLobby() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const createForm = useForm()
  const joinForm = useForm()

  const onJoin = async (data) => {
    setBusy(true)
    setError('')
    try {
      await joinRoom(data)
      navigate(`/interview/live/${data.roomCode.toUpperCase()}`)
    } catch (e) {
      setError(e.userMessage || 'Could not join room')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Create */}
      <form
        onSubmit={createForm.handleSubmit(async (data) => {
          setBusy(true)
          setError('')
          try {
            const res = await createRoom(data)
            const code = res.data?.roomCode || res.data?.code
            navigate(`/interview/live/${code}`)
          } catch (e) {
            setError(e.userMessage || 'Could not create room')
          } finally {
            setBusy(false)
          }
        })}
        className="card p-6 space-y-4"
      >
        <h3 className="font-semibold text-heading flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal">
            <Plus size={18} className="text-white" />
          </span>
          Create a Room
        </h3>
        <div>
          <label className="label">Your name</label>
          <input className="input" placeholder="e.g. Alex" {...createForm.register('name', { required: 'Name required' })} />
        </div>
        <div>
          <label className="label">Role (optional)</label>
          <input className="input" placeholder="e.g. Frontend Engineer" {...createForm.register('role')} />
        </div>
        <div>
          <label className="label">Interview type</label>
          <select className="input" {...createForm.register('type')}>
            <option>Technical</option>
            <option>Behavioral</option>
            <option>System Design</option>
            <option>HR</option>
          </select>
        </div>
        <button type="submit" disabled={busy} className="btn-teal">
          {busy ? <Spinner /> : <Plus size={16} />} Create Room
        </button>
      </form>

      {/* Join */}
      <form onSubmit={joinForm.handleSubmit(onJoin)} className="card p-6 space-y-4">
        <h3 className="font-semibold text-heading flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-purple">
            <ArrowRight size={18} className="text-white" />
          </span>
          Join a Room
        </h3>
        <div>
          <label className="label">Your name</label>
          <input className="input" placeholder="e.g. Jordan" {...joinForm.register('name', { required: 'Name required' })} />
        </div>
        <div>
          <label className="label">Room code</label>
          <input className="input uppercase" placeholder="e.g. AB12CD" {...joinForm.register('roomCode', { required: 'Room code required', minLength: { value: 6, message: '6-character code' } })} />
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <p className="text-xs text-gray-500">
          Ask the host to share the 6-character code with you.
        </p>
        <button type="submit" disabled={busy} className="btn-primary">
          {busy ? <Spinner /> : <ArrowRight size={16} />} Join Room
        </button>
      </form>
    </div>
  )
}

/* ------------------------------- Session -------------------------------- */
function LiveSession({ roomCode }) {
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [coachOpen, setCoachOpen] = useState(true)
  const [camState, setCamState] = useState('off') // off | on | denied
  const [camEnabled, setCamEnabled] = useState(true)
  const [coachTips, setCoachTips] = useState([
    'Take a breath — keep answers concise and structured.',
    'Use the STAR method for behavioral questions.',
  ])
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const chatEndRef = useRef(null)

  useEffect(() => {
    ;(async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        streamRef.current = stream
        setCamState('on')
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          videoRef.current.play().catch(() => {})
        }
      } catch {
        setCamState('denied')
      }
    })()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [])

  const toggleCamera = () => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setCamEnabled(track.enabled)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView()
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    setMessages((m) => [...m, { from: 'me', text: text.trim() }])
    setText('')
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Video tiles */}
      <div className="lg:col-span-2 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative aspect-video rounded-xl bg-base-900 overflow-hidden flex items-center justify-center">
            <video ref={videoRef} autoPlay muted playsInline className={'w-full h-full object-cover ' + (!camEnabled ? 'opacity-20' : '')} />
            {camState !== 'on' && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <Users size={40} className="text-gray-600" />
                <span className="text-xs text-gray-500">
                  {camState === 'denied'
                    ? 'Camera blocked — check browser permissions'
                    : 'Starting camera…'}
                </span>
              </div>
            )}
            {!camEnabled && camState === 'on' && (
              <span className="absolute top-2 right-2 badge bg-danger/20 text-danger">
                Camera off
              </span>
            )}
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded">You</span>
          </div>
          <div className="relative aspect-video rounded-xl bg-base-900 overflow-hidden flex items-center justify-center">
            <Users size={40} className="text-gray-600" />
            <span className="absolute bottom-2 left-2 text-xs bg-black/60 px-2 py-0.5 rounded">Peer</span>
            <span className="absolute top-2 right-2 text-[10px] uppercase tracking-wider text-accent-light">Room {roomCode}</span>
          </div>
        </div>

        {/* Chat */}
        <div className="card p-4 flex flex-col h-72">
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} className="text-accent-light" />
            <span className="text-sm font-semibold text-heading">In-call chat</span>
            <button
              onClick={toggleCamera}
              disabled={camState !== 'on'}
              title={camEnabled ? 'Turn camera off' : 'Turn camera on'}
              className={
                'ml-auto btn-ghost px-3 py-1.5 text-xs ' +
                (!camEnabled ? 'text-danger border-danger/40' : '')
              }
            >
              {camEnabled ? <Video size={14} /> : <VideoOff size={14} />}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto space-y-2">
            {messages.length === 0 && (
              <p className="text-xs text-gray-500">No messages yet.</p>
            )}
            {messages.map((m, i) => (
              <div key={i} className={'text-sm ' + (m.from === 'me' ? 'text-right' : 'text-left')}>
                <span className={'inline-block px-3 py-1.5 rounded-xl ' + (m.from === 'me' ? 'bg-gradient-purple text-white' : 'bg-white/5 text-gray-200')}>
                  {m.text}
                </span>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex gap-2 mt-3">
            <input
              className="input"
              placeholder="Type a message…"
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && send()}
            />
            <button onClick={send} className="btn-primary px-3"><Send size={16} /></button>
          </div>
        </div>
      </div>

      {/* AI coach slide-out */}
      <div className="card p-5">
        <button
          onClick={() => setCoachOpen((o) => !o)}
          className="flex items-center gap-2 text-sm font-semibold text-heading mb-3"
        >
          <Sparkles size={16} className="text-accent-light" /> AI Coach
          <span className="ml-auto text-xs text-gray-500">{coachOpen ? 'Hide' : 'Show'}</span>
        </button>
        {coachOpen && (
          <ul className="space-y-3">
            {coachTips.map((t, i) => (
              <li key={i} className="text-sm text-gray-300 bg-accent/10 border border-accent/20 rounded-lg p-3">
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default function InterviewLive() {
  const { roomCode } = useParams()
  return (
    <AppShell>
      <PageHeader
        icon={Users}
        title="Live Human Room"
        subtitle="Peer-to-peer mock interviews with an AI coach"
      />
      {roomCode ? <LiveSession roomCode={roomCode} /> : <LiveLobby />}
    </AppShell>
  )
}
