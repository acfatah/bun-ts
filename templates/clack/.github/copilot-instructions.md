# Copilot Instructions

## Coding Style

- Always fix lint errors as the last task, only after all other tasks are completed.
- Use `bun run format [..file]` to format code or files.
- We are using ESLint: `@antfu/eslint-config` via `eslint.config.js`
  - two-space indent
  - single quotes
  - alphabetised imports with `perfectionist/sort-imports`
  - empty line before `return`
- Naming React components/Redux
  - slices use PascalCase
  - hooks/helpers/files use camelCase
  - config keys use UPPER_SNAKE_CASE

## Testing & Verification

- Start with specific tests near changed code, then broaden.
- Don’t fix unrelated broken tests.

## Response & Output Style (for Copilot)

- Be concise and friendly; prioritize actionable guidance.
- Use bullets and short sections for scanability.
- Wrap commands, file paths, env vars, and code identifiers in backticks.
- Provide bash-ready commands in fenced blocks when giving steps.
- When editing code, prefer minimal diffs and preserve existing style.
- If you create multiple files or non-trivial code, include a short run/test snippet.
