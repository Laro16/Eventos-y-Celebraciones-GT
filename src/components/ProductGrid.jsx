import ProductCard from './ProductCard'

// Grilla de productos con un título de sección opcional.
// layout: 'grid' (cuadrícula normal) o 'row' (carrusel horizontal para destacados)
export default function ProductGrid({ title, icon, products, onOpen, layout = 'grid' }) {
  if (!products || products.length === 0) return null

  if (layout === 'row') {
    return (
      <section className="mb-5 sm:mb-6">
        {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
          {products.map((p, i) => (
            <div key={p.id} className="w-36 sm:w-44 flex-shrink-0">
              <ProductCard product={p} onOpen={onOpen} index={i} />
            </div>
          ))}
        </div>
      </section>
    )
  }

  return (
    <section className="mb-5 sm:mb-6">
      {title && <SectionTitle icon={icon}>{title}</SectionTitle>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5 sm:gap-3">
        {products.map((p, i) => (
          <ProductCard key={p.id} product={p} onOpen={onOpen} index={i} />
        ))}
      </div>
    </section>
  )
}

function SectionTitle({ icon, children }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <h2 className="font-display text-base sm:text-xl font-bold text-marca-700 flex items-center gap-2 whitespace-nowrap">
        {icon && <span>{icon}</span>}
        {children}
      </h2>
      <div className="flex-1 h-px bg-gradient-to-r from-marca-200 to-transparent" />
    </div>
  )
}
