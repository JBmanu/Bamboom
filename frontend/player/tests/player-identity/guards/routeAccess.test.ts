import { describe, expectTypeOf, it } from 'vitest'
import type { RouteMeta } from 'vue-router'
import type { RouteAccess } from '../../../src/player-identity/guards/routeAccess'

describe('routeAccess', () => {
    it('accepts only the three known access levels', () => {
        expectTypeOf<RouteAccess>().toEqualTypeOf<'anyone' | 'signedInOnly' | 'signedOutOnly'>()
    })

    it('types the access of a route as an optional access level', () => {
        expectTypeOf<RouteMeta['access']>().toEqualTypeOf<RouteAccess | undefined>()
    })
})
