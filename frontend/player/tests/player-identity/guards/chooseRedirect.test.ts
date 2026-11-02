import { describe, expect, it, expectTypeOf } from 'vitest'
import { chooseRedirect, type RouteAccess, accessLevels, LOGIN_PATH } from '../../../src/player-identity/guards/chooseRedirect'

const homePath = '/'

describe('chooseRedirect', () => {
    it('accepts only the three known access levels', () => {
        expectTypeOf<RouteAccess>().toEqualTypeOf<'anyone' | 'signedInOnly' | 'signedOutOnly'>()
    })

    it.each<[RouteAccess | undefined, boolean, string | undefined]>([
        [accessLevels.signedInOnly, false, LOGIN_PATH],
        [accessLevels.signedInOnly, true, undefined],
        [accessLevels.signedOutOnly, true, homePath],
        [accessLevels.signedOutOnly, false, undefined],
        [accessLevels.anyone, false, undefined],
        [accessLevels.anyone, true, undefined],
        [undefined, false, LOGIN_PATH], // a route with no access is treated as signedInOnly
        [undefined, true, undefined]
    ])('access %s, signed in %s → redirect %s', (access, isSignedIn, expectedRedirect) => {
        expect(chooseRedirect({ access, isSignedIn, homePath })).toBe(expectedRedirect)
    })
})
