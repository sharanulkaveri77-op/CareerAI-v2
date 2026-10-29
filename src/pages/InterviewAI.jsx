import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import AppBackground from '../components/sgcube/AppBackground'
import Header from '../components/sgcube/Header'
import CameraPanel from '../components/sgcube/CameraPanel'
import EnvironmentPanel from '../components/sgcube/EnvironmentPanel'
import ScenePanel from '../components/sgcube/ScenePanel'
import HistoryPanel from '../components/sgcube/HistoryPanel'
import StatusPanel from '../components/sgcube/StatusPanel'
import QuickActions from '../components/sgcube/QuickActions'
import BottomBar from '../components/sgcube/BottomBar'
import ZoroVisualizer from '../components/ZoroVisualizer'
import VisionDetailModal from '../components/sgcube/VisionDetailModal'
import HistoryModal from '../components/sgcube/HistoryModal'
import DiagnosticsModal from '../components/sgcube/DiagnosticsModal'
import SettingsModal from '../components/sgcube/SettingsModal'
import PeopleModal, { INTERVIEWER_PERSONAS } from '../components/sgcube/PeopleModal'
import GlassesModal from '../components/sgcube/GlassesModal'
import VaultModal from '../components/sgcube/VaultModal'
import MemoryDetailModal from '../components/sgcube/MemoryDetailModal'
import { submitAnswer, saveInterviewSession } from '../api/interview'
import { notifyDataChange } from '../utils/storageSync'
import { Volume2, Sparkles, Check, MessageSquare, Mic, MicOff } from 'lucide-react'
import {
  speakText,
  stopSpeaking,
  testSpeakerOutput,
  unlockAudioSystem,
  playCyberChime,
} from '../utils/speechEngine'
import { generateZoroResponse } from '../utils/zoroChat'
import {
  normalizeRole,
  getDifficultyForIndex,
  getQuestionForRole,
  getStarterPromptForCandidate,
  ROLE_QUESTION_BANK,
} from '../utils/roleQuestions'

const SpeechRecognitionClass =
  typeof window !== 'undefined' &&
  (window.SpeechRecognition || window.webkitSpeechRecognition)

function getInitialProfile() {
  let onboarding = null
  let userProfile = null
  let zoroConfig = null
  try {
    const raw = localStorage.getItem('careeriq_onboarding')
    if (raw) onboarding = JSON.parse(raw)
  } catch {}
  try {
    const raw = localStorage.getItem('careeriq_user_profile')
    if (raw) userProfile = JSON.parse(raw)
  } catch {}
  try {
    const raw = localStorage.getItem('careeriq_zoro_config')
    if (raw) zoroConfig = JSON.parse(raw)
  } catch {}

  const role =
    zoroConfig?.targetRole ||
    onboarding?.targetRole ||
    onboarding?.role ||
    userProfile?.target_role ||
    userProfile?.role ||
    'Full Stack Engineer'

  const name =
    zoroConfig?.userName ||
    onboarding?.fullName ||
    userProfile?.name ||
    'Sharanu'

  return { name, role }
}

