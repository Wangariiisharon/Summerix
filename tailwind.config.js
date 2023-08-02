/** @type {import('tailwindcss').Config} */
<<<<<<< HEAD
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
=======
const defaultTheme= require('tailwindcss/defaultTheme')
module.exports = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx}",
        "./pages/**/*.{js,ts,jsx,tsx}",
        "./components/**/*.{js,ts,jsx,tsx}",

        // Or if using `src` directory:
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                'yellow': '#FFC107',
                'light-yellow': '#FFF0C5',
                'light-pink': '#FFBFB8',
                'b-white': '#FAFAFB',
                'crimson-red': '#EF6454',
                //green variants
                'light-green': 'rgba(79, 209, 197, 0.3);',
                'd-green': '#4FD1C5',
                'dd-green':'#3BB0A6',
                'pill-green': '#B9F3EE',
                //grey variants
                'grey': '#EFF1F9',
                'b-gray': '#D9E2F6',
                //blue variants
                'll-blue': '#C9E2FF',
                'light-blue': '#B9F3EE',
                'd-blue': '#065AD8',
                'pill-blue': '#A8D1FF',
                't-blue': '#4945FF',
                //blacks
                'f-black': '#030229'

            },
            fontFamily: {
                'sans': ['Nunito', ...defaultTheme.fontFamily.sans]
            },
            backgroundImage: {
               'truck': '/truck.png'
            }

        },
    },
    plugins: [
        require('@tailwindcss/forms'),
        require('@headlessui/tailwindcss')

    ],
>>>>>>> origin/develop
}
