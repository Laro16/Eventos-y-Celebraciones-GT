import { useState } from 'react'
import { compartirArchivo, descargarArchivo } from '../../lib/share'

// Muestra la media de un producto con botones para compartir (a WhatsApp, etc.)
// o descargar cada archivo. Pensado para el panel admin.
export default function MediaShareSheet({ product, onClose }) {
  const [busy, setBusy] = useState(null)
  if (!product) return null

  const media = product.media || []

  async function accion(tipo, item) {
    setBusy(item.id + tipo)
    try {
      if (tipo === 'share') await compartirArchivo(item.url, null, product.name)
      else await descargarArchivo(item.url, null)
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="fixed inset-0 z-[75] flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4" onClick={onClose}>
      <div
        className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-marca-100">
          <h3 className="font-display font-700 text-marca-700 truncate">{product.name}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-marca-50 text-gray-500" aria-label="Cerrar">✕</button>
        </div>

        <div className="overflow-y-auto p-4 space-y-3">
          {media.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-6">Este producto no tiene archivos.</p>
          )}

          {media.map((m) => (
            <div key={m.id} className="flex items-center gap-3 border border-marca-100 rounded-xl p-2">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-marca-50 flex-shrink-0 flex items-center justify-center text-2xl">
                {m.type === 'image' || m.type === 'gif' ? (
                  <img src={m.url} alt="" className="w-full h-full object-cover" />
                ) : m.type === 'video' ? '🎬' : '📄'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-gray-600 uppercase">{m.type}</div>
                <div className="flex gap-2 mt-1">
                  <button
                    onClick={() => accion('share', m)}
                    disabled={busy === m.id + 'share'}
                    className="flex-1 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-bold py-2 disabled:opacity-60"
                  >
                    {busy === m.id + 'share' ? '…' : 'Compartir'}
                  </button>
                  <button
                    onClick={() => accion('download', m)}
                    disabled={busy === m.id + 'download'}
                    className="rounded-lg bg-marca-50 text-marca-600 text-sm font-bold py-2 px-3 disabled:opacity-60"
                  >
                    {busy === m.id + 'download' ? '…' : 'Descargar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
