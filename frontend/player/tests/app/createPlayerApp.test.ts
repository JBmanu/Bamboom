import { describe, expect, it } from 'vitest'
import { createPlayerApp } from '../../src/app/createPlayerApp.ts'
import { LOGIN_PATH } from '../../src/player-identity/routePaths.ts'
import { createMemoryHistory } from 'vue-router'

describe('createPlayerApp', () => {
    it('sends a signed-out visitor to the login once the first page is decided', async () => {
        const app = await createPlayerApp({ history: createMemoryHistory() })
        await app.config.globalProperties.$router.isReady()

        expect(app.config.globalProperties.$router.currentRoute.value.path).toBe(LOGIN_PATH)
    })
})
