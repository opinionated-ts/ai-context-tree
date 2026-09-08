# Context Index System

## Overview

The Context Tree System is a CLI integration that automatically discovers and organizes documentation from `index.instructions.md` files across a project.

It generates a hierarchical tree that AI assistants can use to quickly understand the project's structure and available context.

## How It Works

1. **Discovery** — Recursively scans the project for `index.instructions.md` files.
2. **Parsing** — Extracts YAML frontmatter and directory documentation.
3. **Organization** — Builds a hierarchical tree based on the directory structure.
4. **Rendering** — Outputs the tree in terminal or machine-readable formats.

## File Format

Each `index.instructions.md` file should follow this structure:

```markdown
---
description: "Brief description of this directory's purpose"
---

## Detailed Content

Additional context about the directory.

This can include Markdown formatting, links, code examples, and other
information useful to AI assistants.
```

### Description

The `description` should be a concise phrase or short sentence describing the purpose of the directory.

### Body

The body provides additional context and can contain any valid Markdown content.

## Usage

### CLI

Display the project tree in the terminal:

```bash
bun ai-context-tree
```

Export the index as JSON:

```bash
bun ai-context-tree --format json > ai-context-tree.json
```

Display a compact tree:

```bash
bun ai-context-tree --format compact-tree
```

Specify a custom root directory:

```bash
bun ai-context-tree --root /path/to/dir
```

Limit the directory depth:

```bash
bun ai-context-tree --depth 3
```

## Output Formats

### Tree

The default terminal format displays the directory hierarchy with descriptions:

```text
├── folder — Description of folder
├── another — Another folder description
└── nested — Parent folder
    └── child — Child folder description
```

### Compact Tree

The compact format displays one indexed path per line:

```text
folder — Description of folder
another — Another folder description
nested — Parent folder
nested/child — Child folder description
nested/child/deep — Deeply nested directory description
```

### JSON

The JSON format provides a machine-readable representation:

```json
{
  "root": {
    "description": "Project root",
    "children": [
      {
        "path": "folder",
        "description": "Description",
        "children": []
      }
    ]
  }
}
```

## Features

- Respects `.gitignore` patterns
- Terminal tree output with descriptions
- Compact tree output
- JSON output for programmatic use
- Configurable root directory
- Configurable directory depth

## Future Enhancements

- [ ] Caching for faster repeated runs
- [ ] Category and tag support
- [ ] Search functionality
- [ ] Watch mode for changes
- [ ] MCP server integration
- [ ] Proper YAML/frontmatter parsing for complex or multiline values
