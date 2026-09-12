---
description: "Regression tests for scanning, parsing, and rendering indexed project context"
---

This directory contains the test suite that verifies the `ai-context-tree` behavior across discovery, parsing, hierarchy construction, and output rendering.

Files in this folder:

- [cli.test.ts](./cli.test.ts) - CLI execution and argument handling.
- [compact-tree.test.ts](./compact-tree.test.ts) - Compact tree rendering format.
- [file.test.ts](./file.test.ts) - File-system lookup and index association behavior.
- [gitignore.test.ts](./gitignore.test.ts) - `.gitignore` filtering and ignored path handling.
- [integration.test.ts](./integration.test.ts) - End-to-end project scan and tree generation coverage.
- [parse.test.ts](./parse.test.ts) - Parsing of `index.instructions.md` files and metadata extraction.
- [render.test.ts](./render.test.ts) - Terminal rendering and formatted output checks.
- [tree.test.ts](./tree.test.ts) - Tree construction and hierarchy validation.
- [**fixtures**/](./__fixtures__) - Shared fixture directories and sample project structures used by multiple tests.

This folder is the main verification layer for the repository's context-index feature set.
