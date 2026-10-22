import { fileURLToPath } from 'node:url'
import VueI18nPlugin from '@intlify/unplugin-vue-i18n/vite'

/**
 * Precompiles the vocabulary files at build time, so the app can ship vue-i18n's smaller runtime-only build.
 * Only `<module>/vocabulary/**` files are touched: the app's and the shared one of `common`.
 *
 * @param appSource - the app's `src/` folder, as a URL ending with a slash.
 */
export function translationsPlugin(appSource: URL) {
    return VueI18nPlugin({
        include: [fileURLToPath(new URL('./vocabulary/**', import.meta.url)), fileURLToPath(new URL('./**/vocabulary/**', appSource))]
    })
}
