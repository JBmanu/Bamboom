import { z } from 'zod'
import { validationMessageKeys as messageKeys } from './validationMessageKeys'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const RESET_CODE_LENGTH = 6

// A missing or non-text value is reported as "required" too, instead of Zod's English default message.
const textSchema = z.string({ error: messageKeys.required })
// Not `.min(1)`: that check would hand "at least 1" to the message, and "required" has no number to show.
const isNotEmpty = (text: string) => text.length > 0

// Checks run in the order they are written and the form shows the first message: "required" must come first.
const emailSchema = textSchema
    .trim()
    .refine(isNotEmpty, { error: messageKeys.required })
    .pipe(z.email({ error: messageKeys.emailInvalid }))

const usernameSchema = textSchema
    .trim()
    .refine(isNotEmpty, { error: messageKeys.required })
    .min(USERNAME_MIN_LENGTH, { error: messageKeys.usernameTooShort })
    .max(USERNAME_MAX_LENGTH, { error: messageKeys.usernameTooLong })
    .regex(/^[A-Za-z0-9_]+$/, { error: messageKeys.usernameCharacters })

/** The password being chosen: it must follow the rules. Not trimmed, spaces are part of a password. */
const newPasswordSchema = textSchema
    .refine(isNotEmpty, { error: messageKeys.required })
    .min(PASSWORD_MIN_LENGTH, { error: messageKeys.passwordTooShort })
    .max(PASSWORD_MAX_LENGTH, { error: messageKeys.passwordTooLong })

/** The password typed at the login: only presence is checked, so the rules can change without locking people out. */
const currentPasswordSchema = textSchema.refine(isNotEmpty, { error: messageKeys.required })

const resetCodeSchema = textSchema
    .trim()
    .length(RESET_CODE_LENGTH, { error: messageKeys.codeLength })
    .regex(/^\d+$/, { error: messageKeys.codeDigitsOnly })

/** One schema for each form of the module, named after what the person is doing. */
export const formSchemas = {
    logIn: z.object({
        email: emailSchema,
        password: currentPasswordSchema
    }),

    register: z.object({
        username: usernameSchema,
        email: emailSchema,
        password: newPasswordSchema
    }),

    codeRequest: z.object({ email: emailSchema }),

    codeConfirmation: z.object({ code: resetCodeSchema }),

    passwordReset: z
        .object({
            password: newPasswordSchema,
            passwordConfirmation: z
                .string({
                    error: messageKeys.required
                })
                .refine(isNotEmpty, { error: messageKeys.required })
        })
        .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
            error: messageKeys.passwordConfirmationMismatch,
            path: ['passwordConfirmation'] // the message belongs under the second field, not to the form
        }),

    /** Google gives no username: the person chooses it, with the same rules as in the registration. */
    googleProfile: z.object({ username: usernameSchema })
}
