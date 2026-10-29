import React, { useState, useEffect } from 'react'
import {
  Camera,
  CameraOff,
  Maximize2,
  Compass,
  Sparkles,
  RefreshCw,
  AlertCircle,
  ShieldCheck,
  Monitor,
  Camera as SnapshotIcon,
  Check,
} from 'lucide-react'

export const CameraPanel = ({
  cameraActive = true,
  fps = 30,
  onToggleCamera,
  onStartCamera,
  onToggleSimulatedCam,
  isSimulatedCam = false,
  isScreenSharing = false,
  onToggleScreenShare,
  onTakeSnapshot,
  camError = '',
  videoRef,
  mirrorCam = true,
  eyeContactScore = 94,
}) => {
  const [reticleActive, setReticleActive] = useState(true)
  const [snapshotTaken, setSnapshotTaken] = useState(false)

  // Ensure video element plays as soon as srcObject is attached
  useEffect(() => {
    if (videoRef?.current && videoRef.current.srcObject) {
      videoRef.current.play().catch(() => {})
    }
  })

  const handleFullscreen = () => {
    const el = document.getElementById('zoro-camera-container')
    if (!el) return
    if (!document.fullscreenElement) {
      el.requestFullscreen().catch(() => {})
    } else {
      document.exitFullscreen().catch(() => {})
    }
  }

  const handleSnapshot = () => {
    if (onTakeSnapshot) onTakeSnapshot()
    setSnapshotTaken(true)
    setTimeout(() => setSnapshotTaken(false), 1500)
  }

  return (
    <div
      id="zoro-camera-container"
      className="relative w-full h-full rounded-md bg-[#020305] border border-purple-500/30 overflow-hidden flex flex-col shadow-[0_4px_24px_rgba(0,0,0,0.8)] select-none"
    >
      {/* Top HUD Overlay Bar inside camera */}
      <div className="absolute top-2 left-2 right-2 flex items-center justify-between z-20 pointer-events-none">
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* LIVE indicator */}
          <div
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded border text-xs font-mono font-bold tracking-wider shadow ${
              cameraActive || isScreenSharing
                ? isScreenSharing
                  ? 'bg-blue-950/80 border-blue-500/50 text-blue-300'
                  : isSimulatedCam
                  ? 'bg-purple-950/80 border-purple-500/50 text-purple-300'
                  : 'bg-red-950/80 border-red-500/50 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.4)]'
                : 'bg-yellow-950/80 border-yellow-500/50 text-yellow-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full inline-block ${
                cameraActive || isScreenSharing
                  ? isScreenSharing
                    ? 'animate-pulse bg-blue-400'
                    : 'animate-ping bg-red-500'
                  : 'bg-yellow-500'
              }`}
            />
            <span>
              {isScreenSharing
                ? 'SCREEN'
                : cameraActive
                ? isSimulatedCam
                  ? 'SIMULATED'
                  : 'LIVE'
                : 'PAUSED'}
            </span>
          </div>

          {/* FPS Badge */}
          <div className="px-2 py-0.5 rounded bg-black/70 border border-purple-500/30 text-purple-300 text-xs font-mono">
            {cameraActive || isScreenSharing ? `${fps} FPS` : 'STANDBY'}
          </div>

          {/* Stream Mode Indicator */}
          <div className="px-2 py-0.5 rounded bg-black/70 border border-purple-500/30 text-purple-200 text-xs font-mono hidden sm:inline-block">
            {isScreenSharing ? 'Whiteboard / Code Screen' : isSimulatedCam ? 'AI Vision Model' : '1080p HD'}
          </div>
        </div>

        {/* Camera action buttons */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Screen Share / Whiteboard */}
          {onToggleScreenShare && (
            <button
              onClick={onToggleScreenShare}
              className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 border transition-colors shadow ${
                isScreenSharing
                  ? 'bg-blue-600/30 border-blue-400 text-blue-200'
                  : 'bg-black/60 border-purple-500/30 text-text-muted hover:text-purple-300'
              }`}
              title={isScreenSharing ? 'Stop Screen Share (Return to Webcam)' : 'Share Screen (Code / Whiteboard)'}
            >
              <Monitor className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden md:inline">{isScreenSharing ? 'Webcam' : 'Share Screen'}</span>
            </button>
          )}

          {/* Snapshot Button */}
          <button
            onClick={handleSnapshot}
            className={`w-7 h-7 rounded border flex items-center justify-center transition-colors shadow ${
              snapshotTaken
                ? 'bg-emerald-500/30 border-emerald-400 text-emerald-300'
                : 'bg-black/60 border-purple-500/30 text-text-muted hover:text-purple-300'
            }`}
            title="Take Video Snapshot for AI Feedback"
          >
            {snapshotTaken ? <Check className="w-3.5 h-3.5" /> : <SnapshotIcon className="w-3.5 h-3.5" />}
          </button>

          {/* Demo Cam toggle */}
          {onToggleSimulatedCam && !isScreenSharing && (
            <button
              onClick={onToggleSimulatedCam}
              className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 border transition-colors shadow ${
                isSimulatedCam
                  ? 'bg-purple-600/30 border-purple-400 text-purple-200'
                  : 'bg-black/60 border-purple-500/30 text-text-muted hover:text-purple-300'
              }`}
              title={isSimulatedCam ? 'Switch to Physical Webcam' : 'Switch to Simulated Vision'}
            >
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span className="hidden md:inline">{isSimulatedCam ? 'Real Cam' : 'Demo Cam'}</span>
            </button>
          )}

          {/* Reticle toggle */}
          <button
            onClick={() => setReticleActive((prev) => !prev)}
            className={`w-7 h-7 rounded border flex items-center justify-center transition-colors shadow ${
              reticleActive
                ? 'bg-purple-500/20 border-purple-400 text-purple-300'
                : 'bg-black/60 border-purple-500/30 text-text-muted hover:text-purple-300'
            }`}
            title="Toggle Reticle Overlay"
          >
            <Compass className="w-3.5 h-3.5" />
          </button>

          {/* Camera Pause / Resume */}
          <button
            onClick={onToggleCamera}
            className={`w-7 h-7 rounded border flex items-center justify-center transition-colors shadow ${
              cameraActive
                ? 'bg-black/60 border-purple-500/30 text-purple-300 hover:text-white'
                : 'bg-red-500/20 border-red-500/40 text-red-300 hover:text-white'
            }`}
            title={cameraActive ? 'Pause Camera' : 'Turn On / Resume Camera'}
          >
            {cameraActive ? <Camera className="w-3.5 h-3.5" /> : <CameraOff className="w-3.5 h-3.5" />}
          </button>

          {/* Fullscreen */}
          <button
            onClick={handleFullscreen}
            className="w-7 h-7 rounded bg-black/60 border border-purple-500/30 flex items-center justify-center text-text-muted hover:text-purple-300 transition-colors shadow"
            title="Fullscreen Video"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Video Content Area */}
      <div className="flex-1 w-full h-full relative flex items-center justify-center bg-black/95 overflow-hidden">
        {/* Real Live Webcam / Screen Share Element */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className={`absolute inset-0 w-full h-full ${
            isScreenSharing ? 'object-contain' : 'object-cover'
          } transition-opacity duration-300 ${
            mirrorCam && !isScreenSharing ? 'scale-x-[-1]' : ''
          } ${(cameraActive || isScreenSharing) && !isSimulatedCam ? 'opacity-100 z-10' : 'opacity-0 pointer-events-none'}`}
        />

        {/* Snapshot Flash Overlay */}
        {snapshotTaken && (
          <div className="absolute inset-0 z-30 bg-white/30 backdrop-blur-[2px] animate-fadeOut pointer-events-none flex items-center justify-center">
            <span className="px-3 py-1.5 rounded-full bg-black/80 text-purple-300 font-mono text-xs border border-purple-400">
              SNAPSHOT CAPTURED FOR AI FEEDBACK
            </span>
          </div>
        )}

        {/* Simulated Camera Feed (For users without working webcam) */}
        {cameraActive && isSimulatedCam && !isScreenSharing && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-gradient-to-b from-[#0b0618] via-[#04010a] to-[#0d071d] overflow-hidden">
            {/* Background Grid Accent */}
            <div
              className="absolute inset-0 opacity-15"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 50% 50%, rgba(131, 62, 239, 0.4) 0%, transparent 60%), linear-gradient(rgba(131, 62, 239, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(131, 62, 239, 0.1) 1px, transparent 1px)',
                backgroundSize: '100% 100%, 32px 32px, 32px 32px',
              }}
            />

            {/* Candidate Hologram / Avatar */}
            <div className="relative flex flex-col items-center">
              <div className="relative w-32 h-32 rounded-full border-2 border-purple-500/60 bg-purple-950/40 flex items-center justify-center shadow-[0_0_30px_rgba(131,62,239,0.35)] animate-pulse">
                {/* Inner Face Mesh Representation */}
                <div className="w-24 h-24 rounded-full border border-purple-400/40 flex flex-col items-center justify-center relative">
                  <div className="flex items-center gap-5 mb-2">
                    <span className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc]" />
                    <span className="w-2 h-2 rounded-full bg-purple-300 shadow-[0_0_6px_#c084fc]" />
                  </div>
                  <div className="w-6 h-0.5 bg-purple-400/80 rounded-full" />
                </div>

                {/* Orbiting Telemetry Ring */}
                <div className="absolute -inset-2 rounded-full border border-purple-500/30 border-dashed animate-spin [animation-duration:15s]" />
              </div>

              {/* Simulated Tag */}
              <div className="mt-4 px-3 py-1 rounded-full bg-purple-900/40 border border-purple-500/40 text-[11px] font-mono text-purple-200 flex items-center gap-1.5 shadow">
                <ShieldCheck className="w-3.5 h-3.5 text-teal" />
                <span>Simulated Vision Feed • Real-Time Telemetry Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Camera Off / Blocked Screen */}
        {!cameraActive && !isScreenSharing && (
          <div className="relative z-10 max-w-sm px-6 py-4 flex flex-col items-center justify-center text-center gap-3 text-text-muted bg-black/60 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
            <div className="w-14 h-14 rounded-full border border-purple-500/30 bg-purple-950/30 flex items-center justify-center shadow-lg">
              <CameraOff className="w-7 h-7 text-purple-400" />
            </div>

            <div>
              <p className="text-white font-semibold text-sm">
                {camError ? 'Camera Access Required' : 'Camera Sensor Paused'}
              </p>
              <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                {camError ||
                  'Your webcam stream is currently paused. Click below to start video tracking for the mock interview.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full pt-1">
              <button
                onClick={onStartCamera || onToggleCamera}
                className="w-full btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>{camError ? 'Allow / Retry Camera' : 'Turn On Camera'}</span>
              </button>

              {onToggleSimulatedCam && (
                <button
                  onClick={onToggleSimulatedCam}
                  className="w-full btn-ghost border border-white/10 text-xs py-2 px-3 flex items-center justify-center gap-1.5 hover:border-purple-400/40"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>Use Demo Feed</span>
                </button>
              )}
            </div>

            <p className="text-[10px] text-gray-500 pt-1">
              Tip: In Chrome / Edge, click the lock icon 🔒 next to the URL and set Camera to <strong>Allow</strong>.
            </p>
          </div>
        )}

        {/* Target Reticle Crosshair & Eye Contact Lock */}
        {reticleActive && (cameraActive || isScreenSharing) && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="relative w-44 h-48 rounded-2xl border border-purple-400/40 shadow-[0_0_15px_rgba(131,62,239,0.25)] flex flex-col justify-between p-2">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#833EEF]" />
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-[#833EEF]" />
              <div className="absolute top-1/2 -left-2 -translate-y-1/2 h-4 w-0.5 bg-[#833EEF]" />
              <div className="absolute top-1/2 -right-2 -translate-y-1/2 h-4 w-0.5 bg-[#833EEF]" />

              <div className="flex items-center justify-between text-[9px] font-mono text-purple-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#833EEF] animate-pulse" />
                  {isScreenSharing ? 'SCREEN_LOCK' : 'TARGET_LOCK'}
                </span>
                <span>{eyeContactScore}%</span>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono text-purple-300 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                <span>{isScreenSharing ? 'WHITEBOARD: ON' : 'GAZE: CENTER'}</span>
                <span>CV: ACTIVE</span>
              </div>
            </div>
          </div>
        )}

        {/* Futuristic Corner Reticle Accents */}
        <div className="absolute top-0 left-0 w-3.5 h-3.5 border-t-2 border-l-2 border-purple-400 pointer-events-none z-20" />
        <div className="absolute top-0 right-0 w-3.5 h-3.5 border-t-2 border-r-2 border-purple-400 pointer-events-none z-20" />
        <div className="absolute bottom-0 left-0 w-3.5 h-3.5 border-b-2 border-l-2 border-purple-400 pointer-events-none z-20" />
        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 border-b-2 border-r-2 border-purple-400 pointer-events-none z-20" />
      </div>
    </div>
  )
}

export default CameraPanel
