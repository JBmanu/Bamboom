<script setup lang="ts">
import { computed, ref, useId, useTemplateRef } from 'vue'
import { useI18n } from 'vue-i18n'
import BritishFlag from '~icons/flag/gb-1x1'
import ItalianFlag from '~icons/flag/it-1x1'
import CaretDownIcon from '~icons/ph/caret-down'
import CheckIcon from '~icons/ph/check'
import { type Language, languages, SUPPORTED_LANGUAGES } from '../translations/language/languageConstants.ts'
import { useLanguage } from '../translations/language/useLanguage.ts'
import VButton from './VButton.vue'
import VIcon from './VIcon.vue'

const nameKeyOf = (languageToName: Language) => `common.language.names.${languageToName}`
const switchFailedMessage = (languageWanted: Language) => `Could not switch to "${languageWanted}"`
const FLAGS: Record<Language, typeof BritishFlag> = { [languages.en]: BritishFlag, [languages.it]: ItalianFlag }

const { t } = useI18n()
const { language, setLanguage } = useLanguage()

const panelId = useId()
const panel = useTemplateRef<HTMLElement>('panel')
const isOpen = ref(false)

const options = computed(() => SUPPORTED_LANGUAGES.map((value) => ({ value, name: t(nameKeyOf(value)) })))
const buttonLabel = computed(() => t('common.language.current', { name: t(nameKeyOf(language.value)) }))

// The browser opens and closes the panel (Esc, click outside); we only follow its state.
function followPanelState(event: Event) {
    isOpen.value = (event as ToggleEvent).newState === 'open'
}

async function choose(chosenLanguage: Language) {
    panel.value?.hidePopover()
    try {
        await setLanguage(chosenLanguage)
    } catch (error) {
        console.error(switchFailedMessage(chosenLanguage), error) // the language in use does not change, so nothing to undo
    }
}
</script>

<template>
    <div>
        <VButton
            variant="ghost"
            :popovertarget="panelId"
            :aria-controls="panelId"
            :aria-expanded="isOpen"
            :aria-label="buttonLabel"
            :title="buttonLabel"
        >
            <template #start><VIcon :icon="FLAGS[language]" class="size-5 overflow-hidden rounded-full" /></template>
            {{ language.toUpperCase() }}
            <template #end><VIcon :icon="CaretDownIcon" class="size-4" /></template>
        </VButton>

        <div :id="panelId" ref="panel" popover class="panel" :aria-label="t('common.language.label')" @toggle="followPanelState">
            <ul class="list">
                <li v-for="option in options" :key="option.value">
                    <button
                        type="button"
                        class="choice"
                        :lang="option.value"
                        :aria-current="option.value === language ? 'true' : undefined"
                        @click="choose(option.value)"
                    >
                        <VIcon :icon="FLAGS[option.value]" class="size-5 overflow-hidden rounded-full" />
                        <span>{{ option.name }}</span>
                        <VIcon v-if="option.value === language" :icon="CheckIcon" class="ml-auto size-4" />
                    </button>
                </li>
            </ul>
        </div>
    </div>
</template>

<style scoped src="./style/LanguageSwitcher.css" />
