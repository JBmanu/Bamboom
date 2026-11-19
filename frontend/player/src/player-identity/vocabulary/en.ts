export default {
    login: {
        title: 'Welcome back!',
        subtitle: 'Ready to make the match {highlight}?',
        subtitleHighlight: 'explode',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submit: 'Log in now',
        botFreeNote: 'No bots, only real bamboo!',
        registerQuestion: 'New to Bamboom?',
        registerLink: 'Create an account'
    },
    register: {
        title: 'Join the explosion!',
        subtitle: 'Create your account and {highlight}!',
        subtitleHighlight: 'start playing',
        nicknameLabel: 'Nickname',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submit: 'Create my account',
        loginQuestion: 'Already have an account?',
        loginLink: 'Log in now'
    },
    failures: {
        invalidCredentials: 'Email or password is incorrect.',
        emailAlreadyRegistered: 'This email is already registered.',
        usernameAlreadyTaken: 'This nickname is already taken.',
        resetCodeInvalid: 'This code is not correct.',
        resetCodeExpired: 'This code has expired. Request a new one.',
        tooManyAttempts: 'Too many attempts. Try again in a few minutes.',
        resetNotConfirmed: 'Confirm the code before choosing a new password.',
        networkUnreachable: 'No connection. Check your network and try again.',
        requestTimeout: 'The server took too long to answer. Try again.',
        serverFailure: 'Something went wrong on our side. Try again later.',
        unexpectedResponse: 'We could not understand the server response. Try again later.',
        sessionExpired: 'Your session has expired. Sign in again.'
    },
    validation: {
        required: 'This field is required.',
        emailInvalid: 'Enter a valid email address.',
        usernameTooShort: 'Nickname must be at least {minimum} characters.',
        usernameTooLong: 'Nickname must be at most {maximum} characters.',
        usernameCharacters: 'Use only letters, numbers and underscores.',
        passwordTooShort: 'Password must be at least {minimum} characters.',
        passwordTooLong: 'Password must be at most {maximum} characters.',
        passwordConfirmationMismatch: 'The passwords do not match.',
        codeLength: 'Enter the {length}-digit code.',
        codeDigitsOnly: 'The code only has digits.'
    }
}
