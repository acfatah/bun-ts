# Bun TypeScript Boilerplates / Templates

<p>
  <a href="https://bun.sh">
    <img
      alt="bun.sh"
      src="https://img.shields.io/badge/Bun-%23000000.svg?style=flat-square&logo=bun&logoColor=white"></a>
  <a href="https://github.com/antfu/eslint-config">
    <img
      alt="Code Style"
      src="https://antfu.me/badge-code-style.svg"></a>
  <a href="https://github.com/acfatah/bun-ts/commits/main">
    <img
      alt="GitHub last commit (by committer)"
      src="https://img.shields.io/github/last-commit/acfatah/bun-ts?display_timestamp=committer&style=flat-square"></a>
</p>

This repository hold boilerplates or templates for creating a TypeScript program with [Bun](https://bun.sh).

## Features

- Preinstalled with [eslint][1] and [@antfu/eslint-config][2].
- Predefined common scripts like `format`, `lint`, etc.
- Predifined common vscode settings and extensions.

## Usage

To create a project using this template, make a new directory with your chosen project name, navigate into it, then run the following command:

```bash
bunx --bun tiged acfatah/bun-ts/templates/starter
```

Afterwards, you can update and install the latest dependencies with:

```bash
bun update
```

Look under the `templates` directory to see the other available templates.
Replace `/starter` with the template that you want to use.

## Common Files

Common files that are similar across templates are stored under `templates/_`.
Optionally you may include them with the same command as above.

Example to copy `build.ts` instead of the entire scripts directory:

```bash
bunx --bun get-file acfatah/bun-ts/templates/_/scripts/build.ts
```

## Post-install Scripts

By default, `bun` will block all post-install scripts, including `simple-git-hooks`.

To list all blocked scripts, you can run:

```bash
bun pm unstrusted
```

To execute them, run

```bash
bun pm trust --all
```

Alternatively, you can specify each package name individually.

[1]: https://eslint.org
[2]: https://github.com/antfu/eslint-config
