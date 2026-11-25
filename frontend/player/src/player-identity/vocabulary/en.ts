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
        registerLink: 'Create an account',
        forgotPasswordLink: 'Forgot your password?'
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
    orDivider: 'or',
    continueWithGoogle: 'Continue with Google',
    completeGoogleProfile: {
        title: 'Welcome to the explosion!',
        subtitle: 'Choose your nickname and {highlight}!',
        subtitleHighlight: 'start playing',
        nicknameLabel: 'Nickname',
        emailLabel: 'Email',
        emailNote: 'This email is already linked to your Google account.',
        infoBanner: 'Safe, fast, explosive!',
        submit: 'Complete and play',
        useAnotherEmail: 'Use another email',
        loginQuestion: 'Already have an account?',
        loginLink: 'Log in now'
    },
    forgotPassword: {
        emailStep: {
            title: 'Boom! Password exploded?',
            subtitle: 'No problem, we will help you get back in the game.',
            instruction: 'Enter your email and we will send you a code to reset your password.',
            emailLabel: 'Email',
            submit: 'Send code'
        },
        codeStep: {
            title: 'Check your email',
            subtitle: 'Enter the code to choose a new password.',
            emailLabel: 'Email',
            codeSent: 'If an account exists for {email}, we sent a {length}-digit code. Check your spam folder too.',
            codeLabel: 'Code',
            submit: 'Confirm code',
            resend: 'Send the code again',
            resendIn: 'Send the code again in {seconds} s',
            resendReady: 'You can ask for a new code now.',
            changeEmail: 'Change email'
        },
        backToLoginQuestion: 'Remembered your password?',
        backToLoginLink: 'Back to login'
    },
    newPassword: {
        title: 'New password?',
        subtitle: 'Choose a new password and get back in the game.',
        passwordLabel: 'New password',
        submit: 'Save new password',
        backToLoginQuestion: 'Remembered your password?',
        backToLoginLink: 'Back to login',
        updatedTitle: 'Password updated',
        updatedMessage: 'Your password has been changed. Log in with the new one to get back in the game.',
        goToLogin: 'Go to login',
        startAgain: 'Start again'
    },
    passwordStrength: {
        veryWeak: 'Very weak',
        weak: 'Weak',
        fair: 'Fair',
        good: 'Good',
        strong: 'Strong'
    },
    failures: {
        invalidCredentials: 'Email or password is incorrect.',
        emailAlreadyRegistered: 'This email is already registered.',
        usernameAlreadyTaken: 'This nickname is already taken.',
        resetCodeInvalid: 'This code is not correct.',
        resetCodeExpired: 'This code has expired. Request a new one.',
        tooManyAttempts: 'Too many attempts. Try again in a few minutes.',
        resetNotConfirmed: 'Confirm the code before choosing a new password.',
        resetProofExpired: 'The time to choose a new password has run out. Start again.',
        googleSignInCancelled: 'Google sign-in was cancelled. Try again whenever you are ready.',
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
        codeLength: 'Enter the {length}-digit code.',
        codeDigitsOnly: 'The code only has digits.'
    }
}
