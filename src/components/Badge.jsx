// Etiquetas pequeñas reutilizables (Nuevo, Top, Agotado, descuento...)
const estilos = {
  nuevo: 'bg-gradient-to-r from-amber-400 to-amber-500 text-amber-950',
  top: 'bg-gradient-to-r from-marca-500 to-marca-600 text-white',
  promo: 'bg-marca-100 text-marca-700',
  agotado: 'bg-gray-800/90 text-white',
  descuento: 'bg-rose-600 text-white',
}

export default function Badge({ tipo = 'promo', children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide shadow-sm ${estilos[tipo] || estilos.promo} ${className}`}
    >
      {children}
    </span>
  )
}
