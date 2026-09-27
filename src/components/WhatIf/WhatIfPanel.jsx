import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export function WhatIfPanel({ suggestions, addedSkills, onAdd, onReset }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="font-display text-2xl font-semibold text-white">WHAT IF?</h2>
      <p className="mt-1 text-sm text-white/50">
        Click a skill to instantly see how it changes your Skill DNA, gap, and roadmap — no waiting, no AI call.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {suggestions.map((s) => {
          const added = addedSkills.includes(s)
          return (
            <button
              key={s}
              onClick={() => !added && onAdd(s)}
              disabled={added}
              className={`rounded-full border px-4 py-2 text-sm transition ${
                added
                  ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-300'
                  : 'border-line bg-panel/50 text-white/70 hover:border-violet/60 hover:text-white'
              }`}
            >
              {added ? `✓ ${s}` : `+ ${s}`}
            </button>
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
    </div>
  )
}
