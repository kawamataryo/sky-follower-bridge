import DefaultTheme from 'vitepress/theme'
import './custom.css'
import Voices from './components/Voices.vue'
import AppDemo from './components/AppDemo.vue'
import MyLayout from './MyLayout.vue'

/** @type {import('vitepress').Theme} */
export default {
  extends: DefaultTheme,
  Layout: MyLayout,
  enhanceApp({ app }) {
    app.component('Voices', Voices)
    app.component('AppDemo', AppDemo)
  }
}
