import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import VModal from '../../src/components/VModal.vue'
import { installDialogStub, pressEscape } from '../utils/installDialogStub.ts'
import { mountTwiceWithTranslations, mountWithTranslations } from '../utils/mountWithTranslations.ts'
import { LANGUAGE_STORAGE_KEY, languages } from '../../src/translations/language/languageConstants.ts'

enableAutoUnmount(afterEach)

beforeAll(installDialogStub)
beforeEach(() => localStorage.clear())
afterEach(() => vi.restoreAllMocks())

async function mountModal(open = false, props = {}, slots = {}) {
    const { wrapper } = await mountWithTranslations(
        VModal,
        {},
        {
            props: { open, title: 'Title', ...props },
            slots: { default: 'Content', ...slots }
        }
    )
    return { wrapper, dialog: wrapper.element as HTMLDialogElement }
}

describe('VModal', () => {
    it('is closed by default', async () => {
        const { dialog } = await mountModal()
        expect(dialog.open).toBe(false)
    })

    it('shows its content', async () => {
        const { wrapper } = await mountModal()
        expect(wrapper.text()).toContain('Content')
    })

    it('opens as a modal when `open` becomes true', async () => {
        const showModal = vi.spyOn(HTMLDialogElement.prototype, 'showModal')
        const { wrapper, dialog } = await mountModal()
        await wrapper.setProps({ open: true })

        expect(showModal).toHaveBeenCalledTimes(1)
        expect(dialog.open).toBe(true)
    })

    it('closes when `open` becomes false', async () => {
        const { wrapper, dialog } = await mountModal(true)
        await wrapper.setProps({ open: false })

        expect(dialog.open).toBe(false)
    })

    it('is open right away when mounted with `open`', async () => {
        const { dialog } = await mountModal(true)
        expect(dialog.open).toBe(true)
    })

    it('opens again after being closed', async () => {
        const { wrapper, dialog } = await mountModal(true)
        await wrapper.setProps({ open: false })
        await wrapper.setProps({ open: true })

        expect(dialog.open).toBe(true)
    })

    it('does not try to open a dialog that is already open', async () => {
        const { wrapper, dialog } = await mountModal()
        dialog.showModal() // the stub throws if we call it twice

        await expect(wrapper.setProps({ open: true })).resolves.not.toThrow()
    })

    it('reports nothing when the parent closes it', async () => {
        const { wrapper } = await mountModal(true)

        await wrapper.setProps({ open: false })

        expect(wrapper.emitted('close')).toBeUndefined()
        expect(wrapper.emitted('update:open')).toBeUndefined()
    })

    it('names the dialog after its title', async () => {
        const { wrapper } = await mountModal(true)
        const title = wrapper.get('h2')

        expect(title.text()).toBe('Title')
        expect(title.attributes('id')).toBeTruthy()
        expect(title.attributes('id')).toBe(wrapper.attributes('aria-labelledby'))
    })

    it('gives each modal its own title id', async () => {
        const { wrapper } = await mountTwiceWithTranslations(VModal, { title: 'Title', open: false })
        const [firstId, secondId] = wrapper.findAll('h2').map((title) => title.attributes('id'))

        expect(firstId).not.toBe(secondId)
    })

    it.each([
        [languages.en, 'Close'],
        [languages.it, 'Chiudi']
    ])('offers a close button named in the current language', async (language, text) => {
        localStorage.setItem(LANGUAGE_STORAGE_KEY, language)
        const { wrapper } = await mountModal(true)
        const button = wrapper.get('button')

        expect(button.attributes('aria-label')).toBe(text)
    })

    it('hides the close icon from assistive technology', async () => {
        const { wrapper } = await mountModal(true)
        const svg = wrapper.get('svg')

        expect(svg.attributes('aria-hidden')).toBe('true')
    })

    it('closes and reports once when the close button is pressed', async () => {
        const onClose = vi.fn()
        const { wrapper } = await mountModal(true, { onClose })
        await wrapper.get('button').trigger('click')

        expect(onClose).toHaveBeenCalledTimes(1)
        expect(wrapper.emitted('update:open')).toEqual([[false]])
        expect(wrapper.emitted('close')).toHaveLength(1)
    })

    it('shows the actions in a footer', async () => {
        const footerText = 'footerText'
        const { wrapper } = await mountModal(true, {}, { actions: footerText })
        const footer = wrapper.get('footer')

        expect(footer.text()).toBe(footerText)
    })

    it('has no footer without actions', async () => {
        const { wrapper } = await mountModal(true)
        expect(wrapper.find('footer').exists()).toBe(false)
    })

    describe('when the person closes it', () => {
        it.each<[string, (dialog: HTMLDialogElement) => void]>([
            ['Escape', pressEscape],
            ['a click on the backdrop', (dialog) => dialog.click()]
        ])('reports %s as one closing', async (_way, closeIt) => {
            const { wrapper, dialog } = await mountModal(true)
            closeIt(dialog)

            expect(dialog.open).toBe(false)
            expect(wrapper.emitted('update:open')).toEqual([[false]])
            expect(wrapper.emitted('close')).toHaveLength(1)
        })

        it('stays open on a click inside the content', async () => {
            const { wrapper, dialog } = await mountModal(true)
            await wrapper.get('div').trigger('click') // the content wrapper: the click target is not the dialog

            expect(dialog.open).toBe(true)
            expect(wrapper.emitted('close')).toBeUndefined()
        })

        it('calls the listener of the parent once', async () => {
            const onClose = vi.fn()
            const { dialog } = await mountModal(true, { onClose })

            pressEscape(dialog)

            expect(onClose).toHaveBeenCalledTimes(1)
        })

        it('can be closed again after the parent reopens it', async () => {
            const { wrapper, dialog } = await mountModal(true)
            dialog.click()
            await wrapper.setProps({ open: false }) // the parent follows update:open
            await wrapper.setProps({ open: true })
            dialog.click()

            expect(wrapper.emitted('close')).toHaveLength(2)
        })
    })
})
