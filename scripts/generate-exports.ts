#!/usr/bin/env bun

/**
 * Generate an index.ts file that exports all script files from a given directory.
 */

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { stripIndent } from 'common-tags'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { join } from 'pathe'

import { readDir, readLine, writeFile } from './utils'

const argv = typeof Bun !== 'undefined' ? Bun.argv : process.argv

interface Options {
  help?: boolean
  example?: string
}

let options: Options
let args: string[] = []

try {
  const { values, positionals } = parseArgs({
    args: argv,
    strict: true,
    allowPositionals: true,
    options: {
      help: {
        type: 'boolean',
      },
    },
  })

  options = values
  args = positionals.slice(2)
}
catch (error: unknown) {
  if (
    typeof error === 'object'
    && error !== null
    && 'code' in error
    && (error as { code?: string }).code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE'
  ) {
    console.error('Error: Invalid option value. Use --help to see all valid options.')
  }
  else if (
    typeof error === 'object'
    && error !== null
    && 'message' in error
    && typeof (error as { message?: unknown }).message === 'string'
  ) {
    console.error(`Error: ${(error as { message: string }).message}`)
  }
  else {
    console.error('Error: Unknown error')
  }

  process.exit(1)
}

function helpMessage() {
  console.log(stripIndent`
    Usage: generate-exports [options] <destination>

    Description:
      Generate an index.ts file that exports all script files from a given directory.
      By default, it skips index.ts and index.js files.

    Options:
      --help        Show this help message and exit.

    Arguments:
      destination   The directory where the index.ts file will be generated.

    Example:
      generate-exports src/components

    Note:
      If an index.ts already exists in the destination, you'll be prompted to overwrite it.
  `)
}

async function main() {
  if (options.help)
    return helpMessage()

  const destination = args[0]
  const dir = await readDir(destination ?? '', {
    withFileTypes: true,
  }) as Dirent[]
  let content = ''

  for (const dirent of dir.sort((a, b) => a?.name.localeCompare(b?.name))) {
    if (!dirent.isFile())
      continue

    if (dirent.name.match(/index\.(?:ts|js)/))
      continue

    content += `export * from './${dirent.name}'`
    content += '\n'
  }

  const indexFile = Bun.file(`${join(destination ?? '', 'index.ts')}`)

  if (await indexFile.exists()) {
    process.stdout.write(`${indexFile.name} already exists. Overwrite? [No] \n> `)

    const confirm = await readLine()

    if (!confirm.match(/^y/i))
      process.exit(0)
  }

  try {
    await writeFile(indexFile.name as string, content)
  }
  catch (error) {
    console.error(error)
  }
}

void main()
