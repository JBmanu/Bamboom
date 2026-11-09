/** How the screen shows a failure: next to a field, in a banner, or by taking the person to the login. */

const KINDS = { domain: 'domain', transport: 'transport' } as const
const TREATMENT = { field: 'field', banner: 'banner', redirectToLogin: 'redirectToLogin' } as const

export type FailureKind = keyof typeof KINDS
export type FailureTreatment = keyof typeof TREATMENT
export type FailureCode = keyof typeof failureCatalog

/**
 * One failure, or only some of them: `Failure<'invalid-credentials' | 'network-unreachable'>`.
 * The conditional type spreads over the codes, so checking `failure.code` narrows the rest of the object.
 */
export type Failure<Code extends FailureCode = FailureCode> = Code extends FailureCode
    ? { readonly code: Code } & (typeof failureCatalog)[Code]
    : never

export function createFailure<Code extends FailureCode>(code: Code): Failure<Code> {
    // TypeScript cannot follow the spread through the conditional type, so the cast is needed (the tests cover the result).
    return { code, ...failureCatalog[code] } as Failure<Code>
}

type FailureTemplate = {
    readonly kind: FailureKind
    readonly messageKey: string
    readonly treatment: FailureTreatment
}

const errorFailuresPath = 'playerIdentity.failures.'

/**
 * Every expected failure, in one place. The keys are the stable codes shared with the backend contract (feature 17);
 * message keys and treatments belong to the frontend only.
 */
export const failureCatalog = {
    'invalid-credentials': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'invalidCredentials',
        treatment: TREATMENT.banner
    },
    'email-already-registered': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'emailAlreadyRegistered',
        treatment: TREATMENT.field
    },
    'username-already-taken': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'usernameAlreadyTaken',
        treatment: TREATMENT.field
    },
    'reset-code-invalid': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'resetCodeInvalid',
        treatment: TREATMENT.field
    },
    'reset-code-expired': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'resetCodeExpired',
        treatment: TREATMENT.banner
    },
    'too-many-attempts': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'tooManyAttempts',
        treatment: TREATMENT.banner
    },
    'reset-not-confirmed': {
        kind: KINDS.domain,
        messageKey: errorFailuresPath + 'resetNotConfirmed',
        treatment: TREATMENT.banner
    },
    'network-unreachable': {
        kind: KINDS.transport,
        messageKey: errorFailuresPath + 'networkUnreachable',
        treatment: TREATMENT.banner
    },
    'request-timeout': {
        kind: KINDS.transport,
        messageKey: errorFailuresPath + 'requestTimeout',
        treatment: TREATMENT.banner
    },
    'server-failure': {
        kind: KINDS.transport,
        messageKey: errorFailuresPath + 'serverFailure',
        treatment: TREATMENT.banner
    },
    'unexpected-response': {
        kind: KINDS.transport,
        messageKey: errorFailuresPath + 'unexpectedResponse',
        treatment: TREATMENT.banner
    },
    'session-expired': {
        kind: KINDS.transport,
        messageKey: errorFailuresPath + 'sessionExpired',
        treatment: TREATMENT.redirectToLogin
    }
} as const satisfies Record<string, FailureTemplate>
// `satisfies` checks the shape of every entry; `as const` keeps the exact codes and treatments as types.
