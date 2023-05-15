/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./src/**/*.tsx"],
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: ["winter"],
  },
}
