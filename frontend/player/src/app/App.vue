<script setup lang="ts">
import { LanguageSwitcher, ThemeToggle } from '@bamboom/common'
</script>

<template>
    <div class="min-h-screen bg-background p-6 text-foreground">
        <h1>Bamboom</h1>
        <p>web-app up and running</p>
        <ThemeToggle />
        <LanguageSwitcher />
    </div>
</template>
