import { afterEach } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createPlayerApp } from '../../src/app/createPlayerApp'
import { useResetFlowStore, useSessionStore } from '../../src/player-identity'
import { AuthService } from '../../src/player-identity/api/authService.ts'
import { NEW_PASSWORD_PATH } from '../../src/player-identity/routePaths.ts'
import { waitForPageSwap } from './waitForPageSwap.ts'

type PlayerApp = Awaited<ReturnType<typeof createPlayerApp>>

const mountedApps: PlayerApp[] = []

afterEach(() => {
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0
    document.body.innerHTML = ''
})

type MountOptions = {
    authService?: AuthService
    /** False to look at the page while the first one is still being decided (the session is being restored). */
    waitsForFirstPage?: boolean
}

/** Mounts the whole app as a browser would: the person "opens" `startPath`, signed out unless the service says otherwise. */
export async function mountPlayer(startPath = '/', { authService, waitsForFirstPage = true }: MountOptions = {}) {
    const history = createMemoryHistory()
    history.replace(startPath)
    const container = document.createElement('div')
    document.body.append(container)
    const app = await createPlayerApp({ history, authService })
    app.mount(container)
    mountedApps.push(app)
    if (waitsForFirstPage) await app.config.globalProperties.$router.isReady()
    return { container, app, router: app.config.globalProperties.$router }
}

/** Signs the person in, then opens `path`: what a successful login will do. */
export async function signInAndOpen(app: PlayerApp, path: string) {
    const ada = { username: 'ada', email: 'ada@example.com' }
    useSessionStore(app.config.globalProperties.$pinia).startSession(ada)
    await app.config.globalProperties.$router.push(path)
}

/** Takes the reset flow to the confirmed code, then opens the new password page: what the code step does on success. */
export async function openNewPasswordPage(app: PlayerApp, resetEmail = 'ada@example.com') {
    const resetFlow = useResetFlowStore(app.config.globalProperties.$pinia)
    resetFlow.markCodeRequested(resetEmail)
    resetFlow.markCodeConfirmed()
    await app.config.globalProperties.$router.push(NEW_PASSWORD_PATH)
    await waitForPageSwap()
}
