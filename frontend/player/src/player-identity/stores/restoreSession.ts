import type { AuthService } from '../api/authService.ts'
import type { useSessionStore } from './useSessionStore.ts'

/** Only what restoring needs from the store: the function cannot touch anything else. */
type RestorableSession = Pick<ReturnType<typeof useSessionStore>, 'startSession' | 'endSession' | 'leaveSignedOutKeepingHint'>

/**
 * Asks the server who is signed in and brings the session store to `signedIn` or `signedOut`.
 * It never rejects: the route guard waits for it, so a failure must not block the app.
 */
export async function restoreSession(authService: AuthService, session: RestorableSession): Promise<void> {
    const result = await authService.fetchCurrentPlayer()
    if (!result.ok) {
        // The server did not answer: the person is treated as signed out, but the hint says they probably were not.
        session.leaveSignedOutKeepingHint()
        return
    }
    if (result.value) session.startSession(result.value)
    else session.endSession()
}
