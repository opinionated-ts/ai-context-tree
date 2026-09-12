---
description: "Scripts for syncing local project resources and skill definitions"
---

This directory contains the local update pipeline used to refresh project metadata and skill assets.

Files in this folder:

- [index.ts](./index.ts) - Entry point for local update utilities and orchestration.
- [update-skills.ts](./update-skills.ts) - Synchronizes installed skill definitions and project resources from the configured source.

Use this folder when you need to refresh the local project state or reapply the skill metadata from the workspace source definitions.
