import type { Failure } from '../errors/failures'
import type { Result } from '../errors/result'
import type { ValidationFailure } from '../errors/validationFailure'
import type { FormValues } from '../schemas/formSchemas'

/** Who is signed in, as the screens need to know it. */
export type Player = {
    readonly username: string
    readonly email: string
}

/** The repeated password is checked on the screen only: it is never sent to the server. */
export type NewPasswordInput = Pick<FormValues['passwordReset'], 'password'>

/** What any call can end with when the server cannot be reached or does not answer as agreed. */
export type ConnectionFailure = Failure<'network-unreachable' | 'request-timeout' | 'server-failure' | 'unexpected-response'>

/**
 * Everything the player app asks of the identity backend. Each method lists the failures it can end with:
 * the compiler makes the screen handle them, and nothing is thrown.
 * The server is the only authority on what is valid: the `ValidationFailure` of a method is its answer, not the form's check.
 */
export interface AuthService {
    /** Asks who is signed in. Nobody signed in is an answer (`undefined`), not a failure. */
    fetchCurrentPlayer(): Promise<Result<Player | undefined, ConnectionFailure>>

    /** Credentials are never told apart: a wrong email and a wrong password end with the same failure. */
    logIn(input: FormValues['logIn']): Promise<Result<Player, Failure<'invalid-credentials' | 'too-many-attempts'> | ConnectionFailure>>

    /** Registering also signs the person in. */
    register(
        input: FormValues['register']
    ): Promise<
        Result<
            Player,
            | Failure<'email-already-registered' | 'username-already-taken' | 'too-many-attempts'>
            | ValidationFailure<'username' | 'email' | 'password'>
            | ConnectionFailure
        >
    >

    logOut(): Promise<Result<void, ConnectionFailure>>

    /** Always answers the same, whether the email is registered or not. */
    requestResetCode(input: FormValues['codeRequest']): Promise<Result<void, Failure<'too-many-attempts'> | ConnectionFailure>>

    /** The server remembers which reset is pending: the screen sends the code only. */
    confirmResetCode(
        input: FormValues['codeConfirmation']
    ): Promise<Result<void, Failure<'reset-code-invalid' | 'reset-code-expired' | 'too-many-attempts'> | ConnectionFailure>>

    setNewPassword(input: NewPasswordInput): Promise<Result<void, Failure<'reset-not-confirmed'> | ValidationFailure<'password'> | ConnectionFailure>>

    /** Google gives no username: the person chooses it. */
    completeGoogleProfile(
        input: FormValues['googleProfile']
    ): Promise<Result<Player, Failure<'username-already-taken' | 'session-expired'> | ValidationFailure<'username'> | ConnectionFailure>>
}
