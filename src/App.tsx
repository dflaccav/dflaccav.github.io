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
  const [msgIndex, setMsgIndex] = useState(0)

  const cycleMessage = () => {
    setMsgIndex((i) => (i + 1) % messages.length)
  }

  return (
    <div className="app" onClick={cycleMessage}>
      <div className="glow-orb" />

      <motion.div
        className="breathing"
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15, delay: 0.2 }}
      >
        <h1 className="hero-text">Hi Mom</h1>
      </motion.div>

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
        transition={{ delay: 3, duration: 1 }}
      >
        click anywhere
      </motion.span>
    </div>
  )
}

export default App
