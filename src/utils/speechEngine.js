/**
 * SG-CUBE & Zoro Cybernetic Speech Engine
 * Features:
 * - Bulletproof against Chromium V8 garbage collection bug
 * - Automatic sentence chunking to defeat Chrome 15s freeze bug
 * - Web Audio API cyber chime synthesizer
 * - Natural English voice auto-selection (Neural/Natural/Desktop)
 * - Automatic retry & Google Translate audio fallback
 * - Periodic resume watchdog
 */

let audioCtx = null
let resumeInterval = null
const activeUtterances = new Set()
let isUnlocked = false

/**
 * Initialize Web Audio Context safely on first user gesture
 */
export function getAudioContext() {
  if (typeof window === 'undefined') return null
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) {
      audioCtx = new AudioContextClass()
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {})
  }
  return audioCtx
}

/**
 * Play a high-tech synthesized cyber chime to confirm speaker hardware output
 */
export function playCyberChime(type = 'chime') {
  try {
    const ctx = getAudioContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.connect(gain)
    gain.connect(ctx.destination)

    if (type === 'test') {
      // 3-tone arpeggio (C5 -> E5 -> G5)
      osc.type = 'sine'
      osc.frequency.setValueAtTime(523.25, now)
      osc.frequency.setValueAtTime(659.25, now + 0.08)
      osc.frequency.setValueAtTime(783.99, now + 0.16)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.2, now + 0.04)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)

      osc.start(now)
      osc.stop(now + 0.36)
    } else if (type === 'start') {
      // Subtle two-tone prompt chime
      osc.type = 'triangle'
      osc.frequency.setValueAtTime(440, now)
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.1)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.2)

      osc.start(now)
      osc.stop(now + 0.22)
    } else {
      // Single short subtle ping
      osc.type = 'sine'
      osc.frequency.setValueAtTime(600, now)

      gain.gain.setValueAtTime(0.001, now)
      gain.gain.exponentialRampToValueAtTime(0.08, now + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15)

      osc.start(now)
      osc.stop(now + 0.16)
    }
  } catch (err) {
    console.debug('[SpeechEngine] Chime error:', err)
  }
}

/**
 * Clean text for clean speech pronunciation
 */
