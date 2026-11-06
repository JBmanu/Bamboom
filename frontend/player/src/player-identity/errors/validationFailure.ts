/** A message key with the numbers its text needs, for example `{ minimum: 3 }` for "at least {minimum} characters". */
export type TranslatableMessage = {
    readonly key: string
    readonly values: Readonly<Record<string, number>>
}

/**
 * Input that did not pass the schema of a form: one message for each invalid field.
 * Not part of the failure catalog because it has no fixed code or message: it depends on the form.
 */
export type ValidationFailure<Field extends string = string> = {
    readonly kind: 'validation'
    readonly fieldMessages: Readonly<Partial<Record<Field, TranslatableMessage>>>
}
