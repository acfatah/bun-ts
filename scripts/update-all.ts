#!/usr/bin/env bun

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { join } from 'pathe'
import { readDir } from './utils'

async function updateTemplate(dirent: Dirent): Promise<void> {
  const path = join(dirent.parentPath, dirent.name)
  const versionFile = join(path, '.bun-version')

  // Update .bun-version file
  await Bun.$`bun --version > ${versionFile}`

  // Update packages
  console.log(`Updating "${path}" template...`)

  const proc = Bun.spawn(
    ['bun', 'update'],
    {
      cwd: path,
      stdout: 'pipe',
      stderr: 'pipe',
    },
  )

  const exitCode = await proc.exited

  if (exitCode) {
    const [stderrText, stdoutText] = await Promise.all([
      proc.stderr ? new Response(proc.stderr).text() : Promise.resolve(''),
      proc.stdout ? new Response(proc.stdout).text() : Promise.resolve(''),
    ])

    const message = [stderrText, stdoutText].filter(Boolean).join('\n')

    console.group(`Error updating "${path}" (exit ${exitCode}):`)
    if (message) {
      for (const line of message.split(/\r?\n/)) {
        console.error(line)
      }
    }
    else {
      console.error(
        'Process failed with no output. Consider setting stdout to "pipe" or "inherit" in Bun.spawn to capture stack traces.',
      )
    }
    console.groupEnd()
  }
  else {
    console.log(`Done updating "${path}".`)
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
