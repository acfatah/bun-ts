#!/usr/bin/env bun

/**
 * Script to update all Bun templates in the 'templates' directory.
 */

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import process from 'node:process'
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
  console.log(`Updating "${pathName}"`)

  const proc = Bun.spawn(['bun', 'update'], {
    cwd: path,
    // Avoid backpressure: stream directly to terminal
    stdout: 'inherit',
    stderr: 'inherit',
  })

  // Safety timeout (default 5 minutes; override with UPDATE_TIMEOUT_MS)
  const timeoutMs = Number(process.env.UPDATE_TIMEOUT_MS ?? 5 * 60 * 1000)
  let timedOut = false
  const timer = setTimeout(() => {
    timedOut = true
    try {
      proc.kill()
    }
    catch {}
  }, timeoutMs)

  const exitCode = await proc.exited.finally(() => clearTimeout(timer))

  if (timedOut) {
    console.error(`Update for ${pathName} timed out after ${timeoutMs}ms and was killed.`)

    return
  }

  if (exitCode) {
    console.error(`ERROR: Failed to update "${path}" (exit ${exitCode}). See output above.`)
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

  // Run sequentially to avoid backpressure and resource spikes
  for (const dirent of dir) {
    if (!dirent.isDirectory())
      continue

    try {
      await updateDeps(dirent)
    }
    catch (error) {
      console.error(`An error occurred during the update of "${join(dirent.parentPath, dirent.name)}":`, error)
    }
  }

  console.log('All updates completed.')
}

main()
