#!/usr/bin/env bun

/**
 * Script to update all Bun template in the "templates" directory.
 */

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { join } from 'pathe'
import { readDir } from './utils'

const TARGET_DIR = 'templates'

/**
 * Update dependencies in the given directory.
 */
async function updateDeps(target: string | Dirent): Promise<void> {
  const path = typeof target === 'string' ? target : join(target.parentPath, target.name)
  const versionFile = join(path, '.bun-version')
  const pathName = path === '.' ? 'root' : `"${path}"`

  // Update .bun-version file to follow the Bun version on the system
  await Bun.$`bun --version > ${versionFile}`

  // Update packages
  console.log(`Updating "${pathName}" app...`)

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

    console.error(`ERROR: Failed to update "${path}" (exit ${exitCode})`)
    console.group(`Error details for "${path}" (exit ${exitCode}):`)
    const message = [stderrText, stdoutText].filter(Boolean).join('\n')
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
    console.log(`Done updating "${pathName}".`)
  }
}

async function main() {
  // Update root directory
  await Bun.$`bun --version > .bun-version`
  await updateDeps('.')

  const dir = await readDir(TARGET_DIR, {
    withFileTypes: true,
  }) as Dirent[]

  const tasks: Promise<void>[] = []

  for (const dirent of dir) {
    if (!dirent.isDirectory())
      continue

    tasks.push(
      updateApp(dirent),
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
