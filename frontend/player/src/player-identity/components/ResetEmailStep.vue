<script setup lang="ts">
import { VBanner, VButton, VTextField, VIcon } from '@bamboom/common'
import { useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import LeafIcon from '~icons/ph/leaf'
import RocketIcon from '~icons/ph/rocket-launch-fill'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { useResetFlowStore } from '../stores/useResetFlowStore.ts'
import { useAuthService } from '../useAuthService.ts'

const authService = useAuthService()
const resetFlow = useResetFlowStore()
const { t } = useI18n()

const emailFormElement = useTemplateRef('emailFormElement')

const { form, serverFailure, isSubmitting, submitUnlessWaiting, translateFirstError } = useSchemaForm({
    schema: formSchemas.codeRequest,
    defaultValues: { email: '' },
    formElement: emailFormElement,
    submitValidValues: async ({ email }) => {
        const answer = await authService.requestResetCode({ email })
        // A refusal goes back to the banner and the flow does not move: nothing was sent.
        if (!answer.ok) return answer.failure
        resetFlow.markCodeRequested(email)
        return undefined
    }
})
</script>

<template>
    <VBanner v-if="serverFailure" variant="error">{{ t(serverFailure.messageKey) }}</VBanner>

    <p class="text-center text-sm">{{ t('playerIdentity.forgotPassword.emailStep.instruction') }}</p>

    <form ref="emailFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
        <form.Field v-slot="{ field }" name="email">
            <VTextField
                :label="t('playerIdentity.forgotPassword.emailStep.emailLabel')"
                :icon="LeafIcon"
                name="email"
                type="email"
                autocomplete="email"
                :model-value="field.state.value"
                :error="translateFirstError(field.state.meta.errors)"
                @update:model-value="field.handleChange"
                @blur="field.handleBlur"
            />
        </form.Field>
        <VButton type="submit" :loading="isSubmitting" class="auth-submit">
            {{ t('playerIdentity.forgotPassword.emailStep.submit') }}
            <template #end><VIcon :icon="RocketIcon" /></template>
        </VButton>
    </form>
</template>

<style scoped src="../components/style/authPage.css" />
