const errorValidationPath = 'playerIdentity.validation.'

/** Message keys of the validation errors. The schemas carry keys, not texts: the screen translates them. */
export const validationMessageKeys = {
    required: errorValidationPath + 'required',
    emailInvalid: errorValidationPath + 'emailInvalid',
    usernameTooShort: errorValidationPath + 'usernameTooShort',
    usernameTooLong: errorValidationPath + 'usernameTooLong',
    usernameCharacters: errorValidationPath + 'usernameCharacters',
    passwordTooShort: errorValidationPath + 'passwordTooShort',
    passwordTooLong: errorValidationPath + 'passwordTooLong',
    passwordConfirmationMismatch: errorValidationPath + 'passwordConfirmationMismatch',
    codeLength: errorValidationPath + 'codeLength',
    codeDigitsOnly: errorValidationPath + 'codeDigitsOnly'
} as const
