import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useCatalog } from '../../hooks/useCatalog'
import { deleteProduct } from '../../lib/admin'
import { formatMoney } from '../../lib/format'
import Login from './Login'
import ProductForm from './ProductForm'
import MediaPlaceholder from '../MediaPlaceholder'

export default function AdminApp() {
  const { user, loading: authLoading, signOut } = useAuth()

  if (authLoading) {
    return (
      <div className="min-h-screen fondo-festivo flex items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-marca-200 border-t-marca-500" />
      </div>
    )
  }
  if (!user) return <Login />

  return <Dashboard user={user} signOut={signOut} />
}

function Dashboard({ user, signOut }) {
  // Trae TODOS los productos, incluso los ocultos.
  const { products, loading, error, categories, refresh } = useCatalog({ includeHidden: true })
  const [editing, setEditing] = useState(null) // producto en edición
  const [creating, setCreating] = useState(false)

  async function borrar(p) {
    if (!confirm(`¿Eliminar "${p.name}"? Esto borra también sus archivos.`)) return
    try {
      await deleteProduct(p)
      refresh()
    } catch (err) {
      alert('No se pudo eliminar: ' + (err.message || ''))
    }
  }

  const mostrarForm = creating || editing
  function cerrarForm() {
    setCreating(false)
    setEditing(null)
  }

  return (
    <div className="min-h-screen fondo-festivo pb-24">
      <header className="bg-white border-b border-marca-100 sticky top-0 z-30">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <img src="/logo.png" alt="Logo" className="h-9 w-9 rounded-full ring-2 ring-marca-100 object-contain flex-shrink-0" />
            <span className="font-display font-700 text-marca-700 truncate">Panel · Eventos GT</span>
          </div>
          <div className="flex items-center gap-2">
            <a href="/" className="text-xs text-gray-500 hover:text-marca-500">Ver sitio</a>
            <button onClick={signOut} className="text-sm font-semibold text-marca-600 border border-marca-200 rounded-lg px-3 py-1.5">Salir</button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <h1 className="font-display text-xl font-700 text-gray-800">
            Productos {!loading && <span className="text-gray-400 text-base">({products.length})</span>}
          </h1>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-marca-200 border-t-marca-500" />
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-3 text-sm">{error}</div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {products.length === 0 && (
              <div className="text-center text-gray-400 py-12 text-sm">
                Aún no hay productos. Toca "+ Nuevo" para crear el primero.
              </div>
            )}
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-marca-100 shadow-suave p-3 flex gap-3">
                <div className="w-16 h-16 rounded-lg overflow-hidden bg-marca-50 flex-shrink-0 flex items-center justify-center">
                  {p.cover ? (
                    <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <MediaPlaceholder compact />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-800 truncate">{p.name}</div>
                      <div className="text-xs text-gray-500">{p.category}{p.subcategory ? ` · ${p.subcategory}` : ''}</div>
                    </div>
                    <div className="text-sm font-bold text-marca-600 whitespace-nowrap">{formatMoney(p.finalPrice)}</div>
                  </div>
                  <div className="flex flex-wrap items-center gap-1 mt-1.5">
                    {!p.isVisible && <Chip color="gray">Oculto</Chip>}
                    {!p.isAvailable && <Chip color="red">Agotado</Chip>}
                    {p.isNew && <Chip color="amber">Nuevo</Chip>}
                    {p.isBestseller && <Chip color="marca">Top</Chip>}
                    {p.hasDiscount && <Chip color="rose">-{p.discountPercent}%</Chip>}
                    <span className="text-[11px] text-gray-400 ml-auto">{p.media.length} archivo(s)</span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => setEditing(p)} className="flex-1 text-sm font-semibold text-marca-600 bg-marca-50 rounded-lg py-1.5">Editar</button>
                    <button onClick={() => borrar(p)} className="text-sm font-semibold text-red-500 bg-red-50 rounded-lg py-1.5 px-3">Borrar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Botón flotante: nuevo producto */}
      <button
        onClick={() => setCreating(true)}
        className="fixed bottom-5 right-5 z-30 bg-gradient-to-r from-marca-500 to-marca-600 text-white rounded-full shadow-xl px-5 py-3.5 font-bold hover:scale-105 transition-transform"
      >
        + Nuevo
      </button>

      {mostrarForm && (
        <ProductForm
          product={editing}
          categories={categories}
          onClose={cerrarForm}
          onSaved={refresh}
        />
      )}
    </div>
  )
}

function Chip({ color, children }) {
  const colores = {
    gray: 'bg-gray-100 text-gray-600',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-700',
    marca: 'bg-marca-100 text-marca-700',
    rose: 'bg-rose-100 text-rose-600',
  }
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${colores[color]}`}>{children}</span>
}
