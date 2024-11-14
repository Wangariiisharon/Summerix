/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "#065AD8",
        secondary: "#4FD1C5",
        accent: "#030229",
        danger: "#C80815",

        yellow: "#FFC107",
        "light-yellow": "#FFF0C5",
        "light-pink": "#FFBFB8",
        "b-white": "#FAFAFB",
        "crimson-red": "#EF6454",
        //green variants
        "light-green": "rgba(79, 209, 197, 0.3);",
        "d-green": "#4FD1C5",
        "dd-green": "#3BB0A6",
        "pill-green": "#B9F3EE",
        //grey variants
        grey: "#EFF1F9",
        "b-gray": "#D9E2F6",
        //blue variants
        "ll-blue": "#C9E2FF",
        "light-blue": "#B9F3EE",
        "d-blue": "#065AD8",
        "pill-blue": "#A8D1FF",
        "t-blue": "#4945FF",
        //blacks
        "f-black": "#030229",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@headlessui/tailwindcss")],
};
