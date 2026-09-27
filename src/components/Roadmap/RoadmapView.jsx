import React from 'react'
import { CardContainer, CardBody, CardItem } from '../ui/Card3D'

const PRIORITY_COLOR = { High: 'text-rose-400 bg-rose-400/10', Medium: 'text-amber bg-amber/10' }

export function RoadmapView({ roadmap }) {
  if (roadmap.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-white">You're already a strong match</h2>
        <p className="mt-2 text-sm text-white/50">No significant gaps for this role — nice work.</p>
      </div>
    )
  }
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="font-display text-2xl font-semibold text-white">Your roadmap</h2>
      <p className="mt-1 text-sm text-white/50">Ordered by priority, based on your current gaps.</p>

      <div className="mt-6 space-y-3">
        {roadmap.map((item, i) => (
          <CardContainer key={item.skill}>
            <CardBody className="rounded-xl border border-line bg-panel/50 p-4 flex items-start gap-4">
              <CardItem translateZ={20} className="text-2xl font-display text-white/20 w-8">
                {i + 1}
              </CardItem>
              <CardItem translateZ={30} className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white">{item.skill}</h3>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLOR[item.priority]}`}>
                    {item.priority}
                  </span>
                </div>
                <p className="mt-1 text-xs text-cyan">{item.weeks}</p>
                <p className="mt-1.5 text-sm text-white/60">{item.action}</p>
              </CardItem>
            </CardBody>
          </CardContainer>
        ))}
      </div>
    </div>
  )
}
