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
      },
    },
  },
  plugins: [],
}
