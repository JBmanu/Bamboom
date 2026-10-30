import { beforeAll, describe, expect, it, vi } from 'vitest'
import { installDialogStub, pressEscape } from './installDialogStub'

beforeAll(installDialogStub)

const createOpenDialog = () => {
    const dialog = document.createElement('dialog')
    dialog.showModal()
    return dialog
}

describe('the dialog stub', () => {
    it('opens with showModal', () => {
        expect(createOpenDialog().hasAttribute('open')).toBe(true)
    })

    it('refuses to open a dialog that is already open', () => {
        expect(() => createOpenDialog().showModal()).toThrow(DOMException)
    })

    it('fires close once when closed, and not when it was already closed', () => {
        const dialog = createOpenDialog()
        const onClose = vi.fn()
        dialog.addEventListener('close', onClose)

        dialog.close()
        dialog.close()

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('closes on Escape unless cancel is prevented', () => {
        const closing = createOpenDialog()
        pressEscape(closing)
        expect(closing.hasAttribute('open')).toBe(false)

        const staying = createOpenDialog()
        staying.addEventListener('cancel', (event) => event.preventDefault())
        pressEscape(staying)
        expect(staying.hasAttribute('open')).toBe(true)
    })
})
