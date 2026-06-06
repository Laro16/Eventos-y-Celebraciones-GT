import { supabase } from './supabase'
import { computeFinalPrice } from './format'

// Tipos de media que se muestran como imagen en el carrusel/portada.
const VISUAL = new Set(['image', 'gif'])

// Convierte una fila cruda de la base (con su media anidada) en un objeto
// cómodo y consistente para usar en toda la app.
export function normalizeProduct(row) {
  // Ordenamos la media por su campo "position".
  const media = [...(row.product_media || [])].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0)
  )

  const images = media.filter((m) => VISUAL.has(m.type)).map((m) => m.url)
  const videos = media.filter((m) => m.type === 'video')
  const pdfs = media.filter((m) => m.type === 'pdf')

  const discountPercent = Number(row.discount_percent) || 0
  const price = Number(row.price) || 0

  return {
    id: row.id,
    name: row.name || '',
    description: row.description || '',
    category: row.category || 'General',
    subcategory: row.subcategory || '',

    price,
    discountPercent,
    finalPrice: computeFinalPrice(price, discountPercent),
    hasDiscount: discountPercent > 0,

    isAvailable: row.is_available !== false, // false = agotado
    isNew: !!row.is_new,
    isBestseller: !!row.is_bestseller,
    isOnPromo: !!row.is_on_promo,
    isVisible: row.is_visible !== false,
    sortOrder: row.sort_order ?? 0,

    // Media organizada por tipo, lista para renderizar.
    media, // arreglo completo (image/gif/video/pdf) en orden
    images, // solo urls visuales (foto + gif) para el carrusel
    videos, // objetos {url, type, ...}
    pdfs,   // objetos {url, type, ...}
    cover: images[0] || null, // portada de la tarjeta
  }
}

// Trae el catálogo. Por defecto solo productos visibles (para el público).
// Con { includeHidden: true } trae todos (para el panel de admin).
export async function fetchProducts({ includeHidden = false } = {}) {
  let query = supabase
    .from('products')
    .select('*, product_media(*)')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!includeHidden) {
    query = query.eq('is_visible', true)
  }

  const { data, error } = await query
  if (error) throw error
  return (data || []).map(normalizeProduct)
}
