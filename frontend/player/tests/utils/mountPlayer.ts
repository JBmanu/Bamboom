import { afterEach } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { createPlayerApp } from '../../src/app/createPlayerApp'
import { useSessionStore } from '../../src/player-identity'
import { AuthService } from '../../src/player-identity/api/authService.ts'

type PlayerApp = Awaited<ReturnType<typeof createPlayerApp>>

const mountedApps: PlayerApp[] = []

afterEach(() => {
    mountedApps.forEach((app) => app.unmount())
    mountedApps.length = 0
    document.body.innerHTML = ''
})

type MountOptions = { authService?: AuthService }

/** Mounts the whole app as a browser would: the person "opens" `startPath`, signed out unless the service says otherwise. */
export async function mountPlayer(startPath = '/', { authService }: MountOptions = {}) {
    const history = createMemoryHistory()
    history.replace(startPath)
    const container = document.createElement('div')
    document.body.append(container)
    const app = await createPlayerApp({ history, authService })
    app.mount(container)
    mountedApps.push(app)
    return { container, app, router: app.config.globalProperties.$router }
}

/** Signs the person in, then opens `path`: what a successful login will do. */
export async function signInAndOpen(app: PlayerApp, path: string) {
    const ada = { username: 'ada', email: 'ada@example.com' }
    useSessionStore(app.config.globalProperties.$pinia).startSession(ada)
    await app.config.globalProperties.$router.push(path)
}
