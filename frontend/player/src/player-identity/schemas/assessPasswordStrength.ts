/** Matches the levels of `VStrengthMeter`: 0 (very weak) to 4 (very strong). */
export type PasswordStrengthLevel = 0 | 1 | 2 | 3 | 4

let checkerReady: ReturnType<typeof buildChecker> | undefined

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
    checkerReady ??= buildChecker() // one shared promise: concurrent calls load the dictionaries once
    const checker = await checkerReady
    return checker.check(password, [...personalInputs]).score
}
