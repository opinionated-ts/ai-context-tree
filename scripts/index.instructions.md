---
description: "Automated scripts and CLI tools for project maintenance"
---

## Scripts

Automation and task integration for project development and maintenance.

### Main Directories

- **update-local/** - Scripts to sync and update local resources
- **context-index/** - Context indexing system for AIs
- Other utility scripts as needed

### Conventions

- TypeScript is preferred for new scripts (with Bun as runtime)
- All scripts are executable via `npm run` or `bun run`
- They are documented in `package.json` as available commands
- Should be idempotent when possible

### Execution

```bash
# View all available scripts
bun run --list

# Run a specific script
bun run scripts/context-index/index.ts
```

### Maintenance

Scripts are regularly reviewed to:

- Ensure they remain relevant
- Update dependencies
- Improve performance
