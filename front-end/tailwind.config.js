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
        hz: {
          bg: 'var(--hz-bg)',
          soft: 'var(--hz-bg-soft)',
          ink: 'var(--hz-ink)',
          sub: 'var(--hz-sub)',
          primary: 'var(--hz-primary)',
          primarySoft: 'var(--hz-primary-soft)',
          accent: 'var(--hz-accent)',
          accentSoft: 'var(--hz-accent-soft)',
          good: 'var(--hz-good)',
          warn: 'var(--hz-warn)',
          bad: 'var(--hz-bad)',
          card: 'var(--hz-card)',
          line: 'var(--hz-line)',
          track: 'var(--hz-track)',
          overlay: 'var(--hz-overlay)',
        },
        primary: {
          50: 'var(--hz-primary-soft)',
          100: 'var(--hz-primary-soft)',
          200: 'var(--hz-primary-soft)',
          300: 'var(--hz-accent)',
          400: 'var(--hz-primary)',
          500: 'var(--hz-primary)',
          600: 'var(--hz-primary)',
          700: 'var(--hz-primary)',
          800: 'var(--hz-ink)',
          900: 'var(--hz-ink)',
        },
      },
      borderRadius: {
        xl: '14px',
        '2xl': '16px',
        '3xl': '24px',
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
        'hz-primary': '0 10px 24px color-mix(in srgb, var(--hz-primary) 30%, transparent)',
        'hz-card': '0 12px 28px color-mix(in srgb, var(--hz-ink) 8%, transparent)',
      },
    },
  },
  plugins: [],
};
