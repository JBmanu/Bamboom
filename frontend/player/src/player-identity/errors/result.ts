/**
 * Outcome of an operation that can fail in an expected way.
 * The reason is part of the type: the compiler forces the caller to look at it, unlike a thrown error.
 */
export type Result<Value, Reason> = { readonly ok: true; readonly value: Value } | { readonly ok: false; readonly failure: Reason }

// `never` on the unused side lets one success fit any Result<Value, ...>, and one failure any Result<..., Reason>.
export function succeed<Value>(value: Value): Result<Value, never> {
    return { ok: true, value }
}

export function fail<Reason>(failure: Reason): Result<never, Reason> {
    return { ok: false, failure }
}
