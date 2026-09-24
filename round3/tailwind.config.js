/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
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
    },
  },
  plugins: [],
}
