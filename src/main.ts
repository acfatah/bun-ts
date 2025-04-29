import process from 'node:process'
import { parseArgs } from 'node:util'

interface Options {
  help?: boolean
  example?: string
}

let options: Options
let args: string[] = []

try {
  const { values, positionals } = parseArgs({
    args: Bun.argv,
    strict: true,
    allowPositionals: true,
    options: {
      help: {
        type: 'boolean',
      },

      example: {
        type: 'string',
      },
    },
  })

  options = values
  args = positionals.slice(2)
}
catch (error: any) {
  if (error.code === 'ERR_PARSE_ARGS_INVALID_OPTION_VALUE') {
    console.error('Error: Invalid option value. Use --help to see all valid options.')
  }
  else {
    console.error(`Error: ${error.message}`)
  }

  process.exit(1)
}

export function main() {
  if (options.help) {
    console.log('This is some help message.')

    return
  }

  console.log('Hello, world!')

  if (options.example) {
    console.log(`example: ${options.example}`)
  }

  if (args.length > 0) {
    console.log('Positionals:', args)
  }
}

main()
