import { validateInput } from '../schemas/validateInput'
import { type Failure } from '../errors/failures'
import { shallowRef, type ShallowRef } from 'vue'
import type * as z from 'zod/mini'
import { revalidateLogic, useForm } from '@tanstack/vue-form'
import { type TranslatableMessage } from '../errors/validationFailure'
import { useI18n } from 'vue-i18n'

// Schema is whatever schema the caller passes: field names and value types come from it.
type SchemaFormOptions<Schema extends z.ZodMiniObject> = {
    schema: Schema
    defaultValues: z.input<Schema>
    /** The `<form>` element: it is only used to move the focus to a field by its name. */
    formElement: Readonly<ShallowRef<HTMLFormElement | null>>
    /** Receives the clean values; answers the failure to show, or nothing when it worked. */
    submitValidValues: (values: z.output<Schema>) => Promise<Failure | undefined>
}

/**
 * The form of one of the module's schemas: checked only after the first submit, then at every change.
 * The screen supplies `submitValidValues`; waiting, refusals and messages are handled here.
 */
export function useSchemaForm<Schema extends z.ZodMiniObject>(options: SchemaFormOptions<Schema>) {
    const { t } = useI18n()
    /** The server's last refusal, shown until the next submit. */
    const serverFailure = shallowRef<Failure>()

    const form = useForm({
        defaultValues: options.defaultValues,
        validationLogic: revalidateLogic(),
        validators: {
            // Our validator, not the bare schema: it keeps the numbers a message needs ({ minimum }) and the first-message rule.
            onDynamic: ({ value }) => {
                const validation = validateInput(options.schema, value)
                return validation.ok ? undefined : { fields: validation.failure.fieldMessages }
            }
        },
        onSubmit: async ({ value }) => {
            // TanStack passes the raw values: validating again gives the clean ones (trimmed email).
            const validation = validateInput(options.schema, value)
            if (!validation.ok) return
            serverFailure.value = undefined // new attempt: forget the old refusal
            serverFailure.value = await options.submitValidValues(validation.value)
        }
    })

    /** True from the submit until the answer: the button shows a spinner meanwhile. */
    const isSubmitting = form.useSelector((state) => state.isSubmitting)

    /** Enter submits even while the button is loading: this blocks the second submit. */
    function submitUnlessWaiting() {
        if (isSubmitting.value) return
        void form.handleSubmit() // isSubmitting already tells when it ends
    }

    /** A field can have several errors: show the first, translated. */
    function translateFirstError(errors: readonly (TranslatableMessage | undefined)[]) {
        const firstError = errors.find((error) => error !== undefined)
        return firstError ? t(firstError.key, firstError.values) : undefined
    }

    /** Focuses the input with this name. */
    function focusField(fieldName: Extract<keyof z.input<Schema>, string>) {
        const input = options.formElement.value?.elements.namedItem(fieldName)
        if (input instanceof HTMLInputElement) input.focus()
    }

    /** Empties a field without validating, or "required" would appear under the error banner. */
    function emptyField(fieldName: Extract<keyof z.input<Schema>, string>) {
        // TanStack wants exact field keys; with a generic schema TypeScript can't prove ours is one.
        form.setFieldValue(fieldName as never, '' as never, { dontValidate: true })
    }

    return { form, isSubmitting, serverFailure, submitUnlessWaiting, translateFirstError, focusField, emptyField }
}
