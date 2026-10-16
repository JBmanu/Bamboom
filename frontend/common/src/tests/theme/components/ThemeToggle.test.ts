import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import ThemeToggle from '../../../theme/components/ThemeToggle.vue'
import { preferences, THEME_STORAGE_KEY, themes } from '../../../theme/themeConstants'
import { mockSystemTheme } from '../support/systemTheme'
import { defineComponent, h } from 'vue'

const isDark = () => document.documentElement.classList.contains(themes.dark)

const radio = (wrapper: VueWrapper, value: string) => wrapper.get<HTMLInputElement>(`input[value="${value}"]`)

let mounted: VueWrapper[] = []
const mountToggle = () => {
    const wrapper = mount(ThemeToggle, { attachTo: document.body })
    mounted.push(wrapper)
    return wrapper
}

beforeEach(() => {
    localStorage.clear()
    document.documentElement.className = ''
    mockSystemTheme(false)
})

afterEach(() => {
    mounted.forEach((wrapper) => wrapper.unmount())
    mounted = []
})

describe('ThemeToggle', () => {
    it('offers System, Light and Dark in a group labelled Theme', () => {
        const wrapper = mountToggle()

        expect(wrapper.get('fieldset legend').text()).toBe('Theme')
        expect(wrapper.findAll('input[type="radio"]')).toHaveLength(3)
        expect(wrapper.findAll('label').map((label) => label.text())).toEqual(['System', 'Light', 'Dark'])
    })

    it('selects System when nothing is stored', () => {
        const wrapper = mountToggle()

        expect(radio(wrapper, preferences.auto).element.checked).toBe(true)
        expect(radio(wrapper, themes.dark).element.checked).toBe(false)
    })

    it('selects the stored preference', () => {
        localStorage.setItem(THEME_STORAGE_KEY, themes.dark)

        const wrapper = mountToggle()

        expect(radio(wrapper, themes.dark).element.checked).toBe(true)
        expect(radio(wrapper, preferences.auto).element.checked).toBe(false)
    })

    it('applies and persists the chosen theme', async () => {
        const wrapper = mountToggle()

        await radio(wrapper, themes.dark).setValue()

        expect(isDark()).toBe(true)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(themes.dark)
    })

    it('goes back to following the system', async () => {
        const wrapper = mountToggle()
        await radio(wrapper, themes.dark).setValue()

        await radio(wrapper, preferences.auto).setValue()

        expect(isDark()).toBe(false)
        expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe(preferences.auto)
    })

    it('keeps two toggles in sync', async () => {
        const first = mountToggle()
        const second = mountToggle()

        await radio(first, themes.dark).setValue()

        expect(radio(second, themes.dark).element.checked).toBe(true)
    })

    it('puts the three options in one radio group', () => {
        const wrapper = mountToggle()

        const names = wrapper.findAll('input').map((input) => input.attributes('name'))

        expect(names[0]).toBeTruthy()
        expect(new Set(names).size).toBe(1)
    })

    it('gives every toggle its own radio group', () => {
        const Host = defineComponent({ render: () => h('div', [h(ThemeToggle), h(ThemeToggle)]) })
        const wrapper = mount(Host, { attachTo: document.body })
        mounted.push(wrapper)
        const [first, second] = wrapper.findAll('input[value="dark"]')

        expect(first.attributes('name')).not.toBe(second.attributes('name'))
    })
})
