import Icons from 'unplugin-icons/vite'

/** Compiles `~icons/<set>/<name>` imports into Vue components. One setup, so every app renders icons the same way. */
export function iconsPlugin() {
    // scale 1: the default (1.2em) would make every icon larger than the text next to it.
    return Icons({ compiler: 'vue3', scale: 1 })
}
