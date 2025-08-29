import type { BuildConfig } from 'bun'
import dts from 'bun-plugin-dts'

const defaultBuildConfig: BuildConfig = {
  entrypoints: ['./src/index.ts'],
  outdir: './dist',
}

Promise.all([
  Bun.build({
    ...defaultBuildConfig,
    plugins: [dts()],
    format: 'esm',
    target: 'node',
    naming: '[dir]/[name].mjs',
  }),
])
