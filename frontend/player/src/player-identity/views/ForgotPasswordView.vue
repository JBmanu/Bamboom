<script setup lang="ts">
import { VBanner, VButton, VTextField } from '@bamboom/common'
import { storeToRefs } from 'pinia'
import { computed, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import LeafIcon from '~icons/ph/leaf'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import ResetCodeStep from '../components/ResetCodeStep.vue'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { LOGIN_PATH } from '../routePaths.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { resetFlowSteps, useResetFlowStore } from '../stores/useResetFlowStore.ts'
import { useAuthService } from '../useAuthService.ts'

const authService = useAuthService()
const resetFlow = useResetFlowStore()
const { step } = storeToRefs(resetFlow)
const { t } = useI18n()

// One page, two phases: the store says which one, so the address stays the same and the back button leaves the flow.
const isCodeStepShown = computed(() => step.value === resetFlowSteps.codeRequested)

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
    <div class="auth-page">
        <AuthPageHeader
            :title="isCodeStepShown ? t('playerIdentity.forgotPassword.codeStep.title') : t('playerIdentity.forgotPassword.emailStep.title')"
        >
            <template #subtitle
                >{{ isCodeStepShown ? t('playerIdentity.forgotPassword.codeStep.subtitle') : t('playerIdentity.forgotPassword.emailStep.subtitle') }}
            </template>
        </AuthPageHeader>

        <ResetCodeStep v-if="isCodeStepShown" />

        <template v-else>
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
                </VButton>
            </form>
        </template>

        <AuthAlternativeLink
            :question="t('playerIdentity.forgotPassword.backToLoginQuestion')"
            :link-label="t('playerIdentity.forgotPassword.backToLoginLink')"
            :to="LOGIN_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
