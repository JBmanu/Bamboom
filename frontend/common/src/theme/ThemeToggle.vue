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
    <fieldset class="inline-flex min-w-0 gap-1 rounded-lg border border-border bg-surface p-1">
        <legend class="sr-only">Theme</legend>
        <label v-for="option in OPTIONS" :key="option.value" class="cursor-pointer">
            <input v-model="preference" type="radio" :name="groupName" :value="option.value" class="peer sr-only" />
            <span
                class="block min-h-11 min-w-11 rounded-md px-3 py-2 text-center text-sm font-medium text-foreground-muted select-none hover:bg-surface-muted peer-checked:bg-primary peer-checked:text-on-primary peer-checked:hover:bg-primary-hover peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus-ring"
            >
                {{ option.label }}
            </span>
        </label>
    </fieldset>
</template>
