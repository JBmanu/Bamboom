import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { createPlayerApp } from '../../src/app/createPlayerApp'
import { createMemoryHistory } from 'vue-router'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { installPopoverStub } from "../utils/installPopoverStub.ts";

type PlayerApp = Awaited<ReturnType<typeof createPlayerApp>>

// What the language button says about the language in use: its accessible name.
const ENGLISH_BUTTON_LABEL = 'Language: English'
const ITALIAN_BUTTON_LABEL = 'Lingua: Italiano'

const mountedApps: PlayerApp[] = []

const languageButtonOf = (container: HTMLElement) => container.querySelector<HTMLButtonElement>('button[aria-controls]')!
const choiceFor = (container: HTMLElement, language: string) => container.querySelector<HTMLButtonElement>(`[popover] button[lang="${ language }"]`)!

async function mountPlayer(startPath = '/') {
    const history = createMemoryHistory()
    history.replace(startPath) // where the person "opened" the app
    const container = document.createElement('div')
    document.body.append(container)
    const app = await createPlayerApp({ history })
    app.mount(container)
    mountedApps.push(app)
    return container
}

const radioFor = (container: HTMLElement, language: string) => container.querySelector<HTMLInputElement>(`input[type="radio"][value="${ language }"]`)!

beforeAll(installPopoverStub)
beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))
afterEach(() => {
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0
    document.body.innerHTML = ''
})

describe('App', () => {
    it('offers the language switcher, in English by default', async () => {
        const container = await mountPlayer()

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ENGLISH_BUTTON_LABEL)
    })

    it('shows the app in the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const container = await mountPlayer()

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ITALIAN_BUTTON_LABEL)
    })

    it('changes language from the switcher, without reloading', async () => {
        const container = await mountPlayer()
        choiceFor(container, languages.it).click()
        await vi.waitFor(() => expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ITALIAN_BUTTON_LABEL))

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
    })

    it('keeps the toolbar on every page, such as the not-found page', async () => {
        const container = await mountPlayer('/nowhere')

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ENGLISH_BUTTON_LABEL)
    })

    it('shows the login inside the layout of the access pages', async () => {
        const container = await mountPlayer(LOGIN_PATH)

        expect(container.querySelector('[data-layer="content"] img[alt="Bamboom"]')).not.toBeNull()
    })

    it('keeps the access layout away from the not-found page', async () => {
        const container = await mountPlayer('/nowhere')

        expect(container.querySelector('img[alt="Bamboom"]')).toBeNull()
    })
})
