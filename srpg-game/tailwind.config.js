/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        game: {
          cursor: '#3b82f6',
          moveable: '#22c55e',
          attackable: '#ef4444',
          player: '#3b82f6',
          enemy: '#ef4444',
          ally: '#22c55e',
        }
      }
    },
  },
  plugins: [],
}

