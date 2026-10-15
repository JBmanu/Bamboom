export function inlineScript(fn: (...args: never[]) => void, ...args: unknown[]): string {
    const serializedArgs = args.map((arg) => JSON.stringify(arg).replace(/</g, '\\u003c')).join(',')
    return `(${fn.toString()})(${serializedArgs})`
}