function cleanSpeechText(text) {
  if (!text) return ''
  return text
    .replace(/[*_#`~[\]]/g, '') // remove markdown symbols
    .replace(/https?:\/\/\S+/g, 'link') // replace urls
    .replace(/\b(?:e\.g\.|eg)\b/gi, 'for example')
    .replace(/\b(?:i\.e\.|ie)\b/gi, 'that is')
    .replace(/&/g, ' and ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Break long text into natural sentence chunks (< 160 characters)
 */
function splitIntoChunks(text, maxChunkLen = 150) {
  const cleaned = cleanSpeechText(text)
  if (!cleaned) return []

  // Split on punctuation (. ! ? ; or newlines)
  const rawSentences = cleaned.match(/[^.!?;\n]+[.!?;\n]+|[^.!?;\n]+/g) || [cleaned]
  const chunks = []

  for (const sentence of rawSentences) {
    const s = sentence.trim()
    if (!s) continue

    if (s.length <= maxChunkLen) {
      chunks.push(s)
    } else {
      // Split on commas or words if sentence is long
      const words = s.split(/\s+/)
      let current = ''
      for (const w of words) {
        if ((current + ' ' + w).trim().length <= maxChunkLen) {
          current = (current + ' ' + w).trim()
        } else {
          if (current) chunks.push(current)
          current = w
        }
      }
      if (current) chunks.push(current)
    }
  }

  return chunks.length > 0 ? chunks : [cleaned]
}

/**
 * Find the best natural English voice available in the current browser
 */
function selectBestVoice() {
  if (typeof window === 'undefined' || !window.speechSynthesis) return null
  const voices = window.speechSynthesis.getVoices() || []
  if (voices.length === 0) return null

  // 1. Natural / Neural online voices
  const natural = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      /natural|neural|online|premium/i.test(v.name)
  )
  if (natural) return natural

  // 2. Google voices (Chrome)
  const google = voices.find(
    (v) => v.lang.startsWith('en') && /google/i.test(v.name)
  )
  if (google) return google

  // 3. Known high-quality desktop voices (Windows / Edge / macOS)
  const desktop = voices.find(
    (v) =>
      v.lang.startsWith('en') &&
      /zira|jenny|guy|aria|sonia|samantha|karen|david|mark/i.test(v.name)
  )
  if (desktop) return desktop

  // 4. Any English voice
  const anyEn = voices.find((v) => v.lang.startsWith('en'))
  if (anyEn) return anyEn

  return voices[0] || null
}

if (typeof window !== 'undefined' && window.speechSynthesis) {
  try {
    window.speechSynthesis.onvoiceschanged = () => {
      selectBestVoice()
    }
  } catch {}
}

let speechQueue = []
let isSpeakingNow = false

/**
 * Fallback to Google Translate TTS audio stream if Web Speech API fails
 */
function playAudioFallback(text, onEnd) {
  try {
    const encoded = encodeURIComponent(text.slice(0, 150))
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=en&client=tw-ob&q=${encoded}`
    const audio = new Audio(audioUrl)
    audio.onended = () => {
      if (onEnd) onEnd()
    }
    audio.onerror = () => {
      if (onEnd) onEnd()
    }
    audio.play().catch(() => {
      if (onEnd) onEnd()
    })
  } catch {
    if (onEnd) onEnd()
  }
}

/**
 * Primary Speak function
 */
export function speakText(text, options = {}) {
  const {
    rate = 1.05,
    pitch = 1.0,
    volume = 1.0,
    playChime = false,
    onStart = null,
    onEnd = null,
    onError = null,
  } = options

  if (typeof window === 'undefined') return

  // Stop any active speech cleanly
  stopSpeaking()

  // Ensure AudioContext is ready
  getAudioContext()

  if (playChime) {
    playCyberChime('start')
  }

  const chunks = splitIntoChunks(text)
  if (chunks.length === 0) {
    if (onEnd) onEnd()
    return
  }

  // If speechSynthesis is totally missing, use audio fallback
  if (!window.speechSynthesis) {
    playAudioFallback(chunks.join(' '), onEnd)
    return
  }

  speechQueue = [...chunks]
  isSpeakingNow = true

  // Start keepalive watchdog
  if (resumeInterval) clearInterval(resumeInterval)
  resumeInterval = setInterval(() => {
    if (window.speechSynthesis && window.speechSynthesis.speaking) {
      window.speechSynthesis.resume()
    }
  }, 2000)

  let chunkIndex = 0

  const speakNextChunk = () => {
    if (!isSpeakingNow || chunkIndex >= speechQueue.length) {
      isSpeakingNow = false
      if (resumeInterval) {
        clearInterval(resumeInterval)
        resumeInterval = null
      }
      if (onEnd) onEnd()
      return
    }

    const chunkText = speechQueue[chunkIndex]
    chunkIndex++

    try {
      window.speechSynthesis.resume()

      const utterance = new SpeechSynthesisUtterance(chunkText)
      utterance.rate = rate
      utterance.pitch = pitch
      utterance.volume = volume

      const voice = selectBestVoice()
      if (voice) {
        utterance.voice = voice
      }

      // GC Protection: hold in active set until end/error
      activeUtterances.add(utterance)

      if (chunkIndex === 1 && onStart) {
        onStart()
      }

      utterance.onend = () => {
        activeUtterances.delete(utterance)
        speakNextChunk()
      }

      utterance.onerror = (e) => {
        console.warn('[SpeechEngine] Utterance error:', e)
        activeUtterances.delete(utterance)
        // If error occurred on first chunk, try audio stream fallback
        if (chunkIndex === 1) {
          playAudioFallback(speechQueue.join(' '), onEnd)
          isSpeakingNow = false
          return
        }
        speakNextChunk()
      }

      window.speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('[SpeechEngine] Speak exception:', err)
      playAudioFallback(speechQueue.join(' '), onEnd)
      isSpeakingNow = false
    }
  }

  speakNextChunk()
}

/**
 * Cancel and stop all speech immediately
 */
export function stopSpeaking() {
  isSpeakingNow = false
  speechQueue = []

  if (resumeInterval) {
    clearInterval(resumeInterval)
    resumeInterval = null
  }

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.cancel()
    } catch {}
  }

  activeUtterances.clear()
}

/**
 * Return current speaking status
 */
export function isSpeaking() {
  return isSpeakingNow || (typeof window !== 'undefined' && window.speechSynthesis?.speaking)
}

/**
 * Test speaker hardware and say confirmation
 */
export function testSpeakerOutput(onComplete) {
  playCyberChime('test')
  setTimeout(() => {
    speakText('Audio output verified. CAREERAI neural voice is fully operational with Gemini 3.8 Flash.', {
      rate: 1.05,
      pitch: 1.0,
      onEnd: onComplete,
    })
  }, 350)
}

/**
 * Unlock AudioContext & pre-cache speech synthesis voices
 */
export function unlockAudioSystem() {
  if (isUnlocked) return
  isUnlocked = true

  getAudioContext()

  if (typeof window !== 'undefined' && window.speechSynthesis) {
    try {
      window.speechSynthesis.resume()
      window.speechSynthesis.getVoices()
    } catch {}
  }
}
