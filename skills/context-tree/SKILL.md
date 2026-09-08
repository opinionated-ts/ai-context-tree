---
name: context-tree
description: Use this skill to understand where relevant information lives in the project. It provides a contextual map of the project structure, explaining what each folder is for, what can be found there, and where to look for specific information or resources.
---

# Context Tree CLI

The CLI reads `index.instructions.md` files in a project and generates a tree showing their locations and descriptions. Each folder with a description is documented, and you can explore more details by reading its corresponding `index.instructions.md` file.

## How to Use the CLI

The CLI is located in the `./scripts/` directory of this skill.

Run it with Bun:

```bash
bun ./scripts/cli.mjs
```

Node.js is also supported:

```bash
node ./scripts/cli.mjs
```

If the skill and project are in different locations, pass the project root explicitly:

```bash
bun ./scripts/cli.mjs --root /absolute/path/to/project
```

Use `--root` with the absolute path of the project to scan for context.

## Output Formats

Choose the format based on how you intend to use the result:

- `tree` — Human-readable tree with descriptions. **Default.**
- `compact-tree` — Compact version of the tree, with one path per line.
- `json` — Machine-readable structure for programmatic use or preservation.

Examples:

```bash
bun ./scripts/cli.mjs
bun ./scripts/cli.mjs --format compact-tree
bun ./scripts/cli.mjs --format json
```

## What the Tree Shows

The tree is a **contextual map, not a complete directory listing**.

It only contains folders that have been previously indexed for the CLI. Each entry contains:

- **Path** — Location relative to the project root.
- **Description** — Short explanation of the folder's purpose and contents.

If the CLI produces no results, [learn how to index content so it is available to the CLI](./references/indexing-context.md).

## Exploring Context

Each folder shown by the CLI with a description has a corresponding `index.instructions.md` file at the same level. Read it to get more detailed information about the folder and its contents.

For example, if the tree shows:

```text
src/core — Core utilities
```

The corresponding context file is:

```text
src/core/index.instructions.md
```

## Options

- `--root <path>` — Project directory to scan. Defaults to the current working directory.
- `--format <tree|compact-tree|json>` — Output format. Defaults to `tree`.
- `--depth <number>` — Maximum scan depth. Defaults to `10`.

## Workflow

1. Generate the tree.
2. Use it to identify relevant folders and where information lives.
3. Read the `index.instructions.md` files for folders that require more context.
4. Use that context to guide further exploration.
