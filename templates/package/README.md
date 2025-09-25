# Bun TypeScript Package

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

Boilerplate for creating a TypeScript library or package on [npm](https://www.npmjs.com/) with [Bun](https://bun.sh).

## Usage

1. Update the following information in `package.json` and install dependencies

- [ ] name
- [ ] version
- [ ] description
- [ ] author
- [ ] license
- [ ] homepage
- [ ] repository
- [ ] bugs
- [ ] publish configurations in `.github/workflows/publish.yml`

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

To build the package, run:

```bash
bun run build
```

**Note**: the `run` is required here so bun won't run the default build command.

To release a new version, run:

```bash
bun release
```
