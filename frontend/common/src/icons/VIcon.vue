<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
    icon: Component
    /** Accessible name. Leave it out when the icon only decorates a text that already says the same. */
    label?: string
}>()
</script>

<template>
    <component :is="icon" v-bind="label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }" />
</template>
