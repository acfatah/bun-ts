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
              throw new Error(
                error?.message || `Update failed with exit code ${exitCode}`,
              )
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
  }).catch((error) => {
    console.error('An error occurred:', error)
  })
}

main()
