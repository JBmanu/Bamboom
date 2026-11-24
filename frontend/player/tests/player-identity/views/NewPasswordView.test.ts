import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises } from '@vue/test-utils'
import { FORGOT_PASSWORD_PATH, LOGIN_PATH } from '../../../src/player-identity/routePaths.ts'
import { assessPasswordStrength } from '../../../src/player-identity/schemas/assessPasswordStrength.ts'
import {
    findButtonByText,
    findDialog,
    findFieldByLabel,
    findLinkByText,
    findMeter,
    findSubmitButton,
    readFieldError,
    submitForm,
    subtitleOf,
    titleOf,
    typeInto
} from '../../utils/accessPageQueries.ts'
import { mountPlayer, openNewPasswordPage } from '../../utils/mountPlayer.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '@bamboom/common'
import { createFakeAuthService, useResetFlowStore } from '../../../src/player-identity'
import { installDialogStub, pressEscape } from '../../utils/installDialogStub.ts'
import { resetFlowSteps } from '../../../src/player-identity/stores/useResetFlowStore.ts'

vi.mock('../../../src/player-identity/schemas/assessPasswordStrength.ts')

const account = { username: 'ada', email: 'ada@example.com', password: 'correct-horse-9' }
const RESET_EMAIL = account.email
const newPasswordLabel = 'New password'
const newPassword = 'new-password!'
const RESET_CODE = '123456'

async function openPage({ authService = createFakeAuthService({ accounts: [account], resetCode: RESET_CODE }), confirmsOnServer = true } = {}) {
    const { container, app, router } = await mountPlayer(FORGOT_PASSWORD_PATH, { authService })
    if (confirmsOnServer) {
        await authService.requestResetCode({ email: account.email })
        await authService.confirmResetCode({ code: RESET_CODE })
    }
    await openNewPasswordPage(app, RESET_EMAIL)
    await flushPromises()
    return { container, app, router }
}

async function saveNewPassword(container: HTMLElement) {
    await typeInto(findFieldByLabel(container, newPasswordLabel), newPassword)
    await submitForm(container)
}

beforeAll(installDialogStub)

beforeEach(() => {
    vi.mocked(assessPasswordStrength).mockReset()
    vi.mocked(assessPasswordStrength).mockResolvedValue(0)
    localStorage.removeItem(LANGUAGE_STORAGE_KEY)
})

afterEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
})

describe('NewPasswordView', () => {
    it.each([
        [languages.en, 'New password?', 'Choose a new password and get back in the game.'],
        [languages.it, 'Nuova password?', 'Scegli una nuova password e torna in partita.']
    ])('when the page opens, it shows its title and subtitle in %s and inside the access layout', async (language, title, subtitle) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { container } = await openPage()

        expect(titleOf(container)).toBe(title)
        expect(subtitleOf(container)).toBe(subtitle)
    })

    it('when the page opens, the password field is named "password" and offers "new-password" to the password managers', async () => {
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)

        expect(newPasswordField.name).toBe('password')
        expect(newPasswordField.autocomplete).toBe('new-password')
    })

    it('when the page opens, it offers a way back to the login', async () => {
        const { container } = await openPage()
        const link = findLinkByText(container, 'Back to login')

        expect(link?.getAttribute('href')).toBe(LOGIN_PATH)
        expect(container.textContent?.trim()).toContain('Remembered your password?')
    })

    it('when the page opens, the password field has the focus', async () => {
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)

        expect(document.activeElement).toBe(newPasswordField)
    })

    it('when the form is submitted empty, the password is required', async () => {
        const { container } = await openPage()
        const newPasswordField = findFieldByLabel(container, newPasswordLabel)
        await submitForm(container)

        expect(readFieldError(newPasswordField)).toBe('This field is required.')
    })
})

describe('NewPasswordView: the password strength', () => {
    it('when a password is typed, the meter shows the assessed level', async () => {
        const passwordLevel = 3
        vi.mocked(assessPasswordStrength).mockResolvedValue(passwordLevel)
        const { container } = await openPage()
        await typeInto(findFieldByLabel(container, newPasswordLabel), newPassword)

        expect(findMeter(container)?.getAttribute('data-level')).toBe(String(passwordLevel))
    })

    it('when a password is typed, the email of the reset is given as a personal input', async () => {
        const { container } = await openPage()
        await typeInto(findFieldByLabel(container, newPasswordLabel), 'some-password')
        expect(assessPasswordStrength).toHaveBeenLastCalledWith('some-password', [RESET_EMAIL])
    })
})

describe('NewPasswordView: a saved password', () => {
    it('when the new password is saved, the "Password updated" pop-up opens', async () => {
        const { container } = await openPage()
        await saveNewPassword(container)
        const dialog = findDialog(container)

        expect(dialog.hasAttribute('open')).toBe(true)
        expect(dialog.querySelector('h2')?.textContent?.trim()).toBe('Password updated')
    })

    it('when the new password is saved, the reset flow is cleared', async () => {
        const { container, app } = await openPage()
        await saveNewPassword(container)

        expect(useResetFlowStore(app.config.globalProperties.$pinia).step).toBe(resetFlowSteps.idle)
    })

    it.each([
        ['the person clicks "Go to login"', (container: HTMLElement) => findButtonByText(container, 'Go to login').click()],
        ['the person presses Escape', (container: HTMLElement) => pressEscape(findDialog(container))]
    ])('when %s, the login opens once', async (_way, leavePopUp) => {
        const { container, router } = await openPage()
        const replace = vi.spyOn(router, 'replace')
        await saveNewPassword(container)

        leavePopUp(container)

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(LOGIN_PATH))
        expect(replace).toHaveBeenCalledTimes(1)
    })
})

describe('NewPasswordView: a reset that cannot be finished', () => {
    it.each([
        [
            'the proof has expired',
            'The time to choose a new password has run out. Start again.',
            async () => {
                const authService = createFakeAuthService({ accounts: [account], resetCode: RESET_CODE, resetProofLifetimeMs: 1_000 })
                const page = await openPage({ authService })
                // After the code is confirmed on the server, and only then: the lifetime counts from the confirmation.
                // Only Date is faked, so promises keep working.
                vi.useFakeTimers({ toFake: ['Date'] })
                vi.setSystemTime(Date.now() + 1_001)
                return page
            }
        ],
        ['the server does not remember the code', 'Confirm the code before choosing a new password.', () => openPage({ confirmsOnServer: false })]
    ])('when %s, the banner says it and offers to start again', async (_situation, message, openPageInThatSituation) => {
        const { container } = await openPageInThatSituation()

        await saveNewPassword(container)

        expect(container.querySelector('[role="alert"]')?.textContent).toContain(message)
        expect(findButtonByText(container, 'Start again')).not.toBeUndefined()
        expect(findSubmitButton(container).hasAttribute('disabled')).toBe(true)
        expect(findDialog(container).hasAttribute('open')).toBe(false)
    })

    it('when the person starts again, the flow is cleared and the recovery page opens at the email step', async () => {
        const { container, app, router } = await openPage({ confirmsOnServer: false })
        await saveNewPassword(container)

        findButtonByText(container, 'Start again').click()

        await vi.waitFor(() => expect(router.currentRoute.value.path).toBe(FORGOT_PASSWORD_PATH))
        expect(useResetFlowStore(app.config.globalProperties.$pinia).step).toBe(resetFlowSteps.idle)
        await vi.waitFor(() => expect(titleOf(container)).toBe('Boom! Password exploded?'))
    })
})
