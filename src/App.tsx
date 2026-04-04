import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import './App.css'

const messages = [
  'with love and harmony',
  'balance in all things',
  'radiance and joy',
  'light from within',
]

function App() {
  const [revealed, setRevealed] = useState(false)
  const [msgIndex, setMsgIndex] = useState(0)

  const handleClick = () => {
    if (!revealed) {
      setRevealed(true)
    } else {
      setMsgIndex((i) => (i + 1) % messages.length)
    }
  }

  return (
    <div className="app">
      <div className="glow-orb" />

      <AnimatePresence mode="wait">
        {!revealed ? (
          <motion.div
            key="landing"
            className="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="landing-title">Phira</h1>
            <p className="landing-sub">a small gift of light</p>
            <button className="reveal-btn" onClick={handleClick}>
              Open
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="greeting"
            className="greeting"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 80, damping: 14 }}
            onClick={handleClick}
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App
