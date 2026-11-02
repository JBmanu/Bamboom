export const accessLevels = { anyone: 'anyone', signedInOnly: 'signedInOnly', signedOutOnly: 'signedOutOnly' } as const

export type RouteAccess = (typeof accessLevels)[keyof typeof accessLevels]

declare module 'vue-router' {
    interface RouteMeta {
        /** Who may open the route. A route without `access` is treated as `signedInOnly`. */
        access?: RouteAccess
    }
}
