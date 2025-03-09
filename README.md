# Bun TypeScript

<p>
  <a href="https://github.com/acfatah/bun-ts-boilerplate/commits/main">
  <img alt="GitHub last commit (by committer)" src="https://img.shields.io/github/last-commit/acfatah/bun-ts-boilerplate?display_timestamp=committer&style=flat-square"></a>
</p>

Boilerplate for creating a TypeScript program with Bun.

## Usage

1. Copy the repository,

```bash
bunx tiged acfatah/bun-ts-boilerplate
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
