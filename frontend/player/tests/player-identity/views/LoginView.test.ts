import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { beforeEach, describe, expect, it } from 'vitest'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths'
import { mountPlayer } from '../../utils/mountPlayer'

const titleOf = (container: HTMLElement) => container.querySelector('[data-layer="content"] h1')?.textContent

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('LoginView', () => {
    it('shows its title inside the layout of the access pages', async () => {
        const { container } = await mountPlayer(LOGIN_PATH)

        expect(titleOf(container)).toBe('Welcome back!')
    })

    it('speaks Italian when Italian is the stored language', async () => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, languages.it)
        const { container } = await mountPlayer(LOGIN_PATH)

        expect(titleOf(container)).toBe('Bentornato!')
    })
})
