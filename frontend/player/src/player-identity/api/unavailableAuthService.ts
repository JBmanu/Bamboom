import { failures } from '../errors/failures'
import { fail } from '../errors/result'
import type { AuthService } from './authService'

/**
 * An AuthService that can never answer: every call ends with `serverFailure`.
 * It is the safety net for a wiring mistake (the app did not provide a service), never an adapter to choose on purpose:
 * the screens show their error banner instead of breaking.
 */
export function createUnavailableAuthService(): AuthService {
    // Promise.resolve, not an async function: nothing is awaited, and the answer is the same for every method.
    const answerServerFailure = () => Promise.resolve(fail(failures.serverFailure))

    return {
        fetchCurrentPlayer: answerServerFailure,
        logIn: answerServerFailure,
        register: answerServerFailure,
        logOut: answerServerFailure,
        requestResetCode: answerServerFailure,
        confirmResetCode: answerServerFailure,
        setNewPassword: answerServerFailure,
        completeGoogleProfile: answerServerFailure
    }
}
