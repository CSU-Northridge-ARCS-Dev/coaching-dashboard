/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: theme => ({
        'gradient-radial': 'radial-gradient(ellipse at center, black 0%, red 100%)'
      })
    },
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
  prefix: "tw-",
};
