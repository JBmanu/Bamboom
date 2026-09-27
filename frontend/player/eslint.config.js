// frontend/player/eslint.config.js
//
// ESLint per l'app player (config autonoma).
// defineConfigWithVueTs è l'helper ufficiale che combina
// le regole Vue e TypeScript gestendo correttamente i .vue.
// ESLint = qualità del codice; formattazione delegata a Prettier.

import pluginVue from 'eslint-plugin-vue'
import { defineConfigWithVueTs, vueTsConfigs } from '@vue/eslint-config-typescript'
import prettierConfig from 'eslint-config-prettier'

export default defineConfigWithVueTs(
    // Regole essenziali per Vue 3 (analisi dei <template>)
    pluginVue.configs['flat/recommended'],
    // Regole raccomandate per TypeScript in contesto Vue
    vueTsConfigs.recommended,
    // Spegne le regole di formattazione ESLint che confliggono con Prettier.
    // Va per ultimo per avere la precedenza.
    prettierConfig,
    // Cartelle/file da ignorare
    {
        ignores: ['dist/**', 'node_modules/**', '*.config.ts', '*.config.js']
    }
)