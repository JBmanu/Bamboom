<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
    <!-- Placeholder: it goes away when the first game module arrives. -->
    <section class="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
        <h1 class="text-3xl font-bold">{{ t('app.home.title') }}</h1>
        <p class="text-foreground-muted">{{ t('app.home.description') }}</p>
    </section>
</template>
