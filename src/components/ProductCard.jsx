import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import Badge from './Badge'

export default function ProductCard({ product, onOpen }) {
  const { add } = useCart()
  const [qty, setQty] = useState(1)
  const p = product

  const agotado = !p.isAvailable
  const tieneVideo = p.videos.length > 0
  const tienePdf = p.pdfs.length > 0

  return (
    <article className="group bg-white rounded-2xl shadow-suave border border-marca-100/70 overflow-hidden flex flex-col transition-transform duration-300 hover:-translate-y-1">
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
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            Sin imagen
          </div>
        )}

        {/* Categoría */}
        <span className="absolute left-2 top-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-marca-600 shadow-sm">
          {p.category}
        </span>

        {/* Etiquetas superiores derecha */}
        <div className="absolute right-2 top-2 flex flex-col items-end gap-1">
          {p.hasDiscount && <Badge tipo="descuento">-{p.discountPercent}%</Badge>}
          {p.isNew && <Badge tipo="nuevo">✨ Nuevo</Badge>}
          {p.isBestseller && <Badge tipo="top">★ Top</Badge>}
        </div>

        {/* Indicadores de media */}
        {(tieneVideo || tienePdf) && (
          <div className="absolute left-2 bottom-2 flex gap-1">
            {tieneVideo && (
              <span className="rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5 backdrop-blur-sm">▶ Video</span>
            )}
            {tienePdf && (
              <span className="rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5 backdrop-blur-sm">📄 PDF</span>
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
      <div className="p-3.5 flex flex-col flex-1">
        <h3 className="font-display font-600 text-gray-800 leading-tight line-clamp-2">
          {p.name}
        </h3>
        {p.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>
        )}

        <div className="mt-auto pt-3">
          {/* Precio */}
          <div className="mb-2.5">
            {p.hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-extrabold text-marca-600">
                  {formatMoney(p.finalPrice)}
                </span>
                <span className="text-sm text-gray-400 line-through">
                  {formatMoney(p.price)}
                </span>
              </div>
            ) : (
              <span className="text-lg font-extrabold text-gray-900">
                {formatMoney(p.price)}
              </span>
            )}
          </div>

          {/* Cantidad + agregar */}
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-marca-100 rounded-lg overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-8 h-8 text-gray-500 hover:bg-marca-50 transition-colors"
                aria-label="Restar"
              >
                −
              </button>
              <input
                type="text"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-8 text-center text-sm font-semibold outline-none"
              />
              <button
                onClick={() => setQty((q) => q + 1)}
                className="w-8 h-8 text-gray-500 hover:bg-marca-50 transition-colors"
                aria-label="Sumar"
              >
                +
              </button>
            </div>

            <button
              onClick={() => add(p, qty)}
              disabled={agotado}
              className={`flex-1 rounded-lg py-2 text-sm font-bold transition-all ${
                agotado
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-marca-500 to-marca-600 text-white hover:shadow-suave'
              }`}
            >
              {agotado ? 'Agotado' : 'Agregar'}
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}
