import { createTranslations, VModal } from '@bamboom/common'
import { enableAutoUnmount, flushPromises, mount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { createMemoryHistory, createRouter, useRouter } from 'vue-router'
import { installDialogStub, pressEscape } from '../utils/installDialogStub'

enableAutoUnmount(afterEach)
beforeAll(installDialogStub)
afterEach(() => vi.restoreAllMocks())

const emptyPage = { render: () => null }

// Stands in for the "Password updated" pop-up of feature 11: the modal reports its closing, the host redirects.
const PasswordUpdatedHost = defineComponent({
    setup() {
        const router = useRouter()
        const isOpen = ref(true)
        return () =>
            h(VModal, {
                title: 'Password updated',
                open: isOpen.value,
                'onUpdate:open': (value: boolean) => (isOpen.value = value),
                onClose: () => router.push('/login')
            })
    }
})

async function mountHost() {
    const router = createRouter({
        history: createMemoryHistory(),
        routes: [
            { path: '/', component: emptyPage },
            { path: '/login', component: emptyPage }
        ]
    })
    await router.push('/')
    await router.isReady()
    const push = vi.spyOn(router, 'push')
    const wrapper = mount(PasswordUpdatedHost, { global: { plugins: [router, await createTranslations()] } })
    return { wrapper, dialog: wrapper.element as HTMLDialogElement, router, push }
}

type MountedHost = Awaited<ReturnType<typeof mountHost>>

describe('closing a modal whose host redirects', () => {
    it('stays on the page while the modal is open', async () => {
        const { router, push } = await mountHost()

        expect(push).not.toHaveBeenCalled()
        expect(router.currentRoute.value.path).toBe('/')
    })

    it.each<[string, (host: MountedHost) => unknown]>([
        ['Escape', ({ dialog }) => pressEscape(dialog)],
        ['a click on the backdrop', ({ dialog }) => dialog.click()],
        ['the close button', ({ wrapper }) => wrapper.get('button').trigger('click')]
    ])('goes to the login page once after %s', async (_way, closeIt) => {
        const host = await mountHost()

        await closeIt(host)
        await flushPromises() // the router finishes its navigation asynchronously

        expect(host.push).toHaveBeenCalledTimes(1)
        expect(host.push).toHaveBeenCalledWith('/login')
        expect(host.router.currentRoute.value.path).toBe('/login')
    })
})
