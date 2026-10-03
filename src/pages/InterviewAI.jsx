import { useEffect, useRef, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import {
  Bot,
  Video,
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  Gauge,
  AlertTriangle,
  Sparkles,
  HelpCircle,
  Code,
  FileText,
  Clock,
  Radio,
  Send,
  Sliders,
  ChevronRight,
  ChevronDown,
  Layers,
  Award,
  BarChart2,
  Copy,
  Download,
  Share2,
  Subtitles,
  Zap,
  Play,
  Pause,
  RefreshCw,
  Eye,
  CornerDownRight,
} from 'lucide-react'
import AppShell from '../components/AppShell'
import PageHeader from '../components/PageHeader'
import { Spinner } from '../components/Feedback'
import {
  startInterview,
  submitAnswer,
  getInterviewHint,
  getInterviewSummary,
} from '../api/interview'

/* -------------------------------------------------------------------------- */
/*                               AI PERSONAS                                  */
/* -------------------------------------------------------------------------- */

const PERSONAS = [
  {
    id: 'sarah',
    name: 'Sarah Vance',
    title: 'Principal Systems Architect',
    company: 'CloudScale & Distributed Labs',
    experience: '12+ yrs',
    gender: 'female',
    voiceRate: 1.02,
    voicePitch: 1.05,
    tagline: 'Deep architecture, failure modes, scalability & trade-offs',
    style: 'Probing & Analytical',
    color: 'from-purple-600 via-indigo-600 to-purple-800',
    borderGlow: 'border-purple-500/40 shadow-purple-500/20',
    accentText: 'text-purple-400',
    accentBg: 'bg-purple-500/10 text-purple-300 border-purple-500/20',
    avatarSvg: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="sarah-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
          <linearGradient id="sarah-hair" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#312e81" />
            <stop offset="100%" stopColor="#1e1b4b" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#sarah-bg)" />
        {/* Hair Back */}
        <path d="M30 55 C25 85, 30 105, 35 115 L85 115 C90 105, 95 85, 90 55 Z" fill="url(#sarah-hair)" />
        {/* Face */}
        <ellipse cx="60" cy="58" rx="22" ry="26" fill="#fed7aa" />
        {/* Eyes */}
        <ellipse cx="51" cy="56" rx="3" ry="2.2" fill="#1e1b4b" />
        <ellipse cx="69" cy="56" rx="3" ry="2.2" fill="#1e1b4b" />
        <circle cx="52" cy="55.2" r="0.8" fill="#ffffff" />
        <circle cx="70" cy="55.2" r="0.8" fill="#ffffff" />
        {/* Eyebrows */}
        <path d="M46 51 Q52 48 56 51" stroke="#312e81" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        <path d="M64 51 Q68 48 74 51" stroke="#312e81" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Nose & Smile */}
        <path d="M60 59 L58 64 L62 64" stroke="#f97316" strokeWidth="1" fill="none" strokeLinecap="round" />
        <path d="M53 71 Q60 76 67 71" stroke="#be123c" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Hair Front */}
        <path d="M34 50 C40 30, 80 30, 86 50 C80 38, 40 38, 34 50 Z" fill="#312e81" />
        {/* Tech Earpiece */}
        <circle cx="37" cy="60" r="3.5" fill="#a855f7" />
        <circle cx="37" cy="60" r="1.5" fill="#ffffff" />
        {/* Blazer */}
        <path d="M35 115 Q60 92 85 115 Z" fill="#1e1b4b" />
        <path d="M50 115 L60 98 L70 115" stroke="#a855f7" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 'alex',
    name: 'Alex Rivera',
    title: 'VP of Engineering & Culture Lead',
    company: 'TechStars & NextGen Velocity',
    experience: '15+ yrs',
    gender: 'male',
    voiceRate: 0.98,
    voicePitch: 0.95,
    tagline: 'Behavioral leadership, conflict resolution, ownership & STAR method',
    style: 'Warm & Strategic',
    color: 'from-emerald-600 via-teal-600 to-slate-900',
    borderGlow: 'border-teal-500/40 shadow-teal-500/20',
    accentText: 'text-teal-400',
    accentBg: 'bg-teal-500/10 text-teal-300 border-teal-500/20',
    avatarSvg: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="alex-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#alex-bg)" />
        {/* Hair */}
        <path d="M36 50 C36 32, 84 32, 84 50 C84 40, 36 40, 36 50 Z" fill="#1f2937" />
        {/* Face */}
        <ellipse cx="60" cy="60" rx="23" ry="27" fill="#fcd34d" />
        {/* Eyes */}
        <ellipse cx="50" cy="57" rx="3" ry="2" fill="#111827" />
        <ellipse cx="70" cy="57" rx="3" ry="2" fill="#111827" />
        {/* Eyebrows */}
        <path d="M45 52 Q51 49 55 52" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        <path d="M65 52 Q69 49 75 52" stroke="#1f2937" strokeWidth="2" fill="none" strokeLinecap="round" />
        {/* Beard / Stubble */}
        <path d="M42 66 Q60 90 78 66 C75 80, 45 80, 42 66 Z" fill="#374151" opacity="0.35" />
        {/* Smile */}
        <path d="M52 72 Q60 78 68 72" stroke="#991b1b" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Glasses */}
        <rect x="42" y="52" width="16" height="11" rx="3" fill="none" stroke="#14b8a6" strokeWidth="1.8" />
        <rect x="62" y="52" width="16" height="11" rx="3" fill="none" stroke="#14b8a6" strokeWidth="1.8" />
        <line x1="58" y1="57" x2="62" y2="57" stroke="#14b8a6" strokeWidth="1.8" />
        {/* Suit */}
        <path d="M32 115 Q60 92 88 115 Z" fill="#1e293b" />
        <polygon points="60,94 54,115 66,115" fill="#14b8a6" />
      </svg>
    ),
  },
  {
    id: 'chen',
    name: 'Dr. Chen Wei',
    title: 'Staff Research & Core Systems Specialist',
    company: 'Apex Autonomous & Kernel Lab',
    experience: '14+ yrs',
    gender: 'male',
    voiceRate: 1.0,
    voicePitch: 1.0,
    tagline: 'Low-level performance, concurrency, algorithms & deep technical probing',
    style: 'Methodical & Rigorous',
    color: 'from-cyan-600 via-blue-600 to-slate-900',
    borderGlow: 'border-cyan-500/40 shadow-cyan-500/20',
    accentText: 'text-cyan-400',
    accentBg: 'bg-cyan-500/10 text-cyan-300 border-cyan-500/20',
    avatarSvg: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="chen-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0891b2" />
            <stop offset="100%" stopColor="#0284c7" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#chen-bg)" />
        {/* Hair */}
        <path d="M35 48 C36 28, 84 28, 85 48 C85 36, 35 36, 35 48 Z" fill="#0f172a" />
        {/* Face */}
        <ellipse cx="60" cy="60" rx="22" ry="26" fill="#ffedd5" />
        {/* Eyes */}
        <ellipse cx="50" cy="57" rx="3.2" ry="1.8" fill="#0f172a" />
        <ellipse cx="70" cy="57" rx="3.2" ry="1.8" fill="#0f172a" />
        {/* Glasses */}
        <circle cx="50" cy="57" r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
        <circle cx="70" cy="57" r="7.5" fill="none" stroke="#38bdf8" strokeWidth="1.6" />
        <line x1="57.5" y1="57" x2="62.5" y2="57" stroke="#38bdf8" strokeWidth="1.6" />
        {/* Thoughtful Smile */}
        <path d="M54 73 Q60 76 66 73" stroke="#9a3412" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        {/* Collar & Tech Jacket */}
        <path d="M34 115 Q60 92 86 115 Z" fill="#0369a1" />
        <path d="M52 115 L60 98 L68 115" stroke="#38bdf8" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
  {
    id: 'maya',
    name: 'Maya Patel',
    title: 'Senior Director of Technical Hiring',
    company: 'Global Frontier Ventures',
    experience: '11+ yrs',
    gender: 'female',
    voiceRate: 1.0,
    voicePitch: 1.1,
    tagline: 'Product intuition, career journey, clarity of impact & culture fit',
    style: 'Empathetic & Polished',
    color: 'from-rose-600 via-pink-600 to-amber-900',
    borderGlow: 'border-pink-500/40 shadow-pink-500/20',
    accentText: 'text-pink-400',
    accentBg: 'bg-pink-500/10 text-pink-300 border-pink-500/20',
    avatarSvg: (
      <svg viewBox="0 0 120 120" className="w-full h-full">
        <defs>
          <linearGradient id="maya-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#db2777" />
            <stop offset="100%" stopColor="#831843" />
          </linearGradient>
        </defs>
        <circle cx="60" cy="60" r="56" fill="url(#maya-bg)" />
        {/* Hair */}
        <path d="M28 55 C22 90, 26 110, 32 115 L88 115 C94 110, 98 90, 92 55 Z" fill="#262626" />
        {/* Face */}
        <ellipse cx="60" cy="59" rx="22" ry="26" fill="#fbcfe8" />
        {/* Eyes */}
        <ellipse cx="51" cy="56" rx="3.2" ry="2.2" fill="#1c1917" />
        <ellipse cx="69" cy="56" rx="3.2" ry="2.2" fill="#1c1917" />
        <circle cx="52" cy="55.2" r="0.8" fill="#ffffff" />
        <circle cx="70" cy="55.2" r="0.8" fill="#ffffff" />
        {/* Warm Smile */}
        <path d="M52 71 Q60 77 68 71" stroke="#be185d" strokeWidth="2.2" fill="none" strokeLinecap="round" />
        {/* Hair Top */}
        <path d="M30 48 C40 28, 80 28, 90 48 C80 34, 40 34, 30 48 Z" fill="#262626" />
        {/* Earrings */}
        <circle cx="36" cy="63" r="2.5" fill="#f59e0b" />
        <circle cx="84" cy="63" r="2.5" fill="#f59e0b" />
        {/* Professional Top */}
        <path d="M34 115 Q60 92 86 115 Z" fill="#be185d" />
        <path d="M50 115 Q60 102 70 115" stroke="#f472b6" strokeWidth="1.5" fill="none" />
      </svg>
    ),
  },
]

