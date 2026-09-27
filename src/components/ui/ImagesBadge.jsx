import React from 'react'
import { motion } from 'framer-motion'

const ROTATIONS = [-8, 0, 8]

export function ImagesBadge({ text, icons = [] }) {
  return (
    <div className="inline-flex items-center gap-3 rounded-full border border-line bg-panel/70 py-1.5 pl-2 pr-4">
      <div className="flex -space-x-3">
        {icons.map((Icon, i) => (
          <motion.div
            key={i}
            initial={{ rotate: 0 }}
            whileHover={{ rotate: ROTATIONS[i % ROTATIONS.length] * 1.5, y: -3 }}
            style={{ rotate: ROTATIONS[i % ROTATIONS.length] }}
            className="flex h-7 w-7 items-center justify-center rounded-md border border-white/10 bg-ink text-white/80 shadow-md"
          >
            <Icon size={14} />
          </motion.div>
        ))}
      </div>
      <span className="text-sm text-white/70">{text}</span>
    </div>
  )
}
