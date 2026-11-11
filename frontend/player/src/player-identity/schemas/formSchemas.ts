import * as z from 'zod/mini'
import { validationMessageKeys as messageKeys } from './validationMessageKeys'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const RESET_CODE_LENGTH = 6

// Not `minLength(1)`: that check would hand "at least 1" to the message, and "required" has no number to show.
const isNotEmpty = (text: string) => text.length > 0

// zod/mini: the same rules as zod, written as functions passed to `check`, so the bundle keeps only the ones used.
// A missing or non-text value is reported as "required" too, instead of Zod's English default message.
// Checks run in the order they are written and the form shows the first message: "required" must come first.
const requiredText = z.string({ error: messageKeys.required }).check(z.refine(isNotEmpty, { error: messageKeys.required }))
const requiredTrimmedText = z.string({ error: messageKeys.required }).check(z.trim(), z.refine(isNotEmpty, { error: messageKeys.required }))

const emailSchema = z.pipe(requiredTrimmedText, z.email({ error: messageKeys.emailInvalid }))
const usernameSchema = requiredTrimmedText.check(
    z.minLength(USERNAME_MIN_LENGTH, { error: messageKeys.usernameTooShort }),
    z.maxLength(USERNAME_MAX_LENGTH, { error: messageKeys.usernameTooLong }),
    z.regex(/^[A-Za-z0-9_]+$/, { error: messageKeys.usernameCharacters })
)

/** The password being chosen: it must follow the rules. Not trimmed, spaces are part of a password. */
const newPasswordSchema = requiredText.check(
    z.minLength(PASSWORD_MIN_LENGTH, { error: messageKeys.passwordTooShort }),
    z.maxLength(PASSWORD_MAX_LENGTH, { error: messageKeys.passwordTooLong })
)

const resetCodeSchema = z
    .string({ error: messageKeys.required })
    .check(z.trim(), z.length(RESET_CODE_LENGTH, { error: messageKeys.codeLength }), z.regex(/^\d+$/, { error: messageKeys.codeDigitsOnly }))

/** The values each form hands over once it is valid (trimmed where the schema trims): `FormValues['logIn']`. */
export type FormValues = { [Form in keyof typeof formSchemas]: z.output<(typeof formSchemas)[Form]> }

/** One schema for each form of the module, named after what the person is doing. */
export const formSchemas = {
    // The password typed at the login: only presence is checked, so the rules can change without locking people out.
    logIn: z.object({ email: emailSchema, password: requiredText }),
    register: z.object({ username: usernameSchema, email: emailSchema, password: newPasswordSchema }),
    codeRequest: z.object({ email: emailSchema }),
    codeConfirmation: z.object({ code: resetCodeSchema }),
    passwordReset: z.object({ password: newPasswordSchema, passwordConfirmation: requiredText }).check(
        z.refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
            error: messageKeys.passwordConfirmationMismatch,
            path: ['passwordConfirmation'] // the message belongs under the second field, not to the form
        })
    ),
    /** Google gives no username: the person chooses it, with the same rules as in the registration. */
    googleProfile: z.object({ username: usernameSchema })
}
