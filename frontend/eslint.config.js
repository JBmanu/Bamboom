import pluginVue from 'eslint-plugin-vue'
import {defineConfigWithVueTs, vueTsConfigs} from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier'
import {RASTER_EXTENSIONS} from './common/src/images/rasterFormats.ts'

const APPS = ['player', 'admin']

const RASTER_NEEDS_QUERY = {
    group: RASTER_EXTENSIONS.map((ext) => `**/*.${ext}`),
    message: 'Import images with a query (e.g. "?as=picture") so the pipeline optimizes them.',
}

const COMMON_INTERNALS = {
    group: ['**/common/**', '@bamboom/common/*'],
    message: 'Import from "@bamboom/common" only: its internals are private.',
}

/**
 * @param {string} pkg
 * @param {...{group: string[], message: string}} patterns
 * @returns {import('eslint').Linter.Config}
 */
const restrict = (pkg, ...patterns) => ({
    files: [`${pkg}/src/**/*.{ts,vue}`],
    rules: {'no-restricted-imports': ['error', {patterns: [...patterns, RASTER_NEEDS_QUERY]}]},
})

export default defineConfigWithVueTs(
    // ConfigItemWithExtendsAndVueSupport | ConfigInput['flat/recommended']
    pluginVue.configs['flat/recommended'],
    vueTsConfigs.recommended,
    prettierConfig,
    {ignores: ['**/dist/**', '**/node_modules/**', '**/coverage/**', '**/*.config.ts', '**/*.config.js']},
    restrict('common', {group: APPS, message: 'common is presentation-only: it must never depend on an app.'}),
    ...APPS.map((app) => {
        const others = APPS.filter((other) => other !== app)
        return restrict(
            app,
            {group: others, message: `Apps are independent: ${app} must not import from ${others.join(', ')}.`},
            COMMON_INTERNALS,
        )
    }),
)