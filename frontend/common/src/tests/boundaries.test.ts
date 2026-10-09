// @vitest-environment node
import { ESLint } from 'eslint'
import { describe, expect, it } from 'vitest'
import { resolve } from 'node:path'

const eslint = new ESLint({ cwd: resolve(process.cwd(), '..') })

type Pkg = 'common' | 'player' | 'admin'

// The probe file never exists on disk: ESLint only needs a path to pick the matching config block.
async function boundaryErrors(pkg: Pkg, code: string) {
    const [result] = await eslint.lintText(code, { filePath: `${pkg}/src/boundary-probe.ts` })
    return result.messages.filter((m) => m.ruleId === 'no-restricted-imports')
}

describe('frontend import boundaries', () => {
    it.each([
        ['common -> player (relative)', 'common', "import '../../player/src/main'"],
        ['common -> player (package name)', 'common', "import 'player'"],
        ['player -> admin', 'player', "import '../../admin/src/main'"],
        ['admin -> player', 'admin', "import '../../player/src/main'"],
        ['player -> common internals', 'player', "import '../../common/src/components/AppButton.vue'"]
    ] as const)('forbids %s', async (_label, pkg, code) => {
        expect(await boundaryErrors(pkg, code)).toHaveLength(1)
    })

    it.each([
        ['player -> @bamboom/common', 'player', "import { AppButton } from '@bamboom/common'"],
        ['admin -> @bamboom/common', 'admin', "import { AppButton } from '@bamboom/common'"],
        ['player -> its own module', 'player', "import './main'"],
        ['admin -> its own module', 'admin', "import './main'"],
        ['common -> vue', 'common', "import { ref } from 'vue'"],
        ['common -> its own module', 'common', "import './components'"]
    ] as const)('allows %s', async (_label, pkg, code) => {
        expect(await boundaryErrors(pkg, code)).toHaveLength(0)
    })
})
