/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        theme: "#018E6F",
        themeDark: "#0A1816",
        themeLight: "#75FCDC",
      },
    },
  },
  plugins: [],
};
