/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./round3/index.html",
    "./round3/src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'cyphora-dark': '#080c06',
        'cyphora-panel': '#0e120c',
        'cyphora-gold': '#dfb125',
        'cyphora-gold-border': '#735a11',
        'cyphora-text': '#eae0c8',
        'cyphora-muted': '#888888',
      },
      animation: {
        'image-pan': 'pan 20s ease-in-out infinite alternate',
      },
      keyframes: {
        pan: {
          '0%': { transform: 'scale(1.0) translate(0, 0)' },
          '100%': { transform: 'scale(1.1) translate(-2%, -2%)' },
        }
      }
    },
  },
  plugins: [],
}
