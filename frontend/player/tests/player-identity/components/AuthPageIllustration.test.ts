import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { Picture } from '@bamboom/common'
import AuthPageIllustration from '../../../src/player-identity/components/AuthPageIllustration.vue'

const picture: Picture = {
    sources: { webp: 'letter-144.webp 144w, letter-288.webp 288w' },
    img: { src: 'letter-288.png', w: 288, h: 288 }
}

describe('AuthPageIllustration', () => {
    it('given a picture, when it is shown, then the image is the given one', () => {
        const wrapper = mount(AuthPageIllustration, { props: { picture } })
        expect(wrapper.find('img').attributes('src')).toBe('letter-288.png')
    })

    it('given a picture, when it is shown, then it is decorative: its alternative text is empty', () => {
        const wrapper = mount(AuthPageIllustration, { props: { picture } })
        expect(wrapper.find('img').attributes('alt')).toBe('')
    })
})
