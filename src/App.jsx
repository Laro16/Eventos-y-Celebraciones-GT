import { useState, useMemo } from 'react'
import { useCatalog } from './hooks/useCatalog'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Filters from './components/Filters'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import AdminApp from './components/admin/AdminApp'
import WelcomeModal from './components/WelcomeModal'
import { WHATSAPP } from './lib/config'

export default function App({ admin = false }) {
  if (admin) {
    return <AdminApp />
  }

  return (
    <CartProvider>
      <Catalogo />
    </CartProvider>
  )
}

function Catalogo() {
  const { products, loading, error, categories, getSubcategories } = useCatalog()

  const [category, setCategory] = useState('Todos')
  const [subCategory, setSubCategory] = useState('Todas')
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(null)

  const subcategories = useMemo(
    () => getSubcategories(category),
    [getSubcategories, category]
  )

  function handleCategory(c) {
    setCategory(c)
    setSubCategory('Todas')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return products
      .filter((p) => category === 'Todos' || p.category === category)
      .filter((p) => subCategory === 'Todas' || p.subcategory === subCategory)
      .filter((p) =>
        !q ||
        (p.name + ' ' + p.category + ' ' + p.subcategory + ' ' + p.description)
          .toLowerCase()
          .includes(q)
      )
  }, [products, category, subCategory, query])

  // Mostramos secciones especiales solo en la vista principal sin filtros.
  const vistaPrincipal = category === 'Todos' && subCategory === 'Todas' && !query.trim()
  const masVendidos = useMemo(() => products.filter((p) => p.isBestseller), [products])
  const promociones = useMemo(
    () => products.filter((p) => p.isOnPromo || p.hasDiscount),
    [products]
  )

  return (
    <div className="min-h-screen fondo-festivo flex flex-col">
      <WelcomeModal />
      <Header categories={categories} category={category} onSelectCategory={handleCategory} />

      {/* Hero */}
      <div className="max-w-6xl w-full mx-auto px-3 sm:px-5 pt-6">
        <div className="rounded-3xl bg-gradient-to-br from-marca-500 to-marca-700 text-white px-6 py-8 sm:px-10 sm:py-12 shadow-suave relative overflow-hidden">
          <div className="relative z-10">
            <h1 className="font-display text-2xl sm:text-4xl font-700 leading-tight max-w-xl">
              Hacemos memorables tus celebraciones ✨
            </h1>
            <p className="text-marca-100 mt-2 max-w-lg text-sm sm:text-base">
              Invitaciones digitales, decoración y todo lo que tu fiesta necesita. Pide fácil por WhatsApp.
            </p>
          </div>
          <div className="absolute -right-8 -bottom-10 w-48 h-48 rounded-full bg-white/10" />
          <div className="absolute right-20 -top-12 w-32 h-32 rounded-full bg-white/10" />
        </div>
      </div>

      <main className="max-w-6xl w-full mx-auto px-3 sm:px-5 py-6 flex-1">
        <div className="mb-6">
          <Filters
            query={query}
            onQueryChange={setQuery}
            subcategories={subcategories}
            subCategory={subCategory}
            onSubCategoryChange={setSubCategory}
          />
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-marca-200 border-t-marca-500" />
            <p className="text-sm text-gray-500">Cargando productos…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            No se pudieron cargar los productos: {error}
          </div>
        )}

        {!loading && !error && (
          <div className="aparecer">
            {vistaPrincipal && (
              <>
                <ProductGrid title="Más vendidos" icon="★" products={masVendidos} layout="row" onOpen={setSelected} />
                <ProductGrid title="Promociones" icon="🎁" products={promociones} layout="row" onOpen={setSelected} />
              </>
            )}

            <ProductGrid
              title={vistaPrincipal ? 'Todo el catálogo' : `Resultados (${filtered.length})`}
              products={filtered}
              onOpen={setSelected}
            />

            {filtered.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                No encontramos productos con esos filtros.
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
      <CartDrawer />
      <ProductModal product={selected} onClose={() => setSelected(null)} />

      {/* Botón flotante de WhatsApp */}
      <a
        href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hola, tengo una consulta sobre sus servicios para eventos.')}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white px-4 py-3 shadow-xl hover:scale-105 transition-transform"
        aria-label="WhatsApp"
      >
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.384 0 12.031c0 2.128.552 4.195 1.6 6.015L.231 24l6.096-1.599a11.957 11.957 0 005.704 1.442h.005c6.645 0 12.028-5.385 12.028-12.032C24.064 5.387 18.679 0 12.031 0zm0 21.849h-.003c-1.802 0-3.568-.484-5.116-1.401l-.367-.217-3.803.997.997-3.71-.238-.379A10.016 10.016 0 012.006 12.03c0-5.529 4.5-10.026 10.027-10.026 5.527 0 10.025 4.5 10.025 10.027 0 5.53-4.5 10.018-10.027 10.018z" /></svg>
        <span className="hidden sm:inline font-bold text-sm">Contáctanos</span>
      </a>
    </div>
  )
}
