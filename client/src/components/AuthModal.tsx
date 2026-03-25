import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'

interface AuthModalProps {
  onClose: () => void
}

export default function AuthModal({ onClose }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errorMsg, setErrorMsg] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, register } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg('')
    if (!username || !password) {
      setErrorMsg('Please fill in all fields.')
      return
    }

    setIsSubmitting(true)
    try {
      if (isLogin) {
        await login(username, password)
      } else {
        await register(username, password)
      }
      onClose() // Close on success
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="relative w-full max-w-sm overflow-hidden rounded-2xl shadow-xl border p-8"
          style={{ backgroundColor: 'var(--color-card)', borderColor: 'var(--color-border)' }}
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-black/5 transition-colors"
            onClick={onClose}
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-xl" style={{ color: 'var(--color-text-muted)' }}>
              close
            </span>
          </button>

          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4" style={{ backgroundColor: 'var(--color-primary-light)' }}>
              <span className="material-symbols-outlined text-2xl" style={{ color: 'var(--color-primary)' }}>
                {isLogin ? 'login' : 'person_add'}
              </span>
            </div>
            <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
              {isLogin ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
              {isLogin ? 'Log in to save your visual searches' : 'Sign up to build your search history'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {errorMsg && (
              <div className="px-3 py-2 text-sm font-semibold text-red-700 bg-red-100 rounded-lg">
                {errorMsg}
              </div>
            )}
            <div>
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm font-medium outline-none transition-colors focus:ring-2"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-background)',
                }}
                disabled={isSubmitting}
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border text-sm font-medium outline-none transition-colors focus:ring-2"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                  backgroundColor: 'var(--color-background)',
                }}
                disabled={isSubmitting}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 mt-2 rounded-lg font-bold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
              style={{ backgroundColor: 'var(--color-primary)' }}
            >
              {isSubmitting ? 'Please wait...' : isLogin ? 'Log In' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrorMsg('')
              }}
              className="font-bold hover:underline transition-all"
              style={{ color: 'var(--color-primary)' }}
            >
              {isLogin ? 'Create one' : 'Log in here'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
