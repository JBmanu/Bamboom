import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountPlayer } from '../../utils/mountPlayer'

const FIRST_LOAD_TIMEOUT = 20_000
const UNKNOWN_ADDRESS = '/nowhere'
const wayBackOf = (container: HTMLElement) => container.querySelector<HTMLAnchorElement>('main a')!

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('NotFoundView', () => {
    it('says the page does not exist and offers a way back', async () => {
        const { container } = await mountPlayer(UNKNOWN_ADDRESS)

        expect(container.querySelector('h1')?.textContent).toBe('Page not found')
        expect(wayBackOf(container).textContent?.trim()).toBe('Back to home')
        expect(wayBackOf(container).getAttribute('href')).toBe('/')
    })

    it('speaks Italian when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const { container } = await mountPlayer(UNKNOWN_ADDRESS)

        expect(container.querySelector('h1')?.textContent).toBe('Pagina non trovata')
        expect(wayBackOf(container).textContent?.trim()).toBe('Torna alla home')
    })

    it('takes the way back through the router, without reloading the page', async () => {
        const { container, app } = await mountPlayer(UNKNOWN_ADDRESS)
        const click = new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 })
        wayBackOf(container).dispatchEvent(click)

        expect(click.defaultPrevented).toBe(true) // the router took over from the browser
        await vi.waitFor(() => expect(app.config.globalProperties.$router.currentRoute.value.path).toBe('/login'), { timeout: FIRST_LOAD_TIMEOUT }) // signed out: the home is not for them
    })

    it('moves the focus to the main area when the way back is taken', async () => {
        const { container } = await mountPlayer(UNKNOWN_ADDRESS)
        const main = container.querySelector('main')!
        wayBackOf(container).click()
        await vi.waitFor(() => expect(document.activeElement).toBe(main), { timeout: FIRST_LOAD_TIMEOUT })

        expect(main.getAttribute('tabindex')).toBe('-1')
    })
})
