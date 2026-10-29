import React, { useEffect, useRef, memo } from 'react'

// Design Palette Constants matching ZORO (#833EEF / electric purple)
const PURPLE = '#833EEF'
const PURPLE_GLOW = '#A855F7'
const PURPLE_BRIGHT = '#C084FC'
const PURPLE_DIM = '#6D28D9'
const PURPLE_GLASS = 'rgba(18, 10, 36, 0.75)'
const PURPLE_STROKE = 'rgba(131, 62, 239, 0.35)'

const CX = 200
const CY = 200

function polar(r, deg) {
  const a = (deg * Math.PI) / 180
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)]
}

function arcSegment(rIn, rOut, startDeg, endDeg) {
  const [x1o, y1o] = polar(rOut, startDeg)
  const [x2o, y2o] = polar(rOut, endDeg)
  const [x1i, y1i] = polar(rIn, endDeg)
  const [x2i, y2i] = polar(rIn, startDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${x1o} ${y1o} A ${rOut} ${rOut} 0 ${large} 1 ${x2o} ${y2o} L ${x1i} ${y1i} A ${rIn} ${rIn} 0 ${large} 0 ${x2i} ${y2i} Z`
}

function donutPath(rIn, rOut) {
  return (
    `M ${CX + rOut} ${CY} A ${rOut} ${rOut} 0 1 0 ${CX - rOut} ${CY} A ${rOut} ${rOut} 0 1 0 ${CX + rOut} ${CY} Z ` +
    `M ${CX + rIn} ${CY} A ${rIn} ${rIn} 0 1 1 ${CX - rIn} ${CY} A ${rIn} ${rIn} 0 1 1 ${CX + rIn} ${CY} Z`
  )
}

function Spinner({ duration, reverse = false, children }) {
  return (
    <g>
      {children}
      <animateTransform
        attributeName="transform"
        type="rotate"
        from={`0 ${CX} ${CY}`}
        to={`${reverse ? -360 : 360} ${CX} ${CY}`}
        dur={`${duration}s`}
        repeatCount="indefinite"
      />
    </g>
  )
}

function ArcSegments({ count, rIn, rOut, arcDeg, gapDeg, fill, phase = 0 }) {
  const step = arcDeg + gapDeg
  return (
    <g fill={fill}>
      {Array.from({ length: count }, (_, i) => {
        const start = i * step + phase
        return <path key={i} d={arcSegment(rIn, rOut, start, start + arcDeg)} />
      })}
    </g>
  )
}

function DotsRing({ count, r, dotR, fill, opacity = 1 }) {
  return (
    <g fill={fill} opacity={opacity}>
      {Array.from({ length: count }, (_, i) => {
        const [x, y] = polar(r, (i / count) * 360)
        return <circle key={i} cx={x} cy={y} r={dotR} />
      })}
    </g>
  )
}

function BarcodeTicks({ angle }) {
  const offsets = [-14, -10, -6, -2, 2, 6, 10, 14]
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`} fill={PURPLE}>
      {offsets.map((o) => (
        <rect key={o} x={CX + o - 0.5} y={5} width={1} height={11} opacity={0.85} />
      ))}
    </g>
  )
}

function CardinalArrow({ angle }) {
  return (
    <g transform={`rotate(${angle} ${CX} ${CY})`}>
      <polygon points={`${CX - 5},22 ${CX + 5},22 ${CX},32`} fill={PURPLE_GLOW} />
    </g>
  )
}

function HUDRings() {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 400 400"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id="rimGlow" cx="50%" cy="50%" r="50%">
          <stop offset="70%" stopColor="rgba(131,62,239,0)" />
          <stop offset="100%" stopColor="rgba(131,62,239,0.28)" />
        </radialGradient>
      </defs>

      <g className="hud-ring-spawn" style={{ animationDelay: '0.85s' }}>
        <Spinner duration={55} reverse>
          <circle cx={CX} cy={CY} r={198} fill="url(#rimGlow)" />
          <path
            d={donutPath(168, 190)}
            fill={PURPLE_GLASS}
            fillRule="evenodd"
            stroke={PURPLE_STROKE}
            strokeWidth={0.5}
          />
          <circle
            cx={CX}
            cy={CY}
            r={179}
            fill="none"
            stroke={PURPLE}
            strokeWidth={22}
            opacity={0}
            className="shell-flash-halo"
          />
          <circle
            cx={CX}
            cy={CY}
            r={179}
            fill="none"
            stroke={PURPLE_GLOW}
            strokeWidth={4}
            opacity={0}
            className="shell-flash-core"
          />
          <BarcodeTicks angle={0} />
          <BarcodeTicks angle={90} />
          <BarcodeTicks angle={180} />
          <BarcodeTicks angle={270} />
          <CardinalArrow angle={0} />
          <CardinalArrow angle={90} />
          <CardinalArrow angle={180} />
          <CardinalArrow angle={270} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: '0.65s' }}>
        <Spinner duration={22}>
          <ArcSegments
            count={4}
            rIn={148}
            rOut={165}
            arcDeg={62}
            gapDeg={28}
            fill="rgba(131,62,239,0.85)"
          />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: '0.5s' }}>
        <Spinner duration={16}>
          <DotsRing count={72} r={132} dotR={2} fill="#E9D5FF" opacity={0.95} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: '0.35s' }}>
        <Spinner duration={26} reverse>
          <ArcSegments
            count={4}
            rIn={102}
            rOut={118}
            arcDeg={55}
            gapDeg={35}
            fill="rgba(131,62,239,0.85)"
            phase={22}
          />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: '0.2s' }}>
        <Spinner duration={11} reverse>
          <DotsRing count={54} r={88} dotR={1.6} fill="#C084FC" opacity={0.9} />
        </Spinner>
      </g>

      <g className="hud-ring-spawn" style={{ animationDelay: '0s' }}>
        <Spinner duration={7} reverse>
          <ArcSegments
            count={2}
            rIn={72}
            rOut={78}
            arcDeg={40}
            gapDeg={140}
            fill="rgba(168,85,247,0.75)"
          />
        </Spinner>
      </g>
    </svg>
  )
}

