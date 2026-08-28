/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class', '.theme-light'],
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          900: 'rgb(var(--b-900) / <alpha-value>)',
          850: 'rgb(var(--b-850) / <alpha-value>)',
          800: 'rgb(var(--b-800) / <alpha-value>)',
          750: 'rgb(var(--b-750) / <alpha-value>)',
        },
        heading: 'rgb(var(--c-heading) / <alpha-value>)',
        gray: {
          100: 'rgb(var(--g-100) / <alpha-value>)',
          200: 'rgb(var(--g-200) / <alpha-value>)',
          300: 'rgb(var(--g-300) / <alpha-value>)',
          400: 'rgb(var(--g-400) / <alpha-value>)',
          500: 'rgb(var(--g-500) / <alpha-value>)',
          600: 'rgb(var(--g-600) / <alpha-value>)',
          700: 'rgb(var(--g-700) / <alpha-value>)',
        },
        accent: {
          DEFAULT: '#7c3aed',
          light: '#a855f7',
        },
        teal: '#10b981',
        orange: '#f97316',
        blue: '#3b82f6',
        danger: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
      },
      boxShadow: {
        'glow-purple': '0 0 40px -10px rgba(124, 58, 237, 0.55)',
        'glow-teal': '0 0 40px -10px rgba(16, 185, 129, 0.45)',
        'card': '0 1px 0 0 rgba(255,255,255,0.03) inset, 0 10px 30px -15px rgba(0,0,0,0.6)',
      },
      backgroundImage: {
        'gradient-purple': 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
        'blob': 'radial-gradient(40% 40% at 30% 30%, rgba(124,58,237,0.35), transparent), radial-gradient(40% 40% at 70% 60%, rgba(168,85,247,0.25), transparent)',
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-6px)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
