# ai-context-tree

[![npm version](https://img.shields.io/npm/v/ai-context-tree)](https://www.npmjs.com/package/ai-context-tree)
[![CI](https://img.shields.io/github/actions/workflow/status/opinionated-ts/ai-context-tree/check-and-release.yml?label=CI)](https://github.com/opinionated-ts/ai-context-tree/actions/workflows/check-and-release.yml)
[![License](https://img.shields.io/github/license/DanhezCode/ai-context-tree)](https://github.com/DanhezCode/ai-context-tree/blob/main/LICENSE)
<!-- [![npm downloads](https://img.shields.io/npm/dm/ai-context-tree)](https://www.npmjs.com/package/ai-context-tree)
[![Socket](https://badge.socket.dev/npm/package/ai-context-tree)](https://socket.dev/npm/package/ai-context-tree) -->

`ai-context-tree` turns `index.instructions.md` files into a **contextual map of your codebase**.

> ❤️ If you find `ai-context-tree` useful, consider giving the repo a star — it helps the project a lot!

Instead of exploring directories to discover what they contain, your repository can describe:

- what each important directory is for
- what kind of information lives there
- where to look next
- where more detailed context is available

For example, an AI coding agent can request a context map and receive:

```text
.
├── src
│   ├── core — Core application logic
│   ├── features — Product features and domain workflows
│   ├── lib — Shared libraries and utilities
│   └── tests — Test suites and fixtures
│
├── scripts — Development and maintenance tools
└── docs — Project documentation
```

**It is not another documentation system.**

It is the **navigation layer between your repository and the context inside it**.

## Why Context Maps?

Large repositories contain a lot of implicit knowledge that directory names alone cannot express.

A directory may contain important context that is difficult to discover without already knowing where to look.

`ai-context-tree` makes that navigation explicit by letting directories provide their own context through `index.instructions.md` files.

```text
src/
├── core/
│   └── index.instructions.md
├── features/
│   └── index.instructions.md
└── tests/
    └── index.instructions.md
```

These files stay next to the content they describe, while `ai-context-tree` combines them into a single map:

```text
Context map
    ↓
Relevant directory
    ↓
Detailed local context
    ↓
Source files
```

This gives humans and AI coding agents a structured way to discover repository context without having to explore the entire directory tree first.

## Quick Start

### Recommended: use the AI coding agent skill

The easiest way to use `ai-context-tree` with an AI coding agent is through the ready-to-use skill:

```bash
npx skills add opinionated-ts/ai-context-tree
```

The skill guides the agent through the context discovery workflow:

1. Generate the context map.
2. Inspect the map and decide which directories are relevant to the task.
3. Read their `index.instructions.md`.
4. Use that context to guide further exploration.

The user or maintainer decides which directories should be indexed and included in the map. The skill helps explain and navigate that structure, but it does not automatically decide the repository's indexing policy.

For most AI coding agent workflows, the skill is sufficient and is likely the only thing you need.

### Optional: use the CLI directly

You can also use `ai-context-tree` directly when you want to generate or consume the context map yourself.

Generate a context map with the package manager of your choice:

```bash
npx ai-context-tree
# pnpm dlx ai-context-tree
# bunx ai-context-tree
```

To scan a different directory:

```bash
npx ai-context-tree --root /path/to/directory
```

### Add directory context

Create an `index.instructions.md` inside any directory you want to include in the map:

```text
src/core/index.instructions.md
```

```md
---
description: "Core application logic"
---

Contains the main application workflows and shared runtime logic.

Important areas:

- `workflows/` — Application workflows.
- `domain/` — Domain-specific logic.
- `runtime/` — Shared runtime utilities.

See the related project documentation for implementation details.
```

Run `ai-context-tree` again and the directory becomes part of the map.

## Context Files

`index.instructions.md` provides **instructions for navigating and understanding a directory**.

Its purpose is different from instruction files that define how an agent should work or how code should be implemented.

The `description` in the frontmatter becomes the directory's short description in the generated map:

```md
---
description: Core application logic
---
```

The body provides additional local guidance that helps someone understand the directory and decide where to continue, such as:

- important files or subdirectories
- responsibilities and boundaries
- relationships with other parts of the repository
- locations of deeper context

Keep the content focused on **navigation and context discovery**.

`index.instructions.md` is complementary to existing instruction systems such as `AGENTS.md`, `RULES.md`, and other `*.instructions.md` files.

Those systems can define **rules, behavior, workflows, and implementation instructions**.

`index.instructions.md` defines **where to look and how to discover the context contained in a directory**.

## Output

Choose the representation that fits your workflow:

```bash
npx ai-context-tree --format tree
npx ai-context-tree --format compact-tree
npx ai-context-tree --format json
```

### Tree

Human- and agent-friendly:

```text
src
├── core — Core application logic
├── features — Product features and domain workflows
├── lib — Shared libraries and utilities
└── tests — Test suites and fixtures
```

### Compact Tree

The shortest representation:

```text
src/core — Core application logic
src/features — Product features and domain workflows
src/lib — Shared libraries and utilities
src/tests — Test suites and fixtures
```

### JSON

Useful for scripts, automation, and developer tools:

```json
{
  "root": {
    "description": "Project root",
    "children": [
      {
        "path": "src/core",
        "description": "Core application logic",
        "children": []
      }
    ]
  }
}
```

## CLI

```bash
npx ai-context-tree --root <path> --format <format> --depth <number>
```

| Option                                | Description             |
| ------------------------------------- | ----------------------- |
| `--root <path>`                       | Repository root to scan |
| `--format <tree\|compact-tree\|json>` | Output format           |
| `--depth <number>`                    | Maximum directory depth |

The default format is `tree`.

## How It Works

`ai-context-tree` is **deterministic, local, and provider-independent**.

It works by:

1. Finding `index.instructions.md` files.
2. Reading their metadata and content.
3. Associating each file with its directory.
4. Building the directory hierarchy.
5. Producing the requested output format.

There is **no AI service involved** — and no repository data needs to leave your machine.

## A Map, Not a Directory Listing

`ai-context-tree` intentionally maps **contextualized directories**, rather than reproducing the entire filesystem.

A directory appears in the map because it has been given explicit context through an `index.instructions.md` file.

```text
Repository
│
├── Context map
│   ├── src/core
│   ├── src/features
│   └── docs
│
└── Detailed context
    ├── src/core/index.instructions.md
    ├── src/features/index.instructions.md
    └── docs/index.instructions.md
```

This keeps the map focused on locations that have useful context instead of turning it into another directory listing.

## Design

`ai-context-tree` focuses on **context discovery and repository navigation**.

It does not replace:

- source code
- documentation
- repository instructions
- AI agent instructions

Instead, it gives those existing sources a navigable structure.

```text
Repository
    │
    ├── Instructions → how to work
    │
    ├── Context      → where to look
    │
    └── Content      → what is actually there
```

The goal is simple:

> **Make repositories explain where their important context lives.**

## Contributing

Contributions, issues, and pull requests are welcome.

## License

MIT
