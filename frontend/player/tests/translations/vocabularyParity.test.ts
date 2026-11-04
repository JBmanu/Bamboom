import { describe, expect, it } from 'vitest'

type Vocabulary = { [key: string]: string | Vocabulary }

const loaded = import.meta.glob<{ default: Vocabulary }>('../../src/*/vocabulary/*.ts', { eager: true })

const PATH_PATTERN = /src\/([^/]+)\/vocabulary\/([^/]+)\.ts$/

const vocabulariesByFolder = new Map<string, Record<string, Vocabulary>>()
for (const [path, module] of Object.entries(loaded)) {
    const [, folder, language] = PATH_PATTERN.exec(path)!
    vocabulariesByFolder.set(folder, { ...vocabulariesByFolder.get(folder), [language]: module.default })
}

/** Every message as [`group.key`, text]. */
function messagesOf(vocabulary: Vocabulary, prefix = ''): Array<[string, string]> {
    return Object.entries(vocabulary).flatMap(([key, value]): Array<[string, string]> =>
        typeof value === 'string' ? [[`${prefix}${key}`, value]] : messagesOf(value, `${prefix}${key}.`)
    )
}

describe.each([...vocabulariesByFolder])('vocabulary of %s', (_folder, vocabularies) => {
    it('exists in English and Italian', () => {
        expect(Object.keys(vocabularies).sort()).toEqual(['en', 'it'])
    })

    it('has the same messages in both languages', () => {
        const keysOf = (language: string) =>
            messagesOf(vocabularies[language])
                .map(([key]) => key)
                .sort()

        expect(keysOf('it')).toEqual(keysOf('en'))
    })

    it('has no empty message', () => {
        const empty = Object.values(vocabularies)
            .flatMap(messagesOf)
            .filter(([, text]) => text.trim() === '')

        expect(empty).toEqual([])
    })
})
