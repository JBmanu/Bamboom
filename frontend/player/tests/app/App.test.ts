import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlayerApp } from '../../src/app/createPlayerApp'

type PlayerApp = Awaited<ReturnType<typeof createPlayerApp>>

// Shared labels of `common`: they show which language the whole app is in.
const ENGLISH_LANGUAGE_LABEL = 'Language'
const ITALIAN_LANGUAGE_LABEL = 'Lingua'

const mountedApps: PlayerApp[] = []

async function mountPlayer() {
    const container = document.createElement('div')
    document.body.append(container)
    const app = await createPlayerApp()
    app.mount(container)
    mountedApps.push(app)
    return container
}

const radioFor = (container: HTMLElement, language: string) => container.querySelector<HTMLInputElement>(`input[type="radio"][value="${language}"]`)!

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

afterEach(() => {
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0
    document.body.innerHTML = ''
})

describe('App', () => {
    it('offers the language switcher, in English by default', async () => {
        const container = await mountPlayer()

        expect(container.textContent).toContain(ENGLISH_LANGUAGE_LABEL)
    })

    it('shows the app in the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const container = await mountPlayer()

        expect(container.textContent).toContain(ITALIAN_LANGUAGE_LABEL)
    })

    it('changes language from the switcher, without reloading', async () => {
        const container = await mountPlayer()
        radioFor(container, languages.it).click()
        await vi.waitFor(() => expect(container.textContent).toContain(ITALIAN_LANGUAGE_LABEL))

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
    })
})
