import tier90 from '../assets/stickers/tier-90-hired.png'
import tier80 from '../assets/stickers/tier-80-strong-match.png'
import tier70 from '../assets/stickers/tier-70-on-track.png'
import tier50 from '../assets/stickers/tier-50-needs-water.png'
import tierBelow50 from '../assets/stickers/tier-below-50-how-hard.png'

export const TIERS = [
  { min: 90, img: tier90, captions: ['Basically hired already'] },
  { min: 80, img: tier80, captions: ['Strong Match!'] },
  { min: 70, img: tier70, captions: ['Solidly on track'] },
  { min: 50, img: tier50, captions: ['Freshly planted, needs water', 'Still cooking 👨\u200d🍳'] },
  { min: 0, img: tierBelow50, captions: ["Bro said 'how hard can it be' 💀"] },
]

export function getTier(percent) {
  return TIERS.find((t) => percent >= t.min) || TIERS[TIERS.length - 1]
}

export function getCaption(percent) {
  const tier = getTier(percent)
  return tier.captions[percent % tier.captions.length]
}
