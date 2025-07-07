/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      backgroundImage: (theme) => ({
        "gradient-radial-1":
          "radial-gradient(circle at 10% 20%, black 0%, red 100%)",
        "gradient-radial-2":
          "radial-gradient(circle at 90% 80%, black 0%, red 100%)",
      }),
    },
  },
  plugins: [require("daisyui")],
  prefix: "tw-",
};