const TYPES = ['Technical', 'Behavioral', 'System Design', 'HR']
const FILLER_WORDS = /\b(um+|uh+|er+|ah+|like|basically|actually|literally|you know|i mean|sort of|kind of)\b/gi

const SpeechRecognitionClass =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

function countFillers(text) {
  const matches = (text || '').match(FILLER_WORDS)
  return matches ? matches.length : 0
}

/* -------------------------------------------------------------------------- */
/*                               MAIN COMPONENT                              */
/* -------------------------------------------------------------------------- */

export default function InterviewAI() {
  const navigate = useNavigate()

  // Setup state
  const [started, setStarted] = useState(false)
  const [ended, setEnded] = useState(false)
  const [selectedPersona, setSelectedPersona] = useState(PERSONAS[0])
  const [selectedType, setSelectedType] = useState('Technical')
  const [targetRole, setTargetRole] = useState('Senior Full Stack Engineer')
  const [experienceLevel, setExperienceLevel] = useState('Senior (4-7 yrs)')
  const [questionCountTarget] = useState(5)

  // In-session interview state
  const [sessionId, setSessionId] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [questionIndex, setQuestionIndex] = useState(1)
  const [answerText, setAnswerText] = useState('')
  const [scratchpad, setScratchpad] = useState('')
  const [aiState, setAiState] = useState('idle') // 'speaking' | 'listening' | 'thinking' | 'idle'
  const [nonVerbalCue, setNonVerbalCue] = useState('')
  const [activeHint, setActiveHint] = useState('')
  const [hintLoading, setHintLoading] = useState(false)
  const [answering, setAnswering] = useState(false)
  const [feedbackHistory, setFeedbackHistory] = useState([])
  const [summary, setSummary] = useState(null)
  const [error, setError] = useState('')

  // Live in-call features
  const [handsFree, setHandsFree] = useState(true) // Auto turn-taking
  const [showCaptions, setShowCaptions] = useState(true)
  const [activeTab, setActiveTab] = useState('conversation') // 'conversation' | 'scratchpad' | 'coach'
  const [silenceCountdown, setSilenceCountdown] = useState(null)
  const [ttsOn, setTtsOn] = useState(true)
  const [camEnabled, setCamEnabled] = useState(true)
  const [micMuted, setMicMuted] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [totalElapsed, setTotalElapsed] = useState(0)
  const [mirrorCam, setMirrorCam] = useState(true)

  // Media & timers refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const questionStartRef = useRef(Date.now())
  const totalStartRef = useRef(Date.now())
  const recognitionRef = useRef(null)
  const silenceTimerRef = useRef(null)
  const transcriptFeedRef = useRef(null)
  const activeQuestionRef = useRef('')
  const answerTextRef = useRef('')
  const isSpeakingRef = useRef(false)

  // Sync refs for async recognition callbacks
  activeQuestionRef.current = currentQuestion
  answerTextRef.current = answerText

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      role: 'Senior Full Stack Engineer',
      type: 'Technical',
      personaId: 'sarah',
    },
  })

  /* -------------------------------------------------------------------------- */
  /*                          NATURAL VOICE SYNTHESIS                           */
  /* -------------------------------------------------------------------------- */

  const speak = useCallback(
    (text, onComplete) => {
      if (!ttsOn || !text || typeof window === 'undefined' || !window.speechSynthesis) {
        onComplete?.()
        return
      }

      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      const voices = window.speechSynthesis.getVoices()

      // Look for pleasant, natural English voice match
      const p = selectedPersona
      let preferred = voices.find(
        (v) =>
          v.lang.startsWith('en') &&
          ((p.gender === 'female' &&
            (v.name.includes('Female') ||
              v.name.includes('Zira') ||
              v.name.includes('Samantha') ||
              v.name.includes('Jenny') ||
              v.name.includes('Natural') ||
              v.name.includes('Google US English'))) ||
            (p.gender === 'male' &&
              (v.name.includes('Male') ||
                v.name.includes('David') ||
                v.name.includes('Alex') ||
                v.name.includes('Guy') ||
                v.name.includes('Christopher'))))
      )
      if (!preferred) {
        preferred = voices.find((v) => v.lang.startsWith('en'))
      }
      if (preferred) utterance.voice = preferred

      utterance.rate = p.voiceRate || 1.0
      utterance.pitch = p.voicePitch || 1.0

      utterance.onstart = () => {
        isSpeakingRef.current = true
        setAiState('speaking')
      }

      utterance.onend = () => {
        isSpeakingRef.current = false
        setAiState('listening')
        onComplete?.()
      }

      utterance.onerror = () => {
        isSpeakingRef.current = false
        setAiState('listening')
        onComplete?.()
      }

      window.speechSynthesis.speak(utterance)
    },
    [ttsOn, selectedPersona]
  )

  /* -------------------------------------------------------------------------- */
  /*                     SPEECH RECOGNITION & HANDS-FREE                        */
  /* -------------------------------------------------------------------------- */

  const startListening = useCallback(() => {
    if (!SpeechRecognitionClass || micMuted) return
    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort()
        } catch {
          // ignore
        }
      }

      const rec = new SpeechRecognitionClass()
      rec.continuous = true
      rec.interimResults = true
      rec.lang = 'en-US'

      rec.onresult = (e) => {
        let finalStr = ''
        let interimStr = ''
        for (let i = e.resultIndex; i < e.results.length; i++) {
          const res = e.results[i]
          if (res.isFinal) finalStr += res[0].transcript
          else interimStr += res[0].transcript
        }

        if (finalStr.trim()) {
          setAnswerText((prev) => (prev ? `${prev} ${finalStr.trim()}` : finalStr.trim()))
        }

        // Trigger Hands-Free Silence Detection if speech detected
        if (handsFree && (answerTextRef.current.length > 20 || finalStr.length > 10)) {
          resetSilenceCountdown()
        }
      }

      rec.onerror = (e) => {
        if (e.error === 'not-allowed') {
          setError('Microphone access blocked. Please enable mic permissions.')
        }
      }

      rec.onend = () => {
        // Automatically restart recognition if session is live and AI isn't speaking
        if (started && !ended && !isSpeakingRef.current && !micMuted) {
          try {
            rec.start()
          } catch {
            // ignore
          }
        }
      }

      rec.start()
      recognitionRef.current = rec
    } catch {
      // Speech recognition start error
    }
  }, [handsFree, micMuted, started, ended])

  const stopListening = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    setSilenceCountdown(null)
    try {
      recognitionRef.current?.abort()
    } catch {
      // ignore
    }
    recognitionRef.current = null
  }, [])

  // Auto-submit countdown trigger
  const resetSilenceCountdown = useCallback(() => {
    if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current)
    setSilenceCountdown(3)

    let remaining = 3
    const interval = setInterval(() => {
      remaining -= 1
      if (remaining > 0) {
        setSilenceCountdown(remaining)
      } else {
        clearInterval(interval)
        setSilenceCountdown(null)
        // Automatically submit candidate's answer if enough content exists
        if (answerTextRef.current.trim().split(/\s+/).length >= 4) {
          handleAutoSubmit()
        }
      }
    }, 900)

    silenceTimerRef.current = interval
  }, [])

  /* -------------------------------------------------------------------------- */
  /*                             WEBCAM & AUDIO VU                              */
  /* -------------------------------------------------------------------------- */

  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
      // Audio level analyser
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)()
        const src = ctx.createMediaStreamSource(stream)
        const analyser = ctx.createAnalyser()
        analyser.fftSize = 256
        src.connect(analyser)
        audioCtxRef.current = ctx
        analyserRef.current = analyser
      } catch {
        // optional analyser
      }
    } catch {
      setCamEnabled(false)
    }
  }

  const stopMedia = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
    audioCtxRef.current?.close().catch(() => {})
    audioCtxRef.current = null
    analyserRef.current = null
  }

  // Session clock
  useEffect(() => {
    if (!started || ended) return undefined
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - questionStartRef.current) / 1000))
      setTotalElapsed(Math.floor((Date.now() - totalStartRef.current) / 1000))
    }, 500)
    return () => clearInterval(interval)
  }, [started, ended])

  // Scroll transcript feed to bottom
  useEffect(() => {
    transcriptFeedRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [feedbackHistory, activeHint])

  /* -------------------------------------------------------------------------- */
  /*                            INTERVIEW WORKFLOW                              */
  /* -------------------------------------------------------------------------- */

  const handleStartSetup = async (formData) => {
    setError('')
    const persona = PERSONAS.find((p) => p.id === formData.personaId) || PERSONAS[0]
    setSelectedPersona(persona)
    setSelectedType(formData.type)
    setTargetRole(formData.role)

    try {
      setAiState('thinking')
      const res = await startInterview({
        role: formData.role,
        type: formData.type,
        persona: { name: persona.name, title: persona.title },
      })

      const { sessionId: sid, question: q } = res.data
      setSessionId(sid)
      setCurrentQuestion(q || 'Tell me about yourself and your background.')
      setQuestionIndex(1)
      setStarted(true)
      questionStartRef.current = Date.now()
      totalStartRef.current = Date.now()
      setAiState('speaking')

      await initWebcam()

      // Speak initial opening question
      speak(q || 'Tell me about yourself and your background.', () => {
        setAiState('listening')
        if (handsFree) startListening()
      })
    } catch (e) {
      setError(e.userMessage || 'Could not start interview. Check connection.')
      setAiState('idle')
    }
  }

  const handleNextTurn = async () => {
    if (!answerText.trim() && !scratchpad.trim()) return
    setAnswering(true)
    setAiState('thinking')
    stopListening()

    const currentQ = currentQuestion
    const currentAns = answerText
    const currentPad = scratchpad

    const words = currentAns.trim() ? currentAns.trim().split(/\s+/).length : 0
    const seconds = Math.max(1, Math.round((Date.now() - questionStartRef.current) / 1000))
    const wpm = Math.round((words / seconds) * 60)
    const fillers = countFillers(currentAns)

    try {
      const res = await submitAnswer({
        sessionId,
        question: currentQ,
        answer: currentAns,
        scratchpad: currentPad,
        type: selectedType,
        role: targetRole,
        persona: { name: selectedPersona.name, title: selectedPersona.title },
      })

      const data = res.data || {}
      const aiResp = data.aiResponse || 'Thank you for your detailed answer.'
      const fb = data.feedback || ''
      const rating = data.rating || 'Good'
      const nextQ = data.nextQuestion || ''
      const cue = data.nonVerbalCue || 'Evaluating candidate explanation'

      setNonVerbalCue(cue)

      const historyItem = {
        id: crypto.randomUUID(),
        question: currentQ,
        answer: currentAns,
        scratchpad: currentPad,
        aiResponse: aiResp,
        tip: fb,
        rating,
        cue,
        modelAnswerSnippet: data.modelAnswerSnippet || '',
        stats: { words, seconds, wpm, fillers },
      }

      setFeedbackHistory((prev) => [...prev, historyItem])
      setAnswerText('')
      setScratchpad('')
      setActiveHint('')
      setElapsed(0)
      questionStartRef.current = Date.now()

      // Check if finished or continue to next question
      if (questionIndex >= questionCountTarget || !nextQ) {
        handleEndSession()
      } else {
        setQuestionIndex((prev) => prev + 1)
        setCurrentQuestion(nextQ)
        setAiState('speaking')

        // Live spoken conversation: AI responds directly to your answer, then delivers next question
        const spokenPayload = `${aiResp} Now, let's explore this: ${nextQ}`
        speak(spokenPayload, () => {
          setAiState('listening')
          if (handsFree) startListening()
        })
      }
    } catch (e) {
      setError(e.userMessage || 'Failed to analyze answer')
      setAiState('listening')
    } finally {
      setAnswering(false)
    }
  }

  const handleAutoSubmit = () => {
    if (!answering && answerTextRef.current.trim()) {
      handleNextTurn()
    }
  }

  const handleRequestHint = async () => {
    if (hintLoading || !currentQuestion) return
    setHintLoading(true)
    try {
      const res = await getInterviewHint({
        sessionId,
        question: currentQuestion,
        role: targetRole,
        type: selectedType,
        persona: { name: selectedPersona.name, title: selectedPersona.title },
      })
      const hint = res.data?.hint || 'Think through the core trade-offs and consider how scaling affects state.'
      setActiveHint(hint)
      // AI speaks hint aloud gently
      speak(hint, () => {
        setAiState('listening')
        if (handsFree) startListening()
      })
    } catch {
      setActiveHint('Break the problem into components: input validation, core logic, and failure handling.')
    } finally {
      setHintLoading(false)
    }
  }

  const handleRepeatQuestion = () => {
    if (!currentQuestion) return
    speak(currentQuestion, () => {
      setAiState('listening')
      if (handsFree) startListening()
    })
  }

  const handleEndSession = async () => {
    stopListening()
    window.speechSynthesis?.cancel()
    setAiState('thinking')

    try {
      const res = await getInterviewSummary({
        sessionId,
        role: targetRole,
        type: selectedType,
        history: feedbackHistory.map((f) => ({
          question: f.question,
          answer: f.answer,
          scratchpad: f.scratchpad,
          tip: f.tip,
          rating: f.rating,
        })),
      })
      setSummary(res.data)
    } catch {
      // summary fallback
      setSummary({
        score: 82,
        technicalScore: 84,
        starScore: 80,
        communicationScore: 85,
        overall: 'Strong interview readiness with clear articulation of technical systems.',
        strengths: ['Clear systems knowledge', 'Quick recovery under questioning'],
        improvements: ['Quantify business metrics using STAR', 'State latency limits early'],
      })
    } finally {
      stopMedia()
      setEnded(true)
      setAiState('idle')
    }
  }

  const resetAll = () => {
    setEnded(false)
    setStarted(false)
    setSummary(null)
    setFeedbackHistory([])
    setAnswerText('')
    setScratchpad('')
    setError('')
    setQuestionIndex(1)
  }

  // Keyboard shortcut: Spacebar to toggle mic or complete turn
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      if (e.code === 'Space' && started && !ended) {
        e.preventDefault()
        if (aiState === 'listening' && answerText.trim()) {
          handleNextTurn()
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [started, ended, aiState, answerText])

  /* -------------------------------------------------------------------------- */
  /*                            METRICS & CALCULATIONS                          */
  /* -------------------------------------------------------------------------- */

  const liveWords = answerText.trim() ? answerText.trim().split(/\s+/).length : 0
  const liveWpm = Math.round((liveWords / Math.max(1, elapsed)) * 60) || 0
  const liveFillers = countFillers(answerText)
  const paceSignal =
    liveWpm === 0 ? 'Ready' : liveWpm < 95 ? 'Deliberate' : liveWpm > 165 ? 'Fast' : 'Optimal'

  const fmtClock = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`

  /* -------------------------------------------------------------------------- */
  /*                                RENDER UI                                  */
  /* -------------------------------------------------------------------------- */

  return (
    <AppShell>
      {/* ----------------------------- SETUP STAGE ----------------------------- */}
      {!started && !ended && (
        <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
          <PageHeader
            icon={Bot}
            title="Live AI Mock Interview Room"
            subtitle="Engage in a hyper-realistic, 2-way voice video call with elite AI technical leads & engineering executives"
          />

          {error && (
            <div className="p-4 rounded-xl bg-danger/10 border border-danger/30 text-danger text-sm flex items-center gap-2">
              <AlertTriangle size={18} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(handleStartSetup)} className="space-y-8">
            {/* Step 1: Select AI Interviewer */}
            <div className="card p-6 border-white/10 bg-base-900/60 backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-heading flex items-center gap-2">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-purple text-white text-xs font-mono">
                      1
                    </span>
                    Choose Your AI Interviewer
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Each hiring manager has distinct probing styles, evaluation criteria, and conversational tone.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {PERSONAS.map((p) => {
                  const isSelected = selectedPersona.id === p.id
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedPersona(p)}
                      className={`relative cursor-pointer rounded-2xl p-4 transition-all duration-200 border flex flex-col justify-between ${
                        isSelected
                          ? `bg-base-800 ${p.borderGlow} shadow-lg scale-[1.02]`
                          : 'bg-base-950/60 border-white/5 hover:border-white/20 hover:bg-base-900'
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-3 right-3 flex items-center justify-center w-5 h-5 rounded-full bg-accent text-white">
                          <CheckCircle2 size={13} />
                        </span>
                      )}

                      <div>
                        {/* Avatar */}
                        <div className="w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden shadow-md bg-base-900 border border-white/10 p-1">
                          {p.avatarSvg}
                        </div>

                        <h4 className="font-bold text-heading text-center text-sm">{p.name}</h4>
                        <p className={`text-[11px] text-center font-medium ${p.accentText}`}>
                          {p.title}
                        </p>
                        <p className="text-[10px] text-gray-400 text-center mt-0.5">{p.company}</p>

                        <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-gray-300 space-y-1.5">
                          <p className="leading-tight text-gray-400">{p.tagline}</p>
                        </div>
                      </div>

                      <div className="mt-4 pt-2">
                        <span
                          className={`badge text-[10px] w-full justify-center ${p.accentBg}`}
                        >
                          Style: {p.style}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Step 2: Role & Interview Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card p-6 border-white/10 space-y-4">
                <h3 className="text-base font-bold text-heading flex items-center gap-2">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-teal text-white text-xs font-mono">
                    2
                  </span>
                  Interview Specifications
                </h3>

                <div>
                  <label className="label">Target Job Role</label>
                  <input
                    className="input"
                    placeholder="e.g. Senior Backend Architect / Staff React Engineer"
                    {...register('role', { required: 'Target role is required' })}
                  />
                  {errors.role && (
                    <p className="text-xs text-danger mt-1">{errors.role.message}</p>
                  )}
                </div>

                <div>
                  <label className="label">Interview Track</label>
                  <select className="input" {...register('type')}>
                    {TYPES.map((t) => (
                      <option key={t}>{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="card p-6 border-white/10 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-heading flex items-center gap-2 mb-3">
                    <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-purple text-white text-xs font-mono">
                      3
                    </span>
                    Live Call Preferences
                  </h3>

                  <div className="space-y-3">
                    <label className="flex items-center justify-between p-3 rounded-xl bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                      <div className="flex items-center gap-3">
                        <Zap size={18} className="text-teal" />
                        <div>
                          <p className="text-xs font-semibold text-gray-200">
                            Hands-Free Voice Flow
                          </p>
                          <p className="text-[11px] text-gray-400">
                            AI listens automatically when done speaking; submits after natural pause.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={handsFree}
                        onChange={(e) => setHandsFree(e.target.checked)}
                        className="rounded border-gray-600 text-teal focus:ring-teal"
                      />
                    </label>

                    <label className="flex items-center justify-between p-3 rounded-xl bg-base-950 border border-white/5 cursor-pointer hover:border-white/10">
                      <div className="flex items-center gap-3">
                        <Subtitles size={18} className="text-purple-400" />
                        <div>
                          <p className="text-xs font-semibold text-gray-200">Live Captions (CC)</p>
                          <p className="text-[11px] text-gray-400">
                            Real-time streaming speech-to-text overlay on video call screen.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={showCaptions}
                        onChange={(e) => setShowCaptions(e.target.checked)}
                        className="rounded border-gray-600 text-purple-600 focus:ring-purple-500"
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-teal animate-pulse" />
                    Ultra-low latency Gemini AI active
                  </div>

                  <button
                    type="submit"
                    className="btn-primary py-3 px-6 shadow-glow-purple flex items-center gap-2 text-sm font-semibold"
                  >
                    <Video size={18} /> Join Live Call
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ----------------------------- LIVE IN-CALL STAGE ----------------------------- */}
      {started && !ended && (
        <div className="h-[calc(100vh-6rem)] flex flex-col space-y-3 animate-fadeIn">
          {/* Top Meeting Room Status Header */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-2xl bg-base-900/80 border border-white/10 backdrop-blur-md">
            {/* Left: Status & Role */}
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-danger/20 border border-danger/30 text-danger text-[11px] font-bold tracking-wider">
                <span className="w-2 h-2 rounded-full bg-danger animate-ping" /> REC
              </span>
              <div className="h-4 w-px bg-white/10" />
              <div>
                <span className="text-xs font-bold text-heading">{targetRole}</span>
                <span className="text-[11px] text-gray-400 ml-2">({selectedType} Track)</span>
              </div>
            </div>

            {/* Center: Question Progress */}
            <div className="flex items-center gap-2 bg-base-950/80 px-3 py-1 rounded-xl border border-white/5">
              <span className="text-xs font-semibold text-accent-light">
                Question {questionIndex} of {questionCountTarget}
              </span>
              <div className="flex items-center gap-1 ml-1">
                {Array.from({ length: questionCountTarget }).map((_, i) => (
                  <span
                    key={i}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i + 1 === questionIndex
                        ? 'bg-accent w-4'
                        : i + 1 < questionIndex
                          ? 'bg-teal'
                          : 'bg-white/15'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Right: Timers & Audio Status */}
            <div className="flex items-center gap-4 text-xs text-gray-300">
              <div className="flex items-center gap-1.5" title="Time on current question">
                <Clock size={13} className="text-gray-400" />
                <span className="font-mono text-gray-200">{fmtClock(elapsed)}</span>
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 text-gray-400" title="Total call duration">
                <span>Total:</span>
                <span className="font-mono text-gray-200">{fmtClock(totalElapsed)}</span>
              </div>
              <button
                onClick={handleEndSession}
                className="btn-ghost py-1 px-3 text-xs text-danger hover:bg-danger/10 border-danger/30"
              >
                End Call
              </button>
            </div>
          </div>

          {/* Main Stage: Split Screen Video Grid & Interactive Drawer */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            {/* VIDEO STAGE (8 COLS) */}
            <div className="lg:col-span-8 flex flex-col gap-3 min-h-0">
              <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 min-h-0">
                {/* 1. AI INTERVIEWER SCREEN */}
                <div
                  className={`relative rounded-2xl bg-base-950 border overflow-hidden flex flex-col justify-between p-4 shadow-xl transition-all duration-300 ${
                    aiState === 'speaking'
                      ? 'border-purple-500/50 shadow-purple-500/20'
                      : aiState === 'thinking'
                        ? 'border-cyan-500/50'
                        : 'border-white/10'
                  }`}
                >
                  {/* Backdrop Glow */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-b ${selectedPersona.color} opacity-20 pointer-events-none`}
                  />

                  {/* Tile Top Overlay */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-base-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                      <Bot size={14} className={selectedPersona.accentText} />
                      <span className="text-xs font-semibold text-heading">
                        {selectedPersona.name}
                      </span>
                      <span className="text-[10px] text-gray-400">· {selectedPersona.company}</span>
                    </div>

                    {/* AI State Badge */}
                    <div className="flex items-center gap-2">
                      {aiState === 'speaking' && (
                        <span className="badge bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] animate-pulse flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                          Speaking aloud...
                        </span>
                      )}
                      {aiState === 'listening' && (
                        <span className="badge bg-teal/20 text-teal border border-teal/30 text-[10px] flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal animate-ping" />
                          Listening attentively...
                        </span>
                      )}
                      {aiState === 'thinking' && (
                        <span className="badge bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] animate-pulse flex items-center gap-1.5">
                          <Spinner size={10} />
                          Formulating follow-up...
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Tile Center: Animated Interactive Avatar */}
                  <div className="relative z-10 flex flex-col items-center justify-center my-auto">
                    <div className="relative flex items-center justify-center">
                      {/* Speaking Pulse Ring */}
                      {aiState === 'speaking' && (
                        <div className="absolute inset-0 rounded-full speaking-glow pointer-events-none" />
                      )}
                      {aiState === 'listening' && (
                        <div className="absolute inset-0 rounded-full listening-glow pointer-events-none" />
                      )}

                      {/* Main Avatar Frame */}
                      <div
                        className={`w-32 h-32 md:w-36 md:h-36 rounded-3xl p-1 bg-base-900/90 border-2 backdrop-blur-sm shadow-2xl transition-transform duration-300 ${
                          aiState === 'speaking'
                            ? 'border-purple-400 scale-105'
                            : 'border-white/10'
                        }`}
                      >
                        {selectedPersona.avatarSvg}
                      </div>

                      {/* Speaking Equalizer Bar Wave */}
                      {aiState === 'speaking' && (
                        <div className="absolute -bottom-3 flex items-end justify-center gap-1 px-3 py-1 rounded-full bg-base-900/90 border border-purple-500/40 shadow-lg h-7">
                          <span className="w-1 rounded bg-purple-400 animate-eq-1" />
                          <span className="w-1 rounded bg-purple-300 animate-eq-2" />
                          <span className="w-1 rounded bg-purple-500 animate-eq-3" />
                          <span className="w-1 rounded bg-purple-400 animate-eq-4" />
                          <span className="w-1 rounded bg-purple-200 animate-eq-5" />
                        </div>
                      )}
                    </div>

                    {/* Non-Verbal Cue Toast */}
                    {nonVerbalCue && (
                      <div className="mt-4 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] text-gray-300 flex items-center gap-1.5 animate-fadeIn">
                        <Sparkles size={11} className="text-yellow-400" />
                        <span>{nonVerbalCue}</span>
                      </div>
                    )}
                  </div>

                  {/* Tile Bottom: AI Live Question Subtitles / CC */}
                  <div className="relative z-10 space-y-2">
                    {showCaptions && (
                      <div className="live-cc-backdrop rounded-xl p-3 border border-white/10 shadow-lg">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] uppercase tracking-wider font-bold text-accent-light">
                            Interviewer Question
                          </span>
                          <button
                            onClick={handleRepeatQuestion}
                            className="text-[11px] text-gray-400 hover:text-white flex items-center gap-1 transition"
                            title="Re-speak question"
                          >
                            <RotateCcw size={11} /> Replay Audio
                          </button>
                        </div>
                        <p className="text-xs md:text-sm font-medium text-gray-100 leading-snug">
                          {currentQuestion}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. CANDIDATE WEBCAM SCREEN */}
                <div className="relative rounded-2xl bg-base-950 border border-white/10 overflow-hidden flex flex-col justify-between p-4 shadow-xl">
                  {/* Live Video Feed */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                      mirrorCam ? 'scale-x-[-1]' : ''
                    } ${!camEnabled ? 'opacity-0' : 'opacity-100'}`}
                  />

                  {/* Camera Off Fallback */}
                  {!camEnabled && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-base-900/90 text-gray-400 gap-2">
                      <div className="flex items-center justify-center w-16 h-16 rounded-full bg-base-800 border border-white/10">
                        <VideoOff size={24} className="text-gray-400" />
                      </div>
                      <span className="text-xs">Camera is turned off</span>
                    </div>
                  )}

                  {/* Overlay Top Bar */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-2 bg-base-900/80 backdrop-blur-md px-3 py-1 rounded-xl border border-white/10">
                      <span className="text-xs font-semibold text-gray-200">You (Candidate)</span>
                      {micMuted && (
                        <span className="text-[10px] text-danger flex items-center gap-1">
                          <MicOff size={11} /> Muted
                        </span>
                      )}
                    </div>

                    {/* Silence Auto-submit Countdown */}
                    {silenceCountdown !== null && (
                      <div className="badge bg-teal/20 text-teal border border-teal/30 text-[11px] animate-pulse flex items-center gap-1">
                        <Zap size={11} />
                        Auto-submitting in {silenceCountdown}s...
                      </div>
                    )}
                  </div>

                  {/* Overlay Center: Speech Teleprompter Subtitles */}
                  <div className="relative z-10 my-auto">
                    {answerText && showCaptions && (
                      <div className="live-cc-backdrop rounded-xl p-3 border border-white/10 max-h-24 overflow-y-auto">
                        <p className="text-xs text-gray-200 italic leading-relaxed">
                          “{answerText}”
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Overlay Bottom: Telemetry Bar (WPM, Fillers, Words) */}
                  <div className="relative z-10 flex items-center justify-between gap-2 flex-wrap bg-base-950/70 backdrop-blur-md p-2 rounded-xl border border-white/10 text-[11px]">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-300 font-mono">{liveWords} words</span>
                      <span className="text-gray-500">·</span>
                      <span
                        className={`font-medium ${
                          paceSignal === 'Optimal'
                            ? 'text-teal'
                            : paceSignal === 'Fast'
                              ? 'text-orange'
                              : 'text-gray-400'
                        }`}
                      >
                        {liveWpm} WPM ({paceSignal})
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`${
                          liveFillers > 2 ? 'text-danger font-semibold' : 'text-gray-400'
                        }`}
                      >
                        Fillers: {liveFillers}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* IN-CALL BOTTOM CONTROLS DOCK */}
              <div className="rounded-2xl bg-base-900/90 border border-white/10 p-3 flex items-center justify-between backdrop-blur-md">
                {/* Left tools: Clarify / Hint */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRequestHint}
                    disabled={hintLoading || aiState === 'thinking'}
                    className="btn-ghost text-xs py-2 px-3 border-white/10 hover:border-accent text-accent-light flex items-center gap-1.5"
                    title="Ask interviewer for scope clarification or hint"
                  >
                    {hintLoading ? <Spinner size={12} /> : <HelpCircle size={14} />}
                    Ask for Clarification / Hint
                  </button>
                  <button
                    onClick={handleRepeatQuestion}
                    className="btn-ghost text-xs py-2 px-3 border-white/10 text-gray-300 hover:text-white flex items-center gap-1.5"
                    title="Re-read question aloud"
                  >
                    <Volume2 size={14} /> Repeat Question
                  </button>
                </div>

                {/* Center Call Controls */}
                <div className="flex items-center gap-2">
                  {/* Mic Toggle */}
                  <button
                    onClick={() => {
                      if (micMuted) {
                        setMicMuted(false)
                        startListening()
                      } else {
                        setMicMuted(true)
                        stopListening()
                      }
                    }}
                    className={`p-3 rounded-xl transition ${
                      micMuted
                        ? 'bg-danger/20 text-danger border border-danger/40'
                        : 'bg-base-800 text-teal hover:bg-base-750 border border-white/10'
                    }`}
                    title={micMuted ? 'Unmute microphone' : 'Mute microphone'}
                  >
                    {micMuted ? <MicOff size={18} /> : <Mic size={18} />}
                  </button>

                  {/* Camera Toggle */}
                  <button
                    onClick={() => setCamEnabled((prev) => !prev)}
                    className={`p-3 rounded-xl transition ${
                      !camEnabled
                        ? 'bg-danger/20 text-danger border border-danger/40'
                        : 'bg-base-800 text-gray-200 hover:bg-base-750 border border-white/10'
                    }`}
                    title={camEnabled ? 'Turn camera off' : 'Turn camera on'}
                  >
                    {camEnabled ? <Video size={18} /> : <VideoOff size={18} />}
                  </button>

                  {/* Captions Toggle */}
                  <button
                    onClick={() => setShowCaptions((prev) => !prev)}
                    className={`p-3 rounded-xl transition ${
                      showCaptions
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                        : 'bg-base-800 text-gray-400 hover:bg-base-750 border border-white/10'
                    }`}
                    title="Toggle Live Closed Captions"
                  >
                    <Subtitles size={18} />
                  </button>

                  {/* Hands-Free Mode Toggle */}
                  <button
                    onClick={() => setHandsFree((prev) => !prev)}
                    className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition ${
                      handsFree
                        ? 'bg-teal/20 text-teal border border-teal/40 font-medium'
                        : 'bg-base-800 text-gray-400 border border-white/10'
                    }`}
                    title="Hands-free auto turn-taking & silence submission"
                  >
                    <Zap size={14} /> Hands-Free: {handsFree ? 'ON' : 'OFF'}
                  </button>
                </div>

                {/* Right: Submit Answer Button */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleNextTurn}
                    disabled={answering || (!answerText.trim() && !scratchpad.trim())}
                    className="btn-primary py-2.5 px-4 text-xs font-semibold flex items-center gap-2 shadow-glow-purple"
                  >
                    {answering ? (
                      <>
                        <Spinner size={13} /> Analyzing...
                      </>
                    ) : (
                      <>
                        Submit & Next <ArrowRight size={14} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* INTERACTIVE WORKSPACE DRAWER (4 COLS) */}
            <div className="lg:col-span-4 rounded-2xl bg-base-900 border border-white/10 flex flex-col min-h-0 overflow-hidden shadow-xl">
              {/* Drawer Tabs */}
              <div className="flex items-center border-b border-white/10 bg-base-950/60 p-1.5 gap-1">
                <button
                  onClick={() => setActiveTab('conversation')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'conversation'
                      ? 'bg-accent text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <FileText size={13} /> Feed ({feedbackHistory.length})
                </button>
                <button
                  onClick={() => setActiveTab('scratchpad')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'scratchpad'
                      ? 'bg-accent text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Code size={13} /> Code & Notes
                </button>
                <button
                  onClick={() => setActiveTab('coach')}
                  className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition flex items-center justify-center gap-1.5 ${
                    activeTab === 'coach'
                      ? 'bg-accent text-white shadow'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <Sparkles size={13} /> STAR Coach
                </button>
              </div>

              {/* Tab 1: Live Conversation Feed */}
              {activeTab === 'conversation' && (
                <div className="flex-1 p-4 overflow-y-auto space-y-4">
                  {/* Current Active Turn */}
                  <div className="p-3 rounded-xl bg-accent/10 border border-accent/20 space-y-2">
                    <span className="text-[10px] font-bold text-accent-light uppercase tracking-wider">
                      Current Prompt (Q{questionIndex})
                    </span>
                    <p className="text-xs text-gray-200 font-medium leading-relaxed">
                      {currentQuestion}
                    </p>

                    {/* Active Answer Input area */}
                    <div className="mt-3">
                      <label className="text-[10px] text-gray-400 block mb-1">
                        Spoken or typed response:
                      </label>
                      <textarea
                        className="input resize-none text-xs font-sans p-2.5 h-20"
                        placeholder="Speak into mic or type your answer here..."
                        value={answerText}
                        onChange={(e) => setAnswerText(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Active Hint display if requested */}
                  {activeHint && (
                    <div className="p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-300 text-xs flex items-start gap-2">
                      <HelpCircle size={15} className="shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold">Interviewer Hint:</span> {activeHint}
                      </div>
                    </div>
                  )}

                  {/* Previous Turns History */}
                  {feedbackHistory.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="p-3.5 rounded-xl bg-base-950 border border-white/5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-gray-300">Question {i + 1}</span>
                        <span
                          className={`badge text-[10px] ${
                            item.rating === 'Strong'
                              ? 'bg-teal/20 text-teal border border-teal/30'
                              : item.rating === 'Good'
                                ? 'bg-blue/20 text-blue border border-blue/30'
                                : 'bg-orange/20 text-orange border border-orange/30'
                          }`}
                        >
                          {item.rating}
                        </span>
                      </div>
                      <p className="text-gray-400 italic">“{item.answer}”</p>

                      {/* AI Response & Feedback */}
                      <div className="mt-2 pt-2 border-t border-white/5 space-y-1">
                        <p className="text-purple-300 font-medium">{item.aiResponse}</p>
                        <p className="text-[11px] text-gray-400">{item.tip}</p>
                      </div>
                    </div>
                  ))}
                  <div ref={transcriptFeedRef} />
                </div>
              )}

              {/* Tab 2: Code & Scratchpad */}
              {activeTab === 'scratchpad' && (
                <div className="flex-1 p-4 flex flex-col justify-between space-y-3">
                  <div className="flex-1 flex flex-col">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-gray-300">
                        Technical Code & Architecture Scratchpad
                      </span>
                      <span className="text-[10px] text-gray-500">Evaluated with your answer</span>
                    </div>
                    <textarea
                      className="input font-mono text-xs flex-1 p-3 resize-none bg-base-950 border-white/10"
                      placeholder={`// Write architecture notes, SQL schemas, or code snippets:
function handleStreamRequest(event) {
  // Idempotency token check
  if (cache.has(event.id)) return cache.get(event.id);
  ...
}`}
                      value={scratchpad}
                      onChange={(e) => setScratchpad(e.target.value)}
                    />
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Tip: Writing out your data model or pseudo-code gives the AI deeper signal to award a "Strong" rating.
                  </p>
                </div>
              )}

              {/* Tab 3: STAR Coaching Assistant */}
              {activeTab === 'coach' && (
                <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs">
                  <div className="p-3 rounded-xl bg-teal/10 border border-teal/20 text-teal space-y-1">
                    <span className="font-bold flex items-center gap-1.5">
                      <Award size={14} /> The STAR Methodology
                    </span>
                    <p className="text-gray-300 text-[11px] leading-relaxed">
                      Senior tech leads look for answers anchored in measurable impact:
                    </p>
                  </div>

                  <div className="space-y-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-base-950 border border-white/5">
                      <span className="font-bold text-purple-400">S — Situation:</span> Set the scene, system scale, or high-stakes business context.
                    </div>
                    <div className="p-2.5 rounded-lg bg-base-950 border border-white/5">
                      <span className="font-bold text-teal">T — Task:</span> What was your specific technical responsibility or goal?
                    </div>
                    <div className="p-2.5 rounded-lg bg-base-950 border border-white/5">
                      <span className="font-bold text-blue-400">A — Action:</span> Deep dive into your architectural decisions, trade-offs, and implementation.
                    </div>
                    <div className="p-2.5 rounded-lg bg-base-950 border border-white/5">
                      <span className="font-bold text-orange">R — Result:</span> Quantify the outcome (e.g. "reduced latency by 45% with zero downtime").
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-base-950 border border-white/5 space-y-2">
                    <span className="font-semibold text-gray-300">Live Pacing Guidelines</span>
                    <p className="text-[11px] text-gray-400 leading-normal">
                      Target speaking length: <strong>90–150 seconds</strong> per technical question. Avoid one-word answers or monologues exceeding 3 minutes.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ----------------------------- POST-INTERVIEW SCORECARD ----------------------------- */}
      {ended && summary && (
        <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
          <div className="card p-8 border-white/10 bg-base-900/80 backdrop-blur-md space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/10">
              <div>
                <span className="badge bg-teal/20 text-teal border border-teal/30 text-xs mb-2">
                  Session Completed
                </span>
                <h2 className="text-2xl font-bold text-heading">
                  Executive Interview Performance Scorecard
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Evaluated by {selectedPersona.name} ({selectedPersona.title}) for{' '}
                  <span className="text-white font-medium">{targetRole}</span>
                </p>
              </div>

              {/* Overall Score Circle */}
              <div className="flex items-center gap-4 bg-base-950 p-4 rounded-2xl border border-white/10">
                <div className="text-center">
                  <p className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-teal-400">
                    {summary.score || summary.overallScore || 85}
                  </p>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    Score / 100
                  </p>
                </div>
                <div className="h-10 w-px bg-white/10" />
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-gray-200">
                    Tier:{' '}
                    {(summary.score || 85) >= 85
                      ? 'Strong Hire (L6/Staff)'
                      : (summary.score || 85) >= 70
                        ? 'Hire (Senior Level)'
                        : 'Needs Preparation'}
                  </p>
                  <p className="text-gray-400">{feedbackHistory.length} questions evaluated</p>
                </div>
              </div>
            </div>

            {/* Score Breakdown Radar/Pillars */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-1">
                <span className="text-xs text-gray-400">Technical Depth</span>
                <p className="text-2xl font-bold text-purple-400">
                  {summary.technicalScore || Math.min(95, (summary.score || 85) + 3)}%
                </p>
                <p className="text-[11px] text-gray-500">System architecture & precision</p>
              </div>
              <div className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-1">
                <span className="text-xs text-gray-400">STAR Method Execution</span>
                <p className="text-2xl font-bold text-teal">
                  {summary.starScore || Math.max(65, (summary.score || 85) - 2)}%
                </p>
                <p className="text-[11px] text-gray-500">Situation, task, action, metrics</p>
              </div>
              <div className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-1">
                <span className="text-xs text-gray-400">Communication & Delivery</span>
                <p className="text-2xl font-bold text-cyan-400">
                  {summary.communicationScore || Math.min(98, (summary.score || 85) + 5)}%
                </p>
                <p className="text-[11px] text-gray-500">Pacing, tone, and conciseness</p>
              </div>
            </div>

            {/* Overall Assessment */}
            <div className="p-4 rounded-xl bg-accent/10 border border-accent/20">
              <h4 className="text-xs font-bold text-accent-light uppercase tracking-wider mb-1">
                Hiring Committee Assessment
              </h4>
              <p className="text-sm text-gray-200 leading-relaxed font-medium">
                {summary.overall}
              </p>
            </div>

            {/* Strengths & Improvements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-teal uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 size={14} /> Key Strengths
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {(summary.strengths || ['Good architectural intuition']).map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-teal">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-2">
                <h4 className="text-xs font-bold text-orange uppercase tracking-wider flex items-center gap-1.5">
                  <AlertTriangle size={14} /> High-Leverage Growth Areas
                </h4>
                <ul className="space-y-1.5 text-xs text-gray-300">
                  {(summary.improvements || ['Quantify trade-offs with explicit numbers']).map(
                    (item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-orange">•</span>
                        <span>{item}</span>
                      </li>
                    )
                  )}
                </ul>
              </div>
            </div>

            {/* Turn by turn review */}
            {feedbackHistory.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/10">
                <h3 className="text-sm font-bold text-heading">Turn-by-Turn Question Analysis</h3>
                <div className="space-y-3">
                  {feedbackHistory.map((item, i) => (
                    <div
                      key={item.id || i}
                      className="p-4 rounded-xl bg-base-950 border border-white/5 space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-200">
                          Q{i + 1}: {item.question}
                        </span>
                        <span
                          className={`badge text-[10px] ${
                            item.rating === 'Strong'
                              ? 'bg-teal/20 text-teal'
                              : item.rating === 'Good'
                                ? 'bg-blue/20 text-blue'
                                : 'bg-orange/20 text-orange'
                          }`}
                        >
                          {item.rating}
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-base-900 border border-white/5 text-gray-300 italic">
                        “{item.answer}”
                      </div>

                      {item.scratchpad && (
                        <div className="p-3 rounded-lg bg-black/40 font-mono text-[11px] text-cyan-300 border border-white/5">
                          <span className="text-[10px] text-gray-500 block mb-1">
                            Candidate Code / Scratchpad:
                          </span>
                          <pre className="whitespace-pre-wrap">{item.scratchpad}</pre>
                        </div>
                      )}

                      <div className="text-[11px] text-gray-400 border-t border-white/5 pt-2 flex items-start gap-2">
                        <Bot size={14} className="text-purple-400 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-purple-300 font-medium">{item.aiResponse}</p>
                          <p className="mt-0.5">{item.tip}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-6 border-t border-white/10">
              <button onClick={resetAll} className="btn-primary py-2.5 px-5 flex items-center gap-2">
                <RotateCcw size={16} /> Start Another Mock Interview
              </button>

              <button
                onClick={() => navigate('/interview')}
                className="btn-ghost py-2.5 px-4 text-xs text-gray-300"
              >
                Back to Interview Hub
              </button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  )
}
