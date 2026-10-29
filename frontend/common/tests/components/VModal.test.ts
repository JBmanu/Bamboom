import { enableAutoUnmount } from '@vue/test-utils'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'
import VModal from '../../src/components/VModal.vue'
import { installDialogStub } from '../utils/installDialogStub.ts'
import { mountWithTranslations } from '../utils/mountWithTranslations.ts'

enableAutoUnmount(afterEach)
beforeAll(installDialogStub)
afterEach(() => vi.restoreAllMocks())

async function mountModal(open = false) {
    const { wrapper } = await mountWithTranslations(VModal, {}, { props: { open }, slots: { default: 'Content' } })
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
})
