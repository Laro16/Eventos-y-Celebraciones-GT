// Tarjeta "fantasma" que se muestra mientras cargan los productos.
export default function ProductSkeleton() {
  return (
    <div className="bg-white rounded-2xl border border-marca-100/70 overflow-hidden animate-pulse">
      <div className="aspect-[4/3] bg-marca-100/60" />
      <div className="p-3.5 space-y-2">
        <div className="h-4 bg-marca-100/70 rounded w-3/4" />
        <div className="h-3 bg-marca-100/50 rounded w-1/2" />
        <div className="h-5 bg-marca-100/70 rounded w-1/3 mt-2" />
        <div className="h-8 bg-marca-100/50 rounded mt-2" />
      </div>
    </div>
  )
}
