# @opinionated-ts/template

A ready-to-use TypeScript project template powered by [`@opinionated-ts/config`](https://github.com/opinionated-ts/config) that bundles opinionated tooling defaults for performance, code quality, and developer experience — so you can start building immediately without repetitive setup.

## When to use this template?

Use this template when you want to:

- Avoid repetitive TypeScript tooling setup
- Standardize linting, formatting, and type-checking with clear defaults
- Start from a modern Bun-first setup that is ready to use
- Keep a consistent developer experience across repositories
- Move fast without sacrificing code quality

> [!NOTE]
> This template is designed primarily for Bun environments.

## Getting started

### 1. Create your repo

Click **Use this template** above, or:

```bash
git clone https://github.com/opinionated-ts/template my-project
cd my-project
rm -rf .git && git init
```

### 2. Install dependencies

```bash
bun install
```

### 3. Install git hooks

```bash
bun hooks:install
```

### 4. Edit package metadata

Update `package.json` so releases and CI point to your project:

- `name`: your package name.
- `repository.url`: your repo's URL.

```json
{
  "name": "your-project-name",
  "repository": {
    "type": "git",
    "url": "git+https://github.com/your-username/your-repo.git"
  }
}
```

## What's included

### Local automatic validations

| Category           | Tool                                          | Description                                                           |
| ------------------ | --------------------------------------------- | --------------------------------------------------------------------- |
| **Type checking**  | [TypeScript](https://www.typescriptlang.org/) | Applied together with Oxlint via `typeCheck`/`typeAware`              |
| **Linter**         | [Oxlint](https://oxc.rs/)                     | Fast linting, pre-configured                                          |
| **Formatter**      | [Oxfmt](https://oxc.rs/)                      | Fast formatting, pre-configured                                       |
| **Spellchecking**  | [cspell](https://cspell.org/)                 | Pre-configured for English/Spanish                                    |
| **Commit linting** | [commitlint](https://commitlint.js.org/)      | Enforces [Conventional Commits](https://www.conventionalcommits.org/) |
| **Git hooks**      | [lefthook](https://lefthook.dev/)             | Wired up locally (`pre-commit`, `commit-msg`, `pre-push`)             |

### Remote automation support

The underlying config package also supports CI and release automation for
projects that need it:

| Category    | Tool                                                     | Description                                |
| ----------- | -------------------------------------------------------- | ------------------------------------------ |
| **CI/CD**   | [GitHub Actions](https://github.com/features/actions)    | Automated validation and release pipelines |
| **Release** | [Semantic Release](https://semantic-release.gitbook.io/) | Automated versioning and publishing        |

All template configurations extend `@opinionated-ts/config` directly — see
[opinionated-ts/config](https://github.com/opinionated-ts/config) for the
shared defaults and the recommended overrides available for each tool.

## How the workflow works

A few checks run automatically at key moments in the development cycle:

- Before a commit, changed files are formatted, type-checked, and linted
  automatically (`pre-commit`, via [Oxfmt](https://oxc.rs/) and
  [Oxlint](https://oxc.rs/)).
- When a commit message is written, it is validated against a consistent format
  (`commit-msg`, via [commitlint](https://commitlint.js.org/)).
- Before a push, the test suite runs and dependencies are scanned for known
  vulnerabilities; either failure blocks the push (`pre-push`, via `bun test`
  and `bun audit`).

These checks run automatically as part of `git commit` and `git push` — no
manual steps required.

## Related projects

- [`@opinionated-ts/config`](https://github.com/opinionated-ts/config) — shared
  tooling defaults used by this template
