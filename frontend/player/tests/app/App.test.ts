import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { installPopoverStub } from '../utils/installPopoverStub.ts'
import { mountPlayer } from '../utils/mountPlayer.ts'

// What the language button says about the language in use: its accessible name.
const ENGLISH_BUTTON_LABEL = 'Language: English'
const ITALIAN_BUTTON_LABEL = 'Lingua: Italiano'

const languageButtonOf = (container: HTMLElement) => container.querySelector<HTMLButtonElement>('button[aria-controls]')!
const choiceFor = (container: HTMLElement, language: string) => container.querySelector<HTMLButtonElement>(`[popover] button[lang="${language}"]`)!

beforeAll(installPopoverStub)
beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('App', () => {
    it('offers the language switcher, in English by default', async () => {
        const { container } = await mountPlayer()

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ENGLISH_BUTTON_LABEL)
    })

    it('shows the app in the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const { container } = await mountPlayer()

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ITALIAN_BUTTON_LABEL)
    })

    it('changes language from the switcher, without reloading', async () => {
        const { container } = await mountPlayer()
        choiceFor(container, languages.it).click()
        await vi.waitFor(() => expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ITALIAN_BUTTON_LABEL))

        expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe(languages.it)
    })

    it('keeps the toolbar on every page, such as the not-found page', async () => {
        const { container } = await mountPlayer('/nowhere')

        expect(languageButtonOf(container).getAttribute('aria-label')).toBe(ENGLISH_BUTTON_LABEL)
    })

    it('shows the login inside the layout of the access pages', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)

        expect(container.querySelector('[data-layer="content"] img[alt="Bamboom"]')).not.toBeNull()
    })

    it('keeps the access layout away from the not-found page', async () => {
        const { container } = await mountPlayer('/nowhere')

        expect(container.querySelector('img[alt="Bamboom"]')).toBeNull()
    })
})
