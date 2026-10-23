import { coverageConfigDefaults, defineConfig } from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import { iconsPlugin, imagePipelinePlugin, themeInitPlugin, translationsPlugin } from '@bamboom/common/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [
        vue(),
        tailwindcss(),
        iconsPlugin(),
        themeInitPlugin(),
        imagePipelinePlugin(new URL('./resource/', import.meta.url)),
        translationsPlugin(new URL('./src/', import.meta.url))
    ],
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: 'http://localhost:8000',
                changeOrigin: true
            }
        }
    },
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'text-summary'],
            reportsDirectory: './coverage',
            include: ['src/**/*.{ts,vue}'],
            exclude: [...coverageConfigDefaults.exclude,
                'src/main.ts', 'src/**/index.ts', 'src/**/*.d.ts', 'src/**/*.css'],
            thresholds: {lines: 80, functions: 80, statements: 80, branches: 70},
        }
    }

})