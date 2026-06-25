import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { linkWhatsAppProducto } from '../lib/whatsapp'
import Badge from './Badge'

// Modal de detalle con galería que soporta image / gif / video / pdf.
export default function ProductModal({ product, onClose }) {
  const { add } = useCart()
  const [index, setIndex] = useState(0)
  const [qty, setQty] = useState(1)
  const [touchStart, setTouchStart] = useState(null)

  const slides = product?.media || []
  const total = slides.length
  const current = slides[index]
  const agotado = product && !product.isAvailable

  const next = useCallback(() => setIndex((i) => (i + 1) % total), [total])
  const prev = useCallback(() => setIndex((i) => (i - 1 + total) % total), [total])

  // Reset al cambiar de producto
  useEffect(() => {
    setIndex(0)
    setQty(1)
  }, [product])

  // Teclado + bloquear scroll del fondo + botón atrás
  useEffect(() => {
    if (!product) return
    let cerradoPorAtras = false
    function onKey(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') next()
      if (e.key === 'ArrowLeft') prev()
    }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'

    window.history.pushState({ modal: true }, '')
    const onPop = () => { cerradoPorAtras = true; onClose() }
    window.addEventListener('popstate', onPop)

    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('popstate', onPop)
      document.body.style.overflow = ''
      // Si se cerró con la ✕ / fondo / Escape, consumimos la entrada que agregamos
      // para que el botón "atrás" del teléfono no quede "trabado" una vez.
      if (!cerradoPorAtras) window.history.back()
    }
  }, [product, next, prev, onClose])

  if (!product) return null

  // Swipe en móvil
  const onTouchStart = (e) => setTouchStart(e.touches[0].clientX)
  const onTouchEnd = (e) => {
    if (touchStart == null) return
    const diff = touchStart - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40 && total > 1) (diff > 0 ? next : prev)()
    setTouchStart(null)
  }

  function cerrar() {
    onClose()
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-6"
      onClick={cerrar}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col md:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Galería */}
        <div className="md:w-3/5 bg-gray-900 flex flex-col">
          <div
            className="relative flex-1 flex items-center justify-center min-h-[240px] sm:min-h-[340px]"
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
          >
            <MediaViewer item={current} alt={product.name} />

            {total > 1 && (
              <>
                <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center">‹</button>
                <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white w-9 h-9 rounded-full flex items-center justify-center">›</button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full">
                  {index + 1} / {total}
                </div>
              </>
            )}

            {total === 0 && (
              <div className="text-gray-400 text-sm">Este producto aún no tiene media.</div>
            )}
          </div>

          {/* Miniaturas */}
          {total > 1 && (
            <div className="flex gap-2 overflow-x-auto scrollbar-hide p-2 bg-gray-800">
              {slides.map((m, i) => (
                <button
                  key={m.id || i}
                  onClick={() => setIndex(i)}
                  className={`relative w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 border-2 ${
                    i === index ? 'border-marca-400' : 'border-transparent opacity-70'
                  }`}
                >
                  <Thumb item={m} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="md:w-2/5 p-5 flex flex-col overflow-y-auto">
          <div className="flex items-start justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide text-marca-500">
              {product.category}
              {product.subcategory ? ` · ${product.subcategory}` : ''}
            </span>
            <button onClick={cerrar} className="text-gray-400 hover:text-gray-700 -mt-1" aria-label="Cerrar">✕</button>
          </div>

          <h2 className="font-display text-2xl font-bold text-gray-800 mt-1 leading-tight">
            {product.name}
          </h2>

          <div className="flex gap-1.5 mt-2">
            {product.hasDiscount && <Badge tipo="descuento">-{product.discountPercent}%</Badge>}
            {product.isNew && <Badge tipo="nuevo">✨ Nuevo</Badge>}
            {product.isBestseller && <Badge tipo="top">★ Top</Badge>}
            {agotado && <Badge tipo="agotado">Agotado</Badge>}
          </div>

          {product.description && (
            <p className="text-sm text-gray-600 mt-3 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          )}

          <div className="mt-4">
            {product.hasDiscount ? (
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-marca-600">{formatMoney(product.finalPrice)}</span>
                <span className="text-gray-400 line-through">{formatMoney(product.price)}</span>
              </div>
            ) : (
              <span className="text-2xl font-extrabold text-gray-900">{formatMoney(product.price)}</span>
            )}
          </div>

          <div className="mt-auto pt-5 flex items-center gap-2">
            <div className="flex items-center border border-marca-100 rounded-lg overflow-hidden">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-10 text-gray-500 hover:bg-marca-50">−</button>
              <input
                type="text"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value) || 1))}
                className="w-10 text-center font-semibold outline-none"
              />
              <button onClick={() => setQty((q) => q + 1)} className="w-9 h-10 text-gray-500 hover:bg-marca-50">+</button>
            </div>
            <button
              onClick={() => { add(product, qty); cerrar() }}
              disabled={agotado}
              className={`flex-1 rounded-lg py-2.5 font-bold transition-all ${
                agotado
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-marca-500 to-marca-600 text-white hover:shadow-suave'
              }`}
            >
              {agotado ? 'Agotado' : 'Agregar al carrito'}
            </button>
          </div>

          <a
            href={linkWhatsAppProducto(product)}
            target="_blank"
            rel="noreferrer"
            className="mt-2 flex items-center justify-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 text-white py-2.5 font-bold transition-all"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.384 0 12.031c0 2.128.552 4.195 1.6 6.015L.231 24l6.096-1.599a11.957 11.957 0 005.704 1.442h.005c6.645 0 12.028-5.385 12.028-12.032C24.064 5.387 18.679 0 12.031 0z" /></svg>
            Pedir info por WhatsApp
          </a>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Visor principal según el tipo de media
function MediaViewer({ item, alt }) {
  if (!item) return null
  if (item.type === 'video') {
    return (
      <video src={item.url} controls className="max-w-full max-h-[60vh] mx-auto" />
    )
  }
  if (item.type === 'pdf') {
    return (
      <div className="w-full h-[60vh] bg-white flex flex-col">
        <iframe src={item.url} title="PDF" className="flex-1 w-full" />
        <a
          href={item.url}
          target="_blank"
          rel="noreferrer"
          className="text-center bg-marca-500 text-white text-sm py-2 font-semibold hover:bg-marca-600"
        >
          Abrir / descargar PDF
        </a>
      </div>
    )
  }
  // image o gif
  return (
    <img src={item.url} alt={alt} className="max-w-full max-h-[60vh] object-contain mx-auto" />
  )
}

// Miniatura según tipo
function Thumb({ item }) {
  if (item.type === 'video') {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-lg">▶</div>
    )
  }
  if (item.type === 'pdf') {
    return (
      <div className="w-full h-full bg-gray-700 flex items-center justify-center text-white text-base">📄</div>
    )
  }
  return <img src={item.url} alt="" className="w-full h-full object-cover" />
}
