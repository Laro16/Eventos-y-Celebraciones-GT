import { useState } from 'react'
import { createProduct, updateProduct, uploadMedia, deleteMedia } from '../../lib/admin'

const VACIO = {
  name: '',
  description: '',
  price: '',
  category: '',
  subcategory: '',
  is_available: true,
  is_new: false,
  is_bestseller: false,
  is_on_promo: false,
  discount_percent: 0,
  is_visible: true,
  sort_order: 0,
}

export default function ProductForm({ product, categories = [], onClose, onSaved }) {
  const editando = !!product
  const [form, setForm] = useState(() =>
    product
      ? {
          name: product.name || '',
          description: product.description || '',
          price: product.price ?? '',
          category: product.category || '',
          subcategory: product.subcategory || '',
          is_available: product.isAvailable !== false,
          is_new: !!product.isNew,
          is_bestseller: !!product.isBestseller,
          is_on_promo: !!product.isOnPromo,
          discount_percent: product.discountPercent ?? 0,
          is_visible: product.isVisible !== false,
          sort_order: product.sortOrder ?? 0,
        }
      : { ...VACIO }
  )
  const [currentId, setCurrentId] = useState(product?.id || null)
  const [media, setMedia] = useState(product?.media || [])
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  function buildRow() {
    return {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price) || 0,
      category: form.category.trim() || 'General',
      subcategory: form.subcategory.trim(),
      is_available: form.is_available,
      is_new: form.is_new,
      is_bestseller: form.is_bestseller,
      is_on_promo: form.is_on_promo,
      discount_percent: Math.min(100, Math.max(0, Number(form.discount_percent) || 0)),
      is_visible: form.is_visible,
      sort_order: Number(form.sort_order) || 0,
    }
  }

  async function guardar() {
    setError('')
    setMsg('')
    if (!form.name.trim()) return setError('El nombre es obligatorio.')
    setSaving(true)
    try {
      const row = buildRow()
      if (currentId) {
        await updateProduct(currentId, row)
        setMsg('Cambios guardados ✓')
      } else {
        const nuevo = await createProduct(row)
        setCurrentId(nuevo.id)
        setMsg('Producto creado ✓ Ahora puedes agregar fotos, videos o PDF.')
      }
      onSaved && onSaved()
    } catch (err) {
      setError(err.message || 'No se pudo guardar.')
    } finally {
      setSaving(false)
    }
  }

  async function subirArchivos(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = '' // permite volver a elegir el mismo archivo
    if (files.length === 0 || !currentId) return
    setError('')
    setUploading(true)
    try {
      let pos = media.length
      for (const file of files) {
        const row = await uploadMedia(currentId, file, pos++)
        setMedia((m) => [...m, row])
      }
    } catch (err) {
      setError(err.message || 'No se pudo subir el archivo.')
    } finally {
      setUploading(false)
    }
  }

  async function quitarMedia(item) {
    if (!confirm('¿Eliminar este archivo?')) return
    try {
      await deleteMedia(item)
      setMedia((m) => m.filter((x) => x.id !== item.id))
      onSaved && onSaved()
    } catch (err) {
      setError(err.message || 'No se pudo eliminar.')
    }
  }

  return (
    <div className="fixed inset-0 z-[70] bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-marca-100 sticky top-0 bg-white">
        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-sm">Cancelar</button>
        <h2 className="font-display font-700 text-marca-700">
          {editando ? 'Editar producto' : 'Nuevo producto'}
        </h2>
        <button
          onClick={guardar}
          disabled={saving}
          className="text-marca-600 font-bold text-sm disabled:opacity-50"
        >
          {saving ? 'Guardando…' : 'Guardar'}
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 max-w-xl w-full mx-auto">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-3 py-2 text-sm">{error}</div>
        )}
        {msg && (
          <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm">{msg}</div>
        )}

        <Campo label="Nombre *">
          <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} placeholder="Ej. Invitación Digital Boda" />
        </Campo>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Precio (Q)">
            <input type="number" inputMode="decimal" value={form.price} onChange={(e) => set('price', e.target.value)} className={inputCls} placeholder="0" />
          </Campo>
          <Campo label="Descuento (%)">
            <input type="number" inputMode="numeric" value={form.discount_percent} onChange={(e) => set('discount_percent', e.target.value)} className={inputCls} placeholder="0" />
          </Campo>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Campo label="Categoría">
            <input list="lista-categorias" value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls} placeholder="Bodas, 15 Años…" />
            <datalist id="lista-categorias">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </Campo>
          <Campo label="Subcategoría">
            <input value={form.subcategory} onChange={(e) => set('subcategory', e.target.value)} className={inputCls} placeholder="Invitaciones…" />
          </Campo>
        </div>

        <Campo label="Descripción">
          <textarea value={form.description} onChange={(e) => set('description', e.target.value)} rows={3} className={inputCls} placeholder="Detalles del producto…" />
        </Campo>

        {/* Toggles */}
        <div className="space-y-1 bg-marca-50/50 rounded-xl p-3">
          <Toggle label="Disponible (apagado = Agotado)" checked={form.is_available} onChange={(v) => set('is_available', v)} />
          <Toggle label="Marcar como Nuevo ✨" checked={form.is_new} onChange={(v) => set('is_new', v)} />
          <Toggle label="Más vendido (Top) ★" checked={form.is_bestseller} onChange={(v) => set('is_bestseller', v)} />
          <Toggle label="Mostrar en Promociones 🎁" checked={form.is_on_promo} onChange={(v) => set('is_on_promo', v)} />
          <Toggle label="Visible en el sitio" checked={form.is_visible} onChange={(v) => set('is_visible', v)} />
        </div>

        {/* Media */}
        <div>
          <div className="font-semibold text-gray-700 text-sm mb-2">Fotos, videos y PDF</div>

          {!currentId ? (
            <p className="text-xs text-gray-500 bg-amber-50 border border-amber-200 rounded-lg p-3">
              Guarda el producto primero (botón "Guardar" arriba) y luego podrás subir archivos.
            </p>
          ) : (
            <>
              {media.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {media.map((m) => (
                    <div key={m.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 border border-marca-100">
                      <Preview item={m} />
                      <button
                        onClick={() => quitarMedia(m)}
                        className="absolute top-1 right-1 bg-black/60 text-white w-6 h-6 rounded-full text-xs flex items-center justify-center"
                        aria-label="Eliminar"
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}

              <label className="block">
                <span className={`block text-center rounded-xl border-2 border-dashed border-marca-200 py-5 text-sm font-semibold cursor-pointer transition-colors ${uploading ? 'opacity-60' : 'text-marca-600 hover:bg-marca-50'}`}>
                  {uploading ? 'Subiendo…' : '+ Agregar fotos / video / PDF'}
                </span>
                <input
                  type="file"
                  accept="image/*,video/*,application/pdf"
                  multiple
                  onChange={subirArchivos}
                  disabled={uploading}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-gray-400 mt-1">
                Puedes seleccionar varios. La primera imagen será la portada.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-marca-100 px-3 py-2.5 text-sm outline-none focus:border-marca-300 focus:ring-2 focus:ring-marca-100'

function Campo({ label, children }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-gray-600 mb-1">{label}</span>
      {children}
    </label>
  )
}

function Toggle({ label, checked, onChange }) {
  return (
    <label className="flex items-center justify-between py-2 cursor-pointer">
      <span className="text-sm text-gray-700">{label}</span>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${checked ? 'bg-marca-500' : 'bg-gray-300'}`}
      >
        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : ''}`} />
      </button>
    </label>
  )
}

function Preview({ item }) {
  if (item.type === 'video') return <div className="w-full h-full flex items-center justify-center text-2xl">🎬</div>
  if (item.type === 'pdf') return <div className="w-full h-full flex items-center justify-center text-2xl">📄</div>
  return <img src={item.url} alt="" className="w-full h-full object-cover" />
}
