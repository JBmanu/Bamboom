import pluginVue from 'eslint-plugin-vue'
import {defineConfigWithVueTs, vueTsConfigs} from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier'

const restrictImports = (...patterns) => ({
    rules: {'no-restricted-imports': ['error', {patterns}]},
})

const COMMON_INTERNALS = {
    group: ['**/common/**', '@bamboom/common/*'],
    message: 'Import from "@bamboom/common" only: its internals are private.',
}

export default defineConfigWithVueTs(
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    prettierConfig,
    {
        ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.config.ts', '**/*.config.js']
    },
    {
        files: ['common/src/**/*.{ts,vue}'],
        ...restrictImports({
            group: ['player', 'player/**', 'admin', 'admin/**', '**/player/**', '**/admin/**'],
            message: 'common is presentation-only: it must never depend on an app.',
        }),
    },
    {
        files: ['player/src/**/*.{ts,vue}'],
        ...restrictImports(
            {
                group: ['admin', 'admin/**', '**/admin/**'],
                message: 'Apps are independent: player must not import from admin.',
            },
            COMMON_INTERNALS,
        ),
    },
    {
        files: ['admin/src/**/*.{ts,vue}'],
        ...restrictImports(
            {
                group: ['player', 'player/**', '**/player/**'],
                message: 'Apps are independent: admin must not import from player.',
            },
            COMMON_INTERNALS,
        ),
    },
)


