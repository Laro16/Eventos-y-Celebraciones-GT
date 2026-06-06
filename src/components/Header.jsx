import { useCart } from '../context/CartContext'

export default function Header({ categories, category, onSelectCategory }) {
  const { count, open } = useCart()
  const navItems = ['Todos', ...categories]

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-marca-100">
      <div className="max-w-6xl mx-auto px-3 sm:px-5">
        <div className="flex items-center justify-between gap-3 py-3">
          {/* Marca */}
          <a href="/" className="flex items-center gap-3 min-w-0 no-underline">
            <img
              src="/logo.png"
              alt="Eventos y Celebraciones GT"
              className="h-11 w-11 rounded-full object-contain bg-white ring-2 ring-marca-100 flex-shrink-0"
            />
            <div className="hidden sm:block leading-tight">
              <div className="font-display text-lg font-700 text-marca-700">
                Eventos y Celebraciones <span className="text-marca-500">GT</span>
              </div>
              <div className="text-[11px] text-gray-500 tracking-wide">
                Todo para tu celebración
              </div>
            </div>
          </a>

          {/* Carrito */}
          <button
            onClick={open}
            className="relative inline-flex items-center gap-2 rounded-full bg-marca-500 hover:bg-marca-600 text-white px-4 py-2 text-sm font-semibold shadow-suave transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17M17 17a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-white text-marca-600 text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Navegación de categorías */}
        <nav className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-hide pb-2">
          {navItems.map((c) => {
            const active = category === c
            return (
              <button
                key={c}
                onClick={() => onSelectCategory(c)}
                className={`px-3.5 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-colors ${
                  active
                    ? 'bg-marca-500 text-white shadow-suave'
                    : 'text-gray-600 hover:bg-marca-50'
                }`}
              >
                {c}
              </button>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
