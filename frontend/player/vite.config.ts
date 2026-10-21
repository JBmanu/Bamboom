import {coverageConfigDefaults, defineConfig} from 'vitest/config'
import tailwindcss from '@tailwindcss/vite'
import {imagePipelinePlugin, themeInitPlugin} from '@bamboom/common/vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue(), tailwindcss(), themeInitPlugin(), imagePipelinePlugin(new URL('./resource/', import.meta.url))],
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
                'src/main.ts', 'src/**/index.ts', 'src/**/*.d.ts', 'src/tests/**', 'src/**/*.css'],
            thresholds: {lines: 80, functions: 80, statements: 80, branches: 70},
        }
    }

})