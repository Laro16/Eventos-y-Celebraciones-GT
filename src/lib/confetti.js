// Confeti propio (sin librerías). Acepta opciones para usarlo tanto en la
// bienvenida (ráfaga grande al centro) como en cada toque (ráfaga pequeña
// en el punto tocado).
export function lanzarConfetti(opts = {}) {
  const {
    x = window.innerWidth / 2,
    y = window.innerHeight * 0.5,
    count = 160,
    duracion = 2600,
    power = 11,
  } = opts

  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:100;width:100%;height:100%'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  const W = (canvas.width = window.innerWidth)
  const H = (canvas.height = window.innerHeight)

  const colores = ['#f43f8e', '#db2777', '#f59e0b', '#ffc7dd', '#a855f7', '#22c55e', '#ffffff']

  const parts = Array.from({ length: count }, () => {
    const a = Math.random() * Math.PI * 2
    const sp = 3 + Math.random() * power
    return {
      x, y,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 5,
      g: 0.16 + Math.random() * 0.12,
      size: 5 + Math.random() * 6,
      color: colores[(Math.random() * colores.length) | 0],
      rot: Math.random() * 6,
      vr: (Math.random() - 0.5) * 0.4,
    }
  })

  const inicio = performance.now()
  function frame(t) {
    const e = t - inicio
    ctx.clearRect(0, 0, W, H)
    const alpha = Math.max(0, 1 - e / duracion)
    for (const p of parts) {
      p.vy += p.g
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vr
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = alpha
      ctx.fillStyle = p.color
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
      ctx.restore()
    }
    if (e < duracion) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
