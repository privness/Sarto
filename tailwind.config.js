/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        sand: {
          50: '#faf8f5', 100: '#f5f0ea', 200: '#e8dfd4', 300: '#d4c5b0',
          400: '#bfa88c', 500: '#a68b6b', 600: '#8a7054', 700: '#6b5640',
          800: '#4a3c2e', 900: '#2d2520', 950: '#1a1613'
        },
        accent: { DEFAULT: '#8b6914', light: '#c4a24e' }
      },
      fontFamily: {
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        sans: ['DM Sans', '-apple-system', 'sans-serif']
      }
    }
  },
  plugins: []
};
