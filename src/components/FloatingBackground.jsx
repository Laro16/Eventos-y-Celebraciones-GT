import { useMemo } from 'react'

const FIGURAS = ['🎈', '🎉', '🎁', '🎂', '🍭', '✨', '🎊', '🧁', '⭐', '🎀']

// Capa decorativa de fondo: figuras de fiesta que suben lentamente.
// Va detrás del contenido (-z-10) y no captura toques (pointer-events-none).
export default function FloatingBackground({ cantidad = 12 }) {
  const items = useMemo(
    () =>
      Array.from({ length: cantidad }, () => ({
        emoji: FIGURAS[(Math.random() * FIGURAS.length) | 0],
        left: Math.random() * 100,
        size: 14 + Math.random() * 16,
        dur: 12 + Math.random() * 16,
        delay: Math.random() * 14,
      })),
    [cantidad]
  )

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none" aria-hidden="true">
      {items.map((it, i) => (
        <span
          key={i}
          style={{
            position: 'absolute',
            bottom: '-48px',
            left: it.left + '%',
            fontSize: it.size + 'px',
            animation: 'flotar ' + it.dur + 's linear ' + it.delay + 's infinite',
          }}
        >
          {it.emoji}
        </span>
      ))}
    </div>
  )
}
