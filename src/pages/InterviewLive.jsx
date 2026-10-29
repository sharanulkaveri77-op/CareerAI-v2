import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Users,
  Plus,
  ArrowRight,
  Video,
  VideoOff,
  Mic,
  MicOff,
  MessageSquare,
  Sparkles,
  Send,
  Copy,
  Check,
  HelpCircle,
  Code,
  Award,
  CheckCircle2,
  FileText,
  Camera,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import { createRoom, joinRoom, getRoom } from '../api/rooms'
import { generatePeerQuestion } from '../api/interview'

/* ----------------------------- Create / Join ----------------------------- */
function LiveLobby() {
  const navigate = useNavigate()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const createForm = useForm({
    defaultValues: {
      name: '',
      role: 'Full Stack Engineer',
      type: 'Technical',
      level: 'Senior',
    },
  })
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
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
        className="card p-6 space-y-4 border-teal/20"
      >
        <h3 className="font-semibold text-heading flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-teal">
            <Plus size={18} className="text-white" />
          </span>
          Create a Peer Interview Room
        </h3>
        <div>
          <label className="label">Your Name</label>
          <input
            className="input"
            placeholder="e.g. Alex Rivera"
            {...createForm.register('name', { required: 'Name required' })}
          />
          {createForm.formState.errors.name && (
            <p className="text-xs text-danger mt-1">Name is required</p>
          )}
        </div>
        <div>
          <label className="label">Target Job Role</label>
          <input
            className="input"
            placeholder="e.g. Frontend Engineer"
            {...createForm.register('role')}
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Interview Type</label>
            <select className="input" {...createForm.register('type')}>
              <option>Technical</option>
              <option>Behavioral</option>
              <option>System Design</option>
              <option>HR</option>
            </select>
          </div>
          <div>
            <label className="label">Seniority</label>
            <select className="input" {...createForm.register('level')}>
              <option>Junior</option>
              <option>Mid-Level</option>
              <option>Senior</option>
              <option>Staff / Lead</option>
            </select>
          </div>
        </div>
        <button type="submit" disabled={busy} className="btn-teal w-full flex items-center justify-center gap-2 py-2.5">
          {busy ? <Spinner /> : <Plus size={16} />} Create Room
        </button>
      </form>

      {/* Join */}
      <form onSubmit={joinForm.handleSubmit(onJoin)} className="card p-6 space-y-4 border-purple-500/20">
        <h3 className="font-semibold text-heading flex items-center gap-2">
          <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gradient-purple">
            <ArrowRight size={18} className="text-white" />
          </span>
          Join Existing Room
        </h3>
        <div>
          <label className="label">Your Name</label>
          <input
            className="input"
            placeholder="e.g. Jordan"
            {...joinForm.register('name', { required: 'Name required' })}
          />
          {joinForm.formState.errors.name && (
            <p className="text-xs text-danger mt-1">Name is required</p>
          )}
        </div>
        <div>
          <label className="label">6-Character Room Code</label>
          <input
            className="input uppercase tracking-widest font-mono text-base"
            placeholder="e.g. AB12CD"
            maxLength={6}
            {...joinForm.register('roomCode', {
              required: 'Room code required',
              minLength: { value: 6, message: '6-character code required' },
            })}
          />
          {joinForm.formState.errors.roomCode && (
            <p className="text-xs text-danger mt-1">{joinForm.formState.errors.roomCode.message}</p>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
        <p className="text-xs text-gray-400">
          Ask your peer to share their 6-character room code or invite link.
        </p>
        <button type="submit" disabled={busy} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5">
          {busy ? <Spinner /> : <ArrowRight size={16} />} Join Room
        </button>
      </form>
    </div>
  )
}

/* ------------------------------- Session -------------------------------- */
function LiveSession({ roomCode }) {
  const [room, setRoom] = useState(null)
  const [messages, setMessages] = useState([
    {
      from: 'system',
      text: `Room ${roomCode} active. Welcome to your live peer interview room!`,
    },
  ])
  const [text, setText] = useState('')
  const [coachOpen, setCoachOpen] = useState(true)
  const [scratchpadOpen, setScratchpadOpen] = useState(false)
  const [peerScratchpad, setPeerScratchpad] = useState('')
  const [camState, setCamState] = useState('off') // off | on | denied
  const [camEnabled, setCamEnabled] = useState(true)
  const [micMuted, setMicMuted] = useState(false)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)

  // AI Copilot state
  const [generatedQuestion, setGeneratedQuestion] = useState('')
  const [generatingQ, setGeneratingQ] = useState(false)
  const [rubricScores, setRubricScores] = useState({
    situation: false,
    task: false,
    action: false,
    result: false,
  })

  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const chatEndRef = useRef(null)

  // Fetch room metadata
  useEffect(() => {
    ;(async () => {
      const r = await getRoom(roomCode)
      if (r) setRoom(r)
    })()
  }, [roomCode])

  const initMedia = useCallback(async () => {
    try {
      if (!navigator?.mediaDevices?.getUserMedia) {
        setCamState('denied')
        return
      }
      let stream = null
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        } catch {
          setCamState('denied')
          return
        }
      }
      streamRef.current = stream
      setCamState('on')
      setCamEnabled(true)
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch {
      setCamState('denied')
    }
  }, [])

  useEffect(() => {
    initMedia()
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
  }, [initMedia])

  const toggleCamera = () => {
    if (!streamRef.current) {
      initMedia()
      return
    }
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) {
      initMedia()
      return
    }
    track.enabled = !track.enabled
    setCamEnabled(track.enabled)
  }

  const toggleMic = () => {
    const track = streamRef.current?.getAudioTracks()[0]
    if (!track) return
    track.enabled = !track.enabled
    setMicMuted(!track.enabled)
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    setMessages((m) => [...m, { from: 'me', text: text.trim() }])
    setText('')
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(roomCode)
    setCopiedCode(true)
    setTimeout(() => setCopiedCode(false), 2000)
  }

  const handleCopyLink = () => {
    const link = `${window.location.origin}/interview/live/${roomCode}`
    navigator.clipboard.writeText(link)
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  const handleGenerateQuestion = async () => {
    setGeneratingQ(true)
    try {
      const q = await generatePeerQuestion(
        room?.role || 'Software Engineer',
        room?.type || 'Technical'
      )
      setGeneratedQuestion(q)
    } catch {
      setGeneratedQuestion('Walk me through the most technically challenging architecture you built recently.')
    } finally {
      setGeneratingQ(false)
    }
  }

  const handleSendQuestionToChat = () => {
    if (!generatedQuestion) return
    setMessages((m) => [
      ...m,
      {
        from: 'system',
        text: `🎯 Interview Question: ${generatedQuestion}`,
      },
    ])
  }

  return (
    <div className="space-y-4">
      {/* Room Header Strip */}
      <div className="card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 border-teal/20 bg-base-900/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <span className="w-3 h-3 rounded-full bg-teal animate-ping" />
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-heading text-base">
                Peer Interview Room: <span className="font-mono text-teal">{roomCode}</span>
              </h3>
              <span className="badge bg-teal/15 text-teal text-xs">
                {room?.type || 'Technical'} Track
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Role: <span className="text-white font-medium">{room?.role || 'Full Stack Engineer'}</span>
              {room?.host_name ? ` · Host: ${room.host_name}` : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 border-white/10"
            title="Copy 6-character room code"
          >
            {copiedCode ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
            {copiedCode ? 'Code Copied!' : `Code: ${roomCode}`}
          </button>
          <button
            onClick={handleCopyLink}
            className="btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 border-white/10"
            title="Copy invite link to share with peer"
          >
            {copiedLink ? <Check size={13} className="text-teal" /> : <Copy size={13} />}
            {copiedLink ? 'Link Copied!' : 'Copy Invite Link'}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Video & Chat (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Candidate / Local Tile */}
            <div className="relative aspect-video rounded-2xl bg-base-950 overflow-hidden flex items-center justify-center border border-white/10 shadow-lg">
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className={'w-full h-full object-cover ' + (!camEnabled ? 'opacity-20' : '')}
              />
              {camState !== 'on' && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4 text-center">
                  <Users size={36} className="text-gray-600" />
                  <span className="text-xs text-gray-400">
                    {camState === 'denied'
                      ? 'Camera blocked — check browser permissions'
                      : 'Connecting camera…'}
                  </span>
                  {camState === 'denied' && (
                    <button
                      onClick={initMedia}
                      className="btn-primary text-xs py-1.5 px-3 flex items-center gap-1.5 mt-2 shadow"
                    >
                      <Camera size={13} /> Allow / Retry Camera
                    </button>
                  )}
                </div>
              )}
              {!camEnabled && camState === 'on' && (
                <span className="absolute top-3 right-3 badge bg-danger/20 text-danger border border-danger/30 text-xs">
                  Camera off
                </span>
              )}
              <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-lg text-xs text-white">
                <span>You (Local)</span>
                {micMuted && <span className="text-[10px] text-danger font-semibold">Muted</span>}
              </div>
            </div>

            {/* Remote Peer Tile */}
            <div className="relative aspect-video rounded-2xl bg-base-950 overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-lg">
              <div className="w-16 h-16 rounded-full bg-base-900 border border-white/10 flex items-center justify-center mb-2">
                <Users size={28} className="text-gray-500" />
              </div>
              <span className="text-xs font-semibold text-gray-300">Awaiting Peer Connection</span>
              <span className="text-[11px] text-gray-500 mt-1">
                Share code <span className="font-mono text-teal font-bold">{roomCode}</span> with your peer
              </span>
              <span className="absolute bottom-3 left-3 text-xs bg-black/60 px-2.5 py-1 rounded-lg text-white">
                Peer
              </span>
              <span className="absolute top-3 right-3 text-[10px] uppercase tracking-wider text-teal font-semibold">
                Room {roomCode}
              </span>
            </div>
          </div>

          {/* Call Controls Dock */}
          <div className="card p-3 flex items-center justify-between bg-base-900/90 border-white/10">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleMic}
                className={`p-2.5 rounded-xl border transition ${
                  micMuted
                    ? 'bg-danger/20 text-danger border-danger/40'
                    : 'bg-base-800 text-teal border-white/10'
                }`}
                title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
              >
                {micMuted ? <MicOff size={16} /> : <Mic size={16} />}
              </button>
              <button
                onClick={toggleCamera}
                className={`p-2.5 rounded-xl border transition ${
                  !camEnabled
                    ? 'bg-danger/20 text-danger border-danger/40'
                    : 'bg-base-800 text-gray-300 border-white/10'
                }`}
                title={camEnabled ? 'Turn camera off' : 'Turn camera on'}
              >
                {camEnabled ? <Video size={16} /> : <VideoOff size={16} />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setScratchpadOpen((o) => !o)}
                className={`btn-ghost py-1.5 px-3 text-xs flex items-center gap-1.5 border-white/10 ${
                  scratchpadOpen ? 'bg-accent/20 text-accent-light' : ''
                }`}
              >
                <Code size={14} /> {scratchpadOpen ? 'Hide Notes' : 'Scratchpad'}
              </button>
            </div>
          </div>

          {/* Peer Code / Scratchpad Drawer */}
          {scratchpadOpen && (
            <div className="card p-4 space-y-2 border-white/10 bg-base-950">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-gray-300 flex items-center gap-1.5">
                  <Code size={14} className="text-teal" /> Collaborative Code & Architecture Notes
                </span>
                <span className="text-[10px] text-gray-500">Live in-call buffer</span>
              </div>
              <textarea
                className="input font-mono text-xs w-full h-36 resize-none p-3 bg-base-900 border-white/10"
                placeholder="// Paste code snippets, architecture diagrams, or interview notes here..."
                value={peerScratchpad}
                onChange={(e) => setPeerScratchpad(e.target.value)}
              />
            </div>
          )}

          {/* In-Call Chat */}
          <div className="card p-4 flex flex-col h-72 border-white/10 bg-base-900">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-white/5">
              <MessageSquare size={16} className="text-accent-light" />
              <span className="text-sm font-semibold text-heading">In-Call Room Chat</span>
              <span className="text-xs text-gray-500 ml-auto">{messages.length} messages</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`text-xs ${
                    m.from === 'me'
                      ? 'text-right'
                      : m.from === 'system'
                        ? 'text-center'
                        : 'text-left'
                  }`}
                >
                  <span
                    className={`inline-block px-3 py-1.5 rounded-xl max-w-[85%] leading-relaxed ${
                      m.from === 'me'
                        ? 'bg-gradient-purple text-white'
                        : m.from === 'system'
                          ? 'bg-teal/15 text-teal border border-teal/20 text-[11px]'
                          : 'bg-white/5 text-gray-200'
                    }`}
                  >
                    {m.text}
                  </span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 mt-3 pt-2 border-t border-white/5">
              <input
                className="input text-xs"
                placeholder="Type a message or paste a link…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && send()}
              />
              <button onClick={send} className="btn-primary px-4 py-2 text-xs">
                <Send size={14} />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: AI Co-pilot & STAR Rubric (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* AI Question Generator Card */}
          <div className="card p-5 border-purple-500/20 bg-base-900/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-heading uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-purple-400" /> AI Question Generator
              </span>
              <span className="text-[10px] text-gray-400">{room?.type || 'Technical'}</span>
            </div>
            <p className="text-[11px] text-gray-400 leading-normal">
              Generate realistic questions tailored for {room?.role || 'Software Engineer'}. Send directly to chat for your peer!
            </p>

            <button
              onClick={handleGenerateQuestion}
              disabled={generatingQ}
              className="btn-primary w-full py-2 text-xs flex items-center justify-center gap-1.5 shadow-glow-purple"
            >
              {generatingQ ? <Spinner size={13} /> : <Sparkles size={13} />}
              {generatingQ ? 'Generating Question...' : 'Generate Next Question'}
            </button>

            {generatedQuestion && (
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                <p className="text-xs text-gray-200 font-medium leading-relaxed">
                  “{generatedQuestion}”
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleSendQuestionToChat}
                    className="btn-teal py-1 px-2.5 text-[11px] flex items-center gap-1"
                  >
                    <Send size={11} /> Send to Chat
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interactive STAR Evaluation Rubric */}
          <div className="card p-5 border-teal/20 bg-base-900/80 space-y-3">
            <span className="text-xs font-bold text-teal uppercase tracking-wider flex items-center gap-1.5">
              <Award size={14} /> Peer STAR Evaluation Rubric
            </span>
            <p className="text-[11px] text-gray-400">
              Check off criteria as your peer answers to provide constructive feedback:
            </p>

            <div className="space-y-2 text-xs">
              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                <input
                  type="checkbox"
                  checked={rubricScores.situation}
                  onChange={(e) =>
                    setRubricScores((prev) => ({ ...prev, situation: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-gray-600 text-teal focus:ring-teal"
                />
                <div>
                  <p className="font-semibold text-gray-200">S — Situation Context</p>
                  <p className="text-[10px] text-gray-400">Clear problem scope and architecture baseline</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                <input
                  type="checkbox"
                  checked={rubricScores.task}
                  onChange={(e) =>
                    setRubricScores((prev) => ({ ...prev, task: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-gray-600 text-teal focus:ring-teal"
                />
                <div>
                  <p className="font-semibold text-gray-200">T — Personal Ownership</p>
                  <p className="text-[10px] text-gray-400">Articulated what they personally led vs team</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                <input
                  type="checkbox"
                  checked={rubricScores.action}
                  onChange={(e) =>
                    setRubricScores((prev) => ({ ...prev, action: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-gray-600 text-teal focus:ring-teal"
                />
                <div>
                  <p className="font-semibold text-gray-200">A — Trade-offs & Tech Depth</p>
                  <p className="text-[10px] text-gray-400">Evaluated alternative approaches and edge cases</p>
                </div>
              </label>

              <label className="flex items-start gap-2.5 p-2 rounded-lg bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                <input
                  type="checkbox"
                  checked={rubricScores.result}
                  onChange={(e) =>
                    setRubricScores((prev) => ({ ...prev, result: e.target.checked }))
                  }
                  className="mt-0.5 rounded border-gray-600 text-teal focus:ring-teal"
                />
                <div>
                  <p className="font-semibold text-gray-200">R — Measurable Metrics</p>
                  <p className="text-[10px] text-gray-400">Stated concrete numbers (% improvement, SLA, latency)</p>
                </div>
              </label>
            </div>
          </div>
        </div>
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