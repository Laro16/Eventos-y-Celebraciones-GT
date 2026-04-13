/* dulceria.jsx
   Actualizado:
   - Soporte para múltiples imágenes por producto (separadas por coma en el Excel).
   - Galería de imágenes integrada en la ventana modal.
   - Soporte para deslizar (swipe) con el dedo en teléfonos móviles.
   - Animación de transición segura.
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

// Componente Image + modal (CARRUSEL MÓVIL Y ANIMACIONES)
function ImageWithModal({ src, images, alt, className = 'w-[72%] max-w-[220px] h-36 mx-auto', imgClass = 'object-contain' }) {
  const [open, setOpen] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Estados para detectar el deslizamiento del dedo (Swipe)
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const imgArray = images && images.length > 0 ? images : [src];
  const currentImg = imgArray[currentIndex] || imgArray[0];

  useEffect(() => {
    let timeoutId;
    if (open) {
      setCurrentIndex(0);
      timeoutId = setTimeout(() => setIsShowing(true), 50);
    } else {
      setIsShowing(false);
    }
    return () => clearTimeout(timeoutId);
  }, [open]);
  
  // Funciones para cambiar foto
  const nextImg = (e) => { 
    if (e) e.stopPropagation(); 
    setCurrentIndex(prev => (prev + 1) % imgArray.length); 
  };
  const prevImg = (e) => { 
    if (e) e.stopPropagation(); 
    setCurrentIndex(prev => (prev - 1 + imgArray.length) % imgArray.length); 
  };

  // Controlar con teclado (Computadora)
  useEffect(() => {
    function onKey(e) { 
      if (e.key === 'Escape') setOpen(false); 
      if (e.key === 'ArrowRight') nextImg();
      if (e.key === 'ArrowLeft') prevImg();
    }
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, imgArray.length]);

  // Lógica matemática para el Swipe en teléfonos
  const minSwipeDistance = 40; 

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && imgArray.length > 1) nextImg();
    if (isRightSwipe && imgArray.length > 1) prevImg();
  };

  const modalJsx = open && createPortal(
    <div role="dialog" aria-modal="true" className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300 ease-out ${isShowing ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)}>
      
      {/* Estilos seguros inyectados para la animación */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes subtleFade {
          0% { opacity: 0.2; transform: scale(0.98); }
          100% { opacity: 1; transform: scale(1); }
        }
        .anim-fade { animation: subtleFade 0.35s ease-out forwards; }
      `}} />

      <div className={`transform transition-all duration-300 ease-out flex flex-col items-center justify-center w-full h-full ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
        
        <div 
          className="relative rounded max-w-[100%] max-h-[85%] flex items-center justify-center w-full touch-pan-y"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <button onClick={() => setOpen(false)} aria-label="Cerrar" className="absolute -top-12 right-2 md:top-0 md:-right-12 z-50 rounded-full bg-white/20 text-white p-2 hover:bg-white/40 transition-colors">
            <svg className="w-6 h-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {imgArray.length > 1 && (
            <>
              <button onClick={prevImg} className="hidden md:block absolute left-0 md:-left-16 z-50 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={nextImg} className="hidden md:block absolute right-0 md:-right-16 z-50 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
              </button>
              
              <div className="md:hidden absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-1 pointer-events-none opacity-30">
                 <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                 <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>

              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/90 text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full z-50 backdrop-blur-sm">
                {currentIndex + 1} / {imgArray.length}
              </div>
            </>
          )}
          
          <img 
            key={currentIndex} 
            src={currentImg} 
            alt={alt} 
            onError={handleImgError} 
            draggable="false"
            className="anim-fade max-w-[95vw] max-h-[80vh] object-contain block mx-auto drop-shadow-2xl select-none" 
          />
        </div>
        <div className="text-center text-sm font-medium text-gray-300 mt-10 md:mt-12 px-4 select-none">{alt}</div>
      </div>
    </div>,
    document.body
  );

  return (
    <>
      <button onClick={(e) => { e.preventDefault(); setOpen(true); }} className={`relative block overflow-hidden bg-white/50 rounded ${className}`} style={{ border: 'none', padding: 0 }}>
        <img src={imgArray[0]} alt={alt} loading="lazy" onError={handleImgError} className={`${imgClass} w-full h-full mix-blend-multiply`} />
        
        {imgArray.length > 1 && (
          <span className="absolute bottom-1.5 right-1.5 bg-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 shadow backdrop-blur-sm">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            {imgArray.length}
          </span>
        )}
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

  let imageList = rawImage ? rawImage.split(',').map(img => img.trim()).filter(Boolean) : [];

  if (imageList.length === 0) {
    imageList = [`./src/${slugify(name)}.jpg`];
  } else {
    imageList = imageList.map(img => {
      let i = img;
      if (!/^https?:\/\//i.test(i) && !i.startsWith('./') && !i.startsWith('/')) {
        i = i.startsWith('src/') ? `./${i}` : `./src/${i}`;
      }
      if (!/\.[a-zA-Z0-9]{2,5}$/.test(i) && !/^https?:\/\//i.test(i)) i = `${i}.jpg`;
      return i;
    });
  }

  return { id: raw.id ?? idFallback, name, price, short: description, description, category, subcategory, image: imageList[0], images: imageList };
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

  function handleCategoryChange(c) {
    setCategory(c);
    setSubcategory('Todas');
    triggerConfetti();
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter(p => (category === 'Todos' || p.category === category))
      .filter(p => (subcategory === 'Todas' || p.subcategory === subcategory))
      .filter(p => (p.name + p.category + p.subcategory).toLowerCase().includes(q));
  }, [products, category, subcategory, query]);

  const visibleProducts = filtered.slice(0, visibleCount);

  function handleQuantityChange(productId, qty) {
    const newQty = Math.max(1, Number(qty) || 1);
    setQuantities(prev => ({ ...prev, [productId]: newQty }));
  }

  function incrementQuantity(productId) {
    const currentQty = quantities[productId] || 1;
    handleQuantityChange(productId, currentQty + 1);
  }

  function decrementQuantity(productId) {
    const currentQty = quantities[productId] || 1;
    handleQuantityChange(productId, currentQty - 1);
  }

  function addToCart(product, qtyToAdd) {
    setCart(prev => {
      const found = prev.find(x => x.id === product.id);
      if (found) {
        return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + qtyToAdd } : x);
      }
      return [...prev, { ...product, qty: qtyToAdd }];
    });
  }

  function updateQty(id, qty) { setCart(prev => prev.map(p => p.id === id ? { ...p, qty: Math.max(1, Number(qty) || 1) } : p)); }
  function removeFromCart(id) { setCart(prev => prev.filter(p => p.id !== id)); }

  const subtotal = cart.reduce((s, p) => s + (p.price || 0) * p.qty, 0);
  const total = subtotal;

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
    <div className="min-h-screen bg-gradient-to-br from-white via-white to-gray-100 text-gray-800">
      
      {/* Botón Flotante */}
      <a
        href="https://wa.me/50242454160?text=Hola,%20tengo%20una%20consulta%20sobre%20sus%20servicios%20para%20eventos."
        target="_blank"
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-[60] bg-green-500 text-white px-3 py-2 sm:px-5 sm:py-3 rounded-full shadow-2xl hover:scale-105 transition-transform flex items-center justify-center gap-1.5 sm:gap-2"
        aria-label="Contactar por WhatsApp"
      >
        <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.417-.003 6.557-5.338 11.892-11.893 11.892-1.997-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.599-3.835c1.522.902 3.222 1.387 4.953 1.388 5.417 0 9.825-4.407 9.827-9.823.001-2.624-1.022-5.091-2.882-6.951-1.859-1.86-4.322-2.883-6.941-2.883-5.418 0-9.825 4.408-9.827 9.825-.001 1.761.463 3.479 1.341 4.974l-1.003 3.665 3.754-.984zm11.103-7.514c-.301-.15-1.785-.881-2.062-.981-.278-.1-.48-.15-.682.15s-.782.981-.958 1.182c-.177.201-.354.226-.654.076-.301-.15-1.272-.469-2.422-1.494-.894-.797-1.498-1.782-1.674-2.083-.177-.301-.019-.464.132-.613.135-.134.301-.351.451-.527.151-.176.201-.301.302-.502.101-.201.05-.376-.025-.526-.075-.15-.682-1.642-.934-2.246-.246-.589-.516-.51-.682-.518-.174-.008-.374-.01-.573-.01-.2 0-.525.075-.801.376s-1.052 1.029-1.052 2.508 1.077 2.91 1.228 3.111c.151.201 2.12 3.238 5.136 4.538.718.309 1.278.494 1.714.633.721.221 1.376.19 1.894.113.578-.085 1.785-.73 2.037-1.432.252-.702.252-1.305.176-1.432-.075-.127-.278-.202-.579-.353z"/></svg>
        <span className="font-bold text-xs sm:text-sm">Contáctanos</span>
      </a>

      {/* Header fijo */}
      <header className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-3 flex items-center justify-between gap-2">
          <a href="./" className="flex items-center gap-2 sm:gap-3 min-w-0 flex-shrink-0 no-underline text-current">
            <div className="flex-shrink-0">
              <img src="./src/logo.png" alt="Logo" onLoad={() => setLogoVisible(true)} onError={(e) => { setLogoVisible(false); e.target.style.display = 'none'; }} className="h-10 sm:h-12 object-contain" style={{ display: logoVisible ? 'block' : 'none' }} />
            </div>
            {!logoVisible && <div className="text-xl font-bold select-none">Eventos y Celebraciones GT</div>}
            <div className="truncate hidden sm:block">
              <div className="text-sm sm:text-lg font-semibold truncate">Eventos y Celebraciones GT</div>
              <div className="text-xs text-gray-500 truncate">De todo para tu fiesta</div>
            </div>
          </a>

          <nav className="flex-grow min-w-0 md:hidden">
            <div className="flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide">
              {categories.map(c => (
                <button key={c} className={`px-3 py-2 rounded text-sm flex-shrink-0 ${category === c ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`} onClick={() => handleCategoryChange(c)}>
                  {c}
                </button>
              ))}
            </div>
          </nav>

          <div className="flex items-center gap-3 flex-shrink-0">
            <nav className="hidden md:flex gap-3 items-center mr-2">
              {categories.map(c => (
                <button key={c} className={`px-3 py-2 rounded ${category === c ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100'}`} onClick={() => handleCategoryChange(c)}>
                  {c}
                </button>
              ))}
            </nav>
            <button onClick={() => setCartOpen(true)} className="relative p-2 rounded-md bg-white hover:bg-gray-50 border border-gray-100 shadow-sm" aria-label="Abrir carrito">
              <img src="./src/carrito.png" alt="Carrito" onLoad={() => setCartImgVisible(true)} onError={(e) => { setCartImgVisible(false); e.target.style.display = 'none'; }} className="h-6 w-6 object-contain" style={{ display: cartImgVisible ? 'block' : 'none' }} />
              {!cartImgVisible && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4" />
                </svg>
              )}
              {cart.length > 0 && <span className="absolute -right-2 -top-2 bg-pink-600 text-white text-xs rounded-full px-1.5">{cart.length}</span>}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-4" style={{ paddingTop: 8 }}>
        <section className="bg-white rounded-lg p-3 sm:p-4 shadow-sm mb-4 border border-gray-100">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="col-span-1 md:col-span-1 flex items-center gap-2">
              <input aria-label="Buscar productos" value={query} onChange={e => setQuery(e.target.value)} className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:border-pink-300 focus:outline-none" placeholder="Buscar por nombre o categoría..." />
            </div>
            <div className="col-span-1 md:col-span-2 flex flex-wrap gap-2 items-center justify-end">
              <select value={category} onChange={e => handleCategoryChange(e.target.value)} className="border border-gray-200 rounded px-3 py-2 text-sm max-w-full focus:outline-none">
                {categories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              {subcategories.length > 1 && (
                <select value={subcategory} onChange={e => setSubcategory(e.target.value)} className="border rounded px-3 py-2 text-sm max-w-full bg-pink-50 border-pink-200 focus:outline-none">
                  {subcategories.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              )}
            </div>
          </div>
          
          {subcategories.length > 1 && (
            <div className="mt-3 pt-3 border-t border-gray-100 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide gap-2">
               <span className="text-sm text-gray-500 font-medium mr-1">Filtros rápidos:</span>
               {subcategories.map(s => (
                 <button key={s} className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium border transition-colors ${subcategory === s ? 'bg-pink-100 border-pink-300 text-pink-700' : 'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'}`} onClick={() => setSubcategory(s)}>
                   {s}
                 </button>
               ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold mb-3 text-gray-800">Productos ({filtered.length})</h2>
          {visibleProducts.length === 0 ? (
            <div className="bg-white rounded-lg p-6 text-center shadow-sm border border-gray-100">No se encontraron productos.</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {visibleProducts.map((p, index) => (
                <FadeInOnScroll key={p.id} delay={index * 50}>
                  <article className="bg-white rounded shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col h-full border border-gray-100">
                    <ImageWithModal src={p.image || `./src/${slugify(p.name)}.jpg`} images={p.images} alt={p.name} className="w-[72%] max-w-[220px] h-36 mx-auto mt-3" imgClass="object-contain" />
                    <div className="p-3 flex-1 flex flex-col">
                      <h3 className="font-semibold text-sm sm:text-base truncate text-gray-800">{p.name}</h3>
                      <p className="text-xs sm:text-sm text-gray-500 flex-1">{p.short || p.description}</p>
                      
                      <div className="mt-3 space-y-2">
                        <div className="text-base sm:text-lg font-bold text-gray-900">{moneyFmt.format(p.price || 0)}</div>
                        
                        <div className="flex justify-end items-center gap-3 mt-2">
                          <div className="flex items-center gap-2">
                            <button onClick={() => decrementQuantity(p.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-lg leading-none transition-colors">-</button>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={quantities[p.id] || 1}
                              onChange={(e) => handleQuantityChange(p.id, e.target.value)}
                              className="w-8 text-center text-base font-medium bg-transparent outline-none"
                            />
                            <button onClick={() => incrementQuantity(p.id)} className="w-6 h-6 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center justify-center text-lg leading-none transition-colors">+</button>
                          </div>
                          <button onClick={() => { addToCart(p, quantities[p.id] || 1); triggerConfetti(); }} className="px-3 py-2 bg-pink-500 text-white rounded-md text-sm hover:bg-pink-600 transition-colors shadow-sm">
                            Agregar
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeInOnScroll>
              ))}
            </div>
          )}
          {visibleCount < filtered.length && (
            <div className="mt-6 text-center">
              <button onClick={() => { setVisibleCount(v => v + 12); triggerConfetti(); }} className="px-5 py-2.5 bg-white border border-gray-200 shadow-sm rounded-full text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cargar más</button>
            </div>
          )}
        </section>
      </main>

      {/* Carrito lateral */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform`} style={{ zIndex: 60 }}>
        <div className="p-4 border-b flex items-center justify-between bg-white">
          <h3 className="text-lg font-bold text-gray-800">Tu carrito</h3>
          <div className="flex items-center gap-2">
            <button onClick={() => setCart([])} className="text-sm text-red-500 hover:text-red-600 transition-colors">Vaciar</button>
            <button onClick={() => setCartOpen(false)} className="px-2 py-1 border border-gray-200 rounded hover:bg-gray-50 transition-colors text-gray-600">Cerrar</button>
          </div>
        </div>
        
        <div className="p-4 space-y-4 overflow-auto" style={{ maxHeight: 'calc(100% - 290px)' }}>
          {cart.length === 0 ? (
            <div className="text-center text-gray-500 mt-10">No hay productos en el carrito.</div>
          ) : (
            cart.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <ImageWithModal src={p.image || `./src/${slugify(p.name)}.jpg`} images={p.images} alt={p.name} className="w-20 h-16 bg-gray-50" imgClass="object-contain mix-blend-multiply" />
                <div className="flex-1">
                  <div className="font-semibold text-sm truncate text-gray-800">{p.name}</div>
                  <div className="text-xs text-pink-600 font-medium">{moneyFmt.format(p.price || 0)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center border border-gray-200 rounded-md">
                     <button onClick={() => updateQty(p.id, p.qty - 1)} className="px-2 py-1 leading-none border-r border-gray-200 hover:bg-gray-50 text-gray-600">-</button>
                     <input
                       type="text"
                       inputMode="numeric"
                       value={p.qty}
                       onChange={e => updateQty(p.id, e.target.value)}
                       className="w-10 text-center border-none text-sm bg-transparent outline-none"
                     />
                     <button onClick={() => updateQty(p.id, p.qty + 1)} className="px-2 py-1 leading-none border-l border-gray-200 hover:bg-gray-50 text-gray-600">+</button>
                  </div>
                  <button onClick={() => removeFromCart(p.id)} className="text-sm text-red-400 hover:text-red-500 transition-colors">🗑️</button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Footer del carrito */}
        <div className="p-4 border-t border-gray-100 bg-white absolute bottom-0 w-full shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
          <div className="space-y-2 mb-4">
             <input value={customerData.nombre} onChange={e => setCustomerData({...customerData, nombre: e.target.value})} placeholder="Tu nombre..." className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200 transition-shadow" />
             <input value={customerData.direccion} onChange={e => setCustomerData({...customerData, direccion: e.target.value})} placeholder="Dirección de entrega..." className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200 transition-shadow" />
             <input value={customerData.fecha} onChange={e => setCustomerData({...customerData, fecha: e.target.value})} type="date" className="w-full border border-gray-200 rounded px-3 py-2 text-sm outline-none focus:border-pink-300 focus:ring-1 focus:ring-pink-200 transition-shadow text-gray-600" />
          </div>
          <div className="flex justify-between font-bold text-lg mb-4 text-gray-800"><span>Total</span><span className="text-pink-600">{moneyFmt.format(total)}</span></div>
          <button onClick={() => { openWhatsApp(); triggerConfetti(); }} className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg mb-2 text-sm font-bold shadow-md">Ordenar por WhatsApp</button>
        </div>
      </div>

      <footer className="mt-8 sm:mt-12 py-8 bg-white border-t border-gray-200 text-center text-sm text-gray-500 space-y-4">
        <div className="flex justify-center gap-6">
          <a href="https://www.facebook.com/profile.php?id=61577446754797" target="_blank" className="text-blue-600 hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://www.instagram.com/eventosycelebracionesgt/" target="_blank" className="text-pink-600 hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>
          </a>
          <a href="https://www.tiktok.com/@eventosycelebraci" target="_blank" className="text-black hover:scale-110 transition-transform">
            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.4 121.4 0 0 0 67 20.14z"/></svg>
          </a>
        </div>
        <div>© {new Date().getFullYear()} Eventos y Celebraciones GT — Hecho con cariño</div>
      </footer>
    </div>
  );
}

// export
window.DulceriaApp = DulceriaApp;
