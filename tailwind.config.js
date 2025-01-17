/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        yes: '#3fb68b',
        no: '#ff5353',
        info: '#00b2ff',
        main: 'var(--text-main)',
        secondary: 'var(--text-secondary)',
        active: 'var(--bg-active)',
        primary: '#4f46e5',
        secondary: '#3b82f6',
        dark: '#2d3748',
      },
      borderRadius: {
        DEFAULT: '10px',
      },
      boxShadow: {
        card: '0 8px 32px rgba(0, 0, 0, 0.1)',
        glass: '0 8px 32px 0 rgba( 31, 38, 135, 0.37 )',
      },
      fontFamily: {
        'sans': ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      backdropBlur: {
        glass: '8px',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          ...require('daisyui/src/theming/themes')['[data-theme=light]'],
          primary: '#666cff',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#666cff',
          'base-100': '#2a334c',
          'base-200': '#252d37'
        },
      },
    ],
  },
};
