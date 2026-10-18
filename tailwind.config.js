/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#fdf8ee',
          100: '#f9edcc',
          200: '#f3d98a',
          300: '#edbe48',
          400: '#e8a620',
          500: '#c97f0d',
          600: '#a6610a',
          700: '#7f480c',
          800: '#5c3310',
          900: '#3d200a',
        }
      }
    }
  },
  plugins: []
}
