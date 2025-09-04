# Bun TypeScript

<p>
  <a href="https://bun.sh">
    <img
      alt="bun.sh"
      src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white"></a>
  <a href="https://github.com/antfu/eslint-config">
    <img
      alt="Code Style"
      src="https://antfu.me/badge-code-style.svg"></a>
</p>

Boilerplate for creating a TypeScript program with [Bun](https://bun.sh).

## Usage

1. Update and install dependencies

```bash
bun update
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
rm -rf .git/hooks && bunx --bun simple-git-hooks
```

5. Initial commit

```bash
git commit -m --no-verify "Initial commit"
```

## Compile Scripts

Optionally add the following compile scripts as needed.

```bash
    "compile": "bun build --compile --target=bun-linux-x64 --outfile=dist/index src/index.ts",
    "compile:arm": "bun build --compile --target=bun-linux-armx64 --outfile=dist/index src/index.ts",
    "compile:windows": "bun build --compile --target=bun-windows-x64 --outfile=dist/index.exe src/index.ts",
```

## Github Actions

Optionally add github actions by running the following command:

```bash
bunx --bun tiged acfatah/bun-ts/templates/_/.github
```
