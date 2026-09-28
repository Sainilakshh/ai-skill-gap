import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTier, getCaption } from '../../data/stickerTiers'

export function MatchSticker({ matchPercent, size = 88 }) {
  const tier = getTier(matchPercent)
  const caption = getCaption(matchPercent)

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={tier.min}
        initial={{ opacity: 0, scale: 0.4, rotate: -12 }}
        animate={{ opacity: 1, scale: 1, rotate: -4 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        whileHover={{ rotate: 4, scale: 1.05 }}
        className="flex flex-col items-center gap-2"
      >
        <img
          src={tier.img}
          alt={caption}
          style={{ width: size, height: size }}
          className="rounded-xl object-cover border-2 border-white/10 shadow-glow"
        />
        <p className="text-xs font-medium text-white/70 text-center max-w-[140px]">{caption}</p>
      </motion.div>
    </AnimatePresence>
  )
}
