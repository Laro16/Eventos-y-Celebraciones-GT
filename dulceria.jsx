/* dulceria.jsx
   Actualizado:
   - Carrito persistente (localStorage).
   - Formulario de datos (Nombre, Dirección, Fecha) integrado al pedido.
   - Botón flotante de WhatsApp para consultas.
   - Enlaces de redes sociales actualizados.
*/

const { useState, useMemo, useEffect, useRef } = React;
const { createPortal } = ReactDOM;

// Helper para el efecto de dulces
function triggerConfetti() {
  if (window.confetti) {
    window.confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 },
      shapes: ['circle', 'square'],
      colors: ['#f472b6', '#ec4899', '#db2777', '#ffffff', '#fed7aa']
    });
  }
}

/* Helpers */
function slugify(text) {
  return String(text || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n').replace(/Ñ/g, 'n')
    .toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
function parsePrice(v) {
  if (v == null) return 0;
  const s = String(v).trim().replace(/\s+/g, '');
  const n = parseFloat(s.replace(/[^\d.,-]/g, '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}
function handleImgError(e) {
  e.target.onerror = null;
  e.target.src = 'https://via.placeholder.com/600x400?text=Sin+imagen';
}
const moneyFmt = new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ', maximumFractionDigits: 2 });

// Componente para Animación
function FadeInOnScroll({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    });
    const currentRef = domRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => { if (currentRef) observer.unobserve(currentRef); };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

// Componente Image + modal
function ImageWithModal({ src, alt, className = 'w-[72%] max-w-[220px] h-36 mx-auto', imgClass = 'object-contain' }) {
  const [open, setOpen] = useState(false);
  const [isShowing, setIsShowing] = useState(false);

  useEffect(() => {
    let timeoutId;
    if (open) {
      timeoutId = setTimeout(() => setIsShowing(true), 50);
    } else {
      setIsShowing(false);
    }
    return () => clearTimeout(timeoutId);
  }, [open]);
  
  function onKey(e) { if (e.key === 'Escape') setOpen(false); }
  useEffect(() => {
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const modalJsx = open && createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black bg-opacity-80 p-4 transition-opacity duration-300 ease-out ${isShowing ? 'opacity-100' : 'opacity-0'}`}
      onClick={() => setOpen(false)}
    >
      <div
        className={`transform transition-all duration-300 ease-out ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-black rounded max-w-[95%] max-h-[95%]">
          <button onClick={() => setOpen(false)} aria-label="Cerrar" className="absolute top-2 right-2 z-10 rounded-full bg-black/50 text-white p-1.5 hover:bg-black/75 transition-colors">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img src={src} alt={alt} onError={handleImgError} className="max-w-[95vw] max-h-[95vh] object-contain block mx-auto" />
        </div>
        <div className="text-center text-sm text-gray-200 mt-3">{alt}</div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button
        onClick={(e) => { e.preventDefault(); setOpen(true); }}
        className={`block overflow-hidden bg-gray-100 rounded ${className}`}
        style={{ border: 'none', padding: 0 }}
      >
        <img src={src} alt={alt} loading="lazy" onError={handleImgError} className={`${imgClass} w-full h-full`} />
      </button>
      {modalJsx}
    </>
  );
}

/* Normaliza producto */
function normalizeProduct(raw, idFallback) {
  const name = (raw.name ?? raw.Nombre ?? raw.nombre ?? '').toString().trim();
  const price = parsePrice(raw.price ?? raw.Precio ?? raw.precio ?? raw.Price);
  const description = (raw.description ?? raw.Descripcion ?? raw.descripcion ?? raw.short ?? '').toString();
  const category = (raw.category ?? raw.Categoria ?? raw.categoria ?? 'Sin categoría').toString().trim();
  let subcategory = (raw.subcategory ?? raw.Subcategoria ?? raw.subcategoria ?? '').toString().trim();
  if (!subcategory) subcategory = 'Todas';

  let rawImage = (raw.image ?? raw.Imagen ?? raw.imagen ?? raw.Image ?? '').toString().trim();
  let image = rawImage;
  if (!image) {
    image = `./src/${slugify(name)}.jpg`;
  } else if (!/^https?:\/\//i.test(image) && !image.startsWith('./') && !image.startsWith('/')) {
    image = image.startsWith('src/') ? `./${image}` : `./src/${image}`;
  }
  if (!/\.[a-zA-Z0-9]{2,5}$/.test(image) && !/^https?:\/\//i.test(image)) image = `${image}.jpg`;

  return { id: raw.id ?? idFallback, name, price, short: description, description, category, subcategory, image };
}

/* App principal */
function DulceriaApp() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [subcategory, setSubcategory] = useState('Todas');
  const [visibleCount, setVisibleCount] = useState(12);

  // Carrito con persistencia
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem('eventosCart');
    return saved ? JSON.parse(saved) : [];
  });

  // Datos del cliente para el pedido
  const [customerData, setCustomerData] = useState({
    nombre: '',
    direccion: '',
    fecha: ''
  });

  const [cartOpen, setCartOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [logoVisible, setLogoVisible] = useState(true);
  const [cartImgVisible, setCartImgVisible] = useState(true);

  // Guardar carrito automáticamente
  useEffect(() => {
    localStorage.setItem('eventosCart', JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const res = await fetch('./products.xlsx', { cache: 'no-store' });
        if (!res.ok) throw new Error();
        const ab = await res.arrayBuffer();
        const workbook = XLSX.read(ab, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        if (mounted) setProducts(rows.map((r, i) => normalizeProduct(r, i + 1)));
      } catch (err) {
        const res = await fetch('./products.json').catch(() => null);
        if (res && res.ok) {
          const data = await res.json();
          if (mounted) setProducts(data.map((p, i) => normalizeProduct(p, p.id ?? i + 1)));
        }
      }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);
  const subcategories = useMemo(() => {
    const set = new Set(['Todas']);
    products.forEach(p => {
      if ((category === 'Todos' || p.category === category) && p.subcategory !== 'Todas') set.add(p.subcategory);
    });
    return Array.from(set);
  }, [products, category]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter(p => (category === 'Todos' || p.category === category))
      .filter(p => (subcategory === 'Todas' || p.subcategory === subcategory))
      .filter(p => (p.name + p.category + p.subcategory).toLowerCase().includes(q));
  }, [products, category, subcategory, query]);

  const total = cart.reduce((s, p) => s + (p.price || 0) * p.qty, 0);

  function generateWhatsAppMessage() {
    if (cart.length === 0) return '';
    let lines = ['*Pedido - Eventos y Celebraciones GT* 📝\n'];
    
    if (customerData.nombre) lines.push(`👤 *Cliente:* ${customerData.nombre}`);
    if (customerData.fecha) lines.push(`📅 *Fecha Evento:* ${customerData.fecha}`);
    if (customerData.direccion) lines.push(`📍 *Dirección:* ${customerData.direccion}`);
    lines.push('\n--- *Detalle del Pedido* ---');
    
    cart.forEach(p => lines.push(`• ${p.qty} x ${p.name} (${moneyFmt.format(p.price * p.qty)})`));
    lines.push(`\n💰 *Total:* ${moneyFmt.format(total)}`);
    return encodeURIComponent(lines.join('\n'));
  }

  function openWhatsApp() {
    const text = generateWhatsAppMessage();
    if (!text) return alert('El carrito está vacío.');
    window.open(`https://wa.me/50242454160?text=${text}`, '_blank');
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Botón Flotante */}
      <a
        href="https://wa.me/50242454160?text=Hola,%20tengo%20una%20consulta%20sobre%20sus%20servicios%20para%20eventos."
        target="_blank"
        className="fixed bottom-6 right-6 z-[60] bg-green-500 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform flex items-center justify-center"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.522.902 3.222 1.387 4.953 1.388 5.417 0 9.825-4.407 9.827-9.823.001-2.624-1.022-5.091-2.882-6.951-1.859-1.86-4.322-2.883-6.941-2.883-5.418 0-9.825 4.408-9.827 9.825-.001 1.761.463 3.479 1.341 4.974l-1.003 3.665 3.754-.984zm11.103-7.514c-.301-.15-1.785-.881-2.062-.981-.278-.1-.48-.15-.682.15s-.782.981-.958 1.182c-.177.201-.354.226-.654.076-.301-.15-1.272-.469-2.422-1.494-.894-.797-1.498-1.782-1.674-2.083-.177-.301-.019-.464.132-.613.135-.134.301-.351.451-.527.151-.176.201-.301.302-.502.101-.201.05-.376-.025-.526-.075-.15-.682-1.642-.934-2.246-.246-.589-.516-.51-.682-.518-.174-.008-.374-.01-.573-.01-.2 0-.525.075-.801.376s-1.052 1.029-1.052 2.508 1.077 2.91 1.228 3.111c.151.201 2.12 3.238 5.136 4.538.718.309 1.278.494 1.714.633.721.221 1.376.19 1.894.113.578-.085 1.785-.73 2.037-1.432.252-.702.252-1.305.176-1.432-.075-.127-.278-.202-.579-.353z"/></svg>
      </a>

      <header className="bg-white shadow sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <a href="./" className="flex items-center gap-3 no-underline text-current min-w-0">
            <img src="./src/logo.png" alt="Logo" className="h-10 sm:h-12" onError={() => setLogoVisible(false)} style={{ display: logoVisible ? 'block' : 'none' }} />
            <div className="truncate">
              <div className="text-sm sm:text-lg font-bold truncate">Eventos y Celebraciones GT</div>
              <div className="text-xs text-gray-500">De todo para tu fiesta</div>
            </div>
          </a>
          <nav className="hidden md:flex gap-2">
            {categories.map(c => (
              <button key={c} onClick={() => handleCategoryChange(c)} className={`px-3 py-2 rounded text-sm transition ${category === c ? 'bg-pink-100 text-pink-700 font-bold' : 'hover:bg-gray-100'}`}>{c}</button>
            ))}
          </nav>
          <button onClick={() => setCartOpen(true)} className="relative p-2 bg-pink-50 rounded-lg text-pink-600">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>
             {cart.length > 0 && <span className="absolute -top-1 -right-1 bg-pink-600 text-white text-[10px] px-1.5 py-0.5 rounded-full">{cart.length}</span>}
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-4">
        <section className="bg-white rounded-xl p-4 shadow-sm mb-6 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input value={query} onChange={e => setQuery(e.target.value)} placeholder="¿Qué buscas hoy?" className="md:col-span-2 border rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-pink-200 outline-none" />
            <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none">
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            {subcategories.length > 1 && (
              <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="border rounded-lg px-3 py-2 text-sm outline-none bg-pink-50 border-pink-100">
                {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            )}
          </div>
        </section>

        <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.slice(0, visibleCount).map((p, i) => (
            <FadeInOnScroll key={p.id} delay={i % 5 * 50}>
              <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden border border-gray-100 flex flex-col h-full">
                <ImageWithModal src={p.image} alt={p.name} />
                <div className="p-3 flex flex-col flex-1">
                  <h3 className="font-bold text-sm mb-1 truncate">{p.name}</h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-1">{p.short}</p>
                  <div className="text-pink-600 font-bold mb-3">{moneyFmt.format(p.price)}</div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => {
                      setCart(prev => {
                        const exists = prev.find(x => x.id === p.id);
                        return exists ? prev.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x) : [...prev, {...p, qty: 1}];
                      });
                      triggerConfetti();
                    }} className="w-full bg-pink-500 text-white text-xs py-2 rounded-lg font-medium hover:bg-pink-600">Agregar</button>
                  </div>
                </div>
              </article>
            </FadeInOnScroll>
          ))}
        </section>
        
        {visibleCount < filtered.length && (
          <button onClick={() => setVisibleCount(v => v + 12)} className="mt-8 block mx-auto px-6 py-2 border-2 border-pink-500 text-pink-500 rounded-full font-bold hover:bg-pink-50 transition">Ver más productos</button>
        )}
      </main>

      {/* Carrito Lateral */}
      <div className={`fixed inset-0 z-[70] transition-all ${cartOpen ? 'visible bg-black/50' : 'invisible'}`} onClick={() => setCartOpen(false)}>
        <div className={`absolute top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'}`} onClick={e => e.stopPropagation()}>
          <div className="p-4 border-b flex justify-between items-center bg-pink-50">
            <h3 className="font-bold text-pink-700">Tu Pedido</h3>
            <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-pink-100 rounded-full">✕</button>
          </div>
          
          <div className="p-4 overflow-y-auto" style={{ height: 'calc(100vh - 420px)' }}>
            {cart.length === 0 ? (
              <div className="text-center py-10 text-gray-400">Tu carrito está vacío</div>
            ) : cart.map(p => (
              <div key={p.id} className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-50">
                <img src={p.image} className="w-16 h-16 object-contain rounded bg-gray-50" />
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-sm truncate">{p.name}</div>
                  <div className="text-xs text-pink-600">{moneyFmt.format(p.price)}</div>
                  <div className="flex items-center gap-3 mt-2">
                    <button onClick={() => setCart(prev => prev.map(x => x.id === p.id ? {...x, qty: Math.max(1, x.qty - 1)} : x))} className="w-6 h-6 rounded-full bg-gray-100">-</button>
                    <span className="text-sm font-bold">{p.qty}</span>
                    <button onClick={() => setCart(prev => prev.map(x => x.id === p.id ? {...x, qty: x.qty + 1} : x))} className="w-6 h-6 rounded-full bg-gray-100">+</button>
                  </div>
                </div>
                <button onClick={() => setCart(prev => prev.filter(x => x.id !== p.id))} className="text-red-400 p-2">🗑</button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-gray-50 border-t space-y-3">
            <div className="text-xs font-bold text-gray-500 mb-2 uppercase">Datos de entrega</div>
            <input value={customerData.nombre} onChange={e => setCustomerData({...customerData, nombre: e.target.value})} placeholder="Tu nombre" className="w-full p-2 border rounded-lg text-sm outline-none focus:border-pink-500" />
            <input value={customerData.direccion} onChange={e => setCustomerData({...customerData, direccion: e.target.value})} placeholder="Dirección de entrega" className="w-full p-2 border rounded-lg text-sm outline-none focus:border-pink-500" />
            <input value={customerData.fecha} onChange={e => setCustomerData({...customerData, fecha: e.target.value})} type="date" className="w-full p-2 border rounded-lg text-sm outline-none focus:border-pink-500" />
            
            <div className="pt-4 border-t flex justify-between font-bold text-lg">
              <span>Total:</span>
              <span className="text-pink-600">{moneyFmt.format(total)}</span>
            </div>
            <button onClick={openWhatsApp} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-600 transition">
               Finalizar Pedido por WhatsApp
            </button>
            <button onClick={() => setCart([])} className="w-full py-2 text-xs text-red-400">Vaciar Carrito</button>
          </div>
        </div>
      </div>

      <footer className="mt-12 py-10 bg-white border-t text-center">
        <div className="flex justify-center gap-8 mb-6">
          <a href="https://www.facebook.com/profile.php?id=61577446754797" target="_blank" className="text-gray-400 hover:text-blue-600 transition">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/eventosycelebracionesgt/" target="_blank" className="text-gray-400 hover:text-pink-500 transition">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.85s.012-3.584.07-4.85c.149-3.227 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.116 0-3.483.011-4.712.068-2.736.126-3.901 1.288-4.028 4.028-.058 1.229-.068 1.598-.068 4.712s.011 3.483.068 4.712c.126 2.736 1.288 3.901 4.028 4.028 1.229.058 1.598.068 4.712.068s3.483-.011 4.712-.068c2.736-.126 3.901-1.288 4.028-4.028.058-1.229.068-1.598.068-4.712s-.011-3.483-.068-4.712c-.126-2.736-1.288-3.901-4.028-4.028C15.483 3.975 15.116 3.965 12 3.965zM12 8.428a3.572 3.572 0 100 7.144 3.572 3.572 0 000-7.144zm0 5.344a1.772 1.772 0 110-3.544 1.772 1.772 0 010 3.544zM16.949 6.329a1.2 1.2 0 100 2.4 1.2 1.2 0 000-2.4z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@eventosycelebraci" target="_blank" className="text-gray-400 hover:text-black transition">
            <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-2.43.05-4.86-.95-6.69-2.81-1.77-1.77-2.69-4.16-2.63-6.56.04-2.24 1.04-4.18 2.47-5.68 1.4-1.48 3.2-2.43 5.1-2.55.04-1.38.01-2.77.01-4.15z"/></svg>
          </a>
        </div>
        <div className="text-gray-400 text-sm">© {new Date().getFullYear()} Eventos y Celebraciones GT — Con amor para tu fiesta</div>
      </footer>
    </div>
  );

  function handleCategoryChange(c) {
    setCategory(c);
    setSubcategory('Todas');
    triggerConfetti();
  }
}

window.DulceriaApp = DulceriaApp;