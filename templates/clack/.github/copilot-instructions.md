# Copilot Instructions

## Coding Style

- Always fix lint or style errors as the last task, only after all other tasks are
  completed.
- Use `bun run format [file...]` to format code or files. Square brackets indicate
  the argument is optional and the trailing `...` allows multiple files.
- We are using ESLint: `@antfu/eslint-config` via `eslint.config.ts`
  Summary of key rules:
  - two-space indent
  - single quotes
  - alphabetised imports with `perfectionist/sort-imports`
  - empty line before `return`
- Naming Vue components/composables
  - components use PascalCase
  - component file use script setup syntax, with `<script setup lang="ts">`
  - composables/hooks/helpers/files use kebab-case
  - always use `use` prefix for composables/hooks
- Naming React components/Redux
  - slices use PascalCase
  - hooks/helpers/files use camelCase
  - config keys use UPPER_SNAKE_CASE

## Contribution Rules

- Keep changes minimal and focused; avoid unrelated refactors.
- Do not change filenames/exports unless requested.
- Prefer fixing root causes over surface patches.
- Do not add license/copyright headers.
- Use Conventional Commits (conventionalcommits.org): `feat(scope): ...`,
  `fix(scope): ...`, `chore(scope): ...` (≤72 chars). Document verification steps
  and note env vars/migrations in the body.
- PRs: concise summary, linked issues, UI screenshots/GIFs, and env/monitoring notes
  as needed.

## Testing & Verification

- Start with specific tests near changed code, then broaden.
- Don’t fix unrelated broken tests.

## Response & Output Style

- Be concise and friendly; prioritize actionable guidance.
- Use bullets and short sections for scanability.
- Use tables where helpful.
- Wrap commands, file paths, env vars, and code identifiers in backticks.
- Provide bash-ready commands in fenced blocks when giving steps.
- When editing code, prefer minimal diffs and preserve existing style.
- If you create multiple files or non-trivial code, include a short run/test snippet.

## Safety & Compliance

- Follow Microsoft content policies.
- Do not produce harmful, hateful, lewd, or violent content.
- Avoid copyrighted code or large verbatim quotes from external sources.
