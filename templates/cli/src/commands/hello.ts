import { Command } from 'commander'
import { consola } from 'consola'
import process from 'node:process'

interface HelloCommandOptions {
  output: string
  printArgs: boolean
}

async function sleep(timeout: number) {
  return new Promise(r => setTimeout(r, timeout))
}

async function action(name: string, options: HelloCommandOptions) {
  try {
    consola.start('Starting program...')
    sleep(1000)

    if (name)
      console.log(`Hello ${name}!`)
    else
      console.log('Hello world!')

    sleep(1000)
    consola.success('Program finished...')

    if (options.printArgs) {
      console.log({
        arguments: {
          name,
        },
      })
    }
  }
  catch (error) {
    consola.error(error)
    process.exit(1)
  }
}

export const hello = new Command()
  .name('hello')
  .description('Simple hello message command')
  .argument('[name]', 'user to greet')
  .option(
    '-o, --output <path>',
    'destination directory for json files',
    './public/r',
  )
  .option(
    '--print-args',
    'print arguments',
    false,
  )
  .action(action)
