import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CardContainer, CardBody, CardItem } from '../ui/Card3D'

const PRIORITY_COLOR = { High: 'text-rose-400 bg-rose-400/10', Medium: 'text-amber bg-amber/10' }

function ChainLink(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" {...props}>
      <path d="M10 13a5 5 0 0 0 7.07 0l1.93-1.93a5 5 0 0 0-7.07-7.07L10.5 5.5" />
      <path d="M14 11a5 5 0 0 0-7.07 0l-1.93 1.93a5 5 0 0 0 7.07 7.07L13.5 18.5" />
    </svg>
  )
}

export function RoadmapView({ roadmap }) {
  const [done, setDone] = useState({})
  const [hoveredGap, setHoveredGap] = useState(null)

  if (roadmap.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-white">You're already a strong match</h2>
        <p className="mt-2 text-sm text-white/50">No significant gaps for this role — nice work.</p>
      </div>
    )
  }

  const doneCount = Object.values(done).filter(Boolean).length
  const xpPercent = Math.round((doneCount / roadmap.length) * 100)

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">Your roadmap</h2>
          <p className="mt-1 text-sm text-white/50">Ordered by priority, based on your current gaps.</p>
        </div>
        <p className="text-xs text-white/40">{doneCount}/{roadmap.length} · Level {doneCount + 1}</p>
      </div>

      <div className="mt-4 h-2.5 rounded-full bg-white/10 overflow-hidden">
        <motion.div
          className="h-full rounded-full bg-gradient-to-r from-violet to-cyan"
          initial={{ width: '0%' }}
          animate={{ width: `${xpPercent}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>
      <p className="mt-1.5 text-[11px] text-white/40">
        {xpPercent === 100 ? 'Roadmap complete — Level Up! 🎉' : `Complete this roadmap → Level Up`}
      </p>

      <div className="mt-6 space-y-1">
        {roadmap.map((item, i) => (
          <div key={item.skill}>
            <motion.div
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, delay: i * 0.08, ease: 'easeOut' }}
              onMouseEnter={() => setHoveredGap(i)}
              onMouseLeave={() => setHoveredGap(null)}
            >
              <CardContainer>
                <CardBody className="rounded-xl border border-line bg-panel/50 p-4 flex items-start gap-4">
                  <button
                    onClick={() => setDone((d) => ({ ...d, [item.skill]: !d[item.skill] }))}
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs transition ${
                      done[item.skill]
                        ? 'border-emerald-400 bg-emerald-400/20 text-emerald-300'
                        : 'border-white/20 text-transparent hover:border-white/40'
                    }`}
                  >
                    ✓
                  </button>
                  <CardItem translateZ={20} className="text-2xl font-display text-white/20 w-6">
                    {i + 1}
                  </CardItem>
                  <CardItem translateZ={30} className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className={`text-sm font-semibold ${done[item.skill] ? 'text-white/40 line-through' : 'text-white'}`}>
                        {item.skill}
                      </h3>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[item.priority]}`}>
                        {item.priority}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-cyan">{item.weeks}</p>
                    <p className="mt-1.5 text-sm text-white/60">{item.action}</p>
                  </CardItem>
                </CardBody>
              </CardContainer>
            </motion.div>

            {i < roadmap.length - 1 && (
              <div className="flex justify-center py-0.5">
                <motion.div
                  animate={{
                    color: hoveredGap === i || hoveredGap === i + 1 ? '#8B5CF6' : 'rgba(255,255,255,0.15)',
                    scale: hoveredGap === i || hoveredGap === i + 1 ? 1.15 : 1,
                  }}
                >
                  <ChainLink className="h-4 w-4" />
                </motion.div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
