<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@bamboom/common'
import { RouterView } from 'vue-router'
</script>

<template>
    <div class="min-h-screen bg-background p-6 text-foreground">
        <header>
            <ThemeToggle />
            <LanguageSwitcher />
        </header>
        <main>
            <RouterView />
        </main>
    </div>
</template>
