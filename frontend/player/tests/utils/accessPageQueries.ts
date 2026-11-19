import { flushPromises } from '@vue/test-utils'

export const titleOf = (container: HTMLElement) => container.querySelector('[data-layer="content"] h1')?.textContent
export const subtitleOf = (container: HTMLElement) => container.querySelector('[data-layer="content"] header p')?.textContent

/** Finds an input the way a person does: by the text of its label, through the label's `for`. */
export function findFieldByLabel(container: HTMLElement, labelText: string) {
    const label = [...container.querySelectorAll('label')].find((element) => element.textContent?.trim() === labelText)
    return container.querySelector<HTMLInputElement>(`#${CSS.escape(label!.htmlFor)}`)!
}

/** Finds a link the way a person does: by the text it shows. */
export function findLinkByText(container: HTMLElement, linkText: string) {
    return [...container.querySelectorAll('a')].find((element) => element.textContent?.trim() === linkText)
}

/** The error a screen reader announces for the field: the element its `aria-describedby` points to. */
export function readFieldError(input: HTMLInputElement) {
    const errorId = input.getAttribute('aria-describedby')
    return errorId ? document.getElementById(errorId)?.textContent : undefined
}

// flushPromises: TanStack validates asynchronously, so the test waits for every pending promise before looking.
export async function typeInto(input: HTMLInputElement, text: string) {
    input.value = text
    input.dispatchEvent(new Event('input'))
    await flushPromises()
}

export async function submitForm(container: HTMLElement) {
    container.querySelector('form')!.dispatchEvent(new Event('submit'))
    await flushPromises()
}
