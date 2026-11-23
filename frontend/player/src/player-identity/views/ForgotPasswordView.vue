<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AuthAlternativeLink from '../components/AuthAlternativeLink.vue'
import AuthPageHeader from '../components/AuthPageHeader.vue'
import { LOGIN_PATH } from '../routePaths.ts'

const { t } = useI18n()
</script>

<template>
    <div class="auth-page">
        <AuthPageHeader :title="t('playerIdentity.forgotPassword.emailStep.title')">
            <template #subtitle>{{ t('playerIdentity.forgotPassword.emailStep.subtitle') }}</template>
        </AuthPageHeader>

        <AuthAlternativeLink
            :question="t('playerIdentity.forgotPassword.backToLoginQuestion')"
            :link-label="t('playerIdentity.forgotPassword.backToLoginLink')"
            :to="LOGIN_PATH"
        />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
