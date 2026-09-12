# Recommended Indexing Strategy

When no project-specific indexing strategy takes precedence, index directories according to their contents rather than indexing every directory indiscriminately.

Add an `index.instructions.md` to **every directory that contains at least one file**, except directories that contain only subdirectories and no files of their own.

Therefore:

- Index a directory if it contains one or more files.
- Do not index a directory that contains only subdirectories.
- Evaluate nested directories independently.
- Keep each index focused on describing its own directory.
- Do not duplicate detailed documentation or instructions that belong elsewhere.

## Existing Projects

Be cautious when applying this strategy to an existing project.

For a **new project or a small project with only a few directories**, recommend this strategy confidently.

For an existing project with **many directories (for example, 10 or more) and no indexes yet**, do not apply the strategy silently. Explain the tradeoffs to the user first:

- **Benefit:** broad indexing makes relevant information easier for humans and AI assistants to discover and navigate quickly.
- **Cost:** every index adds metadata that must be maintained when directories, files, and responsibilities change.

Let the user decide whether to adopt the recommended strategy, use a more selective strategy, or define a project-specific strategy.

## Project-Specific Strategy

Once the user decides on an indexing strategy for the project, document it in:

`<project-root>/docs/.opinion/CONTEXT-TREE-INDEXING-STRATEGY.md`

This file becomes the **source of truth for the project's indexing strategy**. Future indexing decisions should follow it instead of the strategy recommended by this skill.
