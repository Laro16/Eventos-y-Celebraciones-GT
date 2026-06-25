import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import { WHATSAPP, BUSINESS_NAME } from '../lib/config'
import { lanzarConfetti } from '../lib/confetti'
import MediaPlaceholder from './MediaPlaceholder'

const CLIENTE_VACIO = { nombre: '', telefono: '', fecha: '', direccion: '', notas: '' }

export default function CartDrawer() {
  const { items, isOpen, close, updateQty, remove, clear, total, count } = useCart()
  const [cliente, setCliente] = useState(CLIENTE_VACIO)
  const [errores, setErrores] = useState({})

  const set = (k, v) => {
    setCliente((c) => ({ ...c, [k]: v }))
    if (errores[k]) setErrores((e) => ({ ...e, [k]: null }))
  }

  function validar() {
    const e = {}
    if (!cliente.nombre.trim()) e.nombre = 'Escribe tu nombre.'
    if (!cliente.fecha) e.fecha = 'Selecciona la fecha del evento.'
    setErrores(e)
    return Object.keys(e).length === 0
  }

  function enviarWhatsApp() {
    if (items.length === 0) return
    if (!validar()) return

    const L = [`*Pedido — ${BUSINESS_NAME}* 🎉`, '']
    L.push(`👤 *Cliente:* ${cliente.nombre}`)
    if (cliente.telefono) L.push(`📞 *Teléfono:* ${cliente.telefono}`)
    L.push(`📅 *Fecha del evento:* ${cliente.fecha}`)
    if (cliente.direccion) L.push(`📍 *Dirección:* ${cliente.direccion}`)
    L.push('', `🛍️ *Pedido (${count} artículo${count !== 1 ? 's' : ''}):*`)
    items.forEach((p) => L.push(`• ${p.qty} × ${p.name} — ${formatMoney(p.price * p.qty)}`))
    L.push('', `💰 *Total: ${formatMoney(total)}*`)
    if (cliente.notas.trim()) L.push('', `📝 *Notas:* ${cliente.notas.trim()}`)

    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(L.join('\n'))}`, '_blank')

    // Confeti SOLO en este momento importante: el cliente envió su pedido.
    lanzarConfetti()
  }

  return (
    <>
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-marca-100">
          <h3 className="font-display text-lg font-bold text-marca-700">
            Tu carrito {count > 0 && <span className="text-gray-400 text-sm">({count})</span>}
          </h3>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs text-gray-400 hover:text-red-500">Vaciar</button>
            )}
            <button onClick={close} className="w-8 h-8 rounded-full hover:bg-marca-50 text-gray-500" aria-label="Cerrar">✕</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center text-gray-400 mt-12 text-sm">
              Aún no has agregado nada. ¡Explora el catálogo! 🎈
            </div>
          ) : (
            items.map((p) => (
              <div key={p.id} className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-marca-50 flex-shrink-0">
                  {p.cover ? (
                    <img src={p.cover} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <MediaPlaceholder compact />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">
                    {formatMoney(p.price)} c/u · <span className="text-marca-600 font-medium">{formatMoney(p.price * p.qty)}</span>
                  </div>
                </div>
                <div className="flex items-center border border-marca-100 rounded-md">
                  <button onClick={() => updateQty(p.id, p.qty - 1)} className="px-2 py-1 text-gray-500 hover:bg-marca-50">−</button>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={p.qty}
                    onChange={(e) => updateQty(p.id, e.target.value)}
                    className="w-8 text-center text-sm outline-none"
                  />
                  <button onClick={() => updateQty(p.id, p.qty + 1)} className="px-2 py-1 text-gray-500 hover:bg-marca-50">+</button>
                </div>
                <button onClick={() => remove(p.id)} className="text-gray-300 hover:text-red-500" aria-label="Quitar">🗑️</button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t border-marca-100 p-4 space-y-2 bg-marca-50/40">
            <div>
              <input
                value={cliente.nombre}
                onChange={(e) => set('nombre', e.target.value)}
                placeholder="Tu nombre *"
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-marca-300 ${errores.nombre ? 'border-red-400' : 'border-marca-100'}`}
              />
              {errores.nombre && <p className="text-[11px] text-red-500 mt-0.5">{errores.nombre}</p>}
            </div>

            <input
              value={cliente.telefono}
              onChange={(e) => set('telefono', e.target.value)}
              inputMode="tel"
              placeholder="Tu teléfono (opcional)"
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300"
            />

            <div>
              <input
                type="date"
                value={cliente.fecha}
                onChange={(e) => set('fecha', e.target.value)}
                className={`w-full rounded-lg border px-3 py-2 text-sm outline-none focus:border-marca-300 text-gray-600 ${errores.fecha ? 'border-red-400' : 'border-marca-100'}`}
              />
              {errores.fecha && <p className="text-[11px] text-red-500 mt-0.5">{errores.fecha}</p>}
            </div>

            <input
              value={cliente.direccion}
              onChange={(e) => set('direccion', e.target.value)}
              placeholder="Dirección (opcional)"
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300"
            />

            <textarea
              value={cliente.notas}
              onChange={(e) => set('notas', e.target.value)}
              rows={2}
              placeholder="Notas o detalles especiales (opcional)"
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300 resize-none"
            />

            <div className="flex justify-between font-bold text-gray-800 pt-1">
              <span>Total</span>
              <span className="text-marca-600">{formatMoney(total)}</span>
            </div>

            <button
              onClick={enviarWhatsApp}
              className="w-full rounded-lg bg-green-500 hover:bg-green-600 text-white py-3 font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.384 0 12.031c0 2.128.552 4.195 1.6 6.015L.231 24l6.096-1.599a11.957 11.957 0 005.704 1.442h.005c6.645 0 12.028-5.385 12.028-12.032C24.064 5.387 18.679 0 12.031 0z" /></svg>
              Ordenar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
