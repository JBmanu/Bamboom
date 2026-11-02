<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BritishFlag from '~icons/flag/gb-1x1'
import ItalianFlag from '~icons/flag/it-1x1'
import { type Language, languages, SUPPORTED_LANGUAGES } from '../translations/language/languageConstants.ts'
import { useLanguage } from '../translations/language/useLanguage.ts'
import VIcon from './VIcon.vue'
import VSegmentedControl from './VSegmentedControl.vue'

const LEGEND_KEY = 'common.language.label'
const nameKeyOf = (languageToName: Language) => `common.language.names.${languageToName}`
const switchFailedMessage = (languageWanted: Language) => `Could not switch to "${languageWanted}"`
const FLAGS: Record<Language, typeof BritishFlag> = { [languages.en]: BritishFlag, [languages.it]: ItalianFlag }

const { t } = useI18n()
const { language, setLanguage } = useLanguage()

const options = computed(() => SUPPORTED_LANGUAGES.map((value) => ({ value, name: t(nameKeyOf(value)) })))

// A copy of the language in use: the browser ticks a radio before the new language is loaded, so the tick cannot be bound to `language` itself.
const tickedLanguage = ref(language.value)
watch(language, (currentLanguage) => (tickedLanguage.value = currentLanguage))

async function chooseLanguage(chosenLanguage: Language) {
    try {
        await setLanguage(chosenLanguage)
    } catch (error) {
        console.error(switchFailedMessage(chosenLanguage), error)
        tickedLanguage.value = language.value
    }
}
</script>

<template>
    <VSegmentedControl v-model="tickedLanguage" :legend="t(LEGEND_KEY)" :options="options" @update:model-value="chooseLanguage">
        <template #option="{ option }">
            <VIcon :icon="FLAGS[option.value]" class="size-5 overflow-hidden rounded-full" />
            <span>{{ option.value.toUpperCase() }}</span>
        </template>
    </VSegmentedControl>
</template>
