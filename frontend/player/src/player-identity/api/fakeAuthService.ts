import { createFailure } from '../errors/failures.ts'
import { fail, succeed, type Result } from '../errors/result.ts'
import type { AuthService, ConnectionFailure, Player } from './authService.ts'

type FakeAccount = {
    readonly username: string
    readonly email: string
    /** Absent for an account created through Google: it can only sign in through Google. */
    password?: string
}

export type FakeAuthServiceOptions = {
    accounts?: readonly FakeAccount[]
    /** The code the fake "sends" by email. */
    resetCode?: string
    resetCodeLifetimeMs?: number
    /** Wrong codes allowed before the pending reset is blocked. */
    maxWrongResetCodes?: number
    /** Time every answer takes, to see the loading states of the screens. */
    latencyMs?: number
}

/** The port, plus the two things only a test double can do. */
export type FakeAuthService = AuthService & {
    /** The next call, whichever it is, ends with this failure; the one after it works again. */
    failNextCall(failure: ConnectionFailure): void
    /** Simulates the person coming back from Google, with a profile still to complete. */
    beginGoogleSignIn(googleEmail: string): void
}

type PendingReset = { readonly email: string; readonly issuedAt: number; wrongCodes: number; confirmed: boolean }

/** An in-memory AuthService: it behaves like the real backend will, so the screens can be built and tested before it exists. */
export function createFakeAuthService({
    accounts = [],
    resetCode = '123456',
    resetCodeLifetimeMs = 10 * 60 * 1000,
    maxWrongResetCodes = 5,
    latencyMs = 0
}: FakeAuthServiceOptions = {}): FakeAuthService {
    const knownAccounts: FakeAccount[] = accounts.map((account) => ({ ...account }))
    let signedInPlayer: Player | undefined
    let pendingReset: PendingReset | undefined
    let pendingGoogleEmail: string | undefined
    let nextCallFailure: ConnectionFailure | undefined

    const findAccountByEmail = (email: string) => knownAccounts.find((account) => account.email === email)
    const isUsernameTaken = (username: string) => knownAccounts.some((account) => account.username === username)
    const toPlayer = ({ username, email }: FakeAccount): Player => ({ username, email })

    // NoInfer: the failures a method can return come from the port, not from the first `fail(...)` found in the body.
    async function answer<Value, Reason>(produceAnswer: () => Result<Value, NoInfer<Reason>>): Promise<Result<Value, Reason | ConnectionFailure>> {
        if (latencyMs > 0) await new Promise((resolve) => setTimeout(resolve, latencyMs))
        if (nextCallFailure) {
            const failure = nextCallFailure
            nextCallFailure = undefined
            return fail(failure)
        }
        return produceAnswer()
    }

    return {
        failNextCall(failure) {
            nextCallFailure = failure
        },

        beginGoogleSignIn(googleEmail) {
            pendingGoogleEmail = googleEmail
        },

        fetchCurrentPlayer: () => answer(() => succeed(signedInPlayer)),

        logIn: ({ email, password }) =>
            answer(() => {
                const account = findAccountByEmail(email)
                // The same failure for an unknown email and a wrong password: the answer must not tell which one it was.
                if (!account || account.password === undefined || account.password !== password) return fail(createFailure('invalid-credentials'))
                signedInPlayer = toPlayer(account)
                return succeed(signedInPlayer)
            }),

        register: ({ username, email, password }) =>
            answer(() => {
                if (findAccountByEmail(email)) return fail(createFailure('email-already-registered'))
                if (isUsernameTaken(username)) return fail(createFailure('username-already-taken'))
                knownAccounts.push({ username, email, password })
                signedInPlayer = { username, email }
                return succeed(signedInPlayer)
            }),

        logOut: () =>
            answer(() => {
                signedInPlayer = undefined
                return succeed(undefined)
            }),

        requestResetCode: ({ email }) =>
            answer(() => {
                // A reset is "pending" for any email, registered or not: the answer, and what follows, must look the same.
                // For an unknown email the empty string means "no account": no code will ever match.
                const emailExists = findAccountByEmail(email) !== undefined
                pendingReset = { email: emailExists ? email : '', issuedAt: Date.now(), wrongCodes: 0, confirmed: false }
                return succeed(undefined)
            }),

        confirmResetCode: ({ code }) =>
            answer(() => {
                if (!pendingReset) return fail(createFailure('reset-code-invalid'))
                if (pendingReset.wrongCodes >= maxWrongResetCodes) return fail(createFailure('too-many-attempts'))
                if (Date.now() - pendingReset.issuedAt > resetCodeLifetimeMs) return fail(createFailure('reset-code-expired'))
                if (pendingReset.email === '' || code !== resetCode) {
                    pendingReset.wrongCodes += 1
                    return fail(createFailure('reset-code-invalid'))
                }
                pendingReset.confirmed = true
                return succeed(undefined)
            }),

        setNewPassword: ({ password }) =>
            answer(() => {
                const account = pendingReset?.confirmed ? findAccountByEmail(pendingReset.email) : undefined
                if (!account) return fail(createFailure('reset-not-confirmed'))
                account.password = password
                pendingReset = undefined
                return succeed(undefined)
            }),

        completeGoogleProfile: ({ username }) =>
            answer(() => {
                if (pendingGoogleEmail === undefined) return fail(createFailure('session-expired'))
                if (isUsernameTaken(username)) return fail(createFailure('username-already-taken'))
                knownAccounts.push({ username, email: pendingGoogleEmail })
                signedInPlayer = { username, email: pendingGoogleEmail }
                pendingGoogleEmail = undefined
                return succeed(signedInPlayer)
            })
    }
}
