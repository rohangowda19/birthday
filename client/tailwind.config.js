/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // "ink" doubles as text-on-light AND background-in-dark-mode
        ink: {
          900: '#1A1A2E',
          800: '#22223B',
          700: '#2E2E4D',
          600: '#3B3B63',
        },
        // "paper" is the light-mode background/surfaces — bright, not muted cream
        paper: {
          50: '#FFF9F0',
          100: '#FFFFFF',
          200: '#FFEEDC',
        },
        // primary accent — vibrant coral instead of muted brass
        brass: {
          400: '#FF8C69',
          500: '#FF6B4A',
          600: '#E8532F',
        },
        // success/paid — bright teal
        forest: {
          500: '#14B8A6',
          600: '#0D9488',
        },
        // reject/expired — clear bright red
        rust: {
          500: '#F87171',
          600: '#EF4444',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        script: ['"Caveat"', 'cursive'],
        body: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        stub: '0 1px 0 rgba(0,0,0,0.03), 0 10px 28px -14px rgba(255,107,74,0.35)',
      },
    },
  },
  plugins: [],
};