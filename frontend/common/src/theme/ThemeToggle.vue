<script setup lang="ts">
import { useId } from 'vue'
import { useI18n } from 'vue-i18n'
import { type Preference, preferences } from './themeConstants.ts'
import { useTheme } from './useTheme.ts'

// The label key is written out, not built from the value: the stored "auto" is shown as "system".
const OPTIONS: { value: Preference; labelKey: string }[] = [
    { value: preferences.auto, labelKey: 'common.theme.system' },
    { value: preferences.light, labelKey: 'common.theme.light' },
    { value: preferences.dark, labelKey: 'common.theme.dark' }
]

const { t } = useI18n()
const { preference } = useTheme()
const groupName = useId()
</script>

<template>
    <fieldset class="toggle">
        <legend class="legend">{{ t('common.theme.label') }}</legend>
        <label v-for="option in OPTIONS" :key="option.value" class="option">
            <input v-model="preference" type="radio" :name="groupName" :value="option.value" class="radio" />
            <span class="label">{{ t(option.labelKey) }}</span>
        </label>
    </fieldset>
</template>

<style scoped src="ThemeToggle.css" />
