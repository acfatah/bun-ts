import process from 'node:process'
import Readline from 'node:readline'

/**
 * Simple readLine
 */
export function readLine(): Promise<string> {
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
