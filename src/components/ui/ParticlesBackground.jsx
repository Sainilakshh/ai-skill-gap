import React, { useEffect, useRef } from 'react'

// Subtle connecting-dots starfield, mouse-reactive. Pure canvas, zero deps —
// keeps bundle small and avoids extra library risk under hackathon time pressure.
export function ParticlesBackground({ density = 70, color = '139,92,246' }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    const mouse = { x: null, y: null }

    function resize() {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      particles = Array.from({ length: density }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        r: Math.random() * 1.5 + 0.5,
      }))
    }

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        if (mouse.x) {
          const dx = p.x - mouse.x
          const dy = p.y - mouse.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 120) {
            p.x += dx / dist * 0.6
            p.y += dy / dist * 0.6
          }
        }

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${color},0.6)`
        ctx.fill()
      })

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x
          const dy = particles[i].y - particles[j].y
          const dist = Math.sqrt(dx * dx + dy * dy)
          if (dist < 110) {
            ctx.beginPath()
            ctx.moveTo(particles[i].x, particles[i].y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.strokeStyle = `rgba(${color},${0.12 * (1 - dist / 110)})`
            ctx.lineWidth = 1
            ctx.stroke()
          }
        }
      }
      animId = requestAnimationFrame(draw)
    }

    function onMouseMove(e) { mouse.x = e.clientX; mouse.y = e.clientY }
    function onMouseLeave() { mouse.x = null; mouse.y = null }

    resize()
    draw()
    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseleave', onMouseLeave)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [density, color])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10 opacity-70" />
}
