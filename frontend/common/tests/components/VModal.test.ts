import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import VModal from '../../src/components/VModal.vue'
import { installDialogStub, pressEscape } from '../utils/installDialogStub.ts'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)
beforeAll(installDialogStub)
afterEach(() => vi.restoreAllMocks())

async function mountModal(open = false, extraProps: Record<string, unknown> = {}) {
    const { wrapper } = await mountWithTranslations(
        VModal,
        {},
        {
            props: { open, ...extraProps },
            slots: { default: 'Content' }
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
        expect(wrapper.text()).toBe('Content')
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
