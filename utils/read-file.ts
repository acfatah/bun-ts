import Bun from 'bun'

/**
 * Simple readFile as text.
 */
export async function readFile(filepath: string, _options = {}) {
  const file = Bun.file(filepath)

  if (!file.exists())
    throw new Error(`The path "${filepath}" does not exists.`)

  return await file.text()
}
