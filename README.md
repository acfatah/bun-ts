# Bun TypeScript

<p>
  <a href="https://bun.sh">
    <img alt="bun.sh" src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white">
  </a>
  <a href="https://github.com/antfu/eslint-config">
    <img alt="Code Style" src="https://antfu.me/badge-code-style.svg">
  </a>
  <a href="https://github.com/acfatah/bun-ts/commits/clack">
    <img alt="GitHub last commit (by committer)" src="https://img.shields.io/github/last-commit/acfatah/bun-ts?display_timestamp=committer&style=flat-square">
  </a>
</p>

Boilerplate for creating a TypeScript program with [Bun](https://bun.sh).

## Usage

1. Copy the repository,

```bash
bunx tiged acfatah/bun-ts#clack newproject
```

2. Initialize git,

```bash
git init
```

3. Include the `.vscode` directory in your repository to ensure consistent settings for all developers. Use git add -f `.vscode` to force add it, bypassing any ignore rules.

```bash
git add -f .vscode
```

4. Initialize `simple-git-hooks`,

```bash
rm -rf .git/hooks && npx simple-git-hooks
```

5. Update and install dependencies

```bash
bun update
```
