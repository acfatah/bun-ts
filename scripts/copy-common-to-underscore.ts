#!/usr/bin/env bun

/**
 * Find files with similar content under templates (excluding "_") and
 * copy those files to the "_" template preserving the same relative paths.
 *
 * Options:
 *   --dry              Only print what would happen, do not write files.
 *   --force            Overwrite existing files in "_" if content differs.
 *   --threshold <n>    Similarity threshold (0..1). Default: 0.98
 *   --verbose          Print more info.
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
const MAX_LEVENSHTEIN_CHARS = 20000 // skip expensive similarity beyond this size

// CLI options
// Ensure we pass only actual flags (exclude bun binary and script path)
const argv = Array.isArray((Bun as any)?.argv)
  ? (Bun as any).argv.slice(2)
  : process.argv.slice(2)
const { values } = parseArgs({
  args: argv,
  strict: true,
  options: {
    dry: { type: 'boolean', default: false },
    force: { type: 'boolean', default: false },
    verbose: { type: 'boolean', default: false },
    threshold: { type: 'string' },
  },
})
const DRY = Boolean(values.dry)
const FORCE = Boolean(values.force)
const VERBOSE = Boolean(values.verbose)
const SIM_THRESHOLD = clampNumber(values.threshold ? Number(values.threshold) : 0.98, 0, 1)

function clampNumber(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Number.isFinite(n) ? n : min))
}

function shouldIgnorePath(p: string, extraDirs: string[] = []) {
  // Skip build artifacts and template-specific transient dirs
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

async function readText(file: string): Promise<string> {
  // Prefer fs promises to avoid accidentally treating binaries as text
  return await fsReadFile(file, 'utf8')
}

function normalizeContent(s: string): string {
  // Normalize line-endings and collapse whitespace for robust similarity
  return s.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim()
}

// Levenshtein distance
function levenshtein(a: string, b: string): number {
  if (a === b)
    return 0
  const m = a.length
  const n = b.length
  if (m === 0)
    return n
  if (n === 0)
    return m

  const dp = Array.from({ length: n + 1 }, (_, j) => j)

  for (let i = 1; i <= m; i++) {
    let prev = dp[0]
    dp[0] = i
    for (let j = 1; j <= n; j++) {
      const temp = dp[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      dp[j] = Math.min(
        dp[j] + 1, // deletion
        dp[j - 1] + 1, // insertion
        prev + cost, // substitution
      )
      prev = temp
    }
  }

  return dp[n]
}

function similarity(a: string, b: string): number {
  const la = a.length
  const lb = b.length
  if (la === 0 && lb === 0)
    return 1
  const dist = levenshtein(a, b)
  const denom = Math.max(la, lb)

  return 1 - (dist / (denom || 1))
}

interface FileEntry {
  template: string
  fullPath: string
  relPath: string
  raw: string
  norm: string
  size: number
}

async function ensureDir(dir: string) {
  await mkdir(dir, { recursive: true })
}

async function main() {
  // Gather template directories excluding "_"
  const dirs = (await readdir(TEMPLATES_DIR, { withFileTypes: true }) as Dirent[])
    .filter(d => d.isDirectory())
    .map(d => join(TEMPLATES_DIR, d.name))
    .filter(d => d !== BASE_DIR)

  // Load simple ignore directories from each template's .gitignore (lines ending with "/")
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
        .map(l => l.replace(/\/+/g, '').replace(/\/$/, ''))
    }
    catch {}
    dirIgnores.set(dir, dirsToIgnore)
  }

  // Map: relPath -> [FileEntry...]
  const byRel = new Map<string, FileEntry[]>()

  for (const dir of dirs) {
    const templateName = dir.split(sep).at(-1) || dir
    const files = await walkFiles(dir, dirIgnores.get(dir))
    for (const file of files) {
      const relPath = relative(dir, file)
      // Skip drizzle generated files and environment files by default
      if (relPath.startsWith('drizzle/') || relPath.startsWith('.env'))
        continue

      // Stat to check size; heavy files use exact match only
      let fsize = 0
      try {
        const st = await stat(file)
        fsize = Number(st.size || 0)
      }
      catch {}

      const raw = await readText(file)
      const norm = normalizeContent(raw)

      const list = byRel.get(relPath) || []
      list.push({ template: templateName, fullPath: file, relPath, raw, norm, size: fsize })
      byRel.set(relPath, list)
    }
  }

  let considered = 0
  let copied = 0
  let skipped = 0
  let conflicts = 0

  for (const [rel, entries] of byRel) {
    if (entries.length < 2)
      continue // need at least 2 to consider "common"
    considered++

    // If all normalized contents are identical, mark as identical quickly
    const allEqual = entries.every(e => e.norm === entries[0].norm)
    let minSim = 1
    if (!allEqual) {
      // For large files, avoid expensive similarity calculation
      const tooLarge = entries.some(e => e.norm.length > MAX_LEVENSHTEIN_CHARS || e.size > 1024 * 100)
      if (tooLarge) {
        minSim = 0 // treat as differing unless exactly equal
      }
      else {
        for (let i = 0; i < entries.length; i++) {
          for (let j = i + 1; j < entries.length; j++) {
            const sim = similarity(entries[i].norm, entries[j].norm)
            minSim = Math.min(minSim, sim)
          }
        }
      }
    }

    if (!allEqual && minSim < SIM_THRESHOLD) {
      if (VERBOSE)
        console.log(`[differs] ${rel} (min similarity=${minSim.toFixed(3)})`)
      skipped++
      continue
    }

    // Choose representative content: the one with smallest average distance
    let best = entries[0]
    let bestScore = -Infinity
    if (allEqual) {
      best = entries[0]
    }
    else {
      for (const e of entries) {
        let sumSim = 0
        for (const f of entries) {
          if (e === f)
            continue
          sumSim += similarity(e.norm, f.norm)
        }
        const avgSim = sumSim / Math.max(entries.length - 1, 1)
        if (avgSim > bestScore) {
          bestScore = avgSim
          best = e
        }
      }
    }

    const destPath = join(BASE_DIR, rel)
    const destDir = destPath.split(sep).slice(0, -1).join(sep)

    // Read existing destination content (if any)
    let exists = false
    let same = false
    try {
      const current = await fsReadFile(destPath, 'utf8')
      exists = true
      same = normalizeContent(current) === best.norm
    }
    catch {}

    if (exists && !same && !FORCE) {
      console.warn(`[conflict] ${rel} exists and differs. Use --force to overwrite.`)
      conflicts++
      continue
    }

    if (DRY) {
      console.log(`[dry] copy ${rel}  <-  (${entries.map(e => e.template).join(', ')})`)
      copied++
      continue
    }

    await ensureDir(destDir)
    await bunWriteFile(destPath, best.raw)
    console.log(`[copied] ${rel}`)
    copied++
  }

  console.log(`Done. Considered: ${considered}, Copied: ${copied}, Skipped: ${skipped}, Conflicts: ${conflicts}`)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
