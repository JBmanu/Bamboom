import { mount } from '@vue/test-utils'
import { type Component, defineComponent, h } from 'vue'
import { createTranslations } from '../../src/translations/createTranslations.ts'
import type { VocabularyLoaders } from '../../src/translations/vocabularies.ts'

type MountOptions = { props?: Record<string, unknown>; attrs?: Record<string, unknown>; slots?: Record<string, string> }

export function mountWith(component: Component, { props = {}, attrs = {}, slots = {} }: MountOptions = {}) {
    return mount(component, { props, attrs, slots })
}

/** Mounts `component` the way an app does: with the real translations plugin installed and attached to the document. */
export async function mountWithTranslations(
    component: Component,
    moduleLoaders: VocabularyLoaders = {},
    { props = {}, slots = {} }: MountOptions = {}
) {
    const translations = await createTranslations(moduleLoaders)
    const wrapper = mount(component, { props, slots, attachTo: document.body, global: { plugins: [translations] } })
    return { wrapper, translations }
}

/** Mounts two copies of `component` in the same app, to check what they share. */
export function mountTwiceWithTranslations(component: Component) {
    const Pair = defineComponent({ render: () => h('div', [h(component), h(component)]) })
    return mountWithTranslations(Pair)
}
