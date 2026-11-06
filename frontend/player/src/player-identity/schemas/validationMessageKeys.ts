/** Message keys of the validation errors. The schemas carry keys, not texts: the screen translates them. */
export const validationMessageKeys = {
    required: 'playerIdentity.validation.required',
    emailInvalid: 'playerIdentity.validation.emailInvalid',
    usernameTooShort: 'playerIdentity.validation.usernameTooShort',
    usernameTooLong: 'playerIdentity.validation.usernameTooLong',
    usernameCharacters: 'playerIdentity.validation.usernameCharacters',
    passwordTooShort: 'playerIdentity.validation.passwordTooShort',
    passwordTooLong: 'playerIdentity.validation.passwordTooLong',
    passwordConfirmationMismatch: 'playerIdentity.validation.passwordConfirmationMismatch',
    codeFormat: 'playerIdentity.validation.codeFormat'
} as const
