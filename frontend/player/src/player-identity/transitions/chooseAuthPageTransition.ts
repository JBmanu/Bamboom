import { LOGIN_PATH, REGISTER_PATH } from '../routePaths.ts'

export type AuthPageTransition = 'card-flip' | 'card-fade'

const FLIPPING_PATHS: readonly string[] = [LOGIN_PATH, REGISTER_PATH]

/**
 * Chooses how the access card changes between two pages.
 * Only login and register flip: people go back and forth between them, like the two sides of a card. Elsewhere a quieter fade is enough.
 */
export function chooseAuthPageTransition(leftPath: string, openedPath: string): AuthPageTransition {
    const isBetweenFlippingPages = [leftPath, openedPath].every((path) => FLIPPING_PATHS.includes(path))
    return isBetweenFlippingPages ? 'card-flip' : 'card-fade'
}
