import type { Result } from '../errors/result.ts'
import type { AuthService } from './authService.ts'
import { failures } from '../errors/failures.ts'

const isSessionExpired = (failure: unknown) =>
    typeof failure === 'object' && failure !== null && 'code' in failure && failure.code === failures.sessionExpired.code

/**
 * Wraps a service so that `onSessionExpired` runs whenever any call answers "session expired".
 * The answer is returned unchanged: the caller still sees the failure.
 */
export function notifyWhenSessionExpires(authService: AuthService, onSessionExpired: () => void): AuthService {
    // Adapters are plain objects of closures (no `this`), so the methods can be passed around unbound.
    function watch<Input extends unknown[], Answer extends Result<unknown, unknown>>(call: (...input: Input) => Promise<Answer>) {
        return async (...input: Input): Promise<Answer> => {
            const answer = await call(...input)
            if (!answer.ok && isSessionExpired(answer.failure)) onSessionExpired()
            return answer
        }
    }

    return {
        fetchCurrentPlayer: watch(authService.fetchCurrentPlayer),
        logIn: watch(authService.logIn),
        register: watch(authService.register),
        logOut: watch(authService.logOut),
        requestResetCode: watch(authService.requestResetCode),
        confirmResetCode: watch(authService.confirmResetCode),
        setNewPassword: watch(authService.setNewPassword),
        completeGoogleProfile: watch(authService.completeGoogleProfile)
    }
}