/* -------------------------------------------------------------------------- */
/*             HIGH-PERFORMANCE 3D CANVAS WEBGL CUBE & PARTICLES              */
/* -------------------------------------------------------------------------- */

// Outer cube 8 vertices: [x, y, z]
const OUTER_VERTICES = [
  [-1, -1, -1],
  [1, -1, -1],
  [1, 1, -1],
  [-1, 1, -1],
  [-1, -1, 1],
  [1, -1, 1],
  [1, 1, 1],
  [-1, 1, 1],
]

// 12 edges connecting vertex indices
const CUBE_EDGES = [
  [0, 1], [1, 2], [2, 3], [3, 0], // back
  [4, 5], [5, 6], [6, 7], [7, 4], // front
  [0, 4], [1, 5], [2, 6], [3, 7], // sides
]

// 6 faces (quads)
const CUBE_FACES = [
  [0, 1, 2, 3], // back
  [4, 5, 6, 7], // front
  [0, 1, 5, 4], // bottom
  [2, 3, 7, 6], // top
  [0, 3, 7, 4], // left
  [1, 2, 6, 5], // right
]

// Particle system data (80 floating particles)
const PARTICLE_COUNT = 80
const PARTICLES = Array.from({ length: PARTICLE_COUNT }).map(() => {
  const r = 1.3 + Math.random() * 1.3
  const theta = Math.random() * Math.PI * 2
  const phi = Math.acos(2 * Math.random() - 1)
  return {
    x: r * Math.sin(phi) * Math.cos(theta),
    y: r * Math.sin(phi) * Math.sin(theta),
    z: r * Math.cos(phi),
    speed: 0.005 + Math.random() * 0.015,
    size: 1 + Math.random() * 2,
    opacity: 0.4 + Math.random() * 0.5,
  }
})

function rotateX(v, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos]
}

function rotateY(v, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos]
}

function rotateZ(v, angle) {
  const cos = Math.cos(angle)
  const sin = Math.sin(angle)
  return [v[0] * cos - v[1] * sin, v[0] * sin + v[1] * cos, v[2]]
}

function project(v, w, h, fov = 350) {
  const distance = 4.0
  const z = v[2] + distance
  const scale = fov / Math.max(0.1, z)
  return {
    x: w / 2 + v[0] * scale,
    y: h / 2 - v[1] * scale,
    z: z,
    scale: scale,
  }
}

