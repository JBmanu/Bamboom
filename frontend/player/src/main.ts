import { createApp } from 'vue'
import App from './App.vue'
import { AppButton } from '@bamboom/common' // temporary, to prove the Docker build

createApp(App).mount('#app')
console.log(AppButton)

// test per ruleset per i tag
