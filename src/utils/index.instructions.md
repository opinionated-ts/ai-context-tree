---
description: "Shared utilities and serialization helpers"
---

This directory contains small reusable support functions used across the project.

Files in this folder:

- [copy-folder.ts](./copy-folder.ts) - Recursively copies directories for local tooling and fixture setup.
- [serialize.ts](./serialize.ts) - Common serialization helpers for converting structured data to JSON and related formats.

Keep this folder focused on generic helper logic; the application-specific behavior lives in [../core](../core).
