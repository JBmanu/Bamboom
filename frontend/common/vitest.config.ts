import { coverageConfigDefaults, defineConfig } from 'vitest/config'
import { iconsPlugin } from './src/icons/iconsPlugin.ts'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
    plugins: [vue(), iconsPlugin()],
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
        },
    },
})