<script setup lang="ts">
import { useId } from 'vue'
import { type Preference, preferences } from './themeConstants.ts'
import { useTheme } from './useTheme.ts'

const OPTIONS: { value: Preference; label: string }[] = [
    { value: preferences.auto, label: 'System' },
    { value: preferences.light, label: 'Light' },
    { value: preferences.dark, label: 'Dark' }
]

const { preference } = useTheme()
const groupName = useId()
</script>

<template>
    <fieldset class="toggle">
        <legend class="legend">Theme</legend>
        <label v-for="option in OPTIONS" :key="option.value" class="option">
            <input v-model="preference" type="radio" :name="groupName" :value="option.value" class="radio" />
            <span class="label">{{ option.label }}</span>
        </label>
    </fieldset>
</template>

<style scoped src="./themeToggle.css" />
