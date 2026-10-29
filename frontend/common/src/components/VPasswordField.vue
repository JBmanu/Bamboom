<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import EyeIcon from '~icons/ph/eye'
import EyeSlashIcon from '~icons/ph/eye-slash'
import VButton from './VButton.vue'
import VIcon from './VIcon.vue'
import VTextField from './VTextField.vue'
import { ref } from 'vue'

defineProps<{
    /** The field's label: see VTextField. Every other VTextField prop (error, valid, icon…) and v-model pass through untouched. */
    label: string
    /** Turns off the field and its show/hide toggle together. */
    disabled?: boolean
}>()

const { t } = useI18n()
const isPasswordVisible = ref(false)

function togglePasswordVisibility() {
    isPasswordVisible.value = !isPasswordVisible.value
}
</script>

<template>
    <VTextField :type="isPasswordVisible ? 'text' : 'password'" :disabled="disabled" :label="label">
        <template #end>
            <VButton
                variant="ghost"
                :aria-label="t('common.password.show')"
                :aria-pressed="isPasswordVisible"
                :disabled="disabled"
                @click="togglePasswordVisibility"
            >
                <template #start>
                    <VIcon :icon="isPasswordVisible ? EyeSlashIcon : EyeIcon" />
                </template>
            </VButton>
        </template>
    </VTextField>
</template>
