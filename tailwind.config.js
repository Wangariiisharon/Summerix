/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        // primary: '#065AD8' 'C9DCF8',
        primary: '#1C1967',
        // secondary: '#4FD1C5',
        secondary: '#1C1967',
        accent: '#030229',
        danger: '#C80815',
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@headlessui/tailwindcss')],
};
