// Confeti propio (sin librerías). Crea un canvas temporal, lanza una ráfaga
// desde el centro y se limpia solo al terminar.
export function lanzarConfetti(duracion = 2600) {
  const canvas = document.createElement('canvas')
  canvas.style.cssText =
    'position:fixed;inset:0;pointer-events:none;z-index:100;width:100%;height:100%'
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')

  let W = (canvas.width = window.innerWidth)
  let H = (canvas.height = window.innerHeight)

  const colores = ['#f43f8e', '#db2777', '#f59e0b', '#ffc7dd', '#a855f7', '#22c55e', '#ffffff']

  const parts = Array.from({ length: 160 }, () => {
    const a = Math.random() * Math.PI * 2
    const sp = 4 + Math.random() * 10
    return {
      x: W / 2,
      y: H * 0.5,
      vx: Math.cos(a) * sp,
      vy: Math.sin(a) * sp - 6, // sesgo hacia arriba
      g: 0.18 + Math.random() * 0.1,
      size: 5 + Math.random() * 7,
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
