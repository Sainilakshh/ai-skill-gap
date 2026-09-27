import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { computeLevel } from '../../lib/skillEngine'

export function EvidencePanel({ skill }) {
  return (
    <div className="rounded-2xl border border-line bg-panel/70 p-5 h-full min-h-[200px]">
      <AnimatePresence mode="wait">
        {!skill ? (
          <motion.p key="empty" className="text-sm text-white/40">
            Click a node in the Skill DNA graph to see the evidence behind it.
          </motion.p>
        ) : (
          <motion.div
            key={skill.name}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-display font-semibold text-white">{skill.name}</h3>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                  skill.type === 'explicit' ? 'bg-cyan/20 text-cyan' : 'bg-white/10 text-white/60'
                }`}
              >
                {skill.type === 'explicit' ? 'EXPLICIT' : 'INFERRED'}
              </span>
            </div>
            <p className="mt-1 text-xs text-white/40">{skill.category}</p>
            <p className="mt-3 text-sm text-violet font-medium">
              Estimated level: {computeLevel(skill.evidenceCount)}
            </p>
            <div className="mt-4 space-y-2">
              <p className="text-xs uppercase tracking-wide text-white/40">Evidence</p>
              {skill.evidence.map((e, i) => (
                <div key={i} className="rounded-lg bg-white/5 px-3 py-2 text-sm text-white/70">
                  {e}
                </div>
              ))}
            </div>
            {skill.type === 'inferred' && (
              <p className="mt-3 text-xs text-amber/80">
                This is an AI-inferred possibility, not a confirmed skill — treat it as a suggestion to validate.
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
