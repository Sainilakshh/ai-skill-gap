import React from 'react'

export function RoleSelector({ selectedRole, onSelectRole, hasCustomRequirements, ranking = [] }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="font-display text-2xl font-semibold text-white">Pick your target role</h2>
      <p className="mt-1 text-sm text-white/50">
        {hasCustomRequirements
          ? 'Using requirements extracted from the job description you provided.'
          : 'Ranked by how well your skills match each role — or go back and paste a job description to use custom requirements instead.'}
      </p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ranking.map(({ role, matchPercent }, idx) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className={`rounded-xl border px-4 py-3 text-sm text-left transition ${
              selectedRole === role
                ? 'border-violet bg-violet/10 text-white'
                : 'border-line bg-panel/40 text-white/60 hover:border-white/30'
            }`}
          >
            <span className="block">{role}</span>
            <span className="mt-2 flex items-center gap-2">
              <span className="h-1 flex-1 rounded-full bg-white/10 overflow-hidden">
                <span className="block h-full rounded-full bg-gradient-to-r from-violet to-cyan" style={{ width: `${matchPercent}%` }} />
              </span>
              <span className="text-[11px] text-white/50">{matchPercent}%</span>
            </span>
            {idx === 0 && <span className="mt-1.5 block text-[10px] text-cyan">Best fit</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
