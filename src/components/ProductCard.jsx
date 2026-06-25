import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { linkWhatsAppProducto } from '../lib/whatsapp'
import Badge from './Badge'
import MediaPlaceholder from './MediaPlaceholder'
import WhatsAppIcon from './WhatsAppIcon'

export default function ProductCard({ product, onOpen, index = 0 }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const p = product

  function agregar() {
    add(p, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1300)
  }

  const agotado = !p.isAvailable
  const tieneVideo = p.videos.length > 0
  const tienePdf = p.pdfs.length > 0

  return (
    <article
      className="card-in group bg-white rounded-xl shadow-suave border border-marca-100/70 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: (index % 8) * 0.05 + 's' }}
    >
      {/* Imagen / portada */}
      <button
        type="button"
        onClick={() => onOpen && onOpen(p)}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-marca-50"
      >
        {p.cover ? (
          <img
            src={p.cover}
            alt={p.name}
            loading="lazy"
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
              agotado ? 'grayscale opacity-70' : ''
            }`}
          />
        ) : (
          <MediaPlaceholder />
        )}

        {/* Categoría */}
        <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-marca-600 shadow-sm">
          {p.category}
        </span>

        {/* Etiquetas superiores derecha */}
        <div className="absolute right-1.5 top-1.5 flex flex-col items-end gap-1">
          {p.hasDiscount && <Badge tipo="descuento">-{p.discountPercent}%</Badge>}
          {p.isNew && <Badge tipo="nuevo">✨ Nuevo</Badge>}
          {p.isBestseller && <Badge tipo="top">★ Top</Badge>}
        </div>

        {/* Indicadores de media */}
        {(tieneVideo || tienePdf) && (
          <div className="absolute left-1.5 bottom-1.5 flex gap-1">
            {tieneVideo && (
              <span className="rounded bg-black/60 text-white text-[9px] px-1 py-0.5 backdrop-blur-sm">▶</span>
            )}
            {tienePdf && (
              <span className="rounded bg-black/60 text-white text-[9px] px-1 py-0.5 backdrop-blur-sm">📄</span>
            )}
          </div>
        )}

        {agotado && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/10">
            <Badge tipo="agotado">Agotado</Badge>
          </div>
        )}
      </button>

      {/* Contenido */}
      <div className="p-2 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-sm text-gray-800 leading-tight line-clamp-2">
          {p.name}
        </h3>

        <div className="mt-auto pt-2">
          {/* Precio + WhatsApp discreto */}
          <div className="flex items-center justify-between mb-2">
            {p.hasDiscount ? (
              <div className="flex items-baseline gap-1.5 min-w-0">
                <span className="text-[14px] font-extrabold text-marca-600">
                  {formatMoney(p.finalPrice)}
                </span>
                <span className="text-[11px] text-gray-400 line-through">
                  {formatMoney(p.price)}
                </span>
              </div>
            ) : (
              <span className="text-[14px] font-extrabold text-gray-900">
                {formatMoney(p.price)}
              </span>
            )}

            {/* Botón WhatsApp: solo ícono, discreto */}
            <a
              href={linkWhatsAppProducto(p)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 hover:bg-green-600 active:scale-95 text-white flex items-center justify-center transition-all"
              aria-label="Pedir info por WhatsApp"
              title="Pedir info por WhatsApp"
            >
              <WhatsAppIcon className="w-4 h-4" />
            </a>
          </div>

          {/* Cantidad + agregar */}
          <div className="flex items-center gap-1.5">
            <div className="flex items-center border border-marca-100 rounded-md overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-6 h-7 text-gray-500 hover:bg-marca-50 transition-colors text-sm"
                aria-label="Restar"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-6 text-center text-xs font-semibold outline-none"
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-6 h-7 text-gray-500 hover:bg-marca-50 transition-colors text-sm"
                aria-label="Sumar"
              >
                +
              </button>
            </div>

            <button
              onClick={agregar}
              disabled={agotado}
              className={`flex-1 rounded-md py-1.5 text-xs font-bold transition-all active:scale-95 ${
                agotado
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : added
                  ? 'bg-green-500 text-white'
                  : 'bg-gradient-to-r from-marca-500 to-marca-600 text-white hover:shadow-suave'
              }`}
            >
              {agotado ? 'Agotado' : added ? '✓ Agregado' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
