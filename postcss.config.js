/**
 * @type {import('postcss').ProcessOptions}
 */
module.exports = {
  plugins: {
    'tailwindcss/nesting': 'postcss-nesting',
    tailwindcss: {},
    autoprefixer: {}
  }
}
