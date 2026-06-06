import { createClient } from '@supabase/supabase-js'

// Las credenciales vienen de variables de entorno (archivo .env en local,
// o Environment Variables en Vercel). NUNCA pongas aquí las llaves directas.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  // Mensaje claro en consola si falta configurar el .env
  console.error(
    'Faltan las variables VITE_SUPABASE_URL y/o VITE_SUPABASE_ANON_KEY. ' +
    'Revisa tu archivo .env (copia .env.example).'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Nombre del bucket de Storage donde se guardan fotos/videos/gifs/pdfs.
export const BUCKET = 'productos'
