/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['DM Sans', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        red: {
          25: '#fefefe', // 99% lightness red
        },
        blue: {
          25: '#fefefe', // 99% lightness blue
        },
        yellow: {
          25: '#fefefe', // 99% lightness yellow
        },
        gray: {
          25: '#fefefe', // 99% lightness gray
        }
      }
    },
  },
  plugins: [],
};