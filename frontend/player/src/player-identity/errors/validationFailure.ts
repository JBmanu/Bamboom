/**
 * Input that did not pass the schema of a form: one message key for each invalid field.
 * Not part of the failure catalog because it has no fixed code or message: it depends on the form.
 */
export type ValidationFailure<Field extends string = string> = {
    readonly kind: 'validation'
    readonly fieldMessageKeys: Readonly<Partial<Record<Field, string>>>
}
