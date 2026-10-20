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
            to: {path: '^common/src/(images/imagePipeline|vite/)', reachable: true},
        },
        {
            name: 'browser-entry-reaches-node-or-build-deps',
            severity: 'error',
            from: {path: '^common/src/index\\.ts$'},
            to: {path: '^((node:)?(fs|path|url|os|child_process)|sharp|vite|vite-imagetools)$', reachable: true},
        },
    ],
    options: {
        doNotFollow: {path: 'node_modules'},
        exclude: {path: '(^|/)(tests|coverage|dist|node_modules)/'},
    },
}