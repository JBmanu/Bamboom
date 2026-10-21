/// <reference types="vite/client" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<Record<string, never>, Record<string, never>, unknown>
    export default component
}

declare module '*?as=picture' {
    // Bare specifier on purpose: relative imports are not allowed in ambient module declarations.
    import type { Picture } from '@bamboom/common'
    const picture: Picture
    export default picture
}
