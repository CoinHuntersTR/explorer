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
      },
      borderRadius: {
        DEFAULT: '10px',
      },
      boxShadow: {
        card: '0 4px 20px rgba(0, 0, 0, 0.05)',
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
          'base-100': '#ffffff',
          'base-200': '#f8f9fa',
          'base-300': '#f1f2f4',
          'base-content': '#1f2937',
        },
      },
      {
        dark: {
          ...require('daisyui/src/theming/themes')['[data-theme=dark]'],
          primary: '#666cff',
          'base-100': '#1a1f2e',
          'base-200': '#141824',
          'base-300': '#0f131d',
          'base-content': '#e2e8f0',
        },
      },
    ],
  },
};
