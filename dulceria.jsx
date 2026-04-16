/* dulceria.jsx
   Actualizado:
   - Validación de carrito: Nombre y Fecha obligatorios para WhatsApp.
   - Soporte para etiquetas "Agotado" y "Nuevo" desde columna "Estado" del Excel.
   - Fondo ultrasuave (#FFF8FA) y dulces flotantes.
   - Sonido de "Burbuja" y Recuadro de bienvenida dinámico.
   - Botón "Agregar" pequeño para evitar cortes de texto.
*/

const { useState, useMemo, useEffect, useRef } = React;
const { createPortal } = ReactDOM;

// Helper para sonido suave de "pop/burbuja"
function playBubbleSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.08);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.08);
  } catch (e) {}
}

// Helper para confeti
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
  return String(text || '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/ñ/g, 'n').replace(/Ñ/g, 'n').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
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

/* Fondo Animado */
function FloatingBackground() {
  const particles = useMemo(() => {
    const items = ['🍬', '🍭', '🎈', '🧁', '🍩', '🍫', '✨', '🎉'];
    return Array.from({ length: 18 }).map((_, i) => ({
      id: i,
      emoji: items[i % items.length],
      left: `${Math.random() * 100}%`,
      animationDuration: `${15 + Math.random() * 25}s`,
      animationDelay: `-${Math.random() * 30}s`, 
      fontSize: `${1.2 + Math.random()}rem`,
      horizontalSway: Math.random() > 0.5 ? 1 : -1
    }));
  }, []);
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes floatUpAndSway {
          0% { transform: translateY(110vh) translateX(0px) rotate(0deg); opacity: 0; }
          10% { opacity: 0.35; }
          90% { opacity: 0.35; }
          100% { transform: translateY(-10vh) translateX(var(--sway)) rotate(360deg); opacity: 0; }
        }
        .candy-float { position: absolute; top: 0; animation: floatUpAndSway linear infinite; }
      `}} />
      {particles.map(p => (
        <div key={p.id} className="candy-float drop-shadow-md" style={{ left: p.left, animationDuration: p.animationDuration, animationDelay: p.animationDelay, fontSize: p.fontSize, '--sway': `${p.horizontalSway * 50}px` }}>
          {p.emoji}
        </div>
      ))}
    </div>
  );
}

function FadeInOnScroll({ children, delay = 0 }) {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef();
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) { setIsVisible(true); observer.unobserve(entry.target); } });
    }, { threshold: 0.08, rootMargin: "80px" });
    if (domRef.current) observer.observe(domRef.current);
    return () => { if (domRef.current) observer.unobserve(domRef.current); };
  }, []);
  return (
    <div ref={domRef} className={`transition-all duration-500 ease-out ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

function ImageWithModal({ src, images, alt, className = 'w-full h-48', imgClass = 'object-cover w-full h-full' }) {
  const [open, setOpen] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const imgArray = images && images.length > 0 ? images : [src];
  const currentImg = imgArray[currentIndex] || imgArray[0];

  const openModal = (e) => { e.preventDefault(); setOpen(true); window.history.pushState({ modalOpen: true }, ''); };
  const closeModal = () => { setOpen(false); if (window.history.state && window.history.state.modalOpen) window.history.back(); };
  
  useEffect(() => {
    const handlePopState = () => { if (open) setOpen(false); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [open]);

  useEffect(() => {
    if (open) setTimeout(() => setIsShowing(true), 50);
    else setIsShowing(false);
  }, [open]);
  
  const modalJsx = open && createPortal(
    <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 transition-opacity duration-300 ${isShowing ? 'opacity-100' : 'opacity-0'}`} onClick={closeModal}>
      <div className={`transform transition-all duration-300 ${isShowing ? 'scale-100' : 'scale-95'}`} onClick={(e) => e.stopPropagation()}>
        <img src={currentImg} alt={alt} onError={handleImgError} className="max-w-[95vw] max-h-[80vh] object-contain drop-shadow-2xl" />
        <div className="text-center text-sm text-gray-300 mt-4">{alt}</div>
      </div>
    </div>, document.body
  );

  return (
    <>
      <button onClick={openModal} className={`relative block overflow-hidden bg-gray-50 ${className}`} style={{ border: 'none', padding: 0 }}>
        <img src={imgArray[0]} alt={alt} loading="lazy" onError={handleImgError} className={`${imgClass} transition-transform duration-700 hover:scale-110`} />
      </button>
      {modalJsx}
    </>
  );
}

function normalizeProduct(raw, idFallback) {
  const name = (raw.name ?? raw.Nombre ?? raw.nombre ?? '').toString().trim();
  const price = parsePrice(raw.price ?? raw.Precio ?? raw.precio ?? raw.Price);
  const description = (raw.description ?? raw.Descripcion ?? raw.descripcion ?? raw.short ?? '').toString();
  const category = (raw.category ?? raw.Categoria ?? raw.categoria ?? 'Sin categoría').toString().trim();
  const subcategoria = (raw.subcategory ?? raw.Subcategoria ?? raw.subcategoria ?? '').toString().trim();
  const estado = (raw.estado ?? raw.Estado ?? '').toString().trim().toLowerCase(); // LEER ESTADO

  let rawImage = (raw.image ?? raw.Imagen ?? raw.imagen ?? raw.Image ?? '').toString().trim();
  let imageList = rawImage ? rawImage.split(',').map(img => img.trim()).filter(Boolean) : [];
  if (imageList.length === 0) imageList = [`./src/${slugify(name)}.jpg`];

  return { id: raw.id ?? idFallback, name, price, short: description, description, category, subcategoria, estado, image: imageList[0], images: imageList };
}

function getEmojiForCategory(categoryName, index) {
  const common = { '15': '👑', 'boda': '💍', 'niño': '🎈', 'graduacion': '🎓', 'bautizo': '🕊️', 'baby': '🍼', 'cumple': '🎂' };
  const key = categoryName.toLowerCase();
  for (let k in common) { if (key.includes(k)) return common[k]; }
  return ['✨', '🎉', '🎊', '🥳'][index % 4];
}

function DulceriaApp() {
  const [products, setProducts] = useState([]);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Todos');
  const [subCategory, setSubCategory] = useState('Todas');
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcome, setShowWelcome] = useState(false);
  const [cart, setCart] = useState(() => JSON.parse(localStorage.getItem('eventosCart') || '[]'));
  const [customerData, setCustomerData] = useState({ nombre: '', direccion: '', fecha: '' });
  const [cartOpen, setCartOpen] = useState(false);
  const [quantities, setQuantities] = useState({});
  const [logoVisible, setLogoVisible] = useState(true);

  useEffect(() => { localStorage.setItem('eventosCart', JSON.stringify(cart)); }, [cart]);

  const openCart = () => { setCartOpen(true); window.history.pushState({ cartOpen: true }, ''); };
  const closeCart = () => { setCartOpen(false); if (window.history.state?.cartOpen) window.history.back(); };

  useEffect(() => {
    let mounted = true;
    async function loadData() {
      try {
        const res = await fetch('./products.xlsx', { cache: 'no-store' });
        const ab = await res.arrayBuffer();
        const workbook = XLSX.read(ab, { type: 'array' });
        const rows = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]], { defval: '' });
        if (mounted) { setProducts(rows.map((r, i) => normalizeProduct(r, i + 1))); setIsLoading(false); setShowWelcome(true); }
      } catch (e) { setIsLoading(false); }
    }
    loadData();
    return () => { mounted = false; };
  }, []);

  const categories = useMemo(() => ['Todos', ...new Set(products.map(p => p.category))], [products]);
  const availableSubcategories = useMemo(() => {
    const currentProds = category === 'Todos' ? products : products.filter(p => p.category === category);
    return ['Todas', ...new Set(currentProds.map(p => p.subcategoria).filter(Boolean))];
  }, [products, category]);

  function handleCategoryChange(c) { playBubbleSound(); setCategory(c); setSubCategory('Todas'); triggerConfetti(); }
  function handleWelcomeSelection(selection) {
    const exact = categories.find(c => c.toLowerCase() === selection.toLowerCase());
    handleCategoryChange(exact || 'Todos');
    setShowWelcome(false);
  }

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return products
      .filter(p => (category === 'Todos' || p.category === category))
      .filter(p => (subCategory === 'Todas' || p.subcategoria === subCategory))
      .filter(p => (p.name + p.category + (p.subcategoria||'')).toLowerCase().includes(q));
  }, [products, category, subCategory, query]);

  function addToCart(product, qtyToAdd) {
    if (product.estado === 'agotado') return; // Seguridad extra
    setCart(prev => {
      const found = prev.find(x => x.id === product.id);
      if (found) return prev.map(x => x.id === product.id ? { ...x, qty: x.qty + qtyToAdd } : x);
      return [...prev, { ...product, qty: qtyToAdd }];
    });
  }

  const subtotal = cart.reduce((s, p) => s + (p.price || 0) * p.qty, 0);

  /* VALIDACION DE CARRITO ANTES DE WHATSAPP */
  function openWhatsApp() {
    if (cart.length === 0) return alert('El carrito está vacío.');
    if (!customerData.nombre.trim()) return alert('Por favor, ingresa tu nombre.');
    if (!customerData.fecha) return alert('Por favor, selecciona la fecha de tu evento.');

    let lines = ['*Pedido - Eventos y Celebraciones GT* 📝\n', `👤 *Cliente:* ${customerData.nombre}`, `📅 *Fecha Evento:* ${customerData.fecha}`];
    if (customerData.direccion) lines.push(`📍 *Dirección:* ${customerData.direccion}`);
    lines.push('\n--- *Detalle* ---');
    cart.forEach(p => lines.push(`• ${p.qty} x ${p.name} (${moneyFmt.format(p.price * p.qty)})`));
    lines.push(`\n💰 *Total:* ${moneyFmt.format(subtotal)}`);
    window.open(`https://wa.me/50242454160?text=${encodeURIComponent(lines.join('\n'))}`, '_blank');
  }

  const welcomeOptions = categories.filter(c => c !== 'Todos');

  return (
    <div className="min-h-screen text-gray-800 relative bg-[#FFF8FA] overflow-hidden">
      {showWelcome && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-5xl text-center">
            <h2 className="text-2xl md:text-4xl font-extrabold text-gray-800 mb-6 md:mb-10">¡Qué alegría verte! ✨<br/><span className="text-pink-500">¿Qué celebramos hoy? 🎉</span></h2>
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
              {welcomeOptions.map((opt, i) => (
                <button key={opt} onClick={() => handleWelcomeSelection(opt)} className="bg-pink-50 hover:bg-pink-500 hover:text-white text-pink-700 font-bold py-4 rounded-xl transition-colors border border-pink-200 flex flex-col items-center gap-2">
                  <span className="text-2xl">{getEmojiForCategory(opt, i)}</span>
                  <span className="text-xs md:text-sm">{opt}</span>
                </button>
              ))}
            </div>
          </div>
        </div>, document.body
      )}
      <FloatingBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="bg-white shadow-sm sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
            <a href="./" className="flex items-center gap-3 no-underline text-current">
              <img src="./src/logo.png" alt="Logo" className="h-10 sm:h-12 object-contain" />
              <div className="hidden sm:block">
                <div className="text-lg font-bold">Eventos y Celebraciones GT</div>
                <div className="text-xs text-gray-500">De todo para tu fiesta</div>
              </div>
            </a>
            <nav className="flex-grow md:hidden px-2 overflow-x-auto whitespace-nowrap scrollbar-hide">
              {categories.map(c => <button key={c} className={`px-3 py-2 rounded text-sm ${category === c ? 'bg-pink-100 text-pink-700' : ''}`} onClick={() => handleCategoryChange(c)}>{c}</button>)}
            </nav>
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex gap-2">
                {categories.map(c => <button key={c} className={`px-3 py-1.5 rounded-full text-sm ${category === c ? 'bg-pink-500 text-white shadow-md' : ''}`} onClick={() => handleCategoryChange(c)}>{c}</button>)}
              </nav>
              <button onClick={openCart} className="relative p-2 rounded-full bg-white border border-gray-100 shadow-sm">
                <img src="./src/carrito.png" alt="Carrito" className="h-6 w-6" />
                {cart.length > 0 && <span className="absolute -right-1 -top-1 bg-pink-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</span>}
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 py-4 flex-grow">
          <section className="bg-white rounded-lg p-3 shadow-sm mb-4 flex flex-col md:flex-row gap-3">
            <input value={query} onChange={e => setQuery(e.target.value)} className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none focus:border-pink-300" placeholder="Buscar productos... 🔍" />
            <select value={subCategory} onChange={e => { setSubCategory(e.target.value); playBubbleSound(); }} className="border border-gray-200 rounded-lg px-4 py-2 text-sm outline-none">
              {availableSubcategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </section>

          {isLoading ? (
            <div className="p-12 text-center bg-white rounded-xl"><div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-500"></div>Cargando...</div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {filtered.slice(0, 12).map((p, index) => (
                <FadeInOnScroll key={p.id} delay={index * 50}>
                  <article className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full border border-gray-100">
                    <div className="relative">
                      {/* EFECTO GRIS SI ESTÁ AGOTADO */}
                      <ImageWithModal src={p.image} alt={p.name} className={`w-full h-40 sm:h-44 ${p.estado === 'agotado' ? 'grayscale opacity-60' : ''}`} />
                      <div className="absolute left-2 top-2 rounded-full bg-white/95 px-2 py-1 text-[9px] font-bold text-pink-600 shadow-sm z-10">{p.category}</div>
                      
                      {/* ETIQUETAS DE ESTADO */}
                      {p.estado === 'agotado' && <div className="absolute inset-0 flex items-center justify-center bg-black/20 z-20"><span className="bg-gray-700 text-white px-3 py-1 rounded-full text-[10px] font-bold uppercase">Agotado</span></div>}
                      {p.estado === 'nuevo' && <div className="absolute right-2 top-2 z-20"><span className="bg-yellow-400 text-black px-2 py-1 rounded-full text-[9px] font-black uppercase shadow-md">✨ Nuevo</span></div>}
                    </div>
                    
                    <div className="p-3 flex flex-col h-full">
                      <h3 className="font-bold text-sm line-clamp-2 leading-tight">{p.name}</h3>
                      <p className="text-[11px] text-gray-500 mt-1 mb-2">{p.short}</p>
                      <div className="mt-auto">
                        <div className="text-base font-extrabold mb-2">{moneyFmt.format(p.price)}</div>
                        <div className="flex items-center gap-1.5">
                          <div className="flex items-center border border-gray-100 rounded-lg">
                            <button onClick={() => setQuantities({...quantities, [p.id]: Math.max(1, (quantities[p.id]||1) - 1)})} className="w-7 h-7 text-gray-400">-</button>
                            <span className="w-6 text-center text-xs font-bold">{quantities[p.id]||1}</span>
                            <button onClick={() => setQuantities({...quantities, [p.id]: (quantities[p.id]||1) + 1})} className="w-7 h-7 text-gray-400">+</button>
                          </div>
                          <button 
                            onClick={() => { playBubbleSound(); addToCart(p, quantities[p.id]||1); triggerConfetti(); }} 
                            disabled={p.estado === 'agotado'}
                            className={`flex-1 py-1.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all ${p.estado === 'agotado' ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-pink-500 to-rose-400 text-white shadow-sm'}`}
                          >
                            {p.estado === 'agotado' ? 'No disponible' : 'Agregar'}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                </FadeInOnScroll>
              ))}
            </div>
          )}
        </main>

        <footer className="mt-8 py-8 text-center text-xs text-gray-400 space-y-4">
          <div className="flex justify-center gap-6">
            <a href="https://www.facebook.com/profile.php?id=61577446754797" target="_blank" className="text-blue-600 hover:scale-110 transition-transform"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg></a>
            <a href="https://www.instagram.com/eventosycelebracionesgt/" target="_blank" className="text-pink-600 hover:scale-110 transition-transform"><svg className="w-7 h-7" fill="currentColor" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg></a>
          </div>
          <div>© {new Date().getFullYear()} Eventos y Celebraciones GT — Hecho con cariño ✨</div>
        </footer>
      </div>

      {/* Carrito lateral */}
      <div className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-2xl transform ${cartOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 z-[100]`}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="text-lg font-bold">Tu carrito</h3>
          <button onClick={closeCart} className="text-gray-400">Cerrar</button>
        </div>
        <div className="p-4 space-y-4 overflow-auto h-[calc(100%-350px)]">
          {cart.length === 0 ? <div className="text-center text-gray-400 mt-10">Vacío 🛍️</div> : cart.map(p => (
            <div key={p.id} className="flex items-center gap-3">
              <img src={p.image} className="w-12 h-12 rounded object-cover" />
              <div className="flex-1 text-sm font-medium">{p.name}</div>
              <div className="text-xs font-bold text-pink-600">{moneyFmt.format(p.price * p.qty)}</div>
              <button onClick={() => { playBubbleSound(); setCart(cart.filter(x => x.id !== p.id)); }} className="text-red-300">🗑️</button>
            </div>
          ))}
        </div>
        <div className="p-4 border-t absolute bottom-0 w-full bg-white space-y-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
          <input value={customerData.nombre} onChange={e => setCustomerData({...customerData, nombre: e.target.value})} placeholder="Tu nombre..." className="w-full border rounded px-3 py-2 text-sm focus:border-pink-300 outline-none" />
          <input value={customerData.direccion} onChange={e => setCustomerData({...customerData, direccion: e.target.value})} placeholder="Dirección..." className="w-full border rounded px-3 py-2 text-sm focus:border-pink-300 outline-none" />
          <input value={customerData.fecha} onChange={e => setCustomerData({...customerData, fecha: e.target.value})} type="date" className="w-full border rounded px-3 py-2 text-sm focus:border-pink-300 outline-none" />
          <div className="flex justify-between font-bold text-lg"><span>Total</span><span className="text-pink-600">{moneyFmt.format(subtotal)}</span></div>
          <button onClick={openWhatsApp} className="w-full py-3 bg-green-500 text-white rounded-lg font-bold shadow-md hover:bg-green-600">Ordenar por WhatsApp</button>
        </div>
      </div>
    </div>
  );
}

window.DulceriaApp = DulceriaApp;
