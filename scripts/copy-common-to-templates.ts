#!/usr/bin/env bun

/**
 * Copy common files under templates/_ to each other template directory,
 * preserving the same relative paths.
 *
 * Options:
 *   --dry           Print actions without writing files
 *   --force         Overwrite existing files even if different
 *   --verbose       Print more info
 *   --no-color      Disable colored output (or set NO_COLOR)
 *   --color         Force colored output even if not TTY (or set FORCE_COLOR)
 */

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { readFile as fsReadFile, mkdir, readdir } from 'node:fs/promises'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { join, relative, sep } from 'pathe'
import { writeFile as bunWriteFile } from './utils'

const TEMPLATES_DIR = 'templates'
const BASE_DIR = join(TEMPLATES_DIR, '_')

const argv = Array.isArray((Bun as any)?.argv) ? (Bun as any).argv.slice(2) : process.argv.slice(2)
const { values } = parseArgs({
  args: argv,
  strict: true,
  options: {
    'dry': { type: 'boolean', default: false },
    'force': { type: 'boolean', default: false },
    'verbose': { type: 'boolean', default: false },
    'no-color': { type: 'boolean', default: false },
    'noColor': { type: 'boolean', default: false },
    'color': { type: 'boolean', default: false },
  },
})
const DRY = Boolean(values.dry)
const FORCE = Boolean(values.force)
const VERBOSE = Boolean(values.verbose)
const NO_COLOR_FLAG = Boolean(values['no-color'] || values.noColor)
const FORCE_COLOR_FLAG = Boolean(values.color)
const NO_COLOR_ENV = Boolean(process.env.NO_COLOR)
const FORCE_COLOR_ENV = Boolean(process.env.FORCE_COLOR)
const isStdoutTTY = Boolean((process.stdout as any)?.isTTY)
const COLOR_ENABLED = (!NO_COLOR_FLAG && !NO_COLOR_ENV) && (FORCE_COLOR_FLAG || FORCE_COLOR_ENV || isStdoutTTY)

const COLORS = {
  red: '\x1B[31m',
  green: '\x1B[32m',
  yellow: '\x1B[33m',
  gray: '\x1B[90m',
  reset: '\x1B[0m',
} as const

function color(text: string, c: keyof Omit<typeof COLORS, 'reset'>) {
  if (!COLOR_ENABLED)
    return text

  return `${COLORS[c]}${text}${COLORS.reset}`
}

function shouldIgnorePath(p: string, extraDirs: string[] = []) {
  const dirs = [
    'node_modules',
    '.git',
    '.vscode',
    'dist',
    'coverage',
    'logs',
    'upload',
    'drizzle',
    'drizzle.meta',
    ...extraDirs.filter(Boolean),
  ]
  const parts = p.split(sep)

  return dirs.some((seg: string) => parts.includes(seg))
}

async function walkFiles(root: string, extraDirs: string[] = []): Promise<string[]> {
  const out: string[] = []
  async function walk(dir: string) {
    const entries = await readdir(dir, { withFileTypes: true }) as Dirent[]
    for (const ent of entries) {
      const full = join(dir, ent.name)
      if (shouldIgnorePath(full, extraDirs))
        continue
      if (ent.isDirectory()) {
        await walk(full)
      }
      else if (ent.isFile()) {
        out.push(full)
      }
    }
  }
  await walk(root)

  return out
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function filesEqual(aPath: string, bPath: string): Promise<boolean> {
  try {
    const [a, b] = await Promise.all([fsReadFile(aPath), fsReadFile(bPath)])
    if (a.byteLength !== b.byteLength)
      return false
    // Fast path for identical object
    if (a.buffer === b.buffer)
      return true
    for (let i = 0; i < a.byteLength; i++) {
      if (a[i] !== b[i])
        return false
    }

    return true
  }
  catch {
    return false
  }
}

async function main() {
  // Find target template dirs (exclude _)
  const dirs = (await readdir(TEMPLATES_DIR, { withFileTypes: true }) as Dirent[])
    .filter(d => d.isDirectory())
    .map(d => join(TEMPLATES_DIR, d.name))
    .filter(d => d !== BASE_DIR)

  // Load simple ignore directories from each template's .gitignore (lines ending with '/')
  const dirIgnores = new Map<string, string[]>()
  for (const dir of dirs) {
    const igPath = join(dir, '.gitignore')
    let dirsToIgnore: string[] = []
    try {
      const ig = await fsReadFile(igPath, 'utf8')
      dirsToIgnore = ig
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('#') && l.endsWith('/'))
        .map(l => l.replace(/\/+/, '').replace(/\/$/, ''))
    }
    catch {}
    dirIgnores.set(dir, dirsToIgnore)
  }

  // Source files from BASE_DIR (_)
  const baseFiles = await walkFiles(BASE_DIR)

  let considered = 0
  let copied = 0
  let skipped = 0
  let conflicts = 0

  for (const src of baseFiles) {
    const rel = relative(BASE_DIR, src)
    considered++

    for (const target of dirs) {
      // Skip if target's own ignore indicates this path should be ignored
      const ignoreDirs = dirIgnores.get(target) || []
      if (shouldIgnorePath(join(target, rel), ignoreDirs)) {
        if (VERBOSE)
          console.log(color(`[ignored] ${rel} -> ${target.split(sep).at(-1)}`, 'gray'))
        continue
      }

      const dest = join(target, rel)
      // Check existing state
      let exists = false
      try {
        await fsReadFile(dest)
        exists = true
      }
      catch {}

      if (exists) {
        const same = await filesEqual(src, dest)
        if (same) {
          skipped++
          if (VERBOSE)
            console.log(color(`[skip-same] ${rel} -> ${target.split(sep).at(-1)}`, 'yellow'))
          continue
        }
        if (!FORCE) {
          console.warn(color(`[conflict] ${rel} differs in ${target.split(sep).at(-1)}. Use --force to overwrite.`, 'red'))
          conflicts++
          continue
        }
      }

      if (DRY) {
        console.log(color(`[dry] copy ${rel} -> ${target.split(sep).at(-1)}`, 'gray'))
        copied++
        continue
      }

      await ensureDir(dest.split(sep).slice(0, -1).join(sep))
      const data = await fsReadFile(src)
      await bunWriteFile(dest, data)
      console.log(color(`[copied] ${rel} -> ${target.split(sep).at(-1)}`, 'green'))
      copied++
    }
  }

  const summary = `${color('Done.', 'gray')} Considered: ${considered}, ${color(`Copied: ${copied}`, 'green')}, ${color(`Skipped: ${skipped}`, 'yellow')}, ${color(`Conflicts: ${conflicts}`, 'red')}`
  console.log(summary)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
