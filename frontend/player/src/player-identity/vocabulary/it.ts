import type en from './en'

export default {
    login: {
        title: 'Bentornato!'
    },
    failures: {
        invalidCredentials: 'Email o password non corrette.',
        emailAlreadyRegistered: 'Questa email è già registrata.',
        usernameAlreadyTaken: 'Questo username è già in uso.',
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
        usernameTooShort: 'Lo username deve avere almeno {minimum} caratteri.',
        usernameTooLong: 'Lo username può avere al massimo {maximum} caratteri.',
        usernameCharacters: 'Usa solo lettere, numeri e trattini bassi.',
        passwordTooShort: 'La password deve avere almeno {minimum} caratteri.',
        passwordTooLong: 'La password può avere al massimo {maximum} caratteri.',
        passwordConfirmationMismatch: 'Le password non coincidono.',
        codeLength: 'Inserisci il codice di {length} cifre.',
        codeDigitsOnly: 'Il codice contiene solo cifre.'
    }
} satisfies typeof en
