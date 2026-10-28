import '../main.css'
import { createTranslations } from '@bamboom/common'
import { createApp } from 'vue'
import GalleryPage from './GalleryPage.vue'

createApp(GalleryPage)
    .use(await createTranslations())
    .mount('#app')
