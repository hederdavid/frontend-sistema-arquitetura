/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#9C5D31',
        'secondary': '#2E1B0F',
        'tertiary': '#FF7D2A',
        'pale-rose': '#FDF9F7'
      }
    },
  },
  plugins: [],
}