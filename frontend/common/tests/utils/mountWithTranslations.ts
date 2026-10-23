import { mount } from '@vue/test-utils'
import { type Component, defineComponent, h } from 'vue'
import { createTranslations } from '../../src/translations/createTranslations.ts'
import type { VocabularyLoaders } from '../../src/translations/vocabularies.ts'

/** Mounts `component` the way an app does: with the real translations plugin installed and attached to the document. */
export async function mountWithTranslations(component: Component, moduleLoaders: VocabularyLoaders = {}, props: Record<string, unknown> = {}) {
    const translations = await createTranslations(moduleLoaders)
    const wrapper = mount(component, { props, attachTo: document.body, global: { plugins: [translations] } })
    return { wrapper, translations }
}

/** Mounts two copies of `component` in the same app, to check what they share. */
export function mountTwiceWithTranslations(component: Component) {
    const Pair = defineComponent({ render: () => h('div', [h(component), h(component)]) })
    return mountWithTranslations(Pair)
}
