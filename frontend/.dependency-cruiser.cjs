/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
    forbidden: [
        {
            name: 'no-circular',
            severity: 'error',
            from: {},
            to: {circular: true},
        },
        {
            name: 'browser-entry-reaches-build-tooling',
            severity: 'error',
            from: {path: '^common/src/index\\.ts$'},
            to: {path: '^common/src/vite/', reachable: true},
        },
        {
            name: 'browser-entry-reaches-node-or-build-deps',
            severity: 'error',
            from: {path: '^common/src/index\\.ts$'},
            to: {
                path: '^((node:)?(fs|path|url|os|child_process)|sharp|vite|vite-imagetools|unplugin-icons(/vite)?)$',
                reachable: true
            },
        },
        {
            name: 'common-must-not-depend-on-apps',
            severity: 'error',
            from: {path: '^common/src'},
            to: {path: '^(player|admin)(/|$)'},
        },
        {
            name: 'apps-must-be-independent',
            severity: 'error',
            from: {path: '^(player|admin)/src'},
            to: {path: '^(player|admin)(/|$)', pathNot: '^$1(/|$)'},
        },
        {
            name: 'apps-use-common-public-api-only',
            severity: 'error',
            from: {path: '^(player|admin)/src'},
            to: {path: '^(common/src|@bamboom/common/)'},
        },
        {
            name: 'production-code-must-not-import-dev',
            severity: 'error',
            from: {path: '^player/src', pathNot: '^player/src/dev/'},
            to: {path: '^player/src/dev/'},
        },
        {
            name: 'modules-use-each-other-through-index-only',
            severity: 'error',
            from: {path: '^(player|admin)/src/([^/]+)/'},
            to: {
                path: '^$1/src/[^/]+/',
                pathNot: ['^$1/src/$2/', '^$1/src/[^/]+/index\\.ts$', '^$1/src/(shared|dev)/'],
            },
        },
        {
            // These layers are plain TypeScript: they can be tested and reused without Vue, and Zod never reaches the main bundle through them.
            name: 'identity-layers-must-not-use-frameworks',
            severity: 'error',
            from: {path: '^player/src/player-identity/(schemas|errors|api)/'},
            // Real packages resolve to node_modules/<name>/..., packages absent from disk keep their name: both are matched.
            to: {path: '^(node_modules/)?(vue|pinia|vue-router)(/|$)'},
        },
    ],
    options: {
        doNotFollow: {path: 'node_modules'},
        exclude: {path: '(^|/)(coverage|dist|node_modules)/'},
    },
}