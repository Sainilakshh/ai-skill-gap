import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CardContainer, CardBody, CardItem } from '../ui/Card3D'
import { MatchSticker } from './MatchSticker'
import { getTier, getCaption } from '../../data/stickerTiers'
import { downloadSkillDNACard } from '../../lib/shareCard'

const LEVEL_WIDTH = { None: '0%', Beginner: '33%', Intermediate: '66%', Advanced: '100%' }
const STATUS_LABEL = { met: 'On track', partial: 'Partial', missing: 'Missing' }
const STATUS_COLOR = { met: 'text-emerald-400', partial: 'text-amber', missing: 'text-rose-400' }

export function GapReport({ matchPercent, gaps, targetRole, topSkills = [] }) {
  const [sharing, setSharing] = useState(false)

  async function handleShare() {
    setSharing(true)
    const tier = getTier(matchPercent)
    try {
      await downloadSkillDNACard({
        matchPercent,
        targetRole,
        topSkills,
        stickerSrc: tier.img,
        caption: getCaption(matchPercent),
      })
    } finally {
      setSharing(false)
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-white">Skill gap report</h2>
          <p className="mt-1 text-sm text-white/50">Explainable, skill-by-skill — not a mystery score.</p>
        </div>
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-3xl font-display font-semibold text-violet">{matchPercent}%</p>
            <p className="text-xs text-white/40">role match</p>
          </div>
          <MatchSticker matchPercent={matchPercent} />
        </div>
      </div>

      <div className="mt-4 flex justify-end">
        <button
          onClick={handleShare}
          disabled={sharing}
          className="rounded-lg border border-violet/40 bg-violet/10 px-4 py-2 text-xs font-medium text-violet hover:bg-violet/20 transition disabled:opacity-50"
        >
          {sharing ? 'Generating…' : '📤 Share my Skill DNA'}
        </button>
      </div>

      <div className="mt-6 grid sm:grid-cols-2 gap-4">
        {gaps.map((g, i) => (
          <motion.div
            key={g.skill}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
          >
            <CardContainer>
              <CardBody className="rounded-xl border border-line bg-panel/50 p-4">
                <CardItem translateZ={30} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-white">{g.skill}</span>
                  <span className={`text-xs font-medium ${STATUS_COLOR[g.status]}`}>
                    {STATUS_LABEL[g.status]}
                  </span>
                </CardItem>
                <CardItem translateZ={20} className="mt-3 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] text-white/40">
                    <span>You: {g.currentLevel}</span>
                    <span>Needed: {g.requiredLevel}</span>
                  </div>
                  <div className="relative h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="absolute inset-y-0 left-0 rounded-full bg-white/25"
                      style={{ width: LEVEL_WIDTH[g.requiredLevel] }}
                    />
                    <motion.div
                      className="absolute inset-y-0 left-0 rounded-full bg-violet"
                      initial={{ width: '0%' }}
                      animate={{ width: LEVEL_WIDTH[g.currentLevel] }}
                      transition={{ duration: 0.6, delay: 0.15 + i * 0.05, ease: 'easeOut' }}
                    />
                  </div>
                </CardItem>
              </CardBody>
            </CardContainer>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
