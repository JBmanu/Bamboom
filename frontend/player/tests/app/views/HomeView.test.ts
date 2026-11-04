import { LANGUAGE_STORAGE_KEY } from '@bamboom/common'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mountPlayer, signInAndOpen } from '../../utils/mountPlayer'

beforeEach(() => localStorage.removeItem(LANGUAGE_STORAGE_KEY))

describe('HomeView', () => {
    it('welcomes a signed-in person', async () => {
        const { container, app } = await mountPlayer('/login')

        await signInAndOpen(app, '/')

        await vi.waitFor(() => expect(container.querySelector('h1')?.textContent).toBe('Welcome to Bamboom'))
    })
})
