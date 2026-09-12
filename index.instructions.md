---
description: "Project root for the `ai-context-tree` repository"
---

This repository contains the implementation, tests, skills, and local automation for the `ai-context-tree` CLI.

Project files at the root include:

- [AGENTS.md](./AGENTS.md) - Repository-level guidance for discovery and work flow.
- [README.md](./README.md) - Overview, usage examples, and project documentation.
- [LICENSE](./LICENSE) - Project license.
- [package.json](./package.json) - Package metadata, scripts, and dependency configuration.
- [bun.lock](./bun.lock) - Lockfile for Bun package management.
- [skills-lock.json](./skills-lock.json) - Lockfile for the project skills registry.
- [tsconfig.json](./tsconfig.json) - TypeScript compiler configuration.
- [tsdown.config.ts](./tsdown.config.ts) - Build configuration for bundling the CLI.
- [oxlint.config.ts](./oxlint.config.ts) - Linting configuration.
- [oxfmt.config.ts](./oxfmt.config.ts) - Formatting configuration.
- [commitlint.config.ts](./commitlint.config.ts) - Commit message linting rules.
- [cspell.config.ts](./cspell.config.ts) - Spell-check configuration.
- [release.config.ts](./release.config.ts) - Release automation configuration.
- [lefthook.yml](./lefthook.yml) - Git hooks configuration.
- [.gitignore](./.gitignore) - Ignore rules for local and generated files.

Important directories and their responsibilities:

- [src/](./src) - Core library implementation for discovery, parsing, tree construction, and rendering.
- [tests/](./tests) - Integration and unit tests covering the library behavior.
- [scripts/](./scripts) - Local maintenance scripts and update automation.
- [skills/](./skills) - Public skills and reusable project guidance.
- [docs/](./docs) - Project documentation and opinionated configuration files.
- [.github/](./.github) - GitHub workflows and repository instructions.
- [.agents/](./.agents) - Local agent metadata and installed skills used by the workspace.

The project follows the recommended indexing strategy: each directory with its own files gets an `index.instructions.md`, while directories that are only containers for subdirectories stay unindexed.
