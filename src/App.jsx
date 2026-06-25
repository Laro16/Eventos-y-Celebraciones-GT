import { useState, useMemo, useCallback } from 'react'
import { useCatalog } from './hooks/useCatalog'
import { CartProvider } from './context/CartContext'
import Header from './components/Header'
import Filters from './components/Filters'
import ProductGrid from './components/ProductGrid'
import ProductModal from './components/ProductModal'
import CartDrawer from './components/CartDrawer'
import Footer from './components/Footer'
import FloatingBackground from './components/FloatingBackground'
import ProductSkeleton from './components/ProductSkeleton'
import BottomBar from './components/BottomBar'
import AdminApp from './components/admin/AdminApp'
import WelcomeModal from './components/WelcomeModal'
import WhatsAppIcon from './components/WhatsAppIcon'
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

  // Cierre estable del modal (evita re-suscribir efectos del modal en cada render).
  const cerrarModal = useCallback(() => setSelected(null), [])

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
    <div className="min-h-screen fondo-festivo flex flex-col pb-20 sm:pb-0">
      <FloatingBackground />
      <WelcomeModal />
      <Header categories={categories} category={category} onSelectCategory={handleCategory} />

      <main className="max-w-6xl w-full mx-auto px-3 sm:px-5 py-3 sm:py-5 flex-1">
        <div className="mb-3 sm:mb-4 pt-1">
          <Filters
            query={query}
            onQueryChange={setQuery}
            subcategories={subcategories}
            subCategory={subCategory}
            onSubCategoryChange={setSubCategory}
          />
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
            {Array.from({ length: 10 }).map((_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            No se pudieron cargar los productos: {error}
          </div>
        )}

        {!loading && !error && (
          <div>
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
      <ProductModal product={selected} onClose={cerrarModal} />
      <BottomBar />

      {/* Botón flotante de WhatsApp (solo escritorio; en celular está en la barra inferior) */}
      <a
        href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hola, tengo una consulta sobre sus servicios para eventos.')}
        target="_blank"
        rel="noreferrer"
        className="hidden sm:inline-flex fixed bottom-5 right-5 z-40 items-center gap-2 rounded-full bg-[#25D366] hover:bg-[#1ebe5b] text-white pl-3 pr-4 py-2.5 shadow-lg shadow-green-600/20 ring-1 ring-black/5 hover:scale-105 transition-transform"
        aria-label="Contáctanos por WhatsApp"
      >
        <WhatsAppIcon className="w-5 h-5" />
        <span className="font-semibold text-sm">Contáctanos</span>
      </a>
    </div>
  )
}
