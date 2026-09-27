import React, { useState } from 'react'
import { motion } from 'framer-motion'

export function FloatingDock({ items, activeId, onSelect }) {
  const [hovered, setHovered] = useState(null)

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <div className="flex items-end gap-2 rounded-2xl border border-line bg-panel/80 backdrop-blur-xl px-3 py-2.5 shadow-2xl">
        {items.map((item) => {
          const isActive = item.id === activeId
          const isHovered = item.id === hovered
          const scale = isHovered ? 1.25 : isActive ? 1.1 : 1
          return (
            <motion.button
              key={item.id}
              onMouseEnter={() => setHovered(item.id)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onSelect(item.id)}
              animate={{ scale, y: isHovered ? -6 : 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              className={`relative flex h-11 w-11 items-center justify-center rounded-xl ${
                isActive ? 'bg-violet/20 text-violet' : 'text-white/60 hover:text-white'
              }`}
              title={item.label}
            >
              {item.icon}
              {isHovered && (
                <span className="absolute -top-8 whitespace-nowrap rounded-md bg-black/90 px-2 py-1 text-[11px] font-medium text-white">
                  {item.label}
                </span>
              )}
            </motion.button>
          )
        })}
      </div>
    </div>
  )
}