export const SGCubeVisualizer = memo(function SGCubeVisualizer({
  state = 'idle', // 'idle' | 'listening' | 'speaking' | 'thinking'
  audioLevel = 0, // 0-100
  size = 320,
}) {
  const canvasRef = useRef(null)
  const animFrameRef = useRef(null)
  const rotRef = useRef({ rotX: 0.35, rotY: 0.45, innerRotY: 0, innerRotZ: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let lastTime = performance.now()

    const render = (time) => {
      const delta = Math.min(0.05, (time - lastTime) / 1000)
      lastTime = time

      // Speed multipliers based on SG CUBE state
      let speedMult = 1.0
      if (state === 'speaking') speedMult = 2.0
      else if (state === 'thinking') speedMult = 1.6
      else if (state === 'listening') speedMult = 1.25

      rotRef.current.rotY += delta * 0.45 * speedMult
      rotRef.current.rotX += delta * 0.20 * speedMult
      rotRef.current.innerRotY -= delta * 0.65 * speedMult
      rotRef.current.innerRotZ += delta * 0.35 * speedMult

      const w = canvas.width
      const h = canvas.height
      ctx.clearRect(0, 0, w, h)

      // Dynamic breathing pulse based on audio level & state
      const pulseAudio = Math.min(0.25, (audioLevel / 100) * 0.25)
      const pulseSine = Math.sin(time * 0.003) * 0.04
      const baseScale = state === 'speaking' ? 0.9 + pulseAudio : 0.85 + pulseSine

      // 1. Render Floating Space Dust Particles
      ctx.fillStyle = PURPLE_GLOW
      PARTICLES.forEach((p) => {
        p.theta = (p.theta || 0) + p.speed * speedMult
        const rotated = rotateY([p.x, p.y, p.z], rotRef.current.rotY * 0.4)
        const proj = project(rotated, w, h, 260)
        ctx.globalAlpha = p.opacity * (state === 'speaking' ? 1.0 : 0.6)
        ctx.beginPath()
        ctx.arc(proj.x, proj.y, p.size * (proj.scale / 120), 0, Math.PI * 2)
        ctx.fill()
      })
      ctx.globalAlpha = 1.0

      // 2. Project Outer Cube Vertices
      const outerTransformed = OUTER_VERTICES.map((v) => {
        const scaled = [v[0] * baseScale, v[1] * baseScale, v[2] * baseScale]
        let r = rotateY(scaled, rotRef.current.rotY)
        r = rotateX(r, rotRef.current.rotX)
        return r
      })

      const outerProjected = outerTransformed.map((v) => project(v, w, h, 270))

      // 3. Render Translucent Cube Faces with Depth Sorting
      const sortedFaces = CUBE_FACES.map((indices) => {
        const avgZ =
          (outerTransformed[indices[0]][2] +
            outerTransformed[indices[1]][2] +
            outerTransformed[indices[2]][2] +
            outerTransformed[indices[3]][2]) /
          4
        return { indices, avgZ }
      }).sort((a, b) => b.avgZ - a.avgZ)

      sortedFaces.forEach(({ indices }) => {
        const p0 = outerProjected[indices[0]]
        const p1 = outerProjected[indices[1]]
        const p2 = outerProjected[indices[2]]
        const p3 = outerProjected[indices[3]]

        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.lineTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.lineTo(p3.x, p3.y)
        ctx.closePath()

        ctx.fillStyle =
          state === 'speaking'
            ? 'rgba(131, 62, 239, 0.28)'
            : state === 'thinking'
              ? 'rgba(168, 85, 247, 0.3)'
              : 'rgba(109, 40, 217, 0.18)'
        ctx.fill()
      })

      // 4. Render Glowing Inner Box (Rotating in reverse)
      const innerScale = baseScale * 0.58
      const innerTransformed = OUTER_VERTICES.map((v) => {
        const scaled = [v[0] * innerScale, v[1] * innerScale, v[2] * innerScale]
        let r = rotateZ(scaled, rotRef.current.innerRotZ)
        r = rotateY(r, rotRef.current.innerRotY)
        r = rotateX(r, rotRef.current.rotX)
        return r
      })
      const innerProjected = innerTransformed.map((v) => project(v, w, h, 270))

      ctx.strokeStyle = state === 'speaking' ? '#C084FC' : '#7C3AED'
      ctx.lineWidth = 1.2
      ctx.globalAlpha = 0.85
      CUBE_EDGES.forEach(([i1, i2]) => {
        const p1 = innerProjected[i1]
        const p2 = innerProjected[i2]
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })

      // 5. Render Outer Radiant Purple Edges with Bloom Glow
      ctx.save()
      ctx.strokeStyle = PURPLE_GLOW
      ctx.shadowColor = PURPLE
      ctx.shadowBlur = state === 'speaking' ? 18 : 10
      ctx.lineWidth = state === 'speaking' ? 2.4 : 1.8
      ctx.globalAlpha = 1.0

      CUBE_EDGES.forEach(([i1, i2]) => {
        const p1 = outerProjected[i1]
        const p2 = outerProjected[i2]
        ctx.beginPath()
        ctx.moveTo(p1.x, p1.y)
        ctx.lineTo(p2.x, p2.y)
        ctx.stroke()
      })
      ctx.restore()

      // 6. Corner Glowing Nodes
      outerProjected.forEach((p) => {
        ctx.beginPath()
        ctx.arc(p.x, p.y, 3.5, 0, Math.PI * 2)
        ctx.fillStyle = '#FFFFFF'
        ctx.shadowColor = PURPLE_GLOW
        ctx.shadowBlur = 12
        ctx.fill()
      })

      // 7. Center Hologram Brand Label: CAREERAI
      const centerProj = project([0, 0, 0], w, h, 270)
      ctx.save()
      ctx.font = 'bold 11px Consolas, monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = PURPLE_BRIGHT
      ctx.shadowColor = PURPLE
      ctx.shadowBlur = 8
      ctx.fillText('CAREERAI', centerProj.x, centerProj.y)
      ctx.restore()

      animFrameRef.current = requestAnimationFrame(render)
    }

    animFrameRef.current = requestAnimationFrame(render)
    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current)
    }
  }, [state, audioLevel])

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Concentric Rotating Cyberpunk HUD Rings */}
      <HUDRings />

      {/* 3D Holographic Cube Canvas */}
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="relative z-10 pointer-events-none"
      />
    </div>
  )
})

export const ZoroVisualizer = SGCubeVisualizer
export default SGCubeVisualizer


