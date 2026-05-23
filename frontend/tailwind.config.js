/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      animation: {
        'spin-slow': 'spin 12s linear infinite',
      },
      colors: {
        stone: {
          50: '#fafaf9',
          100: '#f5f5f4',
          200: '#e7e5e4',
          700: '#44403c',
          800: '#292524',
          900: '#1c1917',
        },
      },
    },
  },
  plugins: [],
};
