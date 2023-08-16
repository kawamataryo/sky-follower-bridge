/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  darkMode: "class",
  content: ["./src/**/*.tsx"],
  plugins: [
    require("daisyui")
  ],
  daisyui: {
    themes: [
      {
        winter: {
          ...require("daisyui/src/theming/themes")["[data-theme=winter]"],
          primary: "#1D4ED8"
        }
      },
    ]
  },
}
