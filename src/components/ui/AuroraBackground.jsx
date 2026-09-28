import React, { useEffect, useRef } from 'react'

// Slow-morphing aurora / mesh-gradient background.
// Pure CSS blobs (radial gradients, no canvas, no blur filter) so it stays GPU-cheap.
// Keyframes live in index.css. Respects prefers-reduced-motion.
const BLOBS = [
  { rgb: '139,92,246', size: '56vmax', top: '-18%', left: '-12%', anim: 'aurora-a', dur: 38, opacity: 0.42 }, // violet
  { rgb: '34,211,238',  size: '46vmax', top: '4%',   left: '52%',  anim: 'aurora-b', dur: 46, opacity: 0.28 }, // cyan
  { rgb: '217,70,239',  size: '42vmax', top: '52%',  left: '10%',  anim: 'aurora-c', dur: 54, opacity: 0.26 }, // magenta
  { rgb: '99,102,241',  size: '38vmax', top: '58%',  left: '62%',  anim: 'aurora-a', dur: 62, opacity: 0.24, reverse: true }, // indigo
]

export function AuroraBackground() {
  const layerRef = useRef(null)

  // Very soft mouse parallax — the whole mesh drifts a few px opposite the cursor.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf
    function onMove(e) {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const x = (e.clientX / window.innerWidth - 0.5) * -28
        const y = (e.clientY / window.innerHeight - 0.5) * -28
        layer.style.transform = `translate3d(${x}px, ${y}px, 0)`
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('mousemove', onMove)
    }
  }, [])

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-ink">
      <div
        ref={layerRef}
        className="absolute -inset-[8%]"
        style={{ transition: 'transform 1.4s cubic-bezier(0.22, 1, 0.36, 1)', willChange: 'transform' }}
      >
        {BLOBS.map((b, i) => (
          <div
            key={i}
            className="aurora-blob absolute rounded-full"
            style={{
              width: b.size,
              height: b.size,
              top: b.top,
              left: b.left,
              opacity: b.opacity,
              background: `radial-gradient(circle at 50% 50%, rgba(${b.rgb},1) 0%, rgba(${b.rgb},0.55) 28%, rgba(${b.rgb},0) 68%)`,
              animation: `${b.anim} ${b.dur}s ease-in-out infinite ${b.reverse ? 'reverse' : 'normal'}`,
            }}
          />
        ))}
      </div>

      {/* Vignette keeps edges dark so text stays readable */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 40%, rgba(8,9,12,0) 0%, rgba(8,9,12,0.55) 70%, rgba(8,9,12,0.9) 100%)',
        }}
      />
    </div>
  )
}
