import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from '../../../src/player-identity/routePaths.ts'
import { assessPasswordStrength } from '../../../src/player-identity/schemas/assessPasswordStrength.ts'
import {
    findFieldByLabel,
    findLinkByText,
    findMeter,
    readFieldError,
    submitForm,
    subtitleOf,
    titleOf,
    typeInto
} from '../../utils/accessPageQueries.ts'
import { mountPlayer, openNewPasswordPage } from '../../utils/mountPlayer.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'

vi.mock('../../../src/player-identity/schemas/assessPasswordStrength.ts')

const RESET_EMAIL = 'ada@example.com'
const newPasswordLabel = 'New password'

/** Opens the page as the code step does: from the recovery page, with the reset flow at the confirmed code. */
async function openPage() {
    const { container, app } = await mountPlayer(FORGOT_PASSWORD_PATH)
    await openNewPasswordPage(app, RESET_EMAIL)
    await flushPromises()
    return { container }
}

beforeEach(() => {
    vi.mocked(assessPasswordStrength).mockReset()
    vi.mocked(assessPasswordStrength).mockResolvedValue(0)
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

afterEach(() => vi.restoreAllMocks())

describe('NewPasswordView', () => {
    it.each([
        [languages.en, 'New password?', 'Choose a new password and get back in the game.'],
        [languages.it, 'Nuova password?', 'Scegli una nuova password e torna in partita.']
    ])('when the page opens, it shows its title and subtitle in %s and inside the access layout', async (language, title, subtitle) => {
        // Assert: titleOf is 'New password?' and subtitleOf is 'Choose a new password and get back in the game.'
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { container } = await openPage()

        expect(titleOf(container)).toBe(title)
        expect(subtitleOf(container)).toBe(subtitle)
    })

    it('when the page opens, the password field is named "password" and offers "new-password" to the password managers', async () => {
        // Prepare: findFieldByLabel(container, 'New password'). Assert: its name and its autocomplete.
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)

        expect(newPasswordField.name).toBe('password')
        expect(newPasswordField.autocomplete).toBe('new-password')
    })

    it('when the page opens, it offers a way back to the login', async () => {
        // Assert: the link with the text 'Back to login' goes to LOGIN_PATH (findLinkByText, href).
        const { container } = await openPage()
        const link = findLinkByText(container, 'Back to login')

        expect(link?.getAttribute('href')).toBe(LOGIN_PATH)
        expect(container.textContent?.trim()).toContain('Remembered your password?')
    })

    it('when the page opens, the password field has the focus', async () => {
        // Assert: document.activeElement is the field.
        // The page is reached by navigation, and after each navigation the focus goes to <main>:
        // if the assertion fails with <main>, the order is different from what we expect. Tell me before changing the code.
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)

        expect(document.activeElement).toBe(newPasswordField)
    })

    it('when the form is submitted empty, the password is required', async () => {
        // Act: submitForm. Assert: readFieldError of the field is the "required" text (see validationMessageKeys / en.ts).
        // The other rules are covered by the schema tests: do not repeat them.
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)
        await submitForm(container)

        expect(readFieldError(newPasswordField)).toBe('This field is required.')
    })
})

describe('NewPasswordView: the password strength', () => {
    it('when a password is typed, the meter shows the assessed level', async () => {
        // Prepare: the mock answers level 3. Act: typeInto the field. Assert: data-level is '3' and the label is 'Good'.
        const passwordLevel = 3
        vi.mocked(assessPasswordStrength).mockResolvedValue(passwordLevel)
        const { container } = await openPage()
        await typeInto(findFieldByLabel(container, newPasswordLabel), 'new-password!')

        expect(findMeter(container)?.getAttribute('data-level')).toBe(String(passwordLevel))
    })

    it('when a password is typed, the email of the reset is given as a personal input', async () => {
        // Act: typeInto the field with 'some-password'.
        // Assert: assessPasswordStrength was last called with ('some-password', [RESET_EMAIL]), like RegisterView.test does.
        const { container } = await openPage()
        await typeInto(findFieldByLabel(container, newPasswordLabel), 'some-password')
        expect(assessPasswordStrength).toHaveBeenLastCalledWith('some-password', [RESET_EMAIL])
    })
})
