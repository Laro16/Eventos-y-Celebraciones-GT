import { supabase, BUCKET } from './supabase'
import { comprimirSiEsImagen } from './imagen'

// --- Productos -------------------------------------------------------------

export async function createProduct(row) {
  const { data, error } = await supabase
    .from('products')
    .insert(row)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateProduct(id, row) {
  const { error } = await supabase.from('products').update(row).eq('id', id)
  if (error) throw error
}

// Borra el producto y también sus archivos del Storage.
export async function deleteProduct(product) {
  const paths = (product.media || [])
    .map((m) => m.storage_path)
    .filter(Boolean)
  if (paths.length > 0) {
    await supabase.storage.from(BUCKET).remove(paths)
  }
  const { error } = await supabase.from('products').delete().eq('id', product.id)
  if (error) throw error
}

// --- Media -----------------------------------------------------------------

// Detecta el tipo de media a partir del archivo.
function tipoDeArchivo(file) {
  const t = file.type || ''
  if (t === 'image/gif') return 'gif'
  if (t.startsWith('image/')) return 'image'
  if (t.startsWith('video/')) return 'video'
  if (t === 'application/pdf') return 'pdf'
  return null // tipo no soportado
}

// Sube un archivo al bucket y crea su fila en product_media.
// Las imágenes se comprimen/redimensionan automáticamente antes de subir.
export async function uploadMedia(productId, file, position = 0) {
  const type = tipoDeArchivo(file)
  if (!type) {
    throw new Error('Tipo de archivo no soportado. Usa imagen, gif, video o PDF.')
  }

  if (type === 'image') {
    file = await comprimirSiEsImagen(file)
  }

  // Nombre seguro y único dentro de una carpeta por producto.
  const safe = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_')
  const path = `${productId}/${Date.now()}-${safe}`

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '3600', upsert: false })
  if (upErr) throw upErr

  const { data: pub } = supabase.storage.from(BUCKET).getPublicUrl(path)

  const { data, error } = await supabase
    .from('product_media')
    .insert({
      product_id: productId,
      type,
      url: pub.publicUrl,
      storage_path: path,
      position,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

// Elimina una media: borra el archivo del Storage y su fila.
export async function deleteMedia(media) {
  if (media.storage_path) {
    await supabase.storage.from(BUCKET).remove([media.storage_path])
  }
  const { error } = await supabase.from('product_media').delete().eq('id', media.id)
  if (error) throw error
}
