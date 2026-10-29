export const EVENT_OPEN = 'open';
export const EVENT_CLOSE = 'open';
export const EVENT_CANCEL = 'cancel';

/**
 * jsdom ships an empty HTMLDialogElement. This adds the parts of the HTML spec our tests rely on.
 * It does NOT emulate focus trapping, the top layer or inert content: those need a real browser.
 */
export function installDialogStub(): void {
    const dialogPrototype = HTMLDialogElement.prototype

    // Stricter than the spec on purpose: a second call throws, so our own guard gets tested.
    dialogPrototype.showModal = function showModal(this: HTMLDialogElement) {
        if (this.hasAttribute(EVENT_OPEN)) throw new DOMException('The dialog is already open.', 'InvalidStateError')
        this.setAttribute(EVENT_OPEN, '')
    }

    dialogPrototype.close = function close(this: HTMLDialogElement) {
        if (!this.hasAttribute(EVENT_OPEN)) return
        this.removeAttribute(EVENT_OPEN)
        this.dispatchEvent(new Event(EVENT_CLOSE))
    }
}

/** Does what the browser does on Escape: `cancel` first, and the dialog closes unless someone prevented it. */
export function pressEscape(dialog: HTMLDialogElement): void {
    const cancelEvent = new Event(EVENT_CANCEL, { cancelable: true })
    dialog.dispatchEvent(cancelEvent)
    if (!cancelEvent.defaultPrevented) dialog.close()
}