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
    ],
    options: {
        doNotFollow: {path: 'node_modules'},
        exclude: {path: '(^|/)(coverage|dist|node_modules)/'},
    },
}