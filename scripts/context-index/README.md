---
description: "Sistema CLI y MCP de indexación de contexto para IAs basado en archivos index.instructions.md"
---

# Context Index System

## Overview

The context index system is a CLI tool and MCP integration that automatically discovers and organizes documentation from `index.instructions.md` files across your project. It generates a hierarchical tree view that IAs can use to quickly understand your project structure.

## How It Works

1. **Discovery**: Recursively scans the project for all `index.instructions.md` files
2. **Parsing**: Extracts YAML frontmatter from each file to get descriptions
3. **Organization**: Builds a hierarchical tree structure reflecting the directory organization
4. **Rendering**: Displays the tree in terminal or exports to Markdown/JSON format

## File Format

Each `index.instructions.md` file should follow this format:

```markdown
---
description: "Brief description of this directory's purpose"
---

## Detailed Content

This section contains more detailed information about the directory.
It can include markdown formatting, links, code examples, etc.
```

## Usage

### CLI

```bash
# Display tree in terminal (default)
bun run context:index

# Export to markdown file
bun run context:index --export markdown

# Export to JSON file
bun run context:index --export json

# Specify custom root directory
bun run scripts/context-index/index.ts --root /path/to/dir

# Limit directory depth
bun run scripts/context-index/index.ts --depth 3
```

### npm Scripts

```bash
# View context tree (shorthand)
bun run context:index

# Export markdown index (useful for pre-commit)
bun run context:index:export
```

## Output Formats

### Terminal (ASCII Tree)

```
├── folder — Description of folder
├── another — Another folder description
└── nested — Parent folder
    └── nested/child — Child folder description
```

### Markdown Export

Generates `.context-index.markdown` with:

- ASCII tree visualization
- Detailed descriptions section
- Headers for easy navigation

### JSON Export

Generates `.context-index.json` with structured tree data:

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

## Integration with IAs

Add to AI system prompts:

```
Here's the project structure:
[output from: bun run context:index]

For more details about any section, request the full content of the relevant index.instructions.md file.
```

## Creation Guidelines

When creating `index.instructions.md` files:

- **Description**: Keep it concise (one phrase or short sentence)
- **Body**: Use markdown to provide additional context
- **Depth**: Place them at logical conceptual boundaries
- **Consistency**: Use consistent tone and style across files

### Recommended Locations

- `/skills/` - Collections of reusable skills
- `/src/` - Source code organization
- `/scripts/` - Automation and tools
- If you use nested skills: `/skills/category/`

## Features

✅ Respects `.gitignore` patterns  
✅ Terminal output with descriptions  
✅ Markdown export for documentation  
✅ JSON export for programmatic use  
✅ Configurable depth limiting  
✅ TypeScript types for integrations

## Future Enhancements

- [ ] Caching for faster repeated runs
- [ ] Category and tag support
- [ ] Search functionality
- [ ] Watch mode for changes
- [ ] MCP server integration
- [ ] Custom title and formatting
