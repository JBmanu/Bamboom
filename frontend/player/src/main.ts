import './main.css'
import { createPlayerApp } from './app/createPlayerApp'

const app = await createPlayerApp()
app.mount('#app')
