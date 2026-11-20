import type en from './en'

export default {
    login: {
        title: 'Bentornato!',
        subtitle: 'Pronto a far {highlight} la partita?',
        subtitleHighlight: 'esplodere',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submit: 'Accedi ora',
        botFreeNote: 'Niente bot, solo bambù veri!',
        registerQuestion: 'Nuovo su Bamboom?',
        registerLink: 'Crea un account'
    },
    register: {
        title: 'Unisciti all’esplosione!',
        subtitle: 'Crea il tuo account e {highlight}!',
        subtitleHighlight: 'inizia a giocare',
        nicknameLabel: 'Nickname',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        submit: 'Crea il mio account',
        loginQuestion: 'Hai già un account?',
        loginLink: 'Accedi ora'
    },
    passwordStrength: {
        veryWeak: 'Molto debole',
        weak: 'Debole',
        fair: 'Discreta',
        good: 'Buona',
        strong: 'Forte'
    },
    failures: {
        invalidCredentials: 'Email o password non corrette.',
        emailAlreadyRegistered: 'Questa email è già registrata.',
        usernameAlreadyTaken: 'Questo nickname è già in uso.',
        resetCodeInvalid: 'Il codice non è corretto.',
        resetCodeExpired: 'Il codice è scaduto. Richiedine uno nuovo.',
        tooManyAttempts: 'Troppi tentativi. Riprova tra qualche minuto.',
        resetNotConfirmed: 'Conferma il codice prima di scegliere una nuova password.',
        networkUnreachable: 'Nessuna connessione. Controlla la rete e riprova.',
        requestTimeout: 'Il server ha impiegato troppo a rispondere. Riprova.',
        serverFailure: 'Qualcosa è andato storto da parte nostra. Riprova più tardi.',
        unexpectedResponse: 'Non siamo riusciti a capire la risposta del server. Riprova più tardi.',
        sessionExpired: 'La sessione è scaduta. Accedi di nuovo.'
    },
    validation: {
        required: 'Questo campo è obbligatorio.',
        emailInvalid: 'Inserisci un indirizzo email valido.',
        usernameTooShort: 'Il nickname deve avere almeno {minimum} caratteri.',
        usernameTooLong: 'Il nickname può avere al massimo {maximum} caratteri.',
        usernameCharacters: 'Usa solo lettere, numeri e trattini bassi.',
        passwordTooShort: 'La password deve avere almeno {minimum} caratteri.',
        passwordTooLong: 'La password può avere al massimo {maximum} caratteri.',
        passwordConfirmationMismatch: 'Le password non coincidono.',
        codeLength: 'Inserisci il codice di {length} cifre.',
        codeDigitsOnly: 'Il codice contiene solo cifre.'
    }
} satisfies typeof en
