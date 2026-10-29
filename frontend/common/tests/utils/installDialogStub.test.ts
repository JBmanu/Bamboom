import { beforeAll, describe, expect, it, vi } from 'vitest'
import { EVENT_CANCEL, EVENT_CLOSE, EVENT_OPEN, installDialogStub, pressEscape } from './installDialogStub'

beforeAll(installDialogStub)

const createOpenDialog = () => {
    const dialog = document.createElement('dialog')
    dialog.showModal()
    return dialog
}

describe('the dialog stub', () => {
    it('opens with showModal', () => {
        expect(createOpenDialog().hasAttribute(EVENT_OPEN)).toBe(true)
    })

    it('refuses to open a dialog that is already open', () => {
        expect(() => createOpenDialog().showModal()).toThrow(DOMException)
    })

    it('fires close once when closed, and not when it was already closed', () => {
        const dialog = createOpenDialog()
        const onClose = vi.fn()
        dialog.addEventListener(EVENT_CLOSE, onClose)

        dialog.close()
        dialog.close()

        expect(onClose).toHaveBeenCalledTimes(1)
    })

    it('closes on Escape unless cancel is prevented', () => {
        const closing = createOpenDialog()
        pressEscape(closing)
        expect(closing.hasAttribute(EVENT_OPEN)).toBe(false)

        const staying = createOpenDialog()
        staying.addEventListener(EVENT_CANCEL, (event) => event.preventDefault())
        pressEscape(staying)
        expect(staying.hasAttribute(EVENT_OPEN)).toBe(true)
    })
})