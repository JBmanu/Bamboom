import { createTranslations, VBanner, VButton, VIcon, VLayers, VPicture, VSpinner, VStrengthMeter, VTextField } from '@bamboom/common'
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import GalleryPage from '../../src/dev/GalleryPage.vue'
import IconsSection from '../../src/dev/sections/IconsSection.vue'

const mountGallery = async () => mount(GalleryPage, { global: { plugins: [await createTranslations()] } })

afterEach(() => vi.restoreAllMocks())

describe('GalleryPage', () => {
    it('mounts without Vue warnings', async () => {
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
        await mountGallery()

        expect(warn).not.toHaveBeenCalled()
    })

    it('shows buttons in every state', async () => {
        const buttons = (await mountGallery()).findAllComponents(VButton)

        expect(buttons.map((button) => button.props('variant'))).toEqual(expect.arrayContaining(['primary', 'ghost']))
        expect(buttons.some((button) => button.props('loading'))).toBe(true)
        expect(buttons.some((button) => button.props('disabled'))).toBe(true)
    })

    it('shows a banner of every variant', async () => {
        const banners = (await mountGallery()).findAllComponents(VBanner)

        expect(banners.map((banner) => banner.props('variant')).sort()).toEqual(['error', 'info', 'loading', 'success'])
    })

    it('shows fields in every state', async () => {
        const fields = (await mountGallery()).findAllComponents(VTextField)

        expect(fields.some((field) => field.props('error'))).toBe(true)
        expect(fields.some((field) => field.props('valid'))).toBe(true)
        expect(fields.some((field) => field.props('icon'))).toBe(true)
        expect(fields.some((field) => field.get('input').attributes('disabled') !== undefined)).toBe(true)
        expect(fields.some((field) => field.get('input').attributes('readonly') !== undefined)).toBe(true)
    })

    it('shows the strength meter at every level', async () => {
        const meters = (await mountGallery()).findAllComponents(VStrengthMeter)

        expect(meters.map((meter) => meter.props('level'))).toEqual([0, 1, 2, 3, 4])
    })

    it('show a spinner that announces itself and one that stays silent', async () => {
        const spinners = (await mountGallery()).findAllComponents(VSpinner)

        expect(spinners.some((spinner) => spinner.props('label'))).toBe(true)
        expect(spinners.some((spinner) => spinner.props('decorative'))).toBe(true)
        expect(spinners.some((spinner) => !spinner.props('decorative'))).toBe(true)
        expect(spinners.some((spinner) => !spinner.props('decorative') && spinner.props('label') === undefined)).toBe(true)
    })

    it('shows icon in every state', async () => {
        const icons = (await mountGallery()).findComponent(IconsSection).findAllComponents(VIcon)

        expect(icons.some((icon) => icon.props('label'))).toBe(true)
        expect(icons.some((icon) => !icon.props('label'))).toBe(true)
    })

    it('shows layers with and without a base and an overlay', async () => {
        const layers = (await mountGallery()).findAllComponents(VLayers)

        expect(layers.some((layer) => layer.find('[data-layer="base"]').exists())).toBe(true)
        expect(layers.some((layer) => layer.find('[data-layer="overlay"]').exists())).toBe(true)
        expect(layers.some((layer) => !layer.find('[data-layer="base"]').exists() && !layer.find('[data-layer="overlay"]').exists())).toBe(true)
    })

    it('shows a lazy picture and a priority picture', async () => {
        const pictures = (await mountGallery()).findAllComponents(VPicture)

        expect(pictures.length).toBeGreaterThan(0)
        expect(pictures.every((picture) => picture.props('alt').length > 0)).toBe(true)
        expect(pictures.some((picture) => picture.props('priority'))).toBe(true)
        expect(pictures.some((picture) => !picture.props('priority'))).toBe(true)
    })
})
