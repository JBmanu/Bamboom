import {defineConfig} from 'vitest/config'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue()],
    test: {
        environment: 'jsdom',
        globals: true,
        coverage: {
            provider: 'v8',
            reporter: ['lcov', 'text-summary'],
            reportsDirectory: './coverage',
            // include: ['src/**/*.{ts,vue}'],
            // exclude: [...coverageConfigDefaults.exclude, 'src/main.ts', 'src/**/index.ts', 'src/**/*.d.ts'],
            // thresholds: { lines: 80, functions: 80, statements: 80, branches: 70 },
        },
    },
})