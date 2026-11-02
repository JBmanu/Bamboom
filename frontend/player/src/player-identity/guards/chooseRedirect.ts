export const LOGIN_PATH = '/login'

export const accessLevels = { anyone: 'anyone', signedInOnly: 'signedInOnly', signedOutOnly: 'signedOutOnly' } as const

export type RouteAccess = (typeof accessLevels)[keyof typeof accessLevels]

type RedirectDecisionInput = {
    access: RouteAccess | undefined
    isSignedIn: boolean
    homePath: string
}

/**
 * Chooses where a navigation must go, or `undefined` to let it through.
 * A route without `access` is treated as `signedInOnly`: forgetting to mark
 * a page must close it, not open it.
 */
export function chooseRedirect({ access = accessLevels.signedInOnly, isSignedIn, homePath }: RedirectDecisionInput): string | undefined {
    if (access === accessLevels.signedInOnly && !isSignedIn) return LOGIN_PATH
    if (access === accessLevels.signedOutOnly && isSignedIn) return homePath
    return undefined
}
