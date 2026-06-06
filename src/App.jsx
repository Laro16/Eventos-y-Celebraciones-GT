import { useCatalog } from './hooks/useCatalog'
import { formatMoney } from './lib/format'

// Vista de verificación del Paso 3.
// Confirma que la capa de datos (useCatalog) trae productos + media + precios.
// El diseño real del catálogo llega en el Paso 4.
export default function App({ admin = false }) {
  const { products, loading, error, categories } = useCatalog()

  return (
    <div className="min-h-screen bg-marca-50 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-extrabold text-marca-600">
            Eventos y Celebraciones GT
          </h1>
          <p className="text-gray-500">
            {admin ? 'Panel de administración' : 'Catálogo'} · verificación de datos
          </p>
        </header>

        {loading && (
          <div className="text-center text-gray-500 py-10">Cargando productos…</div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
            Error: {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <div className="mb-4 text-sm text-gray-600">
              <strong>{products.length}</strong> productos ·{' '}
              <strong>{categories.length}</strong> categorías:{' '}
              {categories.join(', ') || '—'}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-white rounded-xl shadow-sm border border-marca-100 overflow-hidden"
                >
                  <div className="h-40 bg-marca-50 flex items-center justify-center">
                    {p.cover ? (
                      <img
                        src={p.cover}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-400 text-sm">Sin imagen</span>
                    )}
                  </div>
                  <div className="p-3">
                    <div className="font-bold text-gray-800">{p.name}</div>
                    <div className="text-xs text-gray-500">
                      {p.category}
                      {p.subcategory ? ` · ${p.subcategory}` : ''}
                    </div>
                    <div className="mt-2">
                      {p.hasDiscount ? (
                        <span>
                          <span className="line-through text-gray-400 text-sm mr-2">
                            {formatMoney(p.price)}
                          </span>
                          <span className="font-extrabold text-marca-600">
                            {formatMoney(p.finalPrice)}
                          </span>
                          <span className="ml-2 text-xs bg-marca-100 text-marca-700 px-1.5 py-0.5 rounded">
                            -{p.discountPercent}%
                          </span>
                        </span>
                      ) : (
                        <span className="font-extrabold text-gray-900">
                          {formatMoney(p.price)}
                        </span>
                      )}
                    </div>
                    {/* Resumen de media disponible */}
                    <div className="mt-2 flex gap-2 text-[11px] text-gray-500">
                      <span>🖼️ {p.images.length}</span>
                      <span>🎬 {p.videos.length}</span>
                      <span>📄 {p.pdfs.length}</span>
                      {!p.isAvailable && (
                        <span className="text-red-500 font-semibold">Agotado</span>
                      )}
                      {p.isNew && <span className="text-amber-600 font-semibold">Nuevo</span>}
                      {p.isBestseller && (
                        <span className="text-marca-600 font-semibold">Top</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