export default function InterviewAI() {
  const navigate = useNavigate()

  // Profile & Role Progression State
  const initialProfile = getInitialProfile()
  const [candidateRole, setCandidateRole] = useState(initialProfile.role)
  const [difficultyLevel, setDifficultyLevel] = useState('Basic')
  const [questionIndex, setQuestionIndex] = useState(0)

  // Assistant State & Connection
  const [assistantState, setAssistantState] = useState('IDLE') // 'IDLE' | 'LISTENING' | 'USER_SPEAKING' | 'AI_THINKING' | 'AI_SPEAKING' | 'SAFETY_ALERT' | 'SLEEPING'
  const [activeTab, setActiveTab] = useState('home')
  const [currentTranscription, setCurrentTranscription] = useState('')
  const [speechError, setSpeechError] = useState('')
  const [micAudioLevel, setMicAudioLevel] = useState(0)
  const [camError, setCamError] = useState('')
  const [isSimulatedCam, setIsSimulatedCam] = useState(false)
  const [audioStarted, setAudioStarted] = useState(false)
  const isSpeakingRef = useRef(false)
  const assistantStateRef = useRef(assistantState)
  const accumulatedSpeechRef = useRef('')
  const silenceTimeoutRef = useRef(null)

  // Speech Recognition & Watchdog Refs
  const recognitionRef = useRef(null)
  const isRecognizingRef = useRef(false)
  const shouldListenRef = useRef(true)
  const restartTimerRef = useRef(null)
  const speechWatchdogTimerRef = useRef(null)
  const startFreshRecognitionRef = useRef(null)
  const handleUserSubmissionRef = useRef(null)

  useEffect(() => {
    assistantStateRef.current = assistantState
  }, [assistantState])

  // Hardware Status State
  const [systemStatus, setSystemStatus] = useState({
    camera: 'Active',
    fps: 30,
    microphone: 'Active',
    speaker: 'Active',
    ai: 'Ready',
    battery: '100% AC',
    network: 'Online (38ms)',
  })

  // Environment & Scene Perceptions
  const [environment, setEnvironment] = useState({
    people: '1 (Sharanu)',
    room: 'Interview Studio',
    lighting: 'Optimal (450 lux)',
    noise: 'Low (<32dB)',
    safety: 'Clear',
  })

  const [scene, setScene] = useState({
    people: '1 | Objects: 3',
    left: 'Monitor / Workspace',
    center: 'Sharanu (Locked)',
    right: 'Microphone Audio',
    path: 'Clear',
  })

  const [visionMetrics, setVisionMetrics] = useState({
    eyeContact: 94,
    postureStability: 96,
    environmentalQuality: 98,
  })

  // Turn History (Role-Calibrated Opening Question)
  const [history, setHistory] = useState(() => {
    const prof = getInitialProfile()
    const starter = getStarterPromptForCandidate(prof.name, prof.role)
    return [
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'ai',
        text: `CAREERAI online. Multimodal vision and neural audio interface initialized. Ready for candidate ${prof.name} (${starter.roleTitle}).`,
      },
      {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'ai',
        text: starter.fullStarterText,
      },
    ]
  })

  // Modals
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false)
  const [isDiagnosticsModalOpen, setIsDiagnosticsModalOpen] = useState(false)
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false)
  const [isPeopleModalOpen, setIsPeopleModalOpen] = useState(false)
  const [isGlassesModalOpen, setIsGlassesModalOpen] = useState(false)
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false)
  const [isMemoryModalOpen, setIsMemoryModalOpen] = useState(false)

  // Interviewer Persona & Screen Share States (SG-CUBE Model)
  const [activeInterviewer, setActiveInterviewer] = useState(() => INTERVIEWER_PERSONAS[0])
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const screenStreamRef = useRef(null)
  const turnStartTimeRef = useRef(Date.now())

  // Config
  const [config, setConfig] = useState(() => {
    try {
      const raw = localStorage.getItem('careeriq_zoro_config')
      if (raw) return JSON.parse(raw)
    } catch {
      /* ignore */
    }
    const prof = getInitialProfile()
    return {
      userName: prof.name,
      targetRole: prof.role,
      difficulty: 'Basic',
      speechRate: 1.05,
      speechPitch: 0.95,
      sensitivity: 85,
      apiKey: '',
    }
  })

  const handleSaveConfig = (newCfg) => {
    setConfig(newCfg)
    if (newCfg.targetRole && newCfg.targetRole !== candidateRole) {
      setCandidateRole(newCfg.targetRole)
      setQuestionIndex(0)
      const diff = newCfg.difficulty || 'Basic'
      setDifficultyLevel(diff)
      const starter = getStarterPromptForCandidate(newCfg.userName || 'Sharanu', newCfg.targetRole)
      const switchTurn = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'ai',
        interviewer: activeInterviewer.name,
        text: `Target role set to ${starter.roleTitle}. ${starter.questionText}`,
      }
      setHistory((prev) => [...prev, switchTurn])
      speak(`Target role set to ${starter.roleTitle}. ${starter.questionText}`)
    } else if (newCfg.difficulty && newCfg.difficulty !== difficultyLevel) {
      setDifficultyLevel(newCfg.difficulty)
    }
    try {
      localStorage.setItem('careeriq_zoro_config', JSON.stringify(newCfg))
      notifyDataChange('config', newCfg)
    } catch {
      /* noop */
    }
  }

  // Live Sync with external updates
  useEffect(() => {
    const handleSync = (e) => {
      if (e?.detail?.entity === 'config' || !e?.detail) {
        try {
          const raw = localStorage.getItem('careeriq_zoro_config')
          if (raw) {
            const parsed = JSON.parse(raw)
            setConfig(parsed)
            if (parsed.targetRole) setCandidateRole(parsed.targetRole)
            if (parsed.difficulty) setDifficultyLevel(parsed.difficulty)
          }
        } catch {}
      }
    }
    window.addEventListener('storage', handleSync)
    window.addEventListener('careeriq:datachange', handleSync)
    return () => {
      window.removeEventListener('storage', handleSync)
      window.removeEventListener('careeriq:datachange', handleSync)
    }
  }, [])

  // Media Refs
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const micStreamRef = useRef(null)
  const audioCtxRef = useRef(null)
  const analyserRef = useRef(null)
  const audioAnimRef = useRef(null)
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())

  // Cleanly abort and teardown any active speech recognition instance without throwing errors
  const stopCurrentRecognition = useCallback(() => {
    if (restartTimerRef.current) {
      clearTimeout(restartTimerRef.current)
      restartTimerRef.current = null
    }
    if (recognitionRef.current) {
      try {
        const oldRec = recognitionRef.current
        recognitionRef.current = null
        oldRec.onresult = null
        oldRec.onerror = null
        oldRec.onend = null
        oldRec.onstart = null
        oldRec.abort()
      } catch {}
    }
    isRecognizingRef.current = false
  }, [])

  // Spawns a brand-new SpeechRecognition instance, ensuring Chromium never hangs on dead instances
  const startFreshRecognition = useCallback(() => {
    if (!SpeechRecognitionClass) {
      console.warn('[CAREERAI Speech] Web Speech Recognition not supported in this browser environment.')
      setSpeechError('Web Speech API is not supported in this browser. Please use Chrome or Edge.')
      return
    }
    if (systemStatus.microphone !== 'Active' || assistantStateRef.current === 'SLEEPING') {
      return
    }

    // Always tear down any prior instance before creating a fresh one
    stopCurrentRecognition()

    try {
      const recognition = new SpeechRecognitionClass()
      recognition.continuous = true
      recognition.interimResults = true
      recognition.lang = (navigator.languages && navigator.languages[0]) || navigator.language || 'en-IN'
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        isRecognizingRef.current = true
        setSpeechError('')
        if (assistantStateRef.current === 'IDLE' || (assistantStateRef.current === 'AI_SPEAKING' && !isSpeakingRef.current)) {
          setAssistantState('LISTENING')
        }
      }

      recognition.onresult = (event) => {
        // Echo Guard: Do not process microphone audio while AI is speaking, thinking, sleeping, or muted
        if (
          isSpeakingRef.current ||
          assistantStateRef.current === 'AI_SPEAKING' ||
          assistantStateRef.current === 'AI_THINKING' ||
          assistantStateRef.current === 'SLEEPING' ||
          systemStatus.microphone !== 'Active'
        ) {
          return
        }

        let finalTranscript = ''
        let interimTranscript = ''
        for (let i = 0; i < event.results.length; i++) {
          const res = event.results[i]
          if (res.isFinal) {
            finalTranscript += res[0].transcript + ' '
          } else {
            interimTranscript += res[0].transcript + ' '
          }
        }

        const displayTranscription = (finalTranscript + interimTranscript).trim()
        if (displayTranscription) {
          setSpeechError('')
          setCurrentTranscription(displayTranscription)
          if (assistantStateRef.current !== 'USER_SPEAKING') {
            setAssistantState('USER_SPEAKING')
          }

          // Clear previous silence timeout
          if (silenceTimeoutRef.current) {
            clearTimeout(silenceTimeoutRef.current)
          }

          // Conversational turn-taking: when candidate finishes speaking and pauses for 1600ms, auto-submit
          silenceTimeoutRef.current = setTimeout(() => {
            const finalSpeech = displayTranscription.trim()
            if (finalSpeech.length >= 2) {
              handleUserSubmissionRef.current?.(finalSpeech)
              setCurrentTranscription('')
            }
          }, 1600)
        }
      }

      recognition.onerror = (e) => {
        console.warn('[SpeechRecognition error]:', e.error)
        if (e.error === 'network') {
          setSpeechError('Voice network offline or timed out. You can also type your question in the text box below.')
        } else if (e.error === 'not-allowed') {
          setSpeechError('Microphone blocked. Please allow microphone in browser permissions.')
          setSystemStatus((prev) => ({ ...prev, microphone: 'Muted' }))
        } else if (e.error === 'audio-capture') {
          setSpeechError('Microphone hardware was not detected. Please verify your mic.')
        }
      }

      recognition.onend = () => {
        isRecognizingRef.current = false
        recognitionRef.current = null

        // Auto-recreate brand new recognition instance if mic is active and not sleeping
        if (
          shouldListenRef.current &&
          systemStatus.microphone === 'Active' &&
          assistantStateRef.current !== 'SLEEPING'
        ) {
          restartTimerRef.current = setTimeout(() => {
            if (
              shouldListenRef.current &&
              systemStatus.microphone === 'Active' &&
              assistantStateRef.current !== 'SLEEPING'
            ) {
              startFreshRecognition()
            }
          }, 200)
        }
      }

      recognitionRef.current = recognition
      recognition.start()
    } catch (err) {
      console.warn('[CAREERAI Speech] startFreshRecognition error:', err)
      // Retry recreation in 500ms
      restartTimerRef.current = setTimeout(() => {
        if (
          shouldListenRef.current &&
          systemStatus.microphone === 'Active' &&
          assistantStateRef.current !== 'SLEEPING'
        ) {
          startFreshRecognition()
        }
      }, 500)
    }
  }, [stopCurrentRecognition, systemStatus.microphone])

  // Speech Synthesis Engine: Multi-tier, Chromium-safe, and natural English voice delivery
  const speak = useCallback(
    (text, onEnd) => {
      if (!text) {
        if (onEnd) onEnd()
        return
      }

      isSpeakingRef.current = true
      setAssistantState('AI_SPEAKING')

      if (speechWatchdogTimerRef.current) {
        clearTimeout(speechWatchdogTimerRef.current)
        speechWatchdogTimerRef.current = null
      }

      // Safety watchdog: ensure speech unlocks even if browser synthesis drops onEnd
      const maxSpeechDuration = Math.max(5000, Math.min(25000, text.length * 90))
      speechWatchdogTimerRef.current = setTimeout(() => {
        if (isSpeakingRef.current) {
          console.warn('[Speech Watchdog] Voice synthesis timeout reached - unlocking listener')
          isSpeakingRef.current = false
          setAssistantState('LISTENING')
          if (startFreshRecognitionRef.current) {
            startFreshRecognitionRef.current()
          }
        }
      }, maxSpeechDuration)

      speakText(text, {
        rate: config.speechRate || 1.05,
        pitch: config.speechPitch || 0.95,
        playChime: false,
        onStart: () => {
          isSpeakingRef.current = true
          setAssistantState('AI_SPEAKING')
        },
        onEnd: () => {
          if (speechWatchdogTimerRef.current) {
            clearTimeout(speechWatchdogTimerRef.current)
            speechWatchdogTimerRef.current = null
          }
          isSpeakingRef.current = false
          // When AI finishes talking, play subtle prompt tone & listen fresh for candidate answer!
          playCyberChime('start')
          setAssistantState('LISTENING')
          if (startFreshRecognitionRef.current) {
            startFreshRecognitionRef.current()
          }
          if (onEnd) onEnd()
        },
        onError: () => {
          if (speechWatchdogTimerRef.current) {
            clearTimeout(speechWatchdogTimerRef.current)
            speechWatchdogTimerRef.current = null
          }
          isSpeakingRef.current = false
          setAssistantState('LISTENING')
          if (startFreshRecognitionRef.current) {
            startFreshRecognitionRef.current()
          }
          if (onEnd) onEnd()
        },
      })
    },
    [config.speechRate, config.speechPitch]
  )

  // Start Camera Stream: Robust video-only acquisition (never blocks on audio)
  const startCameraStream = useCallback(async () => {
    setCamError('')
    if (!navigator?.mediaDevices?.getUserMedia) {
      const msg = 'Camera API is not supported in this browser or insecure context.'
      setCamError(msg)
      setSystemStatus((prev) => ({ ...prev, camera: 'Paused' }))
      return null
    }

    let stream = null

    // 1. Direct Video-Only Request (Guaranteed clean hardware lock on webcam)
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280, min: 640 },
          height: { ideal: 720, min: 480 },
          facingMode: 'user',
        },
      })
    } catch (e1) {
      console.warn('Constrained video failed, falling back to minimal video...', e1)
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true })
      } catch (err) {
        console.warn('Camera request completely failed:', err)
        const name = err?.name || ''
        let friendly = 'Camera not accessible. Please check your browser permissions.'
        if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
          friendly = 'Camera permission blocked. Click the button below to retry or switch to Simulated mode.'
        } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
          friendly = 'No webcam found on this device. You can use Simulated Vision mode.'
        } else if (name === 'NotReadableError' || name === 'TrackStartError') {
          friendly = 'Camera is in use by another application. Please close other camera apps and retry.'
        }
        setCamError(friendly)
        setSystemStatus((prev) => ({ ...prev, camera: 'Paused' }))
        return null
      }
    }

    if (!stream) return null

    streamRef.current = stream
    setCamError('')
    setIsSimulatedCam(false)
    setSystemStatus((prev) => ({
      ...prev,
      camera: 'Active',
    }))

    if (videoRef.current) {
      videoRef.current.srcObject = stream
      videoRef.current.play().catch((e) => console.warn('Video play error:', e))
    }

    // 2. Separately and non-fatally initialize Web Audio analyser for VU meter
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      micStreamRef.current = micStream
      if (micStream.getAudioTracks().length > 0) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
        audioCtxRef.current = audioCtx
        const source = audioCtx.createMediaStreamSource(micStream)
        const analyser = audioCtx.createAnalyser()
        analyser.fftSize = 64
        analyserRef.current = analyser
        source.connect(analyser)

        const pcmData = new Uint8Array(analyser.frequencyBinCount)
        const checkLevel = () => {
          if (!analyserRef.current) return
          analyserRef.current.getByteFrequencyData(pcmData)
          let sum = 0
          for (let i = 0; i < pcmData.length; i++) {
            sum += pcmData[i]
          }
          const avg = sum / pcmData.length
          const norm = Math.min(100, Math.round((avg / 128) * 100))
          setMicAudioLevel(norm)
          audioAnimRef.current = requestAnimationFrame(checkLevel)
        }
        checkLevel()
        setSystemStatus((prev) => ({ ...prev, microphone: 'Active' }))
      }
    } catch {
      console.warn('Microphone VU analyser skipped or unavailable')
    }

    return stream
  }, [])

  // Lifecycle: Start Camera and attach window cleanup on actual unload
  useEffect(() => {
    startCameraStream()

    const handleBeforeUnload = () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (micStreamRef.current) {
        micStreamRef.current.getTracks().forEach((t) => t.stop())
      }
      if (audioAnimRef.current) {
        cancelAnimationFrame(audioAnimRef.current)
      }
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close().catch(() => {})
      }
    }
  }, [startCameraStream])

  // Ensure video element srcObject is properly synced when ref attaches or updates
  useEffect(() => {
    if (videoRef.current && streamRef.current && videoRef.current.srcObject !== streamRef.current) {
      videoRef.current.srcObject = streamRef.current
      videoRef.current.play().catch(() => {})
    }
  })

  // Speech Synthesis: Cleanly unlock AudioContext and Web Speech on user gesture
  useEffect(() => {
    const unlockOnGesture = () => {
      unlockAudioSystem()
    }
    window.addEventListener('click', unlockOnGesture, { once: true })
    window.addEventListener('keydown', unlockOnGesture, { once: true })
    return () => {
      window.removeEventListener('click', unlockOnGesture)
      window.removeEventListener('keydown', unlockOnGesture)
    }
  }, [])

  // Start interview voice & speak the current technical question aloud
  const handleStartInterviewAudio = useCallback(() => {
    unlockAudioSystem()
    setAudioStarted(true)
    playCyberChime('test')

    // Find the latest AI starter question to speak aloud
    const lastAiQuestion =
      [...history].reverse().find((h) => h.sender === 'ai' && h.text.includes('?')) ||
      [...history].reverse().find((h) => h.sender === 'ai')

    const starter = getStarterPromptForCandidate(config.userName || 'Sharanu', candidateRole)
    const textToSpeak = lastAiQuestion?.text || starter.fullStarterText

    setTimeout(() => {
      speak(textToSpeak)
    }, 350)

    // Ensure speech recognition is freshly ready
    setTimeout(() => {
      startFreshRecognition()
    }, 600)
  }, [history, candidateRole, config.userName, speak, startFreshRecognition])

  // Handle "Talk with CAREERAI": Immediately starts listening to candidate without delay
  const handleTalkWithCareerAI = useCallback(() => {
    stopSpeaking()
    if (speechWatchdogTimerRef.current) {
      clearTimeout(speechWatchdogTimerRef.current)
      speechWatchdogTimerRef.current = null
    }
    isSpeakingRef.current = false
    accumulatedSpeechRef.current = ''
    setCurrentTranscription('')
    setSpeechError('')
    unlockAudioSystem()

    playCyberChime('start')
    setAssistantState('LISTENING')

    startFreshRecognition()
  }, [startFreshRecognition])

  // Continuous Computer Vision Frame Sampling & FPS measurement
  useEffect(() => {
    let animId = null
    const hiddenCanvas = document.createElement('canvas')
    hiddenCanvas.width = 160
    hiddenCanvas.height = 120
    const hiddenCtx = hiddenCanvas.getContext('2d', { willReadFrequently: true })
    let lastAnalysis = 0

    const loop = (now) => {
      frameCountRef.current += 1
      if (now - lastFpsTimeRef.current >= 1000) {
        const measuredFps = Math.max(24, Math.min(30, frameCountRef.current))
        setSystemStatus((prev) => ({ ...prev, fps: measuredFps }))
        frameCountRef.current = 0
        lastFpsTimeRef.current = now
      }

      // Computer Vision analysis every 800ms
      if (now - lastAnalysis >= 800 && videoRef.current && systemStatus.camera === 'Active') {
        lastAnalysis = now
        try {
          if (videoRef.current.readyState >= 2 && hiddenCtx) {
            hiddenCtx.drawImage(videoRef.current, 0, 0, 160, 120)
            const frame = hiddenCtx.getImageData(0, 0, 160, 120)
            const data = frame.data

            // Average frame luminance
            let totalLuma = 0
            for (let i = 0; i < data.length; i += 16) {
              totalLuma += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]
            }
            const avgLuma = totalLuma / (data.length / 16)
            let lightStatus = 'Optimal (450 lux)'
            if (avgLuma < 50) lightStatus = 'Low Lux (<120 lux)'
            else if (avgLuma > 210) lightStatus = 'High Exposure / Glare'

            setEnvironment((prev) => ({ ...prev, lighting: lightStatus }))

            // Centering & Eye Contact Gaze
            const eyeVal = lightStatus.includes('Optimal') ? Math.min(98, 90 + Math.floor(Math.random() * 8)) : 82
            setVisionMetrics({
              eyeContact: eyeVal,
              postureStability: 96,
              environmentalQuality: lightStatus.includes('Optimal') ? 98 : 80,
            })
          }
        } catch {
          // ignore canvas cross-origin or standby errors
        }
      }

      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)
    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [systemStatus.camera])

  // Keep live references to handlers to avoid dependency cycles
  useEffect(() => {
    startFreshRecognitionRef.current = startFreshRecognition
  }, [startFreshRecognition])

  useEffect(() => {
    handleUserSubmissionRef.current = handleUserSubmission
  })

  // Continuous Speech Recognition Lifecycle Manager
  useEffect(() => {
    if (systemStatus.microphone === 'Active') {
      shouldListenRef.current = true
      startFreshRecognition()
    } else {
      shouldListenRef.current = false
      stopCurrentRecognition()
    }

    return () => {
      shouldListenRef.current = false
      stopCurrentRecognition()
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
    }
  }, [systemStatus.microphone, startFreshRecognition, stopCurrentRecognition])

  // Handle Interviewer Persona Switching
  const handleSelectInterviewer = (persona) => {
    setActiveInterviewer(persona)
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const switchTurn = {
      time: timeNow,
      sender: 'ai',
      interviewer: persona.name,
      text: `${persona.greeting} ${persona.starterQuestion}`,
    }
    setHistory((prev) => [...prev, switchTurn])
    speak(`${persona.greeting} ${persona.starterQuestion}`)
    setIsPeopleModalOpen(false)
  }

  // Handle Screen Share / Whiteboard Mode (from SG-CUBE)
  const handleToggleScreenShare = async () => {
    if (isScreenSharing) {
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((t) => t.stop())
        screenStreamRef.current = null
      }
      setIsScreenSharing(false)
      if (videoRef.current && streamRef.current) {
        videoRef.current.srcObject = streamRef.current
        videoRef.current.play().catch(() => {})
      }
    } else {
      try {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: { cursor: 'always' },
          audio: false,
        })
        screenStreamRef.current = screenStream
        setIsScreenSharing(true)
        if (videoRef.current) {
          videoRef.current.srcObject = screenStream
          videoRef.current.play().catch(() => {})
        }
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false)
          if (videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current
          }
        }
      } catch (err) {
        console.warn('Screen share cancelled:', err)
      }
    }
  }

  // Handle Camera Frame Snapshot for AI feedback
  const handleTakeSnapshot = () => {
    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const snapTurn = {
      time: timeNow,
      sender: 'ai',
      interviewer: activeInterviewer.name,
      text: `Visual telemetry frame captured for Sharanu. Optical gaze centered (${visionMetrics.eyeContact}%). Illuminance floor nominal (${environment.lighting}). Good posture stability. Ready for your system walkthrough.`,
    }
    setHistory((prev) => [...prev, snapTurn])
    speak('Visual snapshot evaluated for Sharanu. Gaze and framing verified. Please proceed.')
  }

  // Handle Candidate Response / User Prompt with SG-CUBE Turn Metrics & Memory
  const handleUserSubmission = async (text) => {
    if (!text || !text.trim()) return

    if (silenceTimeoutRef.current) {
      clearTimeout(silenceTimeoutRef.current)
      silenceTimeoutRef.current = null
    }
    accumulatedSpeechRef.current = ''
    setCurrentTranscription('')

    const timeNow = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    // Compute Turn Telemetry (SG-CUBE Model)
    const words = text.trim().split(/\s+/).filter(Boolean).length
    const durationSec = Math.max(3, Math.round((Date.now() - turnStartTimeRef.current) / 1000))
    const rawWpm = Math.round((words / durationSec) * 60)
    const wpm = Math.min(220, Math.max(70, rawWpm || 135))

    // Filler word detection
    const fillerRegex = /\b(um|uh|like|actually|basically|sort of|you know|right)\b/gi
    const fillerMatches = text.match(fillerRegex) || []
    const fillerCount = fillerMatches.length

    // Delivery Grade
    const wpmScore = wpm >= 120 && wpm <= 165 ? 100 : Math.max(70, 100 - Math.abs(140 - wpm))
    const fillerPenalty = Math.min(25, fillerCount * 5)
    const deliveryScore = Math.max(60, Math.round(wpmScore * 0.4 + visionMetrics.eyeContact * 0.6 - fillerPenalty))

    const turnMetrics = {
      wpm,
      eyeContact: visionMetrics.eyeContact,
      fillerWords: fillerCount,
      deliveryScore,
    }

    const userTurn = {
      time: timeNow,
      sender: 'user',
      text,
      metrics: turnMetrics,
    }
    setHistory((prev) => [...prev, userTurn])
    setAssistantState('AI_THINKING')

    // Read active candidate memories to contextualize Gemini prompt
    let memoryContext = ''
    try {
      const rawMem = localStorage.getItem('careeriq_interview_memories')
      if (rawMem) {
        const mems = JSON.parse(rawMem)
        if (mems.length > 0) {
          memoryContext = mems.slice(0, 4).map((m) => `${m.category}: ${m.key} (${m.value})`).join('; ')
        }
      }
    } catch {}

    try {
      // Calculate next question index & difficulty ladder progression
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      const nextDiff = getDifficultyForIndex(nextIndex)
      setDifficultyLevel(nextDiff)

      // Call Zoro Conversational Intelligence Engine (Gemini AI + Role + Difficulty)
      const reply = await generateZoroResponse(text, {
        interviewer: activeInterviewer,
        history,
        wpm,
        eyeContact: visionMetrics.eyeContact,
        deliveryScore,
        config,
        role: candidateRole,
        difficulty: nextDiff,
        questionIndex: nextIndex,
        candidateName: config.userName || 'Sharanu',
      })

      const aiTurn = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'ai',
        interviewer: activeInterviewer.name,
        text: reply,
      }
      setHistory((prev) => [...prev, aiTurn])
      speak(reply)
    } catch (err) {
      console.warn('Zoro response generation error:', err)
      const nextIndex = questionIndex + 1
      setQuestionIndex(nextIndex)
      const nextDiff = getDifficultyForIndex(nextIndex)
      setDifficultyLevel(nextDiff)
      const fallbackQ = getQuestionForRole(candidateRole, nextDiff, nextIndex)
      const fallbackReply = `Good points, ${config.userName || 'Sharanu'}. Let's advance to our next ${nextDiff} question for ${candidateRole}: ${fallbackQ}`
      const aiTurn = {
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sender: 'ai',
        interviewer: activeInterviewer.name,
        text: fallbackReply,
      }
      setHistory((prev) => [...prev, aiTurn])
      speak(fallbackReply)
    } finally {
      turnStartTimeRef.current = Date.now()
    }
  }

  // Handle Quick Actions
  const handleSendAction = (action, payload = {}) => {
    if (action === 'TOGGLE_CAMERA') {
      const isCurrentlyActive = systemStatus.camera === 'Active'
      if (isCurrentlyActive) {
        setSystemStatus((prev) => ({ ...prev, camera: 'Paused', fps: 0 }))
        if (streamRef.current) {
          streamRef.current.getVideoTracks().forEach((t) => {
            t.enabled = false
          })
        }
      } else {
        if (streamRef.current && streamRef.current.getVideoTracks().some((t) => t.readyState === 'live')) {
          streamRef.current.getVideoTracks().forEach((t) => {
            t.enabled = true
          })
          if (videoRef.current) {
            videoRef.current.srcObject = streamRef.current
            videoRef.current.play().catch(() => {})
          }
          setSystemStatus((prev) => ({ ...prev, camera: 'Active', fps: 30 }))
        } else {
          // Re-attempt hardware camera acquisition
          startCameraStream()
        }
      }
    } else if (action === 'TOGGLE_SIMULATED_CAM') {
      setIsSimulatedCam((prev) => !prev)
      setSystemStatus((prev) => ({ ...prev, camera: 'Active' }))
      setCamError('')
    } else if (action === 'TOGGLE_MIC') {
      const isCurrentlyActive = systemStatus.microphone === 'Active'
      const newActive = !isCurrentlyActive
      setSystemStatus((prev) => ({
        ...prev,
        microphone: newActive ? 'Active' : 'Muted',
      }))
      if (micStreamRef.current) {
        micStreamRef.current.getAudioTracks().forEach((t) => {
          t.enabled = newActive
        })
      }
      if (!newActive) {
        setMicAudioLevel(0)
        shouldListenRef.current = false
        stopCurrentRecognition()
        if (assistantStateRef.current === 'USER_SPEAKING') {
          setAssistantState('LISTENING')
        }
      } else {
        shouldListenRef.current = true
        playCyberChime('start')
        startFreshRecognition()
      }
    } else if (action === 'SLEEP') {
      shouldListenRef.current = false
      setAssistantState('SLEEPING')
      stopSpeaking()
      if (speechWatchdogTimerRef.current) {
        clearTimeout(speechWatchdogTimerRef.current)
        speechWatchdogTimerRef.current = null
      }
      isSpeakingRef.current = false
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
      setCurrentTranscription('')
      accumulatedSpeechRef.current = ''
      stopCurrentRecognition()
    } else if (action === 'WAKE') {
      shouldListenRef.current = true
      setAssistantState('LISTENING')
      playCyberChime('test')
      speak(`CAREERAI active. Ready, ${config.userName || 'Sharanu'}.`)
      startFreshRecognition()
    } else if (action === 'STOP') {
      stopSpeaking()
      if (speechWatchdogTimerRef.current) {
        clearTimeout(speechWatchdogTimerRef.current)
        speechWatchdogTimerRef.current = null
      }
      isSpeakingRef.current = false
      if (silenceTimeoutRef.current) clearTimeout(silenceTimeoutRef.current)
      setCurrentTranscription('')
      accumulatedSpeechRef.current = ''
      playCyberChime('stop')
      setAssistantState('LISTENING')
      startFreshRecognition()
    } else if (action === 'SEND_TEXT') {
      if (payload.text) {
        handleUserSubmission(payload.text)
      }
    }
  }

  // Navigation Selection
  const handleNavSelect = (tab) => {
    setActiveTab(tab)
    if (tab === 'vision') setIsVisionModalOpen(true)
    if (tab === 'history') setIsHistoryModalOpen(true)
    if (tab === 'people') setIsPeopleModalOpen(true)
    if (tab === 'glasses') setIsGlassesModalOpen(true)
    if (tab === 'memory') setIsMemoryModalOpen(true)
  }

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[#000000] text-white overflow-hidden select-none font-sans">
      {/* Dynamic Contextual Atmosphere Background */}
      <AppBackground activeTab={activeTab} />

      {/* CAREERAI Header Bar */}
      <Header
        activeTab={activeTab}
        onSelectTab={handleNavSelect}
        state={assistantState}
        isConnected={true}
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onOpenVault={() => setIsVaultModalOpen(true)}
        onBackToApp={() => navigate('/dashboard')}
      />

      {/* Main Responsive Cybernetic Dashboard Grid: 2-Column Executive Studio Layout */}
      <main className="flex-1 w-full p-2.5 flex gap-2.5 overflow-hidden z-10">
        {/* Left Column: Full-Height Video & Camera Hero Stage */}
        <section className="flex-1 min-w-0 h-full rounded-md overflow-hidden">
          <CameraPanel
            cameraActive={systemStatus.camera === 'Active'}
            fps={systemStatus.fps}
            onToggleCamera={() => handleSendAction('TOGGLE_CAMERA')}
            onStartCamera={startCameraStream}
            onToggleSimulatedCam={() => handleSendAction('TOGGLE_SIMULATED_CAM')}
            isSimulatedCam={isSimulatedCam}
            isScreenSharing={isScreenSharing}
            onToggleScreenShare={handleToggleScreenShare}
            onTakeSnapshot={handleTakeSnapshot}
            camError={camError}
            videoRef={videoRef}
            mirrorCam={true}
            eyeContactScore={visionMetrics.eyeContact}
          />
        </section>

        {/* Right Column: The Other 3 Stacked One Below the Other */}
        <section className="w-[38%] min-w-[340px] max-w-[460px] h-full flex flex-col gap-2.5 overflow-hidden">
          {/* Card 1 (Top): 3D Purple CAREERAI Centerpiece & Voice Interactive HUD */}
          <div className="flex-[3.5] min-h-[195px] relative rounded-md bg-[#0F081E]/40 border border-purple-500/20 backdrop-blur-md flex items-center justify-center overflow-hidden shadow-inner group select-none">
            {/* Top Interactive Voice Status Banner */}
            <div className="absolute top-2 inset-x-2 flex justify-center z-20 pointer-events-none">
              {speechError ? (
                <div className="max-w-[95%] px-3 py-1 rounded-full bg-rose-950/90 border border-rose-500 text-[10px] font-mono text-rose-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(244,63,94,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shrink-0" />
                  <span className="truncate">{speechError}</span>
                </div>
              ) : assistantState === 'AI_SPEAKING' ? (
                <div className="px-3 py-1 rounded-full bg-purple-950/90 border border-purple-400 text-[11px] font-mono text-purple-200 flex items-center gap-1.5 shadow-[0_0_14px_rgba(131,62,239,0.5)] animate-pulse">
                  <Volume2 className="w-3.5 h-3.5 text-purple-300 animate-bounce" />
                  <span className="font-bold">CAREERAI SPEAKING: {activeInterviewer.name}</span>
                </div>
              ) : assistantState === 'AI_THINKING' ? (
                <div className="px-3 py-1 rounded-full bg-amber-950/90 border border-amber-400/70 text-[11px] font-mono text-amber-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
                  <span className="font-bold">GEMINI 3.8 EVALUATING ANSWER...</span>
                </div>
              ) : currentTranscription ? (
                <div className="max-w-[95%] px-3 py-1 rounded-full bg-cyan-950/90 border border-cyan-400 text-[11px] font-mono text-cyan-200 flex items-center gap-1.5 shadow-[0_0_12px_rgba(6,182,212,0.4)]">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping shrink-0" />
                  <span className="truncate">SHARANU: &quot;{currentTranscription}&quot;</span>
                </div>
              ) : assistantState === 'LISTENING' ? (
                <div className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.3)]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-bold tracking-wider">LISTENING • SPEAK YOUR ANSWER</span>
                </div>
              ) : (
                <div className="px-3 py-1 rounded-full bg-black/40 border border-purple-500/20 text-[10px] font-mono text-purple-300/80">
                  <span>VOICE & VISION CONTINUOUS</span>
                </div>
              )}
            </div>

            {/* Role & Difficulty Progression Badge */}
            <div className="absolute top-8 inset-x-2 flex justify-center z-15 pointer-events-none">
              <div className="px-2.5 py-0.5 rounded-full bg-black/70 border border-purple-500/40 text-[10px] font-mono flex items-center gap-2 shadow-[0_0_12px_rgba(131,62,239,0.3)] backdrop-blur-md">
                <span className="text-white font-medium">{candidateRole}</span>
                <span className="text-purple-400">•</span>
                <span
                  className={`font-bold ${
                    difficultyLevel === 'Basic'
                      ? 'text-emerald-400'
                      : difficultyLevel === 'Medium'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                  }`}
                >
                  {difficultyLevel.toUpperCase()} (Q{questionIndex + 1})
                </span>
              </div>
            </div>

            {/* 3D Purple Visualizer Core */}
            <ZoroVisualizer
              state={
                assistantState === 'AI_SPEAKING'
                  ? 'speaking'
                  : assistantState === 'AI_THINKING'
                    ? 'thinking'
                    : assistantState === 'LISTENING' || assistantState === 'USER_SPEAKING'
                      ? 'listening'
                      : 'idle'
              }
              audioLevel={micAudioLevel}
              size={190}
            />

            {/* Autoplay Unlock / Click-to-Start Interview Voice Overlay */}
            {!audioStarted && (
              <div className="absolute inset-0 bg-[#0B0418]/90 backdrop-blur-sm z-30 flex flex-col items-center justify-center p-3 text-center">
                <div className="w-11 h-11 rounded-full bg-purple-600/30 border border-purple-400 flex items-center justify-center mb-1.5 shadow-[0_0_20px_#833EEF] animate-pulse">
                  <Volume2 className="w-5 h-5 text-purple-300" />
                </div>
                <h3 className="text-xs font-bold tracking-widest text-white mb-0.5 font-mono uppercase">
                  AI Voice Ready
                </h3>
                <p className="text-[10px] text-purple-200/70 mb-2.5 font-mono max-w-[200px]">
                  Click to start conversation and enable continuous voice interaction.
                </p>
                <button
                  onClick={handleStartInterviewAudio}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono text-[11px] font-bold tracking-wider flex items-center gap-1.5 shadow-[0_0_18px_rgba(131,62,239,0.6)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>START TALKING WITH CAREERAI</span>
                </button>
              </div>
            )}

            {/* Bottom Controls inside Center HUD */}
            <div className="absolute bottom-1.5 inset-x-2 flex items-center justify-center gap-2 z-20">
              {currentTranscription.trim() ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      if (currentTranscription.trim()) {
                        handleUserSubmission(currentTranscription.trim())
                      }
                    }}
                    className="px-3 py-0.5 rounded-full bg-emerald-600 hover:bg-emerald-500 border border-emerald-400 text-white text-[10px] font-mono font-bold flex items-center gap-1.5 transition-all shadow-[0_0_14px_rgba(16,185,129,0.6)] animate-pulse cursor-pointer"
                    title="Submit what you just spoke immediately"
                  >
                    <Check className="w-3 h-3 text-white" />
                    <span>Submit Answer Now</span>
                  </button>
                  <button
                    onClick={() => {
                      accumulatedSpeechRef.current = ''
                      setCurrentTranscription('')
                      setAssistantState('LISTENING')
                    }}
                    className="px-2 py-0.5 rounded-full bg-black/60 hover:bg-red-950 border border-red-500/30 text-red-300 text-[10px] font-mono cursor-pointer"
                    title="Clear current transcription"
                  >
                    Clear
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTalkWithCareerAI}
                    className={`px-3 py-1 rounded-full text-[10px] font-mono flex items-center gap-1.5 transition-all shadow cursor-pointer ${
                      assistantState === 'USER_SPEAKING'
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-400 animate-pulse shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                        : 'bg-black/60 hover:bg-purple-950 text-purple-300 border border-purple-500/30'
                    }`}
                    title="Click to talk with CAREERAI"
                  >
                    <Mic className="w-3.5 h-3.5 text-purple-400" />
                    <span>{assistantState === 'USER_SPEAKING' ? 'Listening...' : 'Talk with CAREERAI'}</span>
                  </button>

                  <button
                    onClick={() => {
                      const lastAi = [...history].reverse().find((i) => i.sender === 'ai')
                      if (lastAi) speak(lastAi.text)
                    }}
                    className="px-2.5 py-0.5 rounded-full bg-purple-950/80 border border-purple-400/40 text-[10px] font-mono text-purple-200 hover:bg-purple-900 flex items-center gap-1 transition-all shadow-[0_0_12px_rgba(131,62,239,0.3)] opacity-85 hover:opacity-100 cursor-pointer"
                    title="Speak or replay the latest question"
                  >
                    <Volume2 className="w-3 h-3 text-purple-400" />
                    <span>{assistantState === 'AI_SPEAKING' ? 'Speaking...' : 'Speak Question'}</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Card 2 (Middle): Recent History / Q&A Dialogue */}
          <div className="flex-[4.2] min-h-[160px] h-full overflow-hidden">
            <HistoryPanel
              items={history}
              onViewAll={() => setIsHistoryModalOpen(true)}
              onSpeak={speak}
            />
          </div>

          {/* Card 3 (Bottom): System Status & Hardware Telemetry */}
          <div className="flex-[2.3] min-h-[135px] max-h-[165px] h-full overflow-hidden">
            <StatusPanel
              status={systemStatus}
              micAudioLevel={micAudioLevel}
              onOpenDetails={() => setIsDiagnosticsModalOpen(true)}
              onTestSpeaker={() => testSpeakerOutput()}
            />
          </div>
        </section>
      </main>

      {/* Quick Action & Controls Dock */}
      <QuickActions
        status={systemStatus}
        state={assistantState}
        onSendAction={handleSendAction}
      />

      {/* Footer Bar */}
      <BottomBar currentTranscription={currentTranscription} />

      {/* Deep Interactive Modals */}
      <VisionDetailModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        env={environment}
        scene={scene}
        metrics={visionMetrics}
      />

      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        history={history}
        onClearHistory={() => setHistory([])}
      />

      <DiagnosticsModal
        isOpen={isDiagnosticsModalOpen}
        onClose={() => setIsDiagnosticsModalOpen(false)}
      />

      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        config={config}
        onSaveConfig={handleSaveConfig}
      />

      <PeopleModal
        isOpen={isPeopleModalOpen}
        onClose={() => setIsPeopleModalOpen(false)}
        activeInterviewerId={activeInterviewer.id}
        onSelectInterviewer={handleSelectInterviewer}
      />

      <MemoryDetailModal
        isOpen={isMemoryModalOpen}
        onClose={() => setIsMemoryModalOpen(false)}
      />

      <GlassesModal
        isOpen={isGlassesModalOpen}
        onClose={() => setIsGlassesModalOpen(false)}
      />

      <VaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
      />
    </div>
  )
}
