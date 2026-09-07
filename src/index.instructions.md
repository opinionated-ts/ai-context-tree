---
description: "TypeScript code and utilities for data processing and transformation"
---

## Source Code

Core modules and utilities of the project, written in TypeScript.

### Content

- **utils/** - Reusable functions (directory copying, transformations, helpers)
- Domain-specific business logic
- Shared types and interfaces
- Public package exports

### Type Structure

The code maintains strong types in TypeScript (`^7.0.2`). All modules export types that can be used both internally and by dependents.

### Dependencies

Minimal by design:

- Native Bun/Node.js code is preferred over external libraries
- When adding a dependency, it must solve a real problem
- The process is documented and justified

### Compilation

Source files can be compiled to JavaScript using `tsdown` for distribution.
