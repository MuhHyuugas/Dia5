/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7c3aed',
        'primary-dark': '#6d28d9',
        secondary: '#10b981',
        'secondary-dark': '#059669',
        error: '#ef4444',
        surface: '#ffffff',
        background: '#f8fafc',
        'on-surface': '#0f172a',
        'on-surface-variant': '#64748b',
        outline: '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
