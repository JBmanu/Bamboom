export const RASTER_EXTENSIONS = ['avif', 'gif', 'heif', 'jpeg', 'jpg', 'png', 'tiff', 'webp'] as const

const RASTER_FILE = new RegExp(`\\.(${RASTER_EXTENSIONS.join('|')})$`, 'i')

export const isRasterFile = (path: string): boolean => RASTER_FILE.test(path)
