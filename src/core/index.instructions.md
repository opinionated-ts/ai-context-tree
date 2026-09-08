---
description: "core implementation for `ai-context-tree`"
---

- [index.ts](./index.ts) - Main entry point for generating the context tree output.
- [parse.ts](./parse.ts) - Discovers and parses `index.instructions.md` files across the project.
- [tree.ts](./tree.ts) - Builds the hierarchical project structure from the parsed entries.
- [render.ts](./render.ts) - Formats the tree for terminal output or export modes.
- [types.ts](./types.ts) - Shared TypeScript contracts for nodes, entries, and render data.
- [gitignore.ts](./gitignore.ts) - Filters files and directories according to `.gitignore` rules.
