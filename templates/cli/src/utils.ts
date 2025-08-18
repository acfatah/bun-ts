import Bun from 'bun'
import consola from 'consola'
import { existsSync } from 'node:fs'
import { readdir } from 'node:fs/promises'

export async function readFile(filepath: string) {
  const file = Bun.file(filepath)

  return await file.text()
}

export async function readDirectory(
  path: string,
  options: { recursive?: boolean, withFileTypes?: boolean, encoding?: string } = {},
) {
  if (!existsSync(path)) {
    consola.warn(`The directory ${path} does not exist. Skipping...`)

    return []
  }

  // @ts-expect-error ignore no verload match for readdir options type
  return readdir(path, options)
}

export async function writeFile(path: string, payload: any) {
  Bun.write(path, payload)
}

export async function removeFile(filename: string) {
  const file = Bun.file(filename)

  if (await file.exists()) {
    await Bun.$`rm ${filename}`
  }
}

export async function rimraf(path: string) {
  await Bun.$`rm -rf ${path}`
}
