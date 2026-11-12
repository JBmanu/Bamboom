import type { AuthService } from './authService.ts'
import { createFakeAuthService } from './fakeAuthService.ts'

/** Long enough to see the loading states, short enough not to slow down trying the app. */
export const DEMO_LATENCY_MS = 600

/** The account to sign in with during `npm run dev`. */
export const DEMO_ACCOUNT = { username: 'demo_player', email: 'demo@example.com', password: 'demoPassword1' }

/**
 * The fake with a demo account and some latency, for `npm run dev` only: `main.ts` uses it when Vite says DEV,
 * so it never reaches production. Tests keep the empty fake, which answers at once.
 */
export function createDemoAuthService(): AuthService {
    return createFakeAuthService({ accounts: [DEMO_ACCOUNT], latencyMs: DEMO_LATENCY_MS })
}
