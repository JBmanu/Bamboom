/** Matches the levels of `VStrengthMeter`: 0 (very weak) to 4 (very strong). */
export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

let checkerReady: ReturnType<typeof buildChecker> | undefined

// One shared promise: concurrent calls, and a preload followed by a check, load the dictionaries once.
function loadChecker() {
    checkerReady ??= buildChecker()
    return checkerReady
}

/** Starts loading the dictionaries without checking anything: called when the person reaches the password field, so they are ready at the first key. */
export function preloadPasswordStrength(): void {
    // Only a head start: a failure is left to `assessPasswordStrength`, which waits for the same promise.
    loadChecker().catch(() => undefined)
}

// Dynamic imports: the dictionaries are heavy and only needed once the person starts typing a password.
async function buildChecker() {
    const [{ ZxcvbnFactory }, common, english, italian] = await Promise.all([
        import('@zxcvbn-ts/core'),
        import('@zxcvbn-ts/language-common'),
        import('@zxcvbn-ts/language-en'),
        import('@zxcvbn-ts/language-it')
    ])
    return new ZxcvbnFactory({
        graphs: common.adjacencyGraphs,
        translations: english.translations,
        dictionary: { ...common.dictionary, ...english.dictionary, ...italian.dictionary }
    })
}

/** Advisory only: the server decides what is accepted. `personalInputs` (email, nickname) count as guessable words. */
export async function assessPasswordStrength(password: string, personalInputs: readonly string[] = []): Promise<PasswordStrengthLevel> {
    const checker = await loadChecker()
    return checker.check(password, [...personalInputs]).score
}
