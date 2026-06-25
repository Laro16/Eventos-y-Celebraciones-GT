# Auditoría y correcciones — Eventos y Celebraciones GT

Revisé todo el proyecto (código + SQL + políticas). El proyecto está bien
construido; lo que sigue son arreglos reales (varios invisibles para ti) y
recomendaciones. Tienes el proyecto completo ya corregido en este ZIP.

---

## ⚠️ Lo más importante que estaba fallando (y no se notaba)

### 1. La tipografía elegante y las sombras NO se estaban viendo
Tu diseño usaba 4 clases que **no existían** en la configuración de Tailwind, así
que el navegador las ignoraba en silencio:

- `font-display` (13 usos) → debía aplicar la fuente **Fraunces** en los títulos.
  Resultado real: **se descargaba Fraunces pero nunca se usaba**; todos los
  títulos salían en Poppins.
- `font-700` / `font-600` (12 usos) → no son clases válidas de Tailwind. Muchos
  títulos ("Más vendidos", nombres de producto, panel, footer, bienvenida)
  salían en **peso normal (delgado)** en vez de negrita.
- `shadow-suave` (10 usos) → las tarjetas y botones no tenían **ninguna sombra**.

Lo comprobé compilando el CSS final: esas clases simplemente no aparecían.
**Ya quedó arreglado:** definí `display` y `shadow-suave` en `tailwind.config.js`
y cambié `font-700/600` por las clases canónicas `font-bold/font-semibold`. Vas a
notar de inmediato que el sitio se ve más fino: títulos con serif, negritas
reales y sombras suaves.

### 2. `env.example` tenía código por error
El archivo contenía una copia de `main.jsx` (código React) en lugar de las
variables de entorno. Si tú o alguien copiaba `.env.example` a `.env`, obtenía
basura. **Corregido:** ahora lista `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`
con instrucciones.

### 3. Confeti en CADA toque (problema de experiencia)
Había un listener global de `pointerdown` que lanzaba confeti **en cualquier
toque**: al filtrar, al abrir un producto, al cerrar el carrito y —lo peor— al
**hacer scroll en el celular** (en móvil `pointerdown` se dispara al empezar a
deslizar). Para un cliente que está evaluando una compra se siente ruidoso y
hasta roto, y además creaba un `<canvas>` nuevo por cada toque.

**Mi recomendación (y lo que hice):** quitar el confeti global y dejarlo solo en
momentos que de verdad valen la pena: la **bienvenida** (ya lo tenías) y cuando
el cliente **envía su pedido** por WhatsApp. La sensación de fiesta se conserva,
pero sin el ruido. La animación de "✓ Agregado" y el saltito del contador del
carrito siguen dando feedback al agregar.
> Si prefieres mantener algo de confeti al agregar al carrito, se puede; pero te
> recomiendo NO volver a ponerlo en cada toque.

---

## 🔒 Seguridad de Supabase (archivo `MEJORAS_SUPABASE.sql`)

Ejecuta ese script en **SQL Editor** (es idempotente, seguro de re-ejecutar).
Incluye:

- **Lectura pública solo de productos visibles.** Antes la política era
  `USING (true)`: cualquiera que llamara la API podía ver productos ocultos
  (borradores). La app los escondía en el navegador, pero la base no.
- **`updated_at` automático** con un trigger (antes quedaba congelado en la
  fecha de creación).
- **Índices** para que el catálogo escale bien (la FK de media no tenía índice).
- **Políticas de Storage** (opcional) por si las subidas no funcionan o para
  reforzar el bucket `productos`.

**Acción manual recomendada (importante):** con las políticas actuales, cualquier
usuario *autenticado* puede editar/borrar productos. Hoy está bien porque la
única cuenta eres tú, pero **desactiva el registro público** para que nadie pueda
crearse una cuenta con permisos:
`Authentication → Providers/Settings → desactiva "Allow new users to sign up"`.

---

## 🧹 Limpieza

