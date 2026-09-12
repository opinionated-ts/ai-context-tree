# Indexing Context

To make a directory available to the `ai-context-tree` CLI, add an `index.instructions.md` file to that directory.

## Create an Index

Create:

```text
<directory>/index.instructions.md
```

Add a `description` to the frontmatter:

```markdown
---
description: Brief description of this directory's purpose
---

Additional context about the directory.
```

### Description

Keep the `description` concise. Describe what the directory is for and what can be found there.

### Context

The body can contain any valid Markdown, but keep it focused on **indexing the directory rather than providing detailed instructions**.

Useful content includes:

- A brief overview of what the directory contains.
- What should or should not be added to the directory.
- Important files or subdirectories, with a short description of each.
- Links to related resources, files or documentation.
- Important relationships with other parts of the project.

The goal is to help an AI assistant **navigate and understand the directory**, not to replace detailed documentation or project instructions.

## Indexing Strategy

Before choosing an indexing strategy, check whether the project contains:

`<project-root>/docs/.opinion/CONTEXT-TREE-INDEXING-STRATEGY.md`

- If it does not exist, read the [<skill-path>/references/recommended-indexing-strategy.md](./recommended-indexing-strategy.md) and use it.
- If it exists and says to use the strategy recommended by this skill, read and use the [<skill-path>/references/recommended-indexing-strategy.md](./recommended-indexing-strategy.md).
- If it exists and defines its own strategy, follow that strategy instead and do not apply the strategy recommended by this skill.

When introducing an indexing strategy to an existing project, consider the project's size and current indexing state. If the project has many directories (for example, 10 or more) and none are currently indexed, explain the tradeoffs to the user before applying a broad strategy and let them decide how to proceed.
