import './main.css'
import { createPlayerApp } from './app/createPlayerApp'
import { createDemoAuthService } from './player-identity'

const app = await createPlayerApp(import.meta.env.DEV ? { authService: createDemoAuthService() } : {})
app.mount('#app')
