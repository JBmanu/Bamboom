import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { VButton } from '@bamboom/common'

describe('@bamboom/common consumption', () => {
    it('renders a shared component inside the player app', () => {
        const wrapper = mount(VButton, { slots: { default: 'Play' } })
        expect(wrapper.text()).toBe('Play')
    })
})
