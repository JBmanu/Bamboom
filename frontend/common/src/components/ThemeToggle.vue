<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import MonitorIcon from '~icons/ph/monitor'
import MoonIcon from '~icons/ph/moon'
import SunIcon from '~icons/ph/sun'
import { type Preference, preferences } from '../theme/themeConstants.ts'
import { useTheme } from '../theme/useTheme.ts'
import VButton from './VButton.vue'
import VIcon from './VIcon.vue'

// The name keys are written out: the stored "auto" is shown as "system".
const looks: Record<Preference, { nameKey: string; icon: typeof SunIcon }> = {
    [preferences.light]: { nameKey: 'common.theme.light', icon: SunIcon },
    [preferences.dark]: { nameKey: 'common.theme.dark', icon: MoonIcon },
    [preferences.auto]: { nameKey: 'common.theme.system', icon: MonitorIcon }
}

// What a click does: light, then dark, then back to following the system.
const following: Record<Preference, Preference> = {
    [preferences.light]: preferences.dark,
    [preferences.dark]: preferences.auto,
    [preferences.auto]: preferences.light
}

const { t } = useI18n()
const { preference } = useTheme()

const currentName = computed(() => t(looks[preference.value].nameKey))
const label = computed(() => t('common.theme.switch', { current: currentName.value, next: t(looks[following[preference.value]].nameKey) }))

function switchToFollowing() {
    preference.value = following[preference.value]
}
</script>

<template>
    <VButton variant="ghost" :aria-label="label" :title="label" @click="switchToFollowing">
        <VIcon :icon="looks[preference].icon" class="size-5" />
        <!-- A button that only changes its icon says nothing to someone who cannot see it. -->
        <span role="status" class="sr-only">{{ currentName }}</span>
    </VButton>
</template>
