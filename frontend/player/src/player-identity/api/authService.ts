import { failures } from '../errors/failures'
import type { Result } from '../errors/result'
import type { ValidationFailure } from '../errors/validationFailure'
import type { FormValues } from '../schemas/formSchemas'

/** Who is signed in, as the screens need to know it. */
export type Player = {
    readonly username: string
    readonly email: string
}

/** The two places the person can end up after the trip to Google. */
export const googleSignInStatuses = { signedIn: 'signedIn', profileToComplete: 'profileToComplete' } as const

/** What the person is left with after the trip to Google. */
export type GoogleSignInOutcome =
    | { readonly status: typeof googleSignInStatuses.signedIn; readonly player: Player }
    | { readonly status: typeof googleSignInStatuses.profileToComplete }

/** The profile Google handed over, still waiting for the person to choose a nickname. */
export type PendingGoogleProfile = { readonly email: string }

/** What the server needs to set the new password: the password only. */
export type NewPasswordInput = FormValues['passwordReset']

/** What any call can end with when the server cannot be reached or does not answer as agreed. */
export type ConnectionFailure =
    typeof failures.networkUnreachable | typeof failures.requestTimeout | typeof failures.serverFailure | typeof failures.unexpectedResponse

/**
 * Everything the player app asks of the identity backend. Each method lists the failures it can end with:
 * the compiler makes the screen handle them, and nothing is thrown.
 * The server is the only authority on what is valid: the `ValidationFailure` of a method is its answer, not the form's check.
 */
export interface AuthService {
    /** Asks who is signed in. Nobody signed in is an answer (`undefined`), not a failure. */
    fetchCurrentPlayer(): Promise<Result<Player | undefined, ConnectionFailure>>

    /** Credentials are never told apart: a wrong email and a wrong password end with the same failure. */
    logIn(
        input: FormValues['logIn']
    ): Promise<Result<Player, typeof failures.invalidCredentials | typeof failures.tooManyAttempts | ConnectionFailure>>

    /** Registering also signs the person in. */
    register(
        input: FormValues['register']
    ): Promise<
        Result<
            Player,
            | typeof failures.emailAlreadyRegistered
            | typeof failures.usernameAlreadyTaken
            | typeof failures.tooManyAttempts
            | ValidationFailure<'username' | 'email' | 'password'>
            | ConnectionFailure
        >
    >

    logOut(): Promise<Result<void, ConnectionFailure>>

    /** Always answers the same, whether the email is registered or not. */
    requestResetCode(input: FormValues['codeRequest']): Promise<Result<void, typeof failures.tooManyAttempts | ConnectionFailure>>

    /** The server remembers which reset is pending: the screen sends the code only. */
    confirmResetCode(
        input: FormValues['codeConfirmation']
    ): Promise<
        Result<void, typeof failures.resetCodeInvalid | typeof failures.resetCodeExpired | typeof failures.tooManyAttempts | ConnectionFailure>
    >

    /** Only accepted for a short time after the code was confirmed: later, the person must start the reset again. */
    setNewPassword(
        input: NewPasswordInput
    ): Promise<
        Result<void, typeof failures.resetNotConfirmed | typeof failures.resetProofExpired | ValidationFailure<'password'> | ConnectionFailure>
    >

    /**
     * The whole trip to Google as one answer. The HTTP adapter will redirect and bring the outcome back (feature 18),
     * so the port promises the outcome, not how it travels.
     */
    continueWithGoogle(): Promise<Result<GoogleSignInOutcome, typeof failures.googleSignInCancelled | ConnectionFailure>>

    /** The profile still waiting for a nickname. Nobody waiting is an answer (`undefined`), not a failure. */
    fetchPendingGoogleProfile(): Promise<Result<PendingGoogleProfile | undefined, ConnectionFailure>>

    /** Forgets the pending profile because the person left the Google step. Having none is not a failure. */
    cancelGoogleProfile(): Promise<Result<void, ConnectionFailure>>

    /** Google gives no username: the person chooses it. */
    completeGoogleProfile(
        input: FormValues['googleProfile']
    ): Promise<
        Result<Player, typeof failures.usernameAlreadyTaken | typeof failures.sessionExpired | ValidationFailure<'username'> | ConnectionFailure>
    >
}
