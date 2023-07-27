/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#11263C', // normal
        secondary: '#E2EDF8', // light
        accent: '#34B53A', // green
        stats: '#274F79', // slightly light
        slight:'14FFC7'
      },
      fontFamily: {
        sans: ['"Open Sans"', 'sans-serif'],
        body: ['"Open Sans"'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
