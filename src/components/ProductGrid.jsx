import ProductCard from './ProductCard'

// Grilla de productos con un título de sección opcional.
// layout: 'grid' (cuadrícula normal) o 'row' (carrusel horizontal para destacados)
export default function ProductGrid({ title, icon, products, onOpen, layout = 'grid' }) {
  if (!products || products.length === 0) return null

  if (layout === 'row') {
    return (
      <section className="mb-8">
        {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
        <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {products.map((p) => (
            <div key={p.id} className="w-44 sm:w-56 flex-shrink-0">
              <ProductCard product={p} onOpen={onOpen} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-8">
      {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} />
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ icon, children }) {
  return (
    <h2 className="font-display text-xl sm:text-2xl font-700 text-marca-700 mb-3 flex items-center gap-2">
      {icon && <span>{icon}</span>}
      {children}
    </h2>
  )
}
