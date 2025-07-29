/** @type {import('tailwindcss').Config} */
//const colors = require('tailwindcss/colors')

export default {
  mode: 'jit',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}", 
  ],
  theme: {
    extend: {
      colors: {
        primary: '#161616',
        gray: {
          100: '#454747',
          200: '#2d2e2e',
          300: '#454747',
          400: '#747777',
          500: '#a2a7a7ff',
        },
        secondary: '#1d1d1d',
      },
      transitionDuration: {
        410: '410ms',
      },
      fontFamily: {
        body: ['Figtree']
      },
      fontWeight: {
        'extraBold': 1000,
      },
      height: {
        '28.5': '30rem',
      }
    },
  },
  plugins: [],
}