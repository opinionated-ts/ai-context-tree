---
name: context-tree
description: Use this skill to understand where relevant information lives in the project. It provides a contextual map of the project structure, explaining what each folder is for, what can be found there, and where to look for specific information or resources.
---

# Context Tree CLI

The `ai-context-tree` CLI reads `index.instructions.md` files and generates a contextual map of the project structure. Each indexed folder includes a description of its purpose and contents, with its corresponding `index.instructions.md` providing additional context.

## How to Use the CLI

The CLI is provided by the `ai-context-tree` package and can be run using your preferred package manager:

```bash
bunx ai-context-tree
# pnpm dlx ai-context-tree
# npx ai-context-tree
```

If the skill and project are in different locations, pass the project root explicitly:

```bash
bunx ai-context-tree --root /absolute/path/to/project
```

Use `--root` with the absolute path of the project to scan.

## Output Formats

Choose the format based on how you intend to use the result:

- `tree` — Human-readable tree with descriptions. **Default.**
- `compact-tree` — Compact version with one path per line.
- `json` — Machine-readable structure for programmatic use or preservation.

```bash
bunx ai-context-tree --format tree # default
bunx ai-context-tree --format compact-tree
bunx ai-context-tree --format json
```

## Options

- `--root <path>` — Project directory to scan. Defaults to the current working directory.
- `--format <tree|compact-tree|json>` — Output format. Defaults to `tree`.
- `--depth <number>` — Maximum scan depth. Defaults to `10`.

## What the Tree Shows

The tree is a **contextual map, not a complete directory listing**.

It only contains folders that have been indexed for the CLI. Each entry contains:

- **Path** — Location relative to the project root.
- **Description** — Short explanation of the folder's purpose and contents.

Each displayed folder with a description has a corresponding `index.instructions.md` file at the same level. Read it when more detailed context is needed.

For example:

```text
src/core — Core utilities
```

corresponds to:

```text
src/core/index.instructions.md
```

## References

Use the appropriate reference when more guidance is needed:

- **Indexing context** — Read [`<skill-path>/references/indexing-context.md`](./references/indexing-context.md) when relevant content is missing from the tree and needs to be made available to Context Tree, or when creating new folders/files that should be indexed. This is the guide for learning how to create, expand, reorganize, or otherwise maintain indexes so their content can be discovered through the tree. If the tree does not show something you need, it may simply not be indexed yet.
- **Modifying indexed files** — Read [`<skill-path>/references/modifying-indexed-files.md`](./references/modifying-indexed-files.md) when you have modified files or directories that are already covered by indexes, especially before saving work or creating a commit. It helps identify which indexes are associated with the changed paths and determine whether those indexes need to be updated to reflect the changes. Use it to verify that staged or unstaged changes are properly represented by the existing indexes before finalizing the work.

Do not duplicate the procedures from these references here; read the relevant guide when its workflow applies.

## Workflow

1. Generate the tree.
2. Use it to identify relevant folders and where information lives.
3. Read the corresponding `index.instructions.md` files when more context is needed.
4. If relevant content is missing from the tree or new folders/files need to be indexed, read [`<skill-path>/references/indexing-context.md`](./references/indexing-context.md).
5. When modifying files or directories already covered by indexes, especially before saving work or creating a commit, read [`<skill-path>/references/modifying-indexed-files.md`](./references/modifying-indexed-files.md).
6. Use the resulting context to guide further exploration and work.

## Optional: If additional information about the CLI or skill is needed, read the [README](https://raw.githubusercontent.com/opinionated-ts/ai-context-tree/main/README.md).
