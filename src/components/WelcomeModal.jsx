import { useEffect, useState } from 'react'
import { lanzarConfetti } from '../lib/confetti'

// Se muestra una vez por sesión (al abrir/recargar el sitio). Para mostrarlo
// SIEMPRE, cambia sessionStorage por una variable; para mostrarlo una sola vez
// por navegador, usa localStorage.
export default function WelcomeModal() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (sessionStorage.getItem('ecgt_bienvenida')) return
    sessionStorage.setItem('ecgt_bienvenida', '1')
    setOpen(true)
    const t = setTimeout(() => lanzarConfetti(), 250)
    return () => clearTimeout(t)
  }, [])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-7 text-center aparecer"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src="/logo.png"
          alt="Logo"
          className="h-16 w-16 mx-auto rounded-full ring-2 ring-marca-100 object-contain"
        />
        <h2 className="font-display text-2xl font-700 text-marca-700 mt-3">
          ¡Bienvenido/a! 🎉
        </h2>
        <p className="text-sm text-gray-600 mt-2">
          En <strong>Eventos y Celebraciones GT</strong> tenemos todo para que tu fiesta sea
          inolvidable: invitaciones digitales, decoración y mucho más.
        </p>
        <button
          onClick={() => setOpen(false)}
          className="mt-5 w-full rounded-xl bg-gradient-to-r from-marca-500 to-marca-600 text-white py-3 font-bold hover:shadow-suave transition-all"
        >
          Ver catálogo
        </button>
      </div>
    </div>
  )
}
