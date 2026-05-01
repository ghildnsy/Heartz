/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      colors: {
        primary: {
          50: '#f0f4ff',
          100: '#dbe4ff',
          200: '#bac8ff',
          300: '#88a4ff',
          400: '#6c8cff',
          500: '#5a7cff',
          600: '#4563db',
          700: '#3b52b5',
          800: '#2e408f',
          900: '#1e2d6d',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '16px',
        '3xl': '20px',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        'cta-slide-up': {
          from: { opacity: '0', transform: 'translateY(16px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 3s ease-in-out infinite',
        'cta-slide-up': 'cta-slide-up 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      },
      boxShadow: {
        // untuk menyamai shadow khusus yang sebelumnya ditulis manual
        'primary-sm': '0 2px 8px rgba(108, 140, 255, 0.3)',
        'primary-md': '0 2px 10px rgba(108, 140, 255, 0.35)',
        'primary-md-strong': '0 2px 10px rgba(108, 140, 255, 0.5)',
        'primary-lg': '0 4px 16px rgba(108, 140, 255, 0.35)',
        'primary-xl': '0 6px 24px rgba(108, 140, 255, 0.4)',
        'primary-2xl': '0 10px 32px rgba(108, 140, 255, 0.5)',
        'primary-card': '0 8px 24px rgba(108, 140, 255, 0.15)',
        'primary-card-dark': '0 8px 24px rgba(108, 140, 255, 0.25)',
        'primary-selected': '0 4px 20px rgba(108, 140, 255, 0.35)',
        'black-soft': '0 8px 24px rgba(0, 0, 0, 0.06)',
        'black-soft-dark': '0 8px 24px rgba(0, 0, 0, 0.3)',
      },
    },
  },
  plugins: [],
};