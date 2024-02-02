/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.tsx"],
  plugins: [
    require("daisyui")
  ],
  safelist: [
    {
      pattern: /(badge|border)-(info|warning|secondary|neutral|success)/,
    }
  ],
  daisyui: {
    themes: [
      {
        winter: {
          ...require("daisyui/src/theming/themes").winter,
          primary: "#1D4ED8"
        }
      },
      {
        dark: {
          ...require("daisyui/src/theming/themes").night,
          primary: "#1D4ED8"
        }
      }
    ],
  },
}
