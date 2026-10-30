const OPEN_ATTRIBUTE = 'open'
const CLOSE_EVENT = 'close'
const CANCEL_EVENT = 'cancel'

/**
 * jsdom ships an empty HTMLDialogElement. This adds the parts of the HTML spec our tests rely on.
 * It does NOT emulate focus trapping, the top layer or inert content: those need a real browser.
 */
export function installDialogStub(): void {
    const dialogPrototype = HTMLDialogElement.prototype

    // Stricter than the spec on purpose: a second call throws, so our own guard gets tested.
    dialogPrototype.showModal = function showModal(this: HTMLDialogElement) {
        if (this.hasAttribute(OPEN_ATTRIBUTE)) throw new DOMException('The dialog is already open.', 'InvalidStateError')
        this.setAttribute(OPEN_ATTRIBUTE, '')
    }

    dialogPrototype.close = function close(this: HTMLDialogElement) {
        if (!this.hasAttribute(OPEN_ATTRIBUTE)) return
        this.removeAttribute(OPEN_ATTRIBUTE)
        this.dispatchEvent(new Event(CLOSE_EVENT))
    }
}

/** Does what the browser does on Escape: `cancel` first, and the dialog closes unless someone prevented it. */
export function pressEscape(dialog: HTMLDialogElement): void {
    const cancelEvent = new Event(CANCEL_EVENT, { cancelable: true })
    dialog.dispatchEvent(cancelEvent)
    if (!cancelEvent.defaultPrevented) dialog.close()
}
