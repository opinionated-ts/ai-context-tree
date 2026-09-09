# Give humans and AI coding agents a map of your repository

`ai-context-tree` turns `index.instructions.md` files into a **contextual map of your codebase**.

> ❤️ If you find `ai-context-tree` useful, consider giving the repo a star — it helps the project a lot!

Instead of exploring directories to discover what they contain, your repository can describe:

- what each important directory is for
- what kind of information lives there
- where to look next
- where more detailed context is available

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

## Why?

Large repositories contain a lot of implicit knowledge that directory names alone cannot express.

An `index.instructions.md` lets a directory explain itself:

```text
src/
├── core/
│   └── index.instructions.md
├── features/
│   └── index.instructions.md
└── tests/
    └── index.instructions.md
```

The context stays next to the code it describes, while `ai-context-tree` turns those local descriptions into one navigable map.

```text
Context map
    ↓
Relevant directory
    ↓
Detailed local context
    ↓
Source files
```

This gives humans and AI agents a fast way to **find relevant context before exploring the code itself**.

## For AI Coding Agents

`ai-context-tree` includes a ready-to-use skill for AI coding agents:

```bash
npx skills add opinionated-ts/ai-context-tree
```

The skill teaches an agent to:

1. Generate the context map.
2. Identify directories relevant to the task.
3. Read their `index.instructions.md`.
4. Use that context to guide further exploration.

For example:

```text
src/core — Core application logic
```

points the agent to:

```text
src/core/index.instructions.md
```

The agent can understand the directory before opening its source files.

## Quick Start

### Generate a context map

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

Create an `index.instructions.md` inside any directory you want to describe:

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

Every indexed directory has an `index.instructions.md`.

The frontmatter provides the short description displayed in the map:

```md
---
description: Core application logic
---
```

The body contains deeper local context, such as:

- what the directory contains
- what belongs there
- important files or subdirectories
- relationships with other parts of the repository
- where to continue exploring

Keep it focused on **understanding and navigating the directory**.

Detailed implementation rules and specialized instructions can remain in your existing documentation and agent configuration.

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

`ai-context-tree` is deterministic, local, and provider-independent.

It:

1. Finds `index.instructions.md` files.
2. Reads their metadata and descriptions.
3. Reconstructs the directory hierarchy.
4. Produces a human- or machine-readable context map.
5. Respects configured scan limits and ignored paths.

There is **no AI service involved** and no repository data needs to leave your machine.

## A Map, Not a Directory Listing

The output intentionally represents **directories that have been explicitly given context**, rather than reproducing the entire filesystem.

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

The map tells you **where to look**.

The local context file tells you **what to know before looking there**.

## Design

`ai-context-tree` does not replace source code, documentation, repository instructions, or AI agent instructions.

It connects them:

```text
Code
  +
Repository instructions
  +
Directory context
  =
A repository that is easier to navigate
```

The goal is simple:

> **Make repositories explain where their important context lives.**

## Contributing

Contributions, issues, and pull requests are welcome.

## License

MIT
