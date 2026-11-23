<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import AuthPageHeader from '../components/AuthPageHeader.vue'

const { t } = useI18n()
</script>

<template>
    <!-- Provisional page: the real one, with its form, replaces it. -->
    <div class="auth-page">
        <AuthPageHeader :title="t('playerIdentity.newPassword.title')" />
    </div>
</template>

<style scoped src="../components/style/authPage.css" />
