import type { z } from 'zod'
import { fail, succeed, type Result } from '../errors/result'
import type { TranslatableMessage, ValidationFailure } from '../errors/validationFailure'

type FieldOf<Schema extends z.ZodObject> = Extract<keyof z.output<Schema>, string>

/**
 * The numbers of the rule that was broken, read from the issue itself: they are the ones the schema was written with,
 * so a text such as "at least {minimum} characters" can never disagree with the rule.
 */
function valuesOf(issue: z.core.$ZodIssue): TranslatableMessage['values'] {
    if (issue.code === 'too_small') return issue.exact ? { length: Number(issue.minimum) } : { minimum: Number(issue.minimum) }
    if (issue.code === 'too_big') return issue.exact ? { length: Number(issue.maximum) } : { maximum: Number(issue.maximum) }
    return {}
}

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

    const fieldMessages: Partial<Record<string, TranslatableMessage>> = {}
    for (const issue of parsed.error.issues) {
        const field = issue.path[0]
        if (typeof field === 'string') fieldMessages[field] ??= { key: issue.message, values: valuesOf(issue) } // check order: the first wins
    }
    // The cast narrows the keys to the fields of this schema: TypeScript cannot know that every path starts with one of them.
    return fail({ kind: 'validation', fieldMessages } as ValidationFailure<FieldOf<Schema>>)
}
