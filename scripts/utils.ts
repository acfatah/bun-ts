import Bun from 'bun'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'
import process from 'node:process'
import Readline from 'node:readline'

export async function readDir(
  path: string,
  options: {
    withFileTypes: boolean
    recursive?: boolean
    encoding?: string
  } = { withFileTypes: true },
) {
  if (!existsSync(path)) {
    throw new Error(`The directory "${path}" does not exist.`)
  }

  // @ts-expect-error Ignore readdir options type mismatch
  return readdir(path, options)
}

/**
 * Simple readFile as text.
 */
export async function readFile(filepath: string, _options = {}) {
  const file = Bun.file(filepath)
  const fileExists = await file.exists()

  if (!fileExists)
    throw new Error(`The path "${filepath}" does not exists.`)

  return file.text()
}

/**
 * Simple readLine
 */
export async function readLine(): Promise<string> {
  return new Promise((resolve) => {
    const rl = Readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    })

    rl.on('line', (line) => {
      resolve(line.trim())
      rl.close()
    })
  })
}

/**
 * @see https://bun.sh/docs/api/file-io#writing-files-bun-write
 */
export async function writeFile(
  destination: string,
  data: string | Blob | ArrayBufferLike | NodeJS.TypedArray | Uint8Array,
) {
  await Bun.write(destination, data)
}
