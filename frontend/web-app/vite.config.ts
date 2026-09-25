// frontend/web-app/vite.config.ts

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    server: {
        port: 5173,          // porta del dev server Vite
        host: true,          // ascolta su tutte le interfacce (serve dentro Docker)

        // PROXY di sviluppo: ogni chiamata a /api viene inoltrata
        // all'API Gateway (porta 8000). Così il frontend chiama
        // sempre "/api/..." senza sapere dove sta il gateway.
        proxy: {
            '/api': {
                target: 'http://localhost:8000',   // API Gateway Express
                changeOrigin: true
            }
        }
    }
})