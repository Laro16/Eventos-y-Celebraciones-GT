import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { WHATSAPP } from '../lib/config'

// Barra fija inferior, SOLO en celular (sm:hidden). Acciones al alcance del pulgar.
export default function BottomBar() {
  const { count, total, open } = useCart()

  return (
    <div
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-marca-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch gap-2 px-3 py-2">
        <a
          href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hola, tengo una consulta sobre sus servicios para eventos.')}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500 text-white py-2.5 font-bold text-sm active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.384 0 12.031c0 2.128.552 4.195 1.6 6.015L.231 24l6.096-1.599a11.957 11.957 0 005.704 1.442h.005c6.645 0 12.028-5.385 12.028-12.032C24.064 5.387 18.679 0 12.031 0z" /></svg>
          WhatsApp
        </a>

        <button
          onClick={open}
          className="relative flex-[1.4] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-marca-500 to-marca-600 text-white py-2.5 font-bold text-sm active:scale-95 transition-transform"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17M17 17a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {count > 0 ? 'Carrito · ' + formatMoney(total) : 'Carrito'}
          {count > 0 && (
            <span className="absolute -top-1.5 right-3 bg-white text-marca-600 text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
