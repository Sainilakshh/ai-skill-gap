import React, { useEffect, useState } from 'react'
import { listAnalyses } from '../../lib/history'

export function HistoryList({ user, onReload, onClose }) {
  const [items, setItems] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    listAnalyses(user.id).then((res) => {
      setItems(res.items)
      setError(res.ok ? null : res.error)
      setLoading(false)
    })
  }, [user.id])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-panel p-6 max-h-[80vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold text-white">My analyses</h3>
          <button onClick={onClose} className="text-white/40 hover:text-white">✕</button>
        </div>

        {loading && <p className="mt-4 text-sm text-white/40">Loading…</p>}

        {!loading && error && (
          <div className="mt-4 rounded-lg bg-rose-400/10 border border-rose-400/30 px-3 py-2.5">
            <p className="text-xs text-rose-300">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <p className="mt-4 text-sm text-white/40">No saved analyses yet — run one and it'll show up here.</p>
        )}

        <div className="mt-4 space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onReload(item)}
              className="w-full rounded-xl border border-line bg-ink/40 p-3 text-left hover:border-violet/50 transition"
            >
              <p className="text-sm font-medium text-white">{item.target_role}</p>
              <p className="mt-0.5 text-xs text-white/40">
                {new Date(item.created_at).toLocaleString()} · {item.input_summary}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
