<script setup lang="ts">
import { nextTick, onMounted, ref, useTemplateRef } from 'vue'
import { I18nT, useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { VBanner, VButton, VIcon, VTextField, VCollapseTransition } from '@bamboom/common'
import GoogleIcon from '~icons/logos/google-icon'
import LeafIcon from '~icons/ph/leaf'
import UserIcon from '~icons/ph/user-fill'
import BambooIcon from '~icons/withicons/bamboo-solid'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import OrDivider from '../components/OrDivider.vue'
import { failures } from '../errors/failures.ts'
import { useSchemaForm } from '../forms/useSchemaForm.ts'
import { COMPLETE_GOOGLE_PROFILE_PATH, LOGIN_PATH, REGISTER_PATH } from '../routePaths.ts'
import { formSchemas } from '../schemas/formSchemas.ts'
import { useSessionStore } from '../stores/useSessionStore.ts'
import { useAuthService } from '../useAuthService.ts'
import FlankingLeaves from '../components/FlankingLeaves.vue'

const authService = useAuthService()
const session = useSessionStore()
const router = useRouter()
const { t } = useI18n()

const profileFormElement = useTemplateRef('profileFormElement')
/** Stays undefined until the server says who is waiting: the form is not shown before. */
const pendingEmail = ref<string>()

const { form, serverFailure, isSubmitting, isFieldValueValid, submitUnlessWaiting, translateFirstError, focusField } = useSchemaForm({
    schema: formSchemas.googleProfile,
    defaultValues: { username: '' },
    formElement: profileFormElement,
    fieldOfFailure: { [failures.usernameAlreadyTaken.code]: 'username' },
    submitValidValues: async ({ username }) => {
        const answer = await authService.completeGoogleProfile({ username })
        if (!answer.ok) return answer.failure
        session.startSession(answer.value)
        // Opening this page again lets the route guard decide where a signed-in person goes.
        await router.replace({ path: COMPLETE_GOOGLE_PROFILE_PATH, force: true })
        return undefined
    }
})

onMounted(async () => {
    const answer = await authService.fetchPendingGoogleProfile()
    if (!answer.ok) {
        serverFailure.value = answer.failure
        return
    }
    // Nobody is waiting (page reloaded, trip cancelled): there is nothing to complete here.
    if (answer.value === undefined) {
        await router.replace(LOGIN_PATH)
        return
    }
    pendingEmail.value = answer.value.email
    await nextTick() // the form exists only now
    focusField('username')
})

/** The server forgets the pending profile first: leaving without it would keep an email waiting for nobody. */
async function cancelProfileAndGoTo(path: string) {
    serverFailure.value = undefined
    const answer = await authService.cancelGoogleProfile()
    if (!answer.ok) {
        serverFailure.value = answer.failure
        return
    }
    await router.push(path)
}
</script>

<template>
    <div class="auth-page">
        <FlankingLeaves>
            <div class="flex size-16 items-center justify-center rounded-full bg-white shadow-md" aria-hidden="true">
                <GoogleIcon class="size-8" />
            </div>
        </FlankingLeaves>

        <AuthPageHeader :title="t('playerIdentity.completeGoogleProfile.title')">
            <template #subtitle>
                <I18nT scope="global" keypath="playerIdentity.completeGoogleProfile.subtitle" tag="span">
                    <template #highlight>
                        <strong class="auth-highlight">{{ t('playerIdentity.completeGoogleProfile.subtitleHighlight') }}</strong>
                    </template>
                </I18nT>
            </template>
        </AuthPageHeader>

        <VCollapseTransition v-slot="{ content: shownFailure }" :content="serverFailure">
            <VBanner variant="error">{{ t(shownFailure.messageKey) }}</VBanner>
        </VCollapseTransition>

        <form v-if="pendingEmail" ref="profileFormElement" novalidate class="auth-form" @submit.prevent="submitUnlessWaiting">
            <form.Field v-slot="{ field }" name="username">
                <VTextField
                    :label="t('playerIdentity.completeGoogleProfile.nicknameLabel')"
                    :icon="UserIcon"
                    name="username"
                    type="text"
                    autocomplete="nickname"
                    :model-value="field.state.value"
                    :error="translateFirstError(field.state.meta.errors)"
                    :valid="field.state.meta.isBlurred && isFieldValueValid('username', field.state.value)"
                    @update:model-value="field.handleChange"
                    @blur="field.handleBlur"
                />
            </form.Field>
            <!-- Shown, not part of the form values: Google already vouched for it. -->
            <VTextField
                :label="t('playerIdentity.completeGoogleProfile.emailLabel')"
                :icon="LeafIcon"
                type="email"
                :model-value="pendingEmail"
                readonly
            />
            <p class="text-sm text-foreground-muted">{{ t('playerIdentity.completeGoogleProfile.emailNote') }}</p>

            <VBanner variant="info">{{ t('playerIdentity.completeGoogleProfile.infoBanner') }}</VBanner>
            <VButton type="submit" :loading="isSubmitting" class="auth-submit">
                {{ t('playerIdentity.completeGoogleProfile.submit') }}
                <template #end><VIcon :icon="BambooIcon" /></template>
            </VButton>
        </form>

        <OrDivider :label="t('playerIdentity.orDivider')" />
        <VButton variant="secondary" @click="cancelProfileAndGoTo(REGISTER_PATH)">
            <template #start><VIcon :icon="UserIcon" /></template>
            {{ t('playerIdentity.completeGoogleProfile.useAnotherEmail') }}
        </VButton>

        <!-- Not AuthAlternativeLink: this one must cancel the pending profile before leaving. -->
        <p class="text-center text-sm">
            {{ t('playerIdentity.completeGoogleProfile.loginQuestion') }}
            <button type="button" class="font-semibold text-link underline" @click="cancelProfileAndGoTo(LOGIN_PATH)">
                {{ t('playerIdentity.completeGoogleProfile.loginLink') }}
            </button>
        </p>
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
