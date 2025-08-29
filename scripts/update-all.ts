#!/usr/bin/env bun

import { $, spawn } from 'bun'

async function main() {
  const dirs = (await $`ls templates`.text()).split('\n').filter(Boolean)

  const updatePromises = dirs.map((dir) => {
    return (async () => {
      console.log(`Updating "${dir}" template...`)

      // Update .bun-version file
      await $`bun --version > templates/${dir}/.bun-version`

      // Update packages
      const proc = spawn(
        ['bun', 'update'],
        {
          cwd: `templates/${dir}`,
          stdout: 'ignore',
          stderr: 'ignore',
          onExit(_proc, exitCode, _signalCode, error) {
            if (exitCode) {
              console.error(`An error has occurred while updating ${dir} template.`)
              console.error(error)
            }
          },
        },
      )

      await proc.exited
      console.log(`Done updating "${dir}".`)
    })()
  })

  Promise.all(updatePromises).then(() => {
    console.log('All updates completed.')
  })
}

main()
