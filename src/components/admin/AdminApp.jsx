import { useAuth } from '../../context/AuthContext'
import Login from './Login'

// Protege /admin: si no hay sesión muestra el login; si la hay, el panel.
// El panel real (gestión de productos) se construye en el Paso 7.
export default function AdminApp() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen fondo-festivo flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-marca-200 border-t-marca-500" />
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <div className="min-h-screen fondo-festivo">
      <header className="bg-white border-b border-marca-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-full ring-2 ring-marca-100 object-contain" />
            <span className="font-display font-700 text-marca-700">Panel · Eventos GT</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline text-xs text-gray-500">{user.email}</span>
            <a href="/" className="text-xs text-gray-500 hover:text-marca-500">Ver sitio</a>
            <button
              onClick={signOut}
              className="text-sm font-semibold text-marca-600 hover:text-marca-700 border border-marca-200 rounded-lg px-3 py-1.5"
            >
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-suave border border-marca-100 p-8 text-center">
          <h1 className="font-display text-2xl font-700 text-marca-700">¡Sesión iniciada! ✓</h1>
          <p className="text-gray-500 mt-2 text-sm">
            La gestión de productos (crear, editar, subir fotos/videos/pdf, descuentos y más vendidos)
            llega en el siguiente paso.
          </p>
        </div>
      </main>
    </div>
  )
}
