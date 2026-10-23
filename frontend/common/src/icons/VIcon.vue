<script setup lang="ts">
import type { Component } from 'vue'

defineProps<{
    icon: Component
    label?: string
}>()
</script>

<template>
    <component :is="icon" v-bind="label ? { role: 'img', 'aria-label': label } : { 'aria-hidden': 'true' }" />
</template>
