/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          900: '#0E1B17',
          800: '#122620',
          700: '#16302A',
          600: '#1D3E36',
        },
        paper: {
          50: '#EDE6D0',
          100: '#F4EFDE',
          200: '#E4DCC0',
        },
        brass: {
          400: '#D9A748',
          500: '#C08A2E',
          600: '#A06F22',
        },
        forest: {
          500: '#3C8562',
          600: '#2F6B4F',
        },
        rust: {
          500: '#C2604D',
          600: '#B14A3B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        stub: '0 1px 0 rgba(0,0,0,0.04), 0 8px 24px -12px rgba(14,27,23,0.35)',
      },
    },
  },
  plugins: [],
};
