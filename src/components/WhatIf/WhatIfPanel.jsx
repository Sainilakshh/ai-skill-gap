import React, { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatIfPanel({ suggestions, addedSkills, matchPercent, onAdd, onReset }) {
  const [combo, setCombo] = useState(null)
  const lastComboAt = useRef(0)

  useEffect(() => {
    if (addedSkills.length > 0 && addedSkills.length % 3 === 0 && addedSkills.length !== lastComboAt.current) {
      lastComboAt.current = addedSkills.length
      setCombo(matchPercent)
      const t = setTimeout(() => setCombo(null), 2600)
      return () => clearTimeout(t)
    }
  }, [addedSkills.length, matchPercent])

  return (
    <div className="mx-auto max-w-3xl px-6 py-10 relative">
      <h2 className="font-display text-2xl font-semibold text-white">WHAT IF?</h2>
      <p className="mt-1 text-sm text-white/50">
        Click a skill to instantly see how it changes your Skill DNA, gap, and roadmap — no waiting, no AI call.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const added = addedSkills.includes(s)
          return (
            <motion.button
              key={s}
              whileTap={{ scale: 0.94 }}
              onClick={() => !added && onAdd(s)}
              disabled={added}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                added
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                  : 'border-line bg-panel/50 text-white/70 hover:border-violet/60 hover:text-white'
              }`}
            >
              {added ? `✓ ${s}` : `+ ${s}`}
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {addedSkills.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <button onClick={onReset} className="text-xs text-white/40 hover:text-white/70 underline">
              Reset simulation
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {combo !== null && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="fixed top-8 left-1/2 -translate-x-1/2 z-50 rounded-2xl border border-amber/40 bg-gradient-to-r from-violet/90 to-amber/80 px-6 py-3 shadow-glow"
          >
            <p className="font-display text-lg font-bold text-white text-center">⚡ Power Combo!</p>
            <p className="text-xs text-white/90 text-center mt-0.5">3 skills stacked — match jumped to {combo}%</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
