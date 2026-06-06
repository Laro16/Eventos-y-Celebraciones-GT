// Utilidades para compartir/descargar la media de un producto desde el panel.

function nombreDesdeUrl(url) {
  try {
    const base = new URL(url).pathname.split('/').pop() || 'archivo'
    // quita el prefijo de timestamp tipo "1718-..." si lo tuviera
    return decodeURIComponent(base).replace(/^\d+-/, '')
  } catch {
    return 'archivo'
  }
}

async function obtenerBlob(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error('No se pudo obtener el archivo')
  return await res.blob()
}

// Descarga forzada (trae el archivo como blob y lo guarda).
export async function descargarArchivo(url, nombre) {
  try {
    const blob = await obtenerBlob(url)
    const objUrl = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = objUrl
    a.download = nombre || nombreDesdeUrl(url)
    document.body.appendChild(a)
    a.click()
    a.remove()
    setTimeout(() => URL.revokeObjectURL(objUrl), 4000)
  } catch {
    // Si falla (p. ej. por CORS), abrimos en pestaña nueva para guardar manual.
    window.open(url, '_blank')
  }
}

// Comparte el archivo usando el menú nativo del teléfono (WhatsApp, etc.).
// Si el dispositivo no soporta compartir archivos, descarga como respaldo.
export async function compartirArchivo(url, nombre, texto) {
  const fileName = nombre || nombreDesdeUrl(url)
  try {
    const blob = await obtenerBlob(url)
    const file = new File([blob], fileName, { type: blob.type })
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: fileName, text: texto || '' })
      return
    }
    await descargarArchivo(url, fileName)
  } catch (e) {
    if (e && e.name === 'AbortError') return // el usuario canceló el menú
    await descargarArchivo(url, fileName)
  }
}
