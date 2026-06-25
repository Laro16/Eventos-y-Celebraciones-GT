/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      // Paleta de marca de Eventos y Celebraciones GT.
      // La dejamos centralizada para que todo el sitio (y el panel) use los mismos tonos.
      colors: {
        marca: {
          50:  '#fff5f8',
          100: '#ffe3ee',
          200: '#ffc7dd',
          300: '#ff9cc2',
          400: '#ff5fa0',
          500: '#f43f8e', // principal
          600: '#db2777',
          700: '#b91c63',
          800: '#931550',
          900: '#7a1444',
        },
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', 'sans-serif'],
        // ANTES faltaba esta familia: por eso todas las clases `font-display`
        // (títulos, nombres de producto, etc.) caían en Poppins y NUNCA se veía
        // la tipografía elegante Fraunces, aunque sí se descargaba.
        display: ['Fraunces', 'Georgia', 'serif'],
      },
      // ANTES no existía: `shadow-suave` se usaba en ~10 lugares (tarjetas, botones,
      // header) y no aplicaba ninguna sombra. La definimos con una sombra suave real.
      boxShadow: {
        suave: '0 4px 14px -2px rgba(244, 63, 142, 0.12), 0 2px 6px -2px rgba(0, 0, 0, 0.05)',
      },
    },
  },
  plugins: [],
}
