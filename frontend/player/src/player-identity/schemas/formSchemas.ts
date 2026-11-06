import { z } from 'zod'
import { validationMessageKeys as messageKeys } from './validationMessageKeys'

const USERNAME_MIN_LENGTH = 3
const USERNAME_MAX_LENGTH = 20
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 128
const RESET_CODE_LENGTH = 6

// A missing or non-text value is reported as "required" too, instead of Zod's English default message.
const textSchema = z.string({ error: messageKeys.required })

// Checks run in the order they are written and the form shows the first message: "required" must come first.
const emailSchema = textSchema
    .trim()
    .min(1, { error: messageKeys.required })
    .pipe(z.email({ error: messageKeys.emailInvalid }))

const usernameSchema = textSchema
    .trim()
    .min(1, { error: messageKeys.required })
    .min(USERNAME_MIN_LENGTH, { error: messageKeys.usernameTooShort })
    .max(USERNAME_MAX_LENGTH, { error: messageKeys.usernameTooLong })
    .regex(/^[A-Za-z0-9_]+$/, { error: messageKeys.usernameCharacters })

/** The password being chosen: it must follow the rules. Not trimmed, spaces are part of a password. */
const newPasswordSchema = textSchema
    .min(1, { error: messageKeys.required })
    .min(PASSWORD_MIN_LENGTH, { error: messageKeys.passwordTooShort })
    .max(PASSWORD_MAX_LENGTH, { error: messageKeys.passwordTooLong })

/** The password typed at the login: only presence is checked, so the rules can change without locking people out. */
const currentPasswordSchema = textSchema.min(1, { error: messageKeys.required })

const resetCodeSchema = textSchema.trim().regex(new RegExp(`^\\d{${RESET_CODE_LENGTH}}$`), { error: messageKeys.codeFormat })

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
            passwordConfirmation: z.string({ error: messageKeys.required }).min(1, { error: messageKeys.required })
        })
        .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
            error: messageKeys.passwordConfirmationMismatch,
            path: ['passwordConfirmation'] // the message belongs under the second field, not to the form
        }),

    /** Google gives no username: the person chooses it, with the same rules as in the registration. */
    googleProfile: z.object({ username: usernameSchema })
}
