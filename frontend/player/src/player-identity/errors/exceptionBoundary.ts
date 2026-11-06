import { fail, succeed, type Result } from './result'

/**
 * Runs `operation` and returns its value as a success; if it throws, returns the failure the caller describes.
 * With `awaitAsResult`, this is where the exceptions of libraries and of the browser end:
 * the rest of the module only ever sees a Result.
 */
export function runAsResult<Value, Reason>(operation: () => Value, describeFailure: (cause: unknown) => Reason): Result<Value, Reason> {
    try {
        return succeed(operation())
    } catch (cause: unknown) {
        return fail(describeFailure(cause))
    }
}

/** Same as `runAsResult` for an asynchronous operation: the returned promise never rejects. */
export async function awaitAsResult<Value, Reason>(
    operation: () => Promise<Value>,
    describeFailure: (cause: unknown) => Reason
): Promise<Result<Value, Reason>> {
    try {
        // `await` inside the try: it catches a rejection, and also an exception thrown before any promise exists.
        return succeed(await operation())
    } catch (cause: unknown) {
        return fail(describeFailure(cause))
    }
}
