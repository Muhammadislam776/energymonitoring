/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb', // Electric blue primary accent
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#0f172a', // Deep navy
        },
        navy: {
          900: '#0b132b',
          950: '#070d1e',
        },
        energy: {
          electric: '#2563eb',
          warning: '#f59e0b',
          danger: '#ef4444',
          healthy: '#10b981',
          cyan: '#06b6d4',
          violet: '#8b5cf6',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 25px -5px rgba(15, 23, 42, 0.08), 0 8px 10px -6px rgba(15, 23, 42, 0.04)',
        'glow-blue': '0 0 20px -3px rgba(37, 99, 235, 0.25)',
        'glow-green': '0 0 20px -3px rgba(16, 185, 129, 0.25)',
      }
    },
  },
  plugins: [],
}
