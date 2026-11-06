const OPEN_MARKER = 'data-popover-open' // our own marker: jsdom knows nothing about :popover-open
let invokersInstalled = false

function announce(popover: HTMLElement, newState: 'open' | 'closed') {
    popover.dispatchEvent(Object.assign(new Event('toggle'), { newState }))
}

/**
 * jsdom has no popover API. This adds what our tests rely on: show, hide, toggle, the `toggle` event,
 * and the click on a `popovertarget` button. It does NOT emulate the top layer, Esc or light dismiss: those need a real browser.
 */
export function installPopoverStub(): void {
    const elementPrototype = HTMLElement.prototype

    elementPrototype.showPopover = function showPopover(this: HTMLElement) {
        if (this.hasAttribute(OPEN_MARKER)) return
        this.setAttribute(OPEN_MARKER, '')
        announce(this, 'open')
    }
    elementPrototype.hidePopover = function hidePopover(this: HTMLElement) {
        if (!this.hasAttribute(OPEN_MARKER)) return
        this.removeAttribute(OPEN_MARKER)
        announce(this, 'closed')
    }
    elementPrototype.togglePopover = function togglePopover(this: HTMLElement) {
        if (this.hasAttribute(OPEN_MARKER)) this.hidePopover()
        else this.showPopover()
        return this.hasAttribute(OPEN_MARKER)
    }

    if (invokersInstalled) return
    invokersInstalled = true
    document.addEventListener('click', (event) => {
        const invoker = (event.target as Element).closest('[popovertarget]')
        document.getElementById(invoker?.getAttribute('popovertarget') ?? '')?.togglePopover()
    })
}
