import { WHATSAPP, BUSINESS_NAME } from '../lib/config'

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-marca-100 bg-white/60">
      <div className="max-w-6xl mx-auto px-5 py-10">
        <div className="flex flex-col items-center text-center gap-4">
          {/* Marca */}
          <div>
            <img
              src="/logo.png"
              alt={BUSINESS_NAME}
              className="h-14 w-14 mx-auto rounded-full ring-2 ring-marca-100 object-contain"
            />
            <p className="font-display text-lg font-700 text-marca-700 mt-2">{BUSINESS_NAME}</p>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Invitaciones digitales, decoración y todo para que tu celebración sea inolvidable.
            </p>
          </div>

          {/* Contacto por WhatsApp */}
          <a
            href={'https://wa.me/' + WHATSAPP}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 text-sm font-bold shadow-md transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 0C5.385 0 0 5.384 0 12.031c0 2.128.552 4.195 1.6 6.015L.231 24l6.096-1.599a11.957 11.957 0 005.704 1.442h.005c6.645 0 12.028-5.385 12.028-12.032C24.064 5.387 18.679 0 12.031 0z" /></svg>
            Escríbenos por WhatsApp
          </a>

          {/* Ubicación (edítala con tu zona/horario) */}
          <p className="text-xs text-gray-400">📍 Guatemala · Pedidos y entregas por WhatsApp</p>

          {/* Redes */}
          <div className="flex justify-center gap-5 pt-2">
            <a href="https://www.facebook.com/profile.php?id=61577446754797" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-marca-500 transition-colors" aria-label="Facebook">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>
            </a>
            <a href="https://www.instagram.com/eventosycelebracionesgt/" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-marca-500 transition-colors" aria-label="Instagram">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z" /></svg>
            </a>
            <a href="https://www.tiktok.com/@eventosycelebraci" target="_blank" rel="noreferrer" className="text-gray-400 hover:text-marca-500 transition-colors" aria-label="TikTok">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 448 512"><path d="M448 209.91a210.06 210.06 0 0 1-122.77-39.25V349.38A162.55 162.55 0 1 1 185 188.31V278.2a74.62 74.62 0 1 0 52.23 71.18V0l88 0a121.18 121.18 0 0 0 1.86 22.17A122.18 122.18 0 0 0 381 102.39a121.4 121.4 0 0 0 67 20.14z" /></svg>
            </a>
          </div>

          <p className="text-xs text-gray-400 pt-2 border-t border-marca-100 w-full">
            © {new Date().getFullYear()} {BUSINESS_NAME} — Hecho con cariño en Guatemala
          </p>
        </div>
      </div>
    </footer>
  )
}
