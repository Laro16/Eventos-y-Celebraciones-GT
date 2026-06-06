import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'

export default function Login() {
  const { signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError('')
    if (!email || !password) {
      setError('Escribe tu correo y contraseña.')
      return
    }
    setLoading(true)
    try {
      await signIn(email.trim(), password)
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Correo o contraseña incorrectos.'
          : err.message || 'No se pudo iniciar sesión.'
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen fondo-festivo flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-suave border border-marca-100 p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="Logo" className="h-14 w-14 mx-auto rounded-full ring-2 ring-marca-100 object-contain" />
          <h1 className="font-display text-xl font-700 text-marca-700 mt-3">Panel de administración</h1>
          <p className="text-xs text-gray-500">Eventos y Celebraciones GT</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm mb-4">
            {error}
          </div>
        )}

        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Correo"
            className="w-full rounded-lg border border-marca-100 px-3 py-2.5 text-sm outline-none focus:border-marca-300 focus:ring-2 focus:ring-marca-100"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
            placeholder="Contraseña"
            className="w-full rounded-lg border border-marca-100 px-3 py-2.5 text-sm outline-none focus:border-marca-300 focus:ring-2 focus:ring-marca-100"
          />
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full rounded-lg bg-gradient-to-r from-marca-500 to-marca-600 text-white py-2.5 font-bold text-sm hover:shadow-suave transition-all disabled:opacity-60"
          >
            {loading ? 'Entrando…' : 'Iniciar sesión'}
          </button>
        </div>

        <a href="/" className="block text-center text-xs text-gray-400 hover:text-marca-500 mt-5">
          ← Volver al sitio
        </a>
      </div>
    </div>
  )
}