Borré dos archivos muertos que solo causaban confusión:
- `supabase.js` (en la raíz): era el "placeholder del Paso 2", ya no lo usa nadie.
- `src/lib/WelcomeModal.jsx`: copia exacta del que sí se usa
  (`src/components/WelcomeModal.jsx`).

## 🔧 Arreglo menor
- **Modal de producto:** al cerrarlo con la ✕ quedaba una entrada "fantasma" en
  el historial y el botón *atrás* del teléfono necesitaba un toque de más. Ya se
  consume correctamente.

---

## 💡 Recomendaciones (NO aplicadas — tú decides)

1. **PWA de verdad (offline).** Tienes `manifest.json` y se puede "instalar",
   pero **no hay service worker**, así que no funciona sin conexión ni cachea el
   catálogo. Para un catálogo que cambia seguido conviene una estrategia
   *network-first* para los datos (que no se quede mostrando precios viejos). Si
   quieres, te lo implemento con `vite-plugin-pwa` en una segunda entrega.
2. **Ícono maskable dedicado.** El manifest usa un solo `logo.png` como
   `any maskable`. En Android los íconos maskables necesitan margen de seguridad;
   conviene un PNG 512×512 con padding para que no se recorte el logo.
3. **Productos duplicados en la vista principal.** "Más vendidos" y "Promociones"
   también aparecen abajo en "Todo el catálogo". Es un patrón común, pero si no
   lo quieres, se puede excluir de la grilla general.

---

## Cómo aplicar

1. **Primero el SQL:** Supabase → SQL Editor → pega `MEJORAS_SUPABASE.sql` → Run.
   (Y desactiva el registro público en Authentication.)
2. **Luego el código:** reemplaza los archivos en GitHub. Cambiaron:
   - `tailwind.config.js`
   - `env.example`
   - `src/App.jsx`
   - `src/components/CartDrawer.jsx`
   - `src/components/ProductModal.jsx`
   - `src/components/ProductGrid.jsx`, `ProductCard.jsx`, `Footer.jsx`,
     `WelcomeModal.jsx`, y `src/components/admin/*` (solo cambió `font-700/600`
     por `font-bold/semibold`)
   - **Borra** `supabase.js` (raíz) y `src/lib/WelcomeModal.jsx`
3. Vercel desplegará solo. Verás los títulos con serif, negritas y sombras.

> Lo más simple: sube el contenido de este ZIP tal cual (sin `node_modules`).

---

## Cambios de esta ronda (interfaz)

1. **Footer simplificado.** Quité el bloque de marca redundante (logo, nombre,
   eslogan y el 4.º botón de WhatsApp). El footer quedó minimal: solo redes
   sociales + copyright. (`src/components/Footer.jsx`)

2. **Logo de WhatsApp oficial en todo el sitio.** El ícono anterior era una
   burbuja de chat genérica (sin el teléfono). Creé un componente reutilizable
   `src/components/WhatsAppIcon.jsx` con el logo oficial y lo usé en el botón
   flotante "Contáctanos", las tarjetas, la barra inferior, el carrito y el
   modal. El botón flotante además quedó más fino y con el verde de marca de
   WhatsApp (#25D366).

3. **Vista más compacta / minimalista (sin pedir zoom al usuario).** En vez de
   un `zoom` o `transform` global —que rompen el header sticky, la barra inferior
   fija y los modales— densifiqué el layout:
   - Grilla: de 4 a **5 columnas** en pantallas grandes, con menos separación.
   - Títulos de sección, padding general y tarjetas más compactos.
   - Figuras del fondo más pequeñas y sutiles.
   Esto hace que se vea más al estilo de tu zoom 70–85%, pero sin encoger el
   texto a un tamaño ilegible. Si lo quieres aún más compacto, dímelo y lo bajo
   otro escalón (más columnas o una escala global controlada).

   Archivos tocados: `src/App.jsx`, `src/components/ProductGrid.jsx`,
   `src/components/ProductCard.jsx`, `src/components/FloatingBackground.jsx`,
   `src/index.css`. Nuevo: `src/components/WhatsAppIcon.jsx`.
