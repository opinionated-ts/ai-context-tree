# Give humans and AI coding agents a map of your repository

`ai-context-tree` turns `index.instructions.md` files into a **contextual map of your codebase**.

> ❤️ If you find `ai-context-tree` useful, consider giving the repo a star — it helps the project a lot!

Instead of exploring directories to discover what they contain, your repository can describe:

- what each important directory is for
- what kind of information lives there
- where to look next
- where more detailed context is available

If an AI coding agent asks `ai-context-tree` for context, it can return a map like:

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

A directory can contain important context that is difficult to discover without already knowing where to look.

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

These files stay next to the content they describe, while `ai-context-tree` combines them into a single map.

The result is a simple navigation flow:

```text
Context map
    ↓
Relevant directory
    ↓
Detailed local context
    ↓
Source files
```

## Quick Start

### Recommended: use the AI coding agent skill

The easiest way to use `ai-context-tree` with an AI coding agent is through the ready-to-use skill:

```bash
npx skills add opinionated-ts/ai-context-tree
```

That's enough. The skill handles the context discovery workflow for the agent:

1. Generate the context map.
2. Identify directories relevant to the task.
3. Read their `index.instructions.md`.
4. Use that context to guide further exploration.

For most AI coding agent workflows, **you do not need to run `ai-context-tree` manually**.

### Optional: use the CLI directly

You can also use `ai-context-tree` directly when you want to generate or consume the context map yourself.

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

It is still an instruction file, but its purpose is different from instructions that define how an agent should work or how code should be implemented.

The `description` in the frontmatter becomes the directory's short description in the generated map:

```md
---
description: Core application logic
---
```

The body provides additional local guidance that helps someone understand the directory and decide where to continue, for example:

- important files or subdirectories
- responsibilities and boundaries
- relationships with other parts of the repository
- locations of deeper context

Keep the content focused on **navigation and context discovery**.

`index.instructions.md` is therefore complementary to existing instruction systems such as `AGENTS.md`, `RULES.md`, and other `*.instructions.md` files.

Those systems can define **rules, behavior, workflows, and implementation instructions**.

`index.instructions.md` defines **how to navigate the context contained in a directory**.

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
2. Reads their metadata and content.
3. Associates each file with its directory.
4. Builds the directory hierarchy.
5. Produces the requested output format.

There is **no AI service involved** - and no repository data needs to leave your machine.

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
