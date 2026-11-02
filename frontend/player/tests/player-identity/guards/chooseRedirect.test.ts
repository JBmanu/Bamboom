import { describe, expect, it } from 'vitest'
import { chooseRedirect } from '../../../src/player-identity/guards/chooseRedirect'
import { accessLevels, type RouteAccess } from '../../../src/player-identity/guards/routeAccess'
import { LOGIN_PATH } from '../../../src/player-identity/routePaths.ts'

const homePath = '/'

describe('chooseRedirect', () => {
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
