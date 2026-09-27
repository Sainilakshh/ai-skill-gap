import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { signIn, signUp } from '../../lib/history'
import { isSupabaseConfigured } from '../../lib/supabaseClient'

export function LoginModal({ onClose, onAuthed }) {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    setError('')
    setLoading(true)
    const fn = mode === 'signin' ? signIn : signUp
    const { data, error: err } = await fn(email, password)
    setLoading(false)
    if (err) { setError(err); return }
    if (data?.user) onAuthed(data.user)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-sm rounded-2xl border border-line bg-panel p-6"
      >
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">
            {mode === 'signin' ? 'Sign in' : 'Create account'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>

        {!isSupabaseConfigured && (
          <p className="mt-3 rounded-lg bg-amber/10 px-3 py-2 text-xs text-amber">
            Auth isn't configured yet — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable sign in.
          </p>
        )}

        <div className="mt-4 space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-line bg-ink/60 p-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-line bg-ink/60 p-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-violet/60"
          />
          {error && <p className="text-xs text-rose-400">{error}</p>}
          <button
            onClick={handleSubmit}
            disabled={loading || !isSupabaseConfigured}
            className="w-full rounded-lg bg-violet px-4 py-2.5 text-sm font-semibold text-white hover:bg-violet/90 transition disabled:opacity-50"
          >
            {loading ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </div>

        <button
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="mt-4 text-xs text-white/40 hover:text-white/70"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </motion.div>
    </div>
  )
}
