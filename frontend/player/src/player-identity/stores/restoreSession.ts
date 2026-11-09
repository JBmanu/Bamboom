import type { AuthService } from '../api/authService.ts'
import type { useSessionStore } from './useSessionStore.ts'

/** Only what restoring needs from the store: the function cannot touch anything else. */
type RestorableSession = Pick<ReturnType<typeof useSessionStore>, 'startSession' | 'endSession'>
/**
 * Asks the server who is signed in and brings the session store to `signedIn` or `signedOut`.
 * It never rejects: the route guard waits for it, so a failure must not block the app.
 */
export async function restoreSession(authService: AuthService, session: RestorableSession): Promise<void> {
    const result = await authService.fetchCurrentPlayer()
    // A failed call also leaves the person signed out: the guard only needs to know whether to let them in.
    const restoredPlayer = result.ok ? result.value : undefined

    if (restoredPlayer) session.startSession(restoredPlayer)
    else session.endSession()
}
