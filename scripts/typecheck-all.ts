#!/usr/bin/env bun

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { join } from 'pathe'
import { readDir } from './utils'

const TARGET_DIR = 'templates'
const tsgo = Bun.argv[2] === '--tsgo'

async function typecheckTemplate(dirent: Dirent): Promise<void> {
  const path = join(dirent.parentPath, dirent.name)

  console.log(`Typechecking "${path}"`)

  const proc = Bun.spawn(
    ['bun', tsgo ? 'typecheck:tsgo' : 'typecheck'],
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

    console.group(`Error typechecking "${path}" (exit ${exitCode}):`)
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
    console.log(`"${path}" is OK.`)
  }
}

async function main() {
  const dir = await readDir(TARGET_DIR, {
    withFileTypes: true,
  }) as Dirent[]

  const tasks: Promise<void>[] = []

  for (const dirent of dir) {
    if (!dirent.isDirectory())
      continue

    tasks.push(
      typecheckTemplate(dirent),
    )
  }

  try {
    await Promise.all(tasks)
    console.log('All typechecks completed.')
  }
  catch (error) {
    console.error('An error occurred during the typecheck:', error)
  }
}

main()
