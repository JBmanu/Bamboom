<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
    question: string
    linkLabel: string
    to: string
}>()
</script>

<template>
    <p class="text-center text-sm">
        {{ question }}
        <RouterLink :to="to" class="font-semibold text-link underline">{{ linkLabel }}</RouterLink>
    </p>
</template>
