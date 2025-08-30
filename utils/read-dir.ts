import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'

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
