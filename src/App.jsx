import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

// Placeholder temporal del Paso 2.
// Solo sirve para confirmar que el proyecto compila y que la conexión a
// Supabase funciona. En los próximos pasos reemplazamos esto por el catálogo
// real y el panel de admin.
export default function App({ admin = false }) {
  const [estado, setEstado] = useState('Verificando conexión con Supabase...')

  useEffect(() => {
    async function probar() {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true })

      if (error) {
        setEstado('No se pudo conectar: ' + error.message)
      } else {
        setEstado(`Conexión OK ✓  — ${count ?? 0} productos en la base.`)
      }
    }
    probar()
  }, [])

  return (
    <div className="min-h-screen bg-marca-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-lg border border-marca-100 max-w-md w-full p-8 text-center">
        <h1 className="text-2xl font-extrabold text-marca-600">
          Eventos y Celebraciones GT
        </h1>
        <p className="text-gray-500 mt-1">
          {admin ? 'Panel de administración' : 'Catálogo'}
        </p>
        <div className="mt-6 rounded-lg bg-marca-50 border border-marca-100 px-4 py-3 text-sm text-gray-700">
          {estado}
        </div>
        <p className="text-xs text-gray-400 mt-6">
          Proyecto Vite listo. Siguiente paso: la capa de datos y el catálogo.
        </p>
      </div>
    </div>
  )
}
