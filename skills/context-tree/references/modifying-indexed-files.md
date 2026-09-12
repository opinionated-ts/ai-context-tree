# Modifying Indexed Files

When modifying files or directories covered by Context Tree indexes, check the associated `index.instructions.md` files before finalizing the work.

## Check Associated Indexes

Use `index-for` to resolve the nearest index for each changed path.

Example:

```bash
# start from the file path and walk upward
# stop when reaching this root boundary
bunx ai-context-tree index-for --root . src/features/api/request.ts
```

This means:

- start at `src/features/api`
- then `src/features`
- then `src/core`
- then `src`
- stop at `.` (or the configured `root`)
- keep collecting parent indexes unless `--skip-parents` is used

```bash
# stop at the first match and ignore ancestors
bunx ai-context-tree index-for --skip-parents src/core/features/api/request.ts
```

`--skip-parents` does not change where the search starts; it only stops the upward walk sooner, stops at the first matching index and ignores ancestor indexes, which is generally the default recommended behavior when using the [<skill-path>/references/recommended-indexing-strategy.md](./recommended-indexing-strategy.md).

## Output Formats

Choose the format based on how you intend to use the result:

- `yaml` — Human-readable structured output for inspection, editing, or configuration-oriented workflows.
- `json` — Machine-readable structure for programmatic use or preservation.

```bash
bunx ai-context-tree index-for --format yaml
bunx ai-context-tree index-for --format json # default
```

When multiple paths share the same nearest index, `index-for` groups them together. Use these groups to determine which indexes need to be reviewed rather than checking paths individually.

## Review the Associated Indexes

Read each resolved `index.instructions.md` and determine whether it still accurately represents the directory's current structure and context.

Update an index only when a change makes its existing context inaccurate, incomplete, misleading, or no longer sufficiently representative.

Consider whether the change affects any of the following:

- The directory's **purpose or contents** are no longer accurately described.
- Files or subdirectories that should be highlighted are **missing from the index**, or previously referenced ones are no longer relevant.
- The directory's **organization or structure** has changed in a way the index should communicate.
- The location of relevant information, resources, or documentation has changed.
- Important relationships with other parts of the project have changed or are no longer represented.
- The index no longer provides enough context to **understand or navigate the directory effectively**.

Do not update an index merely because files inside the directory changed. Update it only when the change means the index no longer describes the directory as it should.

The goal is to keep each index representative of the directory's current navigational context, not to document every change or duplicate detailed documentation.

## Before Finalizing

Before saving work or creating a commit:

1. Resolve the indexes associated with the changed paths.
2. Read the relevant indexes.
3. Update any index that is no longer accurate or sufficiently representative.
4. Re-check the resulting indexes if their structure or descriptions were changed.
