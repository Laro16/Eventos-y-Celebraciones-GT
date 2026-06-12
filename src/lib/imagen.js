// Comprime y redimensiona imágenes en el navegador antes de subirlas.
// - Solo procesa image/jpeg, image/png, image/webp.
// - Gifs (se perdería la animación), videos y PDF pasan intactos.
// - Máx 1600px por lado, calidad 0.82, salida JPEG (o WebP si el original era WebP).
const MAX_LADO = 1600
const CALIDAD = 0.82
const COMPRIMIBLES = new Set(['image/jpeg', 'image/png', 'image/webp'])

export async function comprimirSiEsImagen(file) {
  if (!COMPRIMIBLES.has(file.type)) return file

  try {
    const bitmap = await createImageBitmap(file)
    let { width, height } = bitmap

    const escala = Math.min(1, MAX_LADO / Math.max(width, height))
    width = Math.round(width * escala)
    height = Math.round(height * escala)

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    canvas.getContext('2d').drawImage(bitmap, 0, 0, width, height)
    bitmap.close()

    const tipoSalida = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg'
    const blob = await new Promise((res) => canvas.toBlob(res, tipoSalida, CALIDAD))
    if (!blob) return file

    // Si por alguna razón quedó más pesada, usamos la original.
    if (blob.size >= file.size) return file

    const ext = tipoSalida === 'image/webp' ? '.webp' : '.jpg'
    const nombre = file.name.replace(/\.[^.]+$/, '') + ext
    return new File([blob], nombre, { type: tipoSalida })
  } catch {
    // Si el navegador no soporta algo, subimos la original sin romper el flujo.
    return file
  }
}
