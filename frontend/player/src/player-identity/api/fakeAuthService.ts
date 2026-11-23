import { failures } from '../errors/failures.ts'
import { fail, type Result, succeed } from '../errors/result.ts'
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
    /** How long the same email must wait before it can ask for another code. */
    resetCodeResendWaitMs?: number
    /** Wrong codes allowed before the pending reset is blocked. */
    maxWrongResetCodes?: number
    /** Time every answer takes, to see the loading states of the screens. */
    latencyMs?: number
    /** Failed log-ins allowed for one email before its log-in is blocked. */
    maxFailedLogIns?: number
    /** How long the log-in of an email stays blocked once the limit is reached. */
    logInLockoutMs?: number
}

/** The port, plus the two things only a test double can do. */
export type FakeAuthService = AuthService & {
    /** The next call, whichever it is, ends with this failure; the one after it works again. */
    failNextCall(failure: ConnectionFailure): void
    /** Simulates the person coming back from Google, with a profile still to complete. */
    beginGoogleSignIn(googleEmail: string): void
}

/** What the server remembers about the codes of one email: it outlives the pending reset, which another email can replace. */
type ResetAttempts = { readonly requestedAt: number; wrongCodes: number }
/** `email` is the one that was typed, in lower case, whether or not an account has it. */
type PendingReset = { readonly email: string; readonly attempts: ResetAttempts; confirmed: boolean }
type LogInAttempts = { failedLogIns: number; lockedUntil: number }

/** An in-memory AuthService: it behaves like the real backend will, so the screens can be built and tested before it exists. */
export function createFakeAuthService({
    accounts = [],
    latencyMs = 0,
    resetCode = '123456',
    maxWrongResetCodes = 5,
    resetCodeLifetimeMs = 10 * 60 * 1000,
    resetCodeResendWaitMs = 60 * 1000,
    maxFailedLogIns = 5,
    logInLockoutMs = 15 * 60 * 1000
}: FakeAuthServiceOptions = {}): FakeAuthService {
    const knownAccounts: FakeAccount[] = accounts.map((account) => ({ ...account }))
    const logInAttemptsByEmail = new Map<string, LogInAttempts>()
    const resetAttemptsByEmail = new Map<string, ResetAttempts>()

    let signedInPlayer: Player | undefined
    let pendingReset: PendingReset | undefined
    let pendingGoogleEmail: string | undefined
    let nextCallFailure: ConnectionFailure | undefined

    const toComparable = (text: string) => text.toLowerCase()
    const isSameText = (first: string, second: string) => toComparable(first) === toComparable(second)
    const findAccountByEmail = (email: string) => knownAccounts.find((account) => isSameText(account.email, email))
    const isUsernameTaken = (username: string) => knownAccounts.some((account) => isSameText(account.username, username))
    const toPlayer = ({ username, email }: FakeAccount): Player => ({ username, email })
    const isLogInBlocked = (email: string) => (logInAttemptsByEmail.get(toComparable(email))?.lockedUntil ?? 0) > Date.now()

    // Blocked for as long as the code lives: asking again must not hand out a fresh count of wrong codes.
    const isResetBlocked = ({ wrongCodes, requestedAt }: ResetAttempts) =>
        wrongCodes >= maxWrongResetCodes && Date.now() - requestedAt <= resetCodeLifetimeMs

    function recordFailedLogIn(email: string) {
        const comparableEmail = toComparable(email)
        const attempts = logInAttemptsByEmail.get(comparableEmail) ?? { failedLogIns: 0, lockedUntil: 0 }
        attempts.failedLogIns += 1
        if (attempts.failedLogIns >= maxFailedLogIns) {
            attempts.failedLogIns = 0 // once the lockout is over, the count starts again
            attempts.lockedUntil = Date.now() + logInLockoutMs
        }
        logInAttemptsByEmail.set(comparableEmail, attempts)
    }

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
                // Before the credentials: during the lockout even the right password is refused, or the guessing would go on.
                if (isLogInBlocked(email)) return fail(failures.tooManyAttempts)
                const account = findAccountByEmail(email)
                // The same failure for an unknown email and a wrong password: the answer must not tell which one it was.
                if (!account || account.password === undefined || account.password !== password) {
                    recordFailedLogIn(email) // unknown emails count too, or the lockout would tell which emails exist
                    return fail(failures.invalidCredentials)
                }
                logInAttemptsByEmail.delete(toComparable(email))
                signedInPlayer = toPlayer(account)
                return succeed(signedInPlayer)
            }),

        register: ({ username, email, password }) =>
            answer(() => {
                if (findAccountByEmail(email)) return fail(failures.emailAlreadyRegistered)
                if (isUsernameTaken(username)) return fail(failures.usernameAlreadyTaken)
                const newAccount = { username, email: toComparable(email), password }
                knownAccounts.push(newAccount)
                signedInPlayer = toPlayer(newAccount)
                return succeed(signedInPlayer)
            }),

        logOut: () =>
            answer(() => {
                signedInPlayer = undefined
                return succeed(undefined)
            }),

        requestResetCode: ({ email }) =>
            answer(() => {
                // Keyed by the email as typed, registered or not: an unknown email must wait and get blocked exactly like a known one.
                const typedEmail = toComparable(email)
                const previousAttempts = resetAttemptsByEmail.get(typedEmail)
                const mustWait = previousAttempts !== undefined && Date.now() - previousAttempts.requestedAt < resetCodeResendWaitMs
                // A refusal changes nothing: the reset already in progress keeps working and the wait does not restart.
                if (previousAttempts && (mustWait || isResetBlocked(previousAttempts))) return fail(failures.tooManyAttempts)

                const attempts = { requestedAt: Date.now(), wrongCodes: 0 }
                resetAttemptsByEmail.set(typedEmail, attempts)
                pendingReset = { email: typedEmail, attempts, confirmed: false }
                return succeed(undefined)
            }),

        confirmResetCode: ({ code }) =>
            answer(() => {
                if (!pendingReset) return fail(failures.resetCodeInvalid)
                const { attempts } = pendingReset
                if (attempts.wrongCodes >= maxWrongResetCodes) return fail(failures.tooManyAttempts)
                if (Date.now() - attempts.requestedAt > resetCodeLifetimeMs) return fail(failures.resetCodeExpired)
                // An unknown email has no account: no code can match, and the refusal is the same as for a wrong code.
                if (findAccountByEmail(pendingReset.email) === undefined || code !== resetCode) {
                    attempts.wrongCodes += 1
                    return fail(failures.resetCodeInvalid)
                }
                pendingReset.confirmed = true
                return succeed(undefined)
            }),

        setNewPassword: ({ password }) =>
            answer(() => {
                const account = pendingReset?.confirmed ? findAccountByEmail(pendingReset.email) : undefined
                if (!account) return fail(failures.resetNotConfirmed)
                account.password = password
                pendingReset = undefined
                return succeed(undefined)
            }),

        completeGoogleProfile: ({ username }) =>
            answer(() => {
                if (pendingGoogleEmail === undefined) return fail(failures.sessionExpired)
                if (isUsernameTaken(username)) return fail(failures.usernameAlreadyTaken)
                const newAccount = { username, email: toComparable(pendingGoogleEmail) }
                knownAccounts.push(newAccount)
                signedInPlayer = toPlayer(newAccount)
                pendingGoogleEmail = undefined
                return succeed(signedInPlayer)
            })
    }
}
