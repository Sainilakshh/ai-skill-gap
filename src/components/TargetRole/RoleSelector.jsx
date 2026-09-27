import React from 'react'
import { ROLE_NAMES } from '../../lib/skillEngine'

export function RoleSelector({ selectedRole, onSelectRole, hasCustomRequirements }) {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <h2 className="font-display text-2xl font-semibold text-white">Pick your target role</h2>
      <p className="mt-1 text-sm text-white/50">
        {hasCustomRequirements
          ? 'Using requirements extracted from the job description you provided.'
          : 'Choose a role — or go back and paste a job description to use custom requirements instead.'}
      </p>
      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROLE_NAMES.map((role) => (
          <button
            key={role}
            onClick={() => onSelectRole(role)}
            className={`rounded-xl border px-4 py-3 text-sm text-left transition ${
              selectedRole === role
                ? 'border-violet bg-violet/10 text-white'
                : 'border-line bg-panel/40 text-white/60 hover:border-white/30'
            }`}
          >
            {role}
          </button>
        ))}
      </div>
    </div>
  )
}
