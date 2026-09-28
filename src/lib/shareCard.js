// Draws a shareable "Skill DNA" card on an offscreen canvas and triggers a
// PNG download. Pure canvas 2D — no dependency on the 3D graph, so it's
// reliable even after WebGL context churn.

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export async function downloadSkillDNACard({ matchPercent, targetRole, topSkills, stickerSrc, caption }) {
  const W = 1080, H = 1350
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  // Background gradient
  const bg = ctx.createLinearGradient(0, 0, W, H)
  bg.addColorStop(0, '#0F0B1F')
  bg.addColorStop(1, '#08090C')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, W, H)

  // Soft glow accents
  const glow = ctx.createRadialGradient(W * 0.8, 120, 20, W * 0.8, 120, 500)
  glow.addColorStop(0, 'rgba(139,92,246,0.35)')
  glow.addColorStop(1, 'rgba(139,92,246,0)')
  ctx.fillStyle = glow
  ctx.fillRect(0, 0, W, H)

  // Label
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '600 28px Inter, sans-serif'
  ctx.fillText('SKILL DNA', 60, 100)

  // Target role
  ctx.fillStyle = '#ffffff'
  ctx.font = '700 56px "Space Grotesk", sans-serif'
  wrapText(ctx, targetRole || 'My Career Path', 60, 190, W - 120, 62)

  // Big match percent
  ctx.fillStyle = '#8B5CF6'
  ctx.font = '800 220px "Space Grotesk", sans-serif'
  ctx.fillText(`${matchPercent}%`, 60, 520)
  ctx.fillStyle = 'rgba(255,255,255,0.5)'
  ctx.font = '500 30px Inter, sans-serif'
  ctx.fillText('role match', 66, 565)

  // Sticker image, rounded, bottom-right of the percent block
  try {
    const img = await loadImage(stickerSrc)
    const size = 200
    const sx = W - size - 60
    const sy = 340
    ctx.save()
    roundRect(ctx, sx, sy, size, size, 24)
    ctx.clip()
    ctx.drawImage(img, sx, sy, size, size)
    ctx.restore()
    ctx.strokeStyle = 'rgba(255,255,255,0.15)'
    ctx.lineWidth = 2
    roundRect(ctx, sx, sy, size, size, 24)
    ctx.stroke()
  } catch (e) {
    // sticker failed to load — card still works without it
  }

  if (caption) {
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.font = 'italic 26px Inter, sans-serif'
    wrapText(ctx, `"${caption}"`, 60, 610, W - 120, 34)
  }

  // Divider
  ctx.strokeStyle = 'rgba(255,255,255,0.1)'
  ctx.beginPath()
  ctx.moveTo(60, 680)
  ctx.lineTo(W - 60, 680)
  ctx.stroke()

  // Top skills chips
  ctx.font = '600 24px Inter, sans-serif'
  let cx = 60, cy = 740
  const chipH = 52
  topSkills.slice(0, 8).forEach((skill) => {
    const textWidth = ctx.measureText(skill).width
    const chipW = textWidth + 48
    if (cx + chipW > W - 60) { cx = 60; cy += chipH + 16 }
    ctx.fillStyle = 'rgba(139,92,246,0.18)'
    roundRect(ctx, cx, cy, chipW, chipH, chipH / 2)
    ctx.fill()
    ctx.strokeStyle = 'rgba(139,92,246,0.4)'
    ctx.lineWidth = 1.5
    roundRect(ctx, cx, cy, chipW, chipH, chipH / 2)
    ctx.stroke()
    ctx.fillStyle = '#ffffff'
    ctx.fillText(skill, cx + 24, cy + 34)
    cx += chipW + 14
  })

  // Footer
  ctx.fillStyle = 'rgba(255,255,255,0.35)'
  ctx.font = '500 24px Inter, sans-serif'
  ctx.fillText('skilldna.app · Your career, decoded.', 60, H - 60)

  canvas.toBlob((blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'my-skill-dna.png'
    a.click()
    URL.revokeObjectURL(url)
  }, 'image/png')
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ')
  let line = ''
  let curY = y
  words.forEach((word) => {
    const testLine = line + word + ' '
    if (ctx.measureText(testLine).width > maxWidth && line !== '') {
      ctx.fillText(line, x, curY)
      line = word + ' '
      curY += lineHeight
    } else {
      line = testLine
    }
  })
  ctx.fillText(line, x, curY)
}
