/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{html,js}'],
  darkMode: 'class', // Enable dark mode via a CSS class
  theme: {
    extend: {
      colors: {
        primary: '#4F46E5', // Default primary color
        secondary: '#6366F1', // Default secondary color
      },
    },
  },
  plugins: [],
};