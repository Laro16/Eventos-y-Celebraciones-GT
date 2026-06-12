import { useState, useEffect } from 'react'
import { useCart } from '../context/CartContext'

export default function Header({ categories, category, onSelectCategory }) {
  const { count, open } = useCart()
  const [scrolled, setScrolled] = useState(false)
  const navItems = ['Todos', ...categories]

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`sticky top-0 z-40 bg-white/85 backdrop-blur-md border-b border-marca-100 transition-shadow duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-5">
        <div className={`flex items-center justify-between gap-3 transition-all duration-300 ${scrolled ? 'py-1.5' : 'py-2'}`}>
          {/* Marca */}
          <a href="/" className="flex items-center gap-2 min-w-0 no-underline">
            <img
              src="/logo.png"
              alt="Eventos y Celebraciones GT"
              className={`rounded-full object-contain bg-white ring-2 ring-marca-100 flex-shrink-0 transition-all duration-300 ${scrolled ? 'h-8 w-8' : 'h-9 w-9'}`}
            />
            <div className="leading-tight min-w-0">
              <div className="font-display text-sm sm:text-base font-700 text-marca-700 truncate">
                Eventos y Celebraciones <span className="text-marca-500">GT</span>
              </div>
              <div className="hidden sm:block text-[10px] text-gray-400 tracking-wide">
                Todo para tu celebración
              </div>
            </div>
          </a>

          {/* Carrito */}
          <button
            onClick={open}
            className="relative hidden sm:inline-flex items-center gap-2 rounded-full bg-marca-500 hover:bg-marca-600 active:scale-95 text-white px-3.5 py-1.5 text-sm font-semibold shadow-suave transition-all"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17M17 17a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span className="hidden sm:inline">Carrito</span>
            {count > 0 && (
              <span key={count} className="pop absolute -top-1.5 -right-1.5 bg-white text-marca-600 text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow">
                {count}
              </span>
            )}
          </button>
        </div>

        {/* Navegación de categorías */}
        <nav className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1.5">
          {navItems.map((c) => {
            const active = category === c
            return (
              <button
                key={c}
                onClick={() => onSelectCategory(c)}
                className={`px-3 py-1 rounded-full text-[13px] font-medium flex-shrink-0 transition-colors ${
                  active ? 'bg-marca-500 text-white shadow-suave' : 'text-gray-600 hover:bg-marca-50'
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
