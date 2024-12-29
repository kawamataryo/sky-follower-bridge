import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Voices from './components/Voices.vue'
import AppDemo from './components/AppDemo.vue'

/** @type {import('vitepress').Theme} */
export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    app.component('Voices', Voices)
    app.component('AppDemo', AppDemo)
  }
}
