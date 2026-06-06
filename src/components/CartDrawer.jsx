import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { formatMoney } from '../lib/format'
import MediaPlaceholder from './MediaPlaceholder'

// Cambia este número por el de la empresa (formato internacional sin +, ni espacios)
const WHATSAPP = '50242454160'

export default function CartDrawer() {
  const { items, isOpen, close, updateQty, remove, clear, total } = useCart()
  const [cliente, setCliente] = useState({ nombre: '', fecha: '', direccion: '' })

  function enviarWhatsApp() {
    if (items.length === 0) return alert('Tu carrito está vacío.')
    if (!cliente.nombre.trim()) return alert('Por favor escribe tu nombre.')
    if (!cliente.fecha) return alert('Por favor selecciona la fecha de tu evento.')

    const lineas = ['*Pedido — Eventos y Celebraciones GT* 🎉', '']
    lineas.push(`👤 *Cliente:* ${cliente.nombre}`)
    lineas.push(`📅 *Fecha del evento:* ${cliente.fecha}`)
    if (cliente.direccion) lineas.push(`📍 *Dirección:* ${cliente.direccion}`)
    lineas.push('', '*Detalle:*')
    items.forEach((p) =>
      lineas.push(`• ${p.qty} × ${p.name} — ${formatMoney(p.price * p.qty)}`)
    )
    lineas.push('', `💰 *Total:* ${formatMoney(total)}`)

    const texto = encodeURIComponent(lineas.join('\n'))
    window.open(`https://wa.me/${WHATSAPP}?text=${texto}`, '_blank')
  }

  return (
    <>
      {/* Fondo oscuro */}
      <div
        onClick={close}
        className={`fixed inset-0 bg-black/40 z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white z-50 shadow-2xl flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-marca-100">
          <h3 className="font-display text-lg font-700 text-marca-700">Tu carrito</h3>
          <div className="flex items-center gap-2">
            {items.length > 0 && (
              <button onClick={clear} className="text-xs text-gray-400 hover:text-red-500">
                Vaciar
              </button>
            )}
            <button
              onClick={close}
              className="w-8 h-8 rounded-full hover:bg-marca-50 text-gray-500"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Items */}
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
                  <div className="text-xs text-marca-600 font-medium">{formatMoney(p.price)}</div>
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

        {/* Footer / datos del cliente */}
        {items.length > 0 && (
          <div className="border-t border-marca-100 p-4 space-y-2 bg-marca-50/40">
            <input
              value={cliente.nombre}
              onChange={(e) => setCliente({ ...cliente, nombre: e.target.value })}
              placeholder="Tu nombre"
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300"
            />
            <input
              type="date"
              value={cliente.fecha}
              onChange={(e) => setCliente({ ...cliente, fecha: e.target.value })}
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300 text-gray-600"
            />
            <input
              value={cliente.direccion}
              onChange={(e) => setCliente({ ...cliente, direccion: e.target.value })}
              placeholder="Dirección (opcional)"
              className="w-full rounded-lg border border-marca-100 px-3 py-2 text-sm outline-none focus:border-marca-300"
            />
            <div className="flex justify-between font-bold text-gray-800 pt-1">
              <span>Total</span>
              <span className="text-marca-600">{formatMoney(total)}</span>
            </div>
            <button
              onClick={enviarWhatsApp}
              className="w-full rounded-lg bg-green-500 hover:bg-green-600 text-white py-3 font-bold text-sm shadow-md transition-colors"
            >
              Ordenar por WhatsApp
            </button>
          </div>
        )}
      </aside>
    </>
  )
}
