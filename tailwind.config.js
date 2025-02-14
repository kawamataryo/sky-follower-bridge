/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: "jit",
  content: ["./src/**/*.tsx"],
  plugins: [
    require("daisyui")
  ],
  safelist: [
    {
      pattern: /(badge|border|bg|text|border-b)-(info|warning|secondary|neutral|success)/,
    },
    {
      pattern: /(link)/,
    },
    {
      pattern: /(text-\dxl)/,
    },
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
  theme: {
    extend: {
      keyframes: {
        drillDown: {
          '0%': {
            transform: 'translateY(-20px) scale(0.95)',
            opacity: '0',
            zIndex: '0'
          },
          '100%': {
            transform: 'translateY(0) scale(1)',
            opacity: '1',
            zIndex: '10'
          }
        }
      },
      animation: {
        'drill-down': 'drillDown 0.5s ease-in-out forwards'
      }
    }
  }
}
