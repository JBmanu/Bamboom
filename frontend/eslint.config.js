import pluginVue from 'eslint-plugin-vue'
import {defineConfigWithVueTs, vueTsConfigs} from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier'

export default defineConfigWithVueTs(
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    prettierConfig,
    {
        ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.config.ts', '**/*.config.js']
    }
)