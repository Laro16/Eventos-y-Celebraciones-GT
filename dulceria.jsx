// Componente Image + modal (CARRUSEL MÓVIL Y ANIMACIONES)
function ImageWithModal({ src, images, alt, className = 'w-[72%] max-w-[220px] h-36 mx-auto', imgClass = 'object-contain' }) {
  const [open, setOpen] = useState(false);
  const [isShowing, setIsShowing] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState('right'); // Para saber hacia dónde animar

  // Estados para detectar el deslizamiento del dedo (Swipe)
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const imgArray = images && images.length > 0 ? images : [src];
  const currentImg = imgArray[currentIndex] || imgArray[0];

  useEffect(() => {
    let timeoutId;
    if (open) {
      setCurrentIndex(0);
      setDirection('right');
      timeoutId = setTimeout(() => setIsShowing(true), 50);
    } else {
      setIsShowing(false);
    }
    return () => clearTimeout(timeoutId);
  }, [open]);
  
  // Funciones para cambiar foto
  const nextImg = (e) => { 
    if (e) e.stopPropagation(); 
    setDirection('right');
    setCurrentIndex(prev => (prev + 1) % imgArray.length); 
  };
  const prevImg = (e) => { 
    if (e) e.stopPropagation(); 
    setDirection('left');
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
  const minSwipeDistance = 40; // Distancia mínima para que cuente como deslizamiento

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

    if (isLeftSwipe && imgArray.length > 1) {
      nextImg();
    }
    if (isRightSwipe && imgArray.length > 1) {
      prevImg();
    }
  };

  const modalJsx = open && createPortal(
    <div role="dialog" aria-modal="true" className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4 transition-opacity duration-300 ease-out ${isShowing ? 'opacity-100' : 'opacity-0'}`} onClick={() => setOpen(false)}>
      
      {/* Estilos inyectados para la animación sutil */}
      <style>{`
        @keyframes slideRight {
          0% { opacity: 0.2; transform: translateX(25px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes slideLeft {
          0% { opacity: 0.2; transform: translateX(-25px) scale(0.98); }
          100% { opacity: 1; transform: translateX(0) scale(1); }
        }
        .animate-slide-right { animation: slideRight 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
        .animate-slide-left { animation: slideLeft 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }
      `}</style>

      <div className={`transform transition-all duration-300 ease-out flex flex-col items-center justify-center w-full h-full ${isShowing ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`} onClick={(e) => e.stopPropagation()}>
        
        {/* Contenedor principal que detecta el dedo */}
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
              {/* Botones visibles solo en Computadora (md:block) */}
              <button onClick={prevImg} className="hidden md:block absolute left-0 md:-left-16 z-50 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7"></path></svg>
              </button>
              <button onClick={nextImg} className="hidden md:block absolute right-0 md:-right-16 z-50 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full shadow-lg backdrop-blur-sm transition-transform hover:scale-110">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7"></path></svg>
              </button>
              
              {/* Pistas visuales para teléfono (flechitas transparentes a los lados) */}
              <div className="md:hidden absolute top-1/2 -translate-y-1/2 flex justify-between w-full px-1 pointer-events-none opacity-30">
                 <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                 <svg className="w-8 h-8 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
              </div>

              {/* Indicador de fotos (ej: 1 / 3) */}
              <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 text-white/90 text-sm font-medium tracking-widest bg-black/50 px-4 py-1.5 rounded-full z-50 backdrop-blur-sm">
                {currentIndex + 1} / {imgArray.length}
              </div>
            </>
          )}
          
          {/* La Imagen con la animación de entrada */}
          <img 
            key={currentIndex} // Al cambiar el índice, React reinicia la animación
            src={currentImg} 
            alt={alt} 
            onError={handleImgError} 
            draggable="false"
            className={`max-w-[95vw] max-h-[80vh] object-contain block mx-auto drop-shadow-2xl select-none ${direction === 'right' ? 'animate-slide-right' : 'animate-slide-left'}`} 
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
