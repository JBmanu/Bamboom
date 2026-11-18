import { describe, expect, it, vi } from 'vitest'
import { assessPasswordStrength } from '../../../src/player-identity/schemas/assessPasswordStrength.ts'

// Spy around the real class: levels stay real, only the number of builds is counted.
vi.mock('@zxcvbn-ts/core', async (importOriginal) => {
    const original = await importOriginal<typeof import('@zxcvbn-ts/core')>()
    return {
        ...original,
        ZxcvbnFactory: vi.fn(function (options: ConstructorParameters<typeof original.ZxcvbnFactory>[0]) {
            return new original.ZxcvbnFactory(options)
        })
    }
})

describe('assessPasswordStrength', () => {
    it.each(['password', '12345678', 'password123'])('rates the very common %s as the lowest level', async (password) => {
        const level = await assessPasswordStrength(password, [])
        expect(level).toBe(0)
    })

    it('rates a long unusual passphrase as the highest level', async () => {
        const level = await assessPasswordStrength('correct horse battery staple', [])
        expect(level).toBe(4)
    })

    it('lowers the level of a password built from the personal inputs', async () => {
        const levelWithoutPersonalInputs = await assessPasswordStrength('xqzvbkorlin2', [])
        expect(levelWithoutPersonalInputs).toBe(4)
        const levelWithPersonalInputs = await assessPasswordStrength('xqzvbkorlin2', ['xqzvbkorlin'])
        expect(levelWithPersonalInputs).toBe(1)
    })

    it('builds the checker once, however many times it is asked', async () => {
        vi.resetModules() // the checker is cached per module: start from a module that has none
        const { assessPasswordStrength: freshAssess } = await import('../../../src/player-identity/schemas/assessPasswordStrength.ts')
        const { ZxcvbnFactory } = await import('@zxcvbn-ts/core')

        await Promise.all([freshAssess('a1'), freshAssess('b2')]) // at the same time
        await freshAssess('c3')

        expect(ZxcvbnFactory).toHaveBeenCalledTimes(1)
    })
})
