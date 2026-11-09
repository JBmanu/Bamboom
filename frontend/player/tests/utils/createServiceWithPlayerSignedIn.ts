import { createFakeAuthService } from '../../src/player-identity/api/fakeAuthService.ts'
import { contractFixtures } from '../player-identity/api/authServiceContract.ts'

const { account } = contractFixtures

/** A fake that already has Ada signed in, as the server would after a login in a previous visit. */
export async function createServiceWithPlayerSignedIn() {
    const authService = createFakeAuthService({ accounts: [account] })
    await authService.logIn({ email: account.email, password: account.password })
    return authService
}
