<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MonitorIcon from '~icons/ph/monitor'
import MoonIcon from '~icons/ph/moon'
import SunIcon from '~icons/ph/sun'
import { type Preference, preferences } from '../theme/themeConstants.ts'
import { useTheme } from '../theme/useTheme.ts'
import VIcon from './VIcon.vue'
import VSegmentedControl from './VSegmentedControl.vue'

// The name key is written out, not built from the value: the stored "auto" is shown as "system".
const OPTIONS = [
    { value: preferences.auto, nameKey: 'common.theme.system', icon: MonitorIcon },
    { value: preferences.light, nameKey: 'common.theme.light', icon: SunIcon },
    { value: preferences.dark, nameKey: 'common.theme.dark', icon: MoonIcon }
] as const

const { t } = useI18n()
const { preference } = useTheme()
const options = computed(() => OPTIONS.map(({ value, nameKey }) => ({ value, name: t(nameKey) })))
const iconOf = (value: Preference) => OPTIONS.find((option) => option.value === value)!.icon
</script>

<template>
    <VSegmentedControl v-model="preference" :legend="t('common.theme.label')" :options="options">
        <template #option="{ option }"><VIcon :icon="iconOf(option.value)" class="size-5" /></template>
    </VSegmentedControl>
</template>
