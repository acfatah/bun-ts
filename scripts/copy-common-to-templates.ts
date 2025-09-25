#!/usr/bin/env bun

/**
 * Copy common files under templates/_ to each other template directory,
 * preserving the same relative paths.
 *
 * Options:
 *   --dry           Print actions without writing files
 *   --force         Overwrite existing files even if different
 *   --verbose       Print more info
 *   --dir <path>    Only copy files within this subdirectory of _ (e.g. src/middleware)
 *   --file <path>   Copy only a specific file (relative to templates/_). May be repeated.
 *   --files a,b,c   Comma-separated list of specific files to copy (relative to templates/_)
 *   --no-color      Disable colored output (or set NO_COLOR)
 *   --color         Force colored output even if not TTY (or set FORCE_COLOR)
 *
 * You can also pass the subdirectory as a positional argument:
 *   bun scripts/copy-common-to-templates.ts src/middleware
 */

import type { Dirent } from 'node:fs'
import Bun from 'bun'
import { readFile as fsReadFile, mkdir, readdir, stat } from 'node:fs/promises'
import process from 'node:process'
import { parseArgs } from 'node:util'
import { join, relative, sep } from 'pathe'
import { writeFile as bunWriteFile } from './utils'

const TEMPLATES_DIR = 'templates'
const BASE_DIR = join(TEMPLATES_DIR, '_')

const argv = Array.isArray((Bun as any)?.argv) ? (Bun as any).argv.slice(2) : process.argv.slice(2)
const { values, positionals } = parseArgs({
  args: argv,
  strict: true,
  allowPositionals: true,
  options: {
    'dry': { type: 'boolean', default: false },
    'force': { type: 'boolean', default: false },
    'verbose': { type: 'boolean', default: false },
    'dir': { type: 'string' },
    'file': { type: 'string', multiple: true },
    'files': { type: 'string' },
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

// Gather raw positional args (will be interpreted later inside main())
const POSITIONALS = (positionals as any as string[]).filter(Boolean)

// Raw file flags (handled later)
const FLAG_FILE_ENTRIES = [
  ...(Array.isArray(values.file) ? values.file : []),
  ...(typeof values.files === 'string' && values.files.length > 0
    ? values.files.split(',').map(s => s.trim()).filter(Boolean)
    : []),
]

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
  // Determine SUB_DIR and positional file list.
  let subDir = ''
  const positionalFiles: string[] = []

  if (typeof values.dir === 'string' && values.dir.length > 0) {
    subDir = values.dir
  }
  else if (POSITIONALS.length > 0) {
    const candidate = POSITIONALS[0]
    // Heuristic: treat as directory if it exists as a directory under BASE_DIR OR looks like a folder (ends with '/')
    const normalizedCandidate = candidate.replace(/\/+$/, '')
    let isDir = false
    if (candidate.endsWith('/')) {
      isDir = true
    }
    else {
      try {
        const st = await stat(join(BASE_DIR, normalizedCandidate))
        isDir = st.isDirectory()
      }
      catch {
        isDir = false
      }
    }
    if (isDir) {
      subDir = normalizedCandidate
      positionalFiles.push(...POSITIONALS.slice(1))
    }
    else {
      positionalFiles.push(...POSITIONALS)
    }
  }
  // Normalize subDir
  if (subDir) {
    subDir = subDir.replace(/^\.(?:\/|$)/, '').replace(/^\/+/, '').replace(/\/+$/, '')
  }

  // Collect explicit files from flags + positional files
  const rawFiles = [...FLAG_FILE_ENTRIES, ...positionalFiles]
  const EXPLICIT_FILES = rawFiles.map(p => p.replace(/^\.\//, '').replace(/^\/+/, '')).map((p) => {
    if (subDir && !p.startsWith(`${subDir}/`) && p !== subDir)
      return `${subDir}/${p}`

    return p
  })

  if (EXPLICIT_FILES.length && VERBOSE) {
    console.log(color(`[files] limiting copy to: ${EXPLICIT_FILES.join(', ')}`, 'gray'))
  }

  // Resolve source root: either BASE_DIR or a subdirectory within it
  const SOURCE_ROOT = subDir ? join(BASE_DIR, subDir) : BASE_DIR
  const relCheck = relative(BASE_DIR, SOURCE_ROOT)

  if (relCheck.startsWith('..'))
    throw new Error(`--dir must point inside '_' (templates/_). Got: ${subDir}`)

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

  // Source files from BASE_DIR (_) or a subdirectory when --dir provided, unless explicit files were requested
  let baseFiles: string[]
  if (EXPLICIT_FILES.length) {
    baseFiles = []
    for (const rel of EXPLICIT_FILES) {
      const full = join(BASE_DIR, rel)
      try {
        await fsReadFile(full) // existence check
        baseFiles.push(full)
      }
      catch {
        console.warn(color(`[missing] ${rel} does not exist under _; skipping`, 'red'))
      }
    }
    if (!baseFiles.length) {
      console.warn(color('No existing explicit files to copy. Exiting.', 'red'))

      return
    }
  }
  else {
    baseFiles = await walkFiles(SOURCE_ROOT)
  }

  let considered = 0
  let copied = 0
  let skipped = 0
  let conflicts = 0

  for (const src of baseFiles) {
  // Keep relative to BASE_DIR so paths are preserved across templates
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
