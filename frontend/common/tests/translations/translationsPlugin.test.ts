// @vitest-environment node
import { mkdir, mkdtemp, realpath, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, isAbsolute, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { createI18n } from 'vue-i18n'
import { build, type Rolldown } from 'vite'
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest'
import { translationsPlugin } from '../../src/translations/translationsPlugin'
import vue from '@vitejs/plugin-vue'

vi.setConfig({ testTimeout: 60_000, hookTimeout: 60_000 })

const COMMON_ENGLISH_VOCABULARY = fileURLToPath(new URL('../../src/translations/vocabulary/en.ts', import.meta.url))

const LOBBY_ENGLISH = 'lobby-match/vocabulary/en.ts'
const LOBBY_ITALIAN = 'lobby-match/vocabulary/it.ts'
const LOBBY_NOTES = 'lobby-match/notes.ts'
const TYPED_CONSTANT_VOCABULARY = 'typed-constant/vocabulary/en.ts'

/** A made-up app: each key is a path inside its `src/` folder, each value the content of that file. */
const FAKE_APP_FILES: Record<string, string> = {
    [LOBBY_ENGLISH]: `export default { join: { title: 'Join {name}' } }`,
    [LOBBY_ITALIAN]: [`import type en from './en'`, `export default { join: { title: 'Entra {name}' } } satisfies typeof en`].join('\n'),
    [LOBBY_NOTES]: `export default { text: 'plain {text}' }`,
    [TYPED_CONSTANT_VOCABULARY]: [`const en: { title: string } = { title: 'Hello' }`, `export default en`].join('\n')
}

type Messages = Record<string, unknown>

let appSource: string

function translatorFor(language: string, messages: Messages) {
    const { global } = createI18n({ legacy: false, locale: language })
    global.setLocaleMessage(language, messages)
    return global
}

/** Follows `path` through the exported messages, e.g. ('join', 'title'). */
const messageAt = (messages: Messages, ...path: string[]) => path.reduce<unknown>((node, key) => (node as Messages)[key], messages)

/** Bundles one file of the made-up app (or an absolute path) with the plugin, and returns its default export. */
async function bundleDefaultExportOf(file: string): Promise<Messages> {
    const entry = join(appSource, 'entry.ts')
    await writeFile(entry, `export { default } from ${JSON.stringify(isAbsolute(file) ? file : `./${file}`)}`)
    const result = await build({
        root: appSource,
        logLevel: 'silent',
        configFile: false,
        plugins: [vue(), translationsPlugin(pathToFileURL(`${appSource}/`))],
        build: { write: false, rolldownOptions: { input: entry, preserveEntrySignatures: 'exports-only' } }
    })
    const { output } = (Array.isArray(result) ? result[0] : result) as Rolldown.RolldownOutput
    const chunk = output.find((file): file is Rolldown.OutputChunk => file.type === 'chunk')!
    return (await import(`data:text/javascript,${encodeURIComponent(chunk.code)}`)).default
}

beforeAll(async () => {
    // used realpath because macOS work with simbol for path
    appSource = await realpath(await mkdtemp(join(tmpdir(), 'translations-plugin-')))
    await Promise.all(
        Object.entries(FAKE_APP_FILES).map(async ([path, content]) => {
            await mkdir(dirname(join(appSource, path)), { recursive: true })
            await writeFile(join(appSource, path), content)
        })
    )
})

afterAll(() => rm(appSource, { recursive: true, force: true }))

describe('translationsPlugin', () => {
    it('precompiles the vocabulary files of the app, so they still translate', async () => {
        const english = await bundleDefaultExportOf(LOBBY_ENGLISH)

        expect(typeof messageAt(english, 'join', 'title')).not.toBe('string')
        expect(translatorFor('en', english).t('join.title', { name: 'Ann' })).toBe('Join Ann')
    })

    it('accepts a vocabulary written with satisfies', async () => {
        const italian = await bundleDefaultExportOf(LOBBY_ITALIAN)

        expect(typeof messageAt(italian, 'join', 'title')).not.toBe('string')
        expect(translatorFor('it', italian).t('join.title', { name: 'Ann' })).toBe('Entra Ann')
    })

    it('precompiles the shared vocabulary of common wherever the app lives', async () => {
        const english = await bundleDefaultExportOf(COMMON_ENGLISH_VOCABULARY)

        expect(typeof messageAt(english, 'theme', 'label')).not.toBe('string')
    })

    it('leaves files outside a vocabulary folder alone', async () => {
        const notes = await bundleDefaultExportOf(LOBBY_NOTES)

        expect(messageAt(notes, 'text')).toBe('plain {text}')
    })

    it('refuses a vocabulary that is not an object written in place, and says why', async () => {
        await expect(bundleDefaultExportOf(TYPED_CONSTANT_VOCABULARY)).rejects.toThrow(/export default/)
    })
})
