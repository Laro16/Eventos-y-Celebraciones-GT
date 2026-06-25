-- ============================================================================
--  Eventos y Celebraciones GT — Mejoras y endurecimiento de Supabase
--  Todo es IDEMPOTENTE: puedes ejecutar este script las veces que quieras
--  sin romper nada ni duplicar objetos.
--
--  Ejecútalo ANTES de subir los cambios de código.
--  Supabase -> SQL Editor -> pega todo -> Run.
-- ============================================================================


-- ----------------------------------------------------------------------------
-- SECCIÓN A · RLS (seguridad a nivel de fila)
--
--   QUÉ CAMBIA Y POR QUÉ:
--   Antes la lectura pública era `USING (true)`, es decir, CUALQUIERA que llame
--   directamente a la API REST de Supabase podía ver TODOS los productos,
--   incluso los que marcaste como "Oculto" (is_visible = false). La app ya los
--   filtra en el navegador, pero la base no los protegía. Aquí limitamos la
--   lectura pública SOLO a productos visibles (defensa de verdad, no de fachada).
--
--   La escritura sigue siendo solo para usuarios autenticados (tu panel). Ver la
--   nota de seguridad importante al final del archivo sobre desactivar el registro
--   público de usuarios.
-- ----------------------------------------------------------------------------

ALTER TABLE public.products      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_media ENABLE ROW LEVEL SECURITY;

-- Lectura pública: SOLO productos visibles
DROP POLICY IF EXISTS products_public_read ON public.products;
CREATE POLICY products_public_read ON public.products
  FOR SELECT TO public
  USING (is_visible = true);

-- Escritura/borrado: solo autenticados (tu panel admin)
DROP POLICY IF EXISTS products_admin_write ON public.products;
CREATE POLICY products_admin_write ON public.products
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- Media: lectura pública. La dejamos abierta a propósito porque las URLs ya
-- apuntan a un bucket público; restringirla con subconsultas a `products`
-- complica el RLS sin ganar nada real. La escritura, solo autenticados.
DROP POLICY IF EXISTS media_public_read ON public.product_media;
CREATE POLICY media_public_read ON public.product_media
  FOR SELECT TO public
  USING (true);

DROP POLICY IF EXISTS media_admin_write ON public.product_media;
CREATE POLICY media_admin_write ON public.product_media
  FOR ALL TO authenticated
  USING (true) WITH CHECK (true);


-- ----------------------------------------------------------------------------
-- SECCIÓN B · updated_at automático
--
--   QUÉ ARREGLA: la columna `updated_at` tenía DEFAULT now() pero NADIE la
--   actualizaba al editar. Se quedaba congelada en la fecha de creación. Este
--   trigger la pone al día en cada UPDATE, por si más adelante quieres ordenar
--   por "últimos modificados" o auditar cambios.
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ----------------------------------------------------------------------------
-- SECCIÓN C · Índices
--
--   QUÉ MEJORA: la clave foránea product_media.product_id NO crea índice por sí
--   sola en Postgres. Al traer el catálogo se hace un "join" producto<->media;
--   con este índice esa consulta escala bien aunque crezca el catálogo. El
--   segundo índice acelera el filtrado/orden público (visibles, por sort_order).
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_product_media_product_id
  ON public.product_media (product_id);

CREATE INDEX IF NOT EXISTS idx_products_visible_sort
  ON public.products (is_visible, sort_order);


-- ----------------------------------------------------------------------------
-- SECCIÓN D · Storage (OPCIONAL)
--
--   Ejecuta esta sección SOLO si:
--     (a) las subidas o la visualización de imágenes NO funcionan, o
--     (b) quieres asegurarte de que el bucket esté correctamente protegido.
--
--   Si ya te funciona subir y ver archivos, puedes saltarte esta sección.
--   Da por hecho que tu bucket se llama 'productos' (es el que usa el código,
--   en src/lib/supabase.js -> export const BUCKET = 'productos').
-- ----------------------------------------------------------------------------

-- El bucket debe ser público para que getPublicUrl() sirva las imágenes.
UPDATE storage.buckets SET public = true WHERE id = 'productos';

-- Lectura pública de los archivos del bucket
DROP POLICY IF EXISTS productos_public_read ON storage.objects;
CREATE POLICY productos_public_read ON storage.objects
  FOR SELECT TO public
  USING (bucket_id = 'productos');

-- Subir / actualizar / borrar: solo autenticados (tu panel)
DROP POLICY IF EXISTS productos_auth_insert ON storage.objects;
CREATE POLICY productos_auth_insert ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'productos');

DROP POLICY IF EXISTS productos_auth_update ON storage.objects;
CREATE POLICY productos_auth_update ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'productos') WITH CHECK (bucket_id = 'productos');

DROP POLICY IF EXISTS productos_auth_delete ON storage.objects;
CREATE POLICY productos_auth_delete ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'productos');


-- ============================================================================
--  NOTA DE SEGURIDAD IMPORTANTE (no es SQL, es configuración del panel):
--
--  Con las políticas actuales, CUALQUIER usuario autenticado puede editar y
--  borrar productos. Hoy eso está bien porque la única cuenta eres tú. Pero si
--  el registro de usuarios está ABIERTO, alguien podría crearse una cuenta y
--  obtener permiso de escritura.
--
--  ACCIÓN RECOMENDADA: desactiva el auto-registro.
--    Supabase -> Authentication -> Sign In / Providers (o Settings)
--    -> desactiva "Allow new users to sign up".
--  Tú creas tu usuario admin manualmente desde Authentication -> Users -> Add user.
-- ============================================================================
