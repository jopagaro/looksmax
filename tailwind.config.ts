import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F2EEE3',
          dark: '#E8E2D2',
        },
        ink: {
          DEFAULT: '#121212',
          soft: '#3A3A3A',
          mute: '#6E6A61',
        },
        pop: {
          DEFAULT: '#FF4D00',
          dark: '#D94100',
          soft: '#FFE8DD',
        },
      },
      fontFamily: {
        sans: ['var(--font-archivo)', '-apple-system', 'system-ui', 'sans-serif'],
        display: ['var(--font-archivo-black)', '-apple-system', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        brutal: '6px 6px 0 #121212',
        'brutal-sm': '4px 4px 0 #121212',
        'brutal-xs': '3px 3px 0 #121212',
        'brutal-pop': '6px 6px 0 #FF4D00',
        'brutal-pressed': '2px 2px 0 #121212',
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scan-line': 'scanLine 2.2s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scanLine: {
          '0%, 100%': { top: '6%' },
          '50%': { top: '92%' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
