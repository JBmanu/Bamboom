<script setup lang="ts">
import { ref, useId, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { type Language, SUPPORTED_LANGUAGES } from './languageConstants'
import { useLanguage } from './useLanguage'

const LEGEND_KEY = 'common.language.label'
const nameKeyOf = (languageToName: Language) => `common.language.names.${languageToName}`
const switchFailedMessage = (languageWanted: Language) => `Could not switch to "${languageWanted}"`

const { t } = useI18n()
const { language, setLanguage } = useLanguage()
const groupName = useId()

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
    <fieldset>
        <legend>{{ t(LEGEND_KEY) }}</legend>
        <label v-for="option in SUPPORTED_LANGUAGES" :key="option">
            <input v-model="tickedLanguage" type="radio" :name="groupName" :value="option" @change="chooseLanguage(option)" />
            <span>{{ t(nameKeyOf(option)) }}</span>
        </label>
    </fieldset>
</template>

<style src="./LanguageSwitcher.css" />
