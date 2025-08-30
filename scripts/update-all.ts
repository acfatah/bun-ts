#!/usr/bin/env bun

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { join } from 'pathe'
import { readDir } from '../utils'

async function updateTemplate(dirent: Dirent): Promise<void> {
  const templatePath = join(dirent.parentPath, dirent.name)
  const versionFile = join(templatePath, '.bun-version')

  // Update .bun-version file
  await Bun.$`bun --version > ${versionFile}`

  // Update packages
  console.log(`Updating "${templatePath}" template...`)

  const proc = Bun.spawn(
    ['bun', 'update'],
    {
      cwd: templatePath,
      stdout: 'ignore',
      stderr: 'pipe',
    },
  )

  const exitCode = await proc.exited

  if (exitCode) {
    const errorMessage = await proc.stderr?.text()
    console.group(`Error updating "${templatePath}":`)
    console.error(errorMessage)
    console.groupEnd()
  }
  else {
    console.log(`Done updating "${templatePath}".`)
  }
}

async function main() {
  // Update .bun-version file
  await Bun.$`bun --version > .bun-version`

  const dir = await readDir('templates', {
    withFileTypes: true,
  }) as Dirent[]

  const tasks: Promise<void>[] = []

  for (const dirent of dir) {
    if (!dirent.isDirectory())
      continue

    tasks.push(
      updateTemplate(dirent),
    )
  }

  try {
    await Promise.all(tasks)
    console.log('All updates completed.')
  }
  catch (error) {
    console.error('An error occurred during the update:', error)
  }
}

main()
