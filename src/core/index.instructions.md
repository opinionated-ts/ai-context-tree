---
description: "Core runtime and CLI logic for `ai-context-tree`"
---

This directory contains the pipeline that discovers, parses, and renders context indexes.

Files in this folder:

- [cli.ts](./cli.ts) - CLI entry point for scanning a project and generating the output tree.
- [file.ts](./file.ts) - File discovery, nearest-index resolution, and path normalization helpers.
- [gitignore.ts](./gitignore.ts) - `.gitignore` filtering for context discovery and project scanning.
- [index.ts](./index.ts) - Public exports for the library surface.
- [parse.ts](./parse.ts) - Recursively finds `index.instructions.md` files and extracts their metadata.
- [render.ts](./render.ts) - Formats the context tree for terminal, compact, or JSON output.
- [tree.ts](./tree.ts) - Builds the hierarchical project structure from parsed entries.
- [types.ts](./types.ts) - Shared contracts for index entries, nodes, and render payloads.

The directory intentionally stays focused on the central implementation details; supporting utilities live in [../utils](../utils).
