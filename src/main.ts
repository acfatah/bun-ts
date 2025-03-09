import {
  confirm,
  spinner as createSpinner,
  intro,
  isCancel,
  log,
  outro,
} from '@clack/prompts'
import * as ansis from 'ansis'
import { EventEmitter } from 'node:events'
import process from 'node:process'

const VERSION = '1.0.0'
const app = new EventEmitter()
const spinner = createSpinner()

function clear(): void {
  process.stdout.write('\x1B[2J\x1B[0f')
}

async function confirmAction(message: string): Promise<boolean> {
  const result = await confirm({ message })

  if (!result || isCancel(result)) {
    app.emit('exit')

    return false
  }

  return result
}

export function main(): void {
  // Remove previous listeners to avoid memory leaks
  app.removeAllListeners('continue')
  app.removeAllListeners('exit')

  app.on('continue', async () => {
    clear()
    intro(`${ansis.bgGreen`Hello, world!`}${ansis.dim` v${VERSION}`}`)

    if (!await confirmAction('This program will do something. Would you like to continue?'))
      return

    // Simulate the main process
    spinner.start('Doing something...')
    await new Promise(resolve => setTimeout(resolve, 1000))
    spinner.stop('Done!')

    log.message('Finished all tasks!')
    if (await confirmAction('Do you want to start over?'))
      app.emit('continue')
  })

  app.on('exit', () => {
    outro('Goodbye!')
    process.exit(0)
  })

  app.emit('continue')
}

main()
