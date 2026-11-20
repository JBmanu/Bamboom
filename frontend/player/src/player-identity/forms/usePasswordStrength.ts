import { computed, ref, type Ref, watch } from 'vue'
import { assessPasswordStrength, type PasswordStrengthLevel } from '../schemas/assessPasswordStrength.ts'

const rootVocabulary = 'playerIdentity.passwordStrength.'
const strengthLabelKeys = [
    rootVocabulary + 'veryWeak',
    rootVocabulary + 'weak',
    rootVocabulary + 'fair',
    rootVocabulary + 'good',
    rootVocabulary + 'strong'
] as const

/** State of the strength meter: an empty bar until a password has been assessed. */
export function usePasswordStrength(password: Ref<string>, personalInputs: Ref<readonly string[]>) {
    const level = ref<PasswordStrengthLevel | null>(null)

    const strength = computed(() => {
        if (level.value === null) return { level: 0 as const, labelKey: undefined }
        return { level: level.value, labelKey: strengthLabelKeys[level.value] }
    })

    watch([password, personalInputs], async ([currentPassword, currentInputs]) => {
        if (currentPassword === '') {
            level.value = null
            return
        }
        const assessedLevel = await assessPasswordStrength(currentPassword, currentInputs)
        // The check is async: an older answer can arrive after a newer edit and must not overwrite it.
        if (password.value === currentPassword) {
            level.value = assessedLevel
        }
    })

    return { strength }
}
