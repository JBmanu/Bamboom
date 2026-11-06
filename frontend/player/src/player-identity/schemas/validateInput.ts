import type { z } from 'zod'
import { fail, succeed, type Result } from '../errors/result'
import type { ValidationFailure } from '../errors/validationFailure'

type FieldOf<Schema extends z.ZodObject> = Extract<keyof z.output<Schema>, string>

/**
 * Checks the values of a form against its schema.
 * On failure it keeps the first message of each invalid field; `safeParse` reports problems as data, it does not throw.
 */
export function validateInput<Schema extends z.ZodObject>(
    schema: Schema,
    input: z.input<Schema>
): Result<z.output<Schema>, ValidationFailure<FieldOf<Schema>>> {
    const parsed = schema.safeParse(input)
    if (parsed.success) return succeed(parsed.data)

    const fieldMessageKeys: Partial<Record<string, string>> = {}
    for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') fieldMessageKeys[field] ??= issue.message // issues come in check order: the first one wins
    }
    // The cast narrows the keys to the fields of this schema: TypeScript cannot know that every path starts with one of them.
    return fail({ kind: 'validation', fieldMessageKeys } as ValidationFailure<FieldOf<Schema>>)
}
