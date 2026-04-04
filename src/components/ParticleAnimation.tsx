import { useRef, useEffect } from 'react'

interface Props {
  speed: 'cinematic' | 'medium' | 'quick'
  onComplete: () => void
}

const SPEED_DURATIONS: Record<Props['speed'], number> = {
  cinematic: 10000,
  medium: 6000,
  quick: 3000,
}

const COLORS = ['#f6c453', '#f47068', '#b794f4', '#63b3ed']

interface Particle {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  radius: number
  color: string
  colorIndex: number
  angle: number
  orbitRadius: number
  orbitSpeed: number
}

function textToPoints(
  text: string,
  width: number,
  height: number,
  count: number
): { x: number; y: number }[] {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = 'white'
  ctx.font = `bold ${Math.min(width / 4, height / 2)}px Arial`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, width / 2, height / 2)
  const imageData = ctx.getImageData(0, 0, width, height)
  const points: { x: number; y: number }[] = []
  const step = 4
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (imageData.data[(y * width + x) * 4 + 3] > 128) {
        points.push({ x, y })
      }
    }
  }
  const result: { x: number; y: number }[] = []
  const stride = Math.max(1, Math.floor(points.length / count))
  for (let i = 0; i < points.length && result.length < count; i += stride) {
    result.push(points[i])
  }
  return result
}

function ParticleAnimation({ speed, onComplete }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animFrameRef = useRef<number>(0)
  const completedRef = useRef(false)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    const ctx = canvas.getContext('2d')!
    const dpr = window.devicePixelRatio || 1
    let width = 0
    let height = 0
    let particles: Particle[] = []
    let startTime = 0
    const duration = SPEED_DURATIONS[speed]
    const PARTICLE_COUNT = 400

    completedRef.current = false

    function resize() {
      const rect = container!.getBoundingClientRect()
      width = rect.width
      height = rect.height
      canvas!.width = width * dpr
      canvas!.height = height * dpr
      canvas!.style.width = `${width}px`
      canvas!.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    function initParticles() {
      const targets = textToPoints('Hi Mom', width, height, PARTICLE_COUNT)
      const centerX = width / 2
      const centerY = height / 2

      particles = targets.map((target, i) => {
        const angle = Math.random() * Math.PI * 2
        const dist = Math.random() * Math.max(width, height) * 0.5 + 50
        return {
          x: centerX + Math.cos(angle) * dist,
          y: centerY + Math.sin(angle) * dist,
          targetX: target.x,
          targetY: target.y,
          vx: 0,
          vy: 0,
          radius: 2 + Math.random() * 3,
          color: COLORS[i % COLORS.length],
          colorIndex: i % COLORS.length,
          angle: angle,
          orbitRadius: dist,
          orbitSpeed: (0.5 + Math.random() * 1.5) * (Math.random() < 0.5 ? 1 : -1),
        }
      })
    }

    function animate(timestamp: number) {
      if (!startTime) startTime = timestamp
      const elapsed = timestamp - startTime
      const progress = Math.min(elapsed / duration, 1)

      // Semi-transparent clear for motion trails
      ctx.fillStyle = 'rgba(15, 15, 26, 0.15)'
      ctx.fillRect(0, 0, width, height)

      const centerX = width / 2
      const centerY = height / 2

      for (const p of particles) {
        if (progress < 0.4) {
          // Phase 1: Pure swirl
          p.angle += p.orbitSpeed * 0.03
          const targetSwirl = centerX + Math.cos(p.angle) * p.orbitRadius
          const targetSwirlY = centerY + Math.sin(p.angle) * p.orbitRadius
          p.vx += (targetSwirl - p.x) * 0.02
          p.vy += (targetSwirlY - p.y) * 0.02
          // Slowly tighten orbit
          p.orbitRadius *= 0.999
        } else if (progress < 0.9) {
          // Phase 2: Transition — spring toward target, decaying swirl
          const transitionT = (progress - 0.4) / 0.5 // 0 to 1 within this phase
          const swirlStrength = 1 - transitionT
          const springStrength = 0.02 + transitionT * 0.08

          // Swirl force (decaying)
          p.angle += p.orbitSpeed * 0.03 * swirlStrength
          const swirlX = centerX + Math.cos(p.angle) * p.orbitRadius * swirlStrength
          const swirlY = centerY + Math.sin(p.angle) * p.orbitRadius * swirlStrength
          p.vx += (swirlX - p.x) * 0.01 * swirlStrength
          p.vy += (swirlY - p.y) * 0.01 * swirlStrength

          // Spring force toward target
          const dx = p.targetX - p.x
          const dy = p.targetY - p.y
          p.vx += dx * springStrength
          p.vy += dy * springStrength
        } else {
          // Phase 3: Settle — snap to target
          const settleT = (progress - 0.9) / 0.1 // 0 to 1 within this phase
          const snapStrength = 0.1 + settleT * 0.3
          const dx = p.targetX - p.x
          const dy = p.targetY - p.y
          p.vx += dx * snapStrength
          p.vy += dy * snapStrength
          p.vx *= 0.7
          p.vy *= 0.7
        }

        // Apply velocity with damping
        p.vx *= 0.9
        p.vy *= 0.9
        p.x += p.vx
        p.y += p.vy

        // Color cycling shimmer once text is forming
        if (progress > 0.85) {
          const shimmerRate = 0.002
          const shimmerOffset = p.colorIndex + elapsed * shimmerRate
          const ci = Math.floor(shimmerOffset) % COLORS.length
          p.color = COLORS[ci >= 0 ? ci : ci + COLORS.length]
        }

        // Draw particle with soft glow
        const gradient = ctx.createRadialGradient(
          p.x,
          p.y,
          0,
          p.x,
          p.y,
          p.radius * 2.5
        )
        gradient.addColorStop(0, p.color)
        gradient.addColorStop(0.4, p.color + 'cc')
        gradient.addColorStop(1, p.color + '00')

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius * 2.5, 0, Math.PI * 2)
        ctx.fillStyle = gradient
        ctx.fill()
      }

      if (progress >= 1 && !completedRef.current) {
        completedRef.current = true
        onComplete()
      }

      // Keep animating for shimmer even after complete
      animFrameRef.current = requestAnimationFrame(animate)
    }

    resize()
    // Clear canvas fully on first frame
    ctx.fillStyle = 'rgba(15, 15, 26, 1)'
    ctx.fillRect(0, 0, width, height)
    initParticles()
    animFrameRef.current = requestAnimationFrame(animate)

    const handleResize = () => {
      resize()
      // Re-sample targets for new dimensions
      const targets = textToPoints('Hi Mom', width, height, particles.length)
      particles.forEach((p, i) => {
        if (targets[i]) {
          p.targetX = targets[i].x
          p.targetY = targets[i].y
        }
      })
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animFrameRef.current)
      window.removeEventListener('resize', handleResize)
    }
  }, [speed, onComplete])

  return (
    <div
      ref={containerRef}
      style={{ position: 'absolute', inset: 0, overflow: 'hidden' }}
    >
      <canvas ref={canvasRef} style={{ display: 'block' }} />
    </div>
  )
}

export default ParticleAnimation
