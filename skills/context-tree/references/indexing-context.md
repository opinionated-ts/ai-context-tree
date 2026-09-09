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
description: "Brief description of this directory's purpose"
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
- Links to related resources or documentation.
- Important relationships with other parts of the project.

The goal is to help an AI assistant **navigate and understand the directory**, not to replace detailed documentation or project instructions.

## Index Multiple Directories

Add an `index.instructions.md` file to each directory you want to make available to the `ai-context-tree` CLI.

For example:

```text
src/
├── index.instructions.md
├── core/
│   └── index.instructions.md
└── components/
    └── index.instructions.md
```

Run the CLI again after adding the files to see the indexed directories.
