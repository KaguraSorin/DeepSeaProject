import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        midnight: '#191B41',
        indigo: '#3C3B80',
        aurora: '#9373BC',
        cyan: '#5EE7FF',
        mint: '#7BFFCB',
        coral: '#FF8FA3',
        lemon: '#FFE066',
        'text-1': '#F7F4FF',
        'text-2': '#C9C4E6',
      },
      fontFamily: {
        sans: [
          'var(--font-sans)',
          'PingFang SC',
          'Hiragino Sans GB',
          'Microsoft YaHei',
          'system-ui',
          'sans-serif',
        ],
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        glass: '0 8px 32px rgba(9, 10, 30, 0.45)',
        glow: '0 0 24px rgba(147, 115, 188, 0.45)',
        'glow-cyan': '0 0 24px rgba(94, 231, 255, 0.45)',
        'glow-mint': '0 0 22px rgba(123, 255, 203, 0.4)',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        breathe: {
          '0%, 100%': { opacity: '0.55', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.06)' },
        },
        drift: {
          '0%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(4%, -3%, 0) scale(1.08)' },
          '66%': { transform: 'translate3d(-3%, 4%, 0) scale(0.96)' },
          '100%': { transform: 'translate3d(0,0,0) scale(1)' },
        },
        rise: {
          '0%': { transform: 'translateY(0)', opacity: '0' },
          '10%': { opacity: '0.7' },
          '100%': { transform: 'translateY(-110vh)', opacity: '0' },
        },
        shimmer: {
          '0%': { backgroundPosition: '0% 50%' },
          '100%': { backgroundPosition: '200% 50%' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        breathe: 'breathe 3.2s ease-in-out infinite',
        drift: 'drift 26s ease-in-out infinite',
        rise: 'rise 18s linear infinite',
        shimmer: 'shimmer 6s linear infinite',
        'fade-up': 'fade-up 0.6s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;