import { describe, expect, it } from 'vitest'
import {
    COMPLETE_GOOGLE_PROFILE_PATH,
    FORGOT_PASSWORD_PATH,
    LOGIN_PATH,
    NEW_PASSWORD_PATH,
    REGISTER_PATH
} from '../../../src/player-identity/routePaths.ts'
import { chooseAuthPageTransition } from '../../../src/player-identity/transitions/chooseAuthPageTransition.ts'

describe('chooseAuthPageTransition', () => {
    it.each([
        [LOGIN_PATH, REGISTER_PATH],
        [REGISTER_PATH, LOGIN_PATH]
    ])('given the login and the register pages, when the person goes from %s to %s, then the card flips', (leftPath, openedPath) => {
        expect(chooseAuthPageTransition(leftPath, openedPath)).toBe('card-flip')
    })

    it.each([
        [LOGIN_PATH, FORGOT_PASSWORD_PATH],
        [FORGOT_PASSWORD_PATH, LOGIN_PATH],
        [COMPLETE_GOOGLE_PROFILE_PATH, REGISTER_PATH],
        [FORGOT_PASSWORD_PATH, NEW_PASSWORD_PATH]
    ])('given any other pair of access pages, when the person goes from %s to %s, then the card fades', (leftPath, openedPath) => {
        expect(chooseAuthPageTransition(leftPath, openedPath)).toBe('card-fade')
    })
})
