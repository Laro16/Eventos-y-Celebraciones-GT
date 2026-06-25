import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { WHATSAPP } from '../lib/config'
import WhatsAppIcon from './WhatsAppIcon'

// Barra fija inferior, SOLO en celular (sm:hidden). Acciones al alcance del pulgar.
export default function BottomBar() {
  const { count, total, open } = useCart()

  return (
    <div
      className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-marca-100"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-stretch gap-2 px-3 py-1.5">
        <a
          href={'https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent('Hola, tengo una consulta sobre sus servicios para eventos.')}
          target="_blank"
          rel="noreferrer"
          className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-green-500 text-white py-2 font-bold text-[13px] active:scale-95 transition-transform"
        >
          <WhatsAppIcon className="w-4 h-4" />
          WhatsApp
        </a>

        <button
          onClick={open}
          className="relative flex-[1.4] flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-marca-500 to-marca-600 text-white py-2 font-bold text-[13px] active:scale-95 transition-transform"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293A1 1 0 005.414 17H17M17 17a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {count > 0 ? 'Carrito · ' + formatMoney(total) : 'Carrito'}
          {count > 0 && (
            <span key={count} className="pop absolute -top-1.5 right-3 bg-white text-marca-600 text-[11px] font-bold rounded-full min-w-[20px] h-5 px-1 flex items-center justify-center shadow">
              {count}
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
