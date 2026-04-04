import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ParticleAnimation from './components/ParticleAnimation'
import GoldenRectAnimation from './components/GoldenRectAnimation'
import SpiralAnimation from './components/SpiralAnimation'
import './App.css'

type AnimationType = 'particles' | 'golden' | 'spiral'
type Speed = 'cinematic' | 'medium' | 'quick'

const messages = [
  'with love and harmony',
  'balance in all things',
  'radiance and joy',
  'light from within',
]

const animationOptions: { value: AnimationType; label: string; desc: string }[] = [
  { value: 'particles', label: 'Particles', desc: 'swirling vortex' },
  { value: 'golden', label: 'Golden Rect', desc: 'sacred geometry' },
  { value: 'spiral', label: 'Phi Spiral', desc: 'nautilus shell' },
]

const speedOptions: { value: Speed; label: string }[] = [
  { value: 'quick', label: 'Quick' },
  { value: 'medium', label: 'Medium' },
  { value: 'cinematic', label: 'Cinematic' },
]

function App() {
  const [screen, setScreen] = useState<'menu' | 'animating' | 'done'>('menu')
  const [animType, setAnimType] = useState<AnimationType>('particles')
  const [speed, setSpeed] = useState<Speed>('cinematic')
  const [msgIndex, setMsgIndex] = useState(0)

  const handleOpen = () => setScreen('animating')
  const handleComplete = () => setScreen('done')
  const handleBack = () => {
    setScreen('menu')
    setMsgIndex(0)
  }

  return (
    <div className="app">
      <div className="glow-orb" />

      <AnimatePresence mode="wait">
        {screen === 'menu' && (
          <motion.div
            key="menu"
            className="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="landing-title">Phira</h1>
            <p className="landing-sub">a small gift of light</p>

            <div className="selector-group">
              <span className="selector-label">Animation</span>
              <div className="pill-row">
                {animationOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`pill ${animType === opt.value ? 'pill-active' : ''}`}
                    onClick={() => setAnimType(opt.value)}
                  >
                    <span className="pill-name">{opt.label}</span>
                    <span className="pill-desc">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="selector-group">
              <span className="selector-label">Speed</span>
              <div className="pill-row">
                {speedOptions.map((opt) => (
                  <button
                    key={opt.value}
                    className={`pill pill-sm ${speed === opt.value ? 'pill-active' : ''}`}
                    onClick={() => setSpeed(opt.value)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="reveal-btn" onClick={handleOpen}>
              Open
            </button>
          </motion.div>
        )}

        {screen === 'animating' && (
          <motion.div
            key="animating"
            className="animation-container"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
          >
            {animType === 'particles' && (
              <ParticleAnimation speed={speed} onComplete={handleComplete} />
            )}
            {animType === 'golden' && (
              <GoldenRectAnimation speed={speed} onComplete={handleComplete} />
            )}
            {animType === 'spiral' && (
              <SpiralAnimation speed={speed} onComplete={handleComplete} />
            )}
          </motion.div>
        )}

        {screen === 'done' && (
          <motion.div
            key="done"
            className="greeting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14 }}
            onClick={() => setMsgIndex((i) => (i + 1) % messages.length)}
          >
            <div className="breathing">
              <h1 className="hero-text">Hi Mom</h1>
            </div>

            <AnimatePresence mode="wait">
              <motion.p
                key={msgIndex}
                className="subtitle"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {messages[msgIndex]}
              </motion.p>
            </AnimatePresence>

            <motion.span
              className="hint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
            >
              tap for more
            </motion.span>

            <button className="back-btn" onClick={handleBack}>
              ← Back
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
