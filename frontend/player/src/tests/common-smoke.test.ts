import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
// Unresolved on purpose: this is the red step.
import { AppButton } from '@bamboom/common'

describe('@bamboom/common consumption', () => {
    it('renders a shared component inside the player app', () => {
        const wrapper = mount(AppButton, { slots: { default: 'Play' } })
        expect(wrapper.text()).toBe('Play')
    })
})
