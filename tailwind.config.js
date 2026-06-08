/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Using class strategy for theme toggle
  theme: {
    extend: {
      colors: {
        obsidian: '#0B0F19',
        slate: {
          light: '#F8FAFC',
          dark: '#0F172A',
          panels: '#1E293B',
          textDark: '#94A3B8',
          borderDark: '#334155'
        },
        cyan: {
          accent: '#06B6D4'
        }
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
