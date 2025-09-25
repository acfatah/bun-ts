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

Boilerplate for creating a CLI application using [Bun](https://bun.sh) and TypeScript.

## Features

- [@antfu/eslint-config][1]
- [CommitLint][2]
- [Commander][3]

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
git commit --no-verify -m "Initial commit"
```

[1]: https://github.com/antfu/eslint-config
[2]: https://commitlint.js.org
[3]: https://github.com/tj/commander.js
