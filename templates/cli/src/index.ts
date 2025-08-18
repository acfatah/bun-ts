#!/usr/bin/env bun

import { Command } from 'commander'
import packageJson from '../package.json'
import { hello } from './commands/hello'

async function main() {
  const program = new Command()
    .name('cli')
    .description('Command line interface')
    .version(
      packageJson.version,
      '-v, --version',
      'display the version number',
    )

  program
    .addCommand(hello)

  program.parse()
}

main()
