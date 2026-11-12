import { inject } from 'vue'
import { AuthService } from './api/authService.ts'
import { authServiceKey } from './authServiceKey.ts'
import { createUnavailableAuthService } from './api/unavailableAuthService.ts'

export const MISSING_AUTH_SERVICE_MESSAGE = '[player-identity] No AuthService was provided: createPlayerApp must call provide(authServiceKey, …).'

/**
 * The AuthService the app provided, for the components of the module. Call it in `setup`, like any `inject`.
 * If none was provided (a wiring mistake), it returns one that always fails, so the screen shows an error banner
 * instead of breaking, and says in the console what is missing.
 */
export function useAuthService(): AuthService {
    // The explicit `undefined` default tells Vue the service may be missing: the message below replaces its warning.
    const providedService = inject(authServiceKey, undefined)
    if (providedService) return providedService
    console.error(MISSING_AUTH_SERVICE_MESSAGE)
    return createUnavailableAuthService()
}
