/** How the screen shows a failure: next to a field, in a banner, or by taking the person to the login. */

const failureMessagesPath = 'playerIdentity.failures.'
const KINDS = { domain: 'domain', transport: 'transport' } as const
const TREATMENT = { field: 'field', banner: 'banner', redirectToLogin: 'redirectToLogin' } as const

export type FailureKind = keyof typeof KINDS
export type FailureTreatment = keyof typeof TREATMENT

// `const` type parameters keep the exact code and treatment as types, so a failure can be narrowed by its `code`.
const domain = <const Code extends string, const Treatment extends FailureTreatment>(code: Code, treatment: Treatment) =>
    ({ code, kind: KINDS.domain, treatment }) as const

const transport = <const Code extends string, const Treatment extends FailureTreatment>(code: Code, treatment: Treatment) =>
    ({ code, kind: KINDS.transport, treatment }) as const

/**
 * Every expected failure, one line each: the name used in the code, the stable code shared with the backend contract
 * (feature 17), and how the screen shows it. The message key is the name under `playerIdentity.failures` in the vocabularies.
 */
const failureDefinitions = {
    invalidCredentials: domain('invalid-credentials', TREATMENT.banner),
    emailAlreadyRegistered: domain('email-already-registered', TREATMENT.field),
    usernameAlreadyTaken: domain('username-already-taken', TREATMENT.field),
    resetCodeInvalid: domain('reset-code-invalid', TREATMENT.field),
    resetCodeExpired: domain('reset-code-expired', TREATMENT.banner),
    tooManyAttempts: domain('too-many-attempts', TREATMENT.banner),
    resetNotConfirmed: domain('reset-not-confirmed', TREATMENT.banner),
    networkUnreachable: transport('network-unreachable', TREATMENT.banner),
    requestTimeout: transport('request-timeout', TREATMENT.banner),
    serverFailure: transport('server-failure', TREATMENT.banner),
    unexpectedResponse: transport('unexpected-response', TREATMENT.banner),
    sessionExpired: transport('session-expired', TREATMENT.redirectToLogin)
}

export type FailureName = keyof typeof failureDefinitions

/** The ready-made failures: `failures.invalidCredentials`, to return, compare and test with, never rebuilt by hand. */
export const failures = Object.fromEntries(
    Object.entries(failureDefinitions).map(([name, definition]) => [name, { ...definition, messageKey: failureMessagesPath + name }])
    // TypeScript sees the entries as plain pairs: the cast gives back the exact type of each failure.
) as { [Name in FailureName]: (typeof failureDefinitions)[Name] & { readonly messageKey: string } }

/** One failure, or only some of them: `Failure<'invalidCredentials' | 'networkUnreachable'>`. */
export type Failure<Name extends FailureName = FailureName> = (typeof failures)[Name]
