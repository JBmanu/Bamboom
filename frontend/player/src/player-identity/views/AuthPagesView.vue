<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@bamboom/common'
import { RouterView } from 'vue-router'
import AuthLayout from '../components/AuthLayout.vue'
</script>

<template>
    <AuthLayout>
        <RouterView />
        <template #footer>
            <ThemeToggle />
            <LanguageSwitcher />
        </template>
    </AuthLayout>
</template>
