import { describe, expect, it } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import AuthAlternativeLink from '../../../src/player-identity/components/AuthAlternativeLink.vue'
import { createMemoryHistory, createRouter } from 'vue-router'

const TARGET_PATH = '/target'
const question = 'Already have an account?'
const linkLabel = 'Log in now'

// RouterLink needs a router to read the current route and to navigate: a real one, in memory.
async function mountWithRouter() {
    const emptyPage = { render: () => null }
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: emptyPage },
            { path: TARGET_PATH, component: emptyPage }
        ]
    })
    await router.push('/')
    const wrapper = mount(AuthAlternativeLink, {
        props: { question, linkLabel, to: TARGET_PATH },
        global: { plugins: [router] }
    })
    return { router, wrapper }
}

describe('AuthAlternativeLink', () => {
    it('shows the question and the link, pointing to the given address', async () => {
        const { wrapper } = await mountWithRouter()

        expect(wrapper.text()).toContain(question)
        expect(wrapper.find('a').text()).toBe(linkLabel)
        expect(wrapper.find('a').attributes('href')).toBe(TARGET_PATH)
    })

    it('goes to that address without reloading the page when the link is pressed', async () => {
        const { router, wrapper } = await mountWithRouter()
        const click = new MouseEvent('click', { bubbles: true, cancelable: true })
        wrapper.find('a').element.dispatchEvent(click)
        await flushPromises()

        expect(router.currentRoute.value.path).toBe(TARGET_PATH)
        expect(click.defaultPrevented).toBe(true)
    })
})
