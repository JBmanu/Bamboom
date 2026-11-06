import { LANGUAGE_STORAGE_KEY } from '@bamboom/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountPlayer, signInAndOpen } from '../../utils/mountPlayer'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths'

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('HomeView', () => {
    it('welcomes a signed-in person', async () => {
        const { container, app } = await mountPlayer(LOGIN_PATH)

        await signInAndOpen(app, '/')

        await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('Welcome to Bamboom'))
    })
})
