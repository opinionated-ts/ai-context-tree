---
description: "Shared utilities: folder copying, transformations, data manipulation helpers"
---

## Utils

Reusable utility modules used throughout the project.

### Available Modules

- **copy-folder.ts** - Recursively copy directories preserving structure
- Common data transformations
- Helpers for strings, arrays, objects
- Type/validation utilities

### Features

- Fully typed with TypeScript
- No external dependencies (uses native APIs)
- Tested and stable
- Documented with JSDoc

### Usage

Import from the module:

```typescript
import { copyFolder } from "@opinionated-ts/brain/src/utils/copy-folder";
```

All modules export:

- Well-documented main function
- Related types
- Usage examples in comments

### Adding New Helpers

When adding a new helper to utils:

1. Keep the scope small and specific
2. Add complete JSDoc
3. Export necessary types
4. Add tests if complex
