/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/app/**/*.{js,ts,jsx,tsx,mdx}', './src/components/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        hv: {
          forest: '#041508',
          deep: '#082b14',
          dark: '#133d22',
          mid: '#1e6b3e',
          emerald: '#2d9653',
          bright: '#02832d',
          light: '#74d4a0',
          pale: '#c8f0d8',
          mist: '#e8f8ef',
          gold: '#a8d96a',
          amber: '#6dbf67',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['"Playfair Display"', 'serif'],
      },
    },
  },
  plugins: [],
}
