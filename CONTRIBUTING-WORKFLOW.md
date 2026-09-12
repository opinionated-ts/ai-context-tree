# Contributing workflow

`ai-context-tree` is intentionally small and focused. Contributions should generally be narrow, easy to review, and grounded in the actual behavior of the CLI and the repository's context map.

## 1. Set up the repository

Clone the repository and install its dependencies:

```bash
git clone <repository-url>
cd ai-context-tree
bun install
```

Install the repository hooks and project skills:

```bash
bun run hooks:install
bunx skills experimental_install
```

`bun run hooks:install` installs the Lefthook-managed Git hooks used by the repository.

`bunx skills experimental_install` installs the project skills used as part of the local contributor workflow.

## 2. Create a feature branch

Create a dedicated branch before making changes:

```bash
git checkout -b fix/my-change
# git checkout -b feature/my-feature
```

Use a branch name that clearly describes the purpose of the work. Keep each branch focused on a single change or closely related set of changes.

## 3. Make the change

Keep the implementation focused on the problem being solved.

Prefer a small, well-defined change over an unrelated refactor. Avoid mixing multiple independent changes in the same branch or commit.

Before changing code, review the relevant project context and existing implementation so that the change follows the repository's established structure and conventions.

## 4. Review the affected indexes

This project uses `index.instructions.md` files to describe repository structure and provide navigation context.

When a change affects a directory or code path represented by an index, determine whether the existing index still accurately describes that area.

Use `index-for` to identify the indexes associated with your changes:

```bash
bunx ai-context-tree index-for --include-staged
bunx ai-context-tree index-for --include-unstaged
bunx ai-context-tree index-for --include-staged --include-unstaged
```

Review the relevant indexes before finalizing the change.

Update an index only when the change makes its existing description inaccurate, incomplete, or no longer representative of the directory's purpose or navigation guidance.

Do not update indexes merely because files were modified.

## 5. Add or update tests

Changes to behavior should be covered by appropriate tests.

Prefer focused tests that verify the affected behavior directly. For bug fixes, add a regression test that demonstrates the failure being corrected whenever practical.

Also consider relevant edge cases introduced by the change rather than relying only on the primary success path.

## 6. Validate the change

Run the relevant validation for the change and resolve all reported issues before finalizing the work.

Repository validation is also enforced through Lefthook:

- commit hooks run formatting and linting checks
- pre-push hooks run the test suite

The hooks are intended to catch issues automatically during the normal Git workflow, but contributors should still run targeted validation when developing or debugging a change.

## 7. Review the final diff

Before committing, inspect the final diff and verify that:

- only intended files are changed
- the implementation is limited to the requested scope
- relevant tests are present and passing
- affected indexes are accurate
- formatting and linting issues are resolved
- no temporary files, debug code, or unrelated changes remain

For example:

```bash
git status
git diff
git diff --staged
```

## 8. Create the commit

Create a focused commit using the repository's Conventional Commit convention.

Review recent commits when needed to understand the project's existing style and scope.

The commit message should describe the intent of the change rather than merely listing implementation details.

Keep unrelated changes in separate commits.

If using an AI assistant to prepare the commit message, have it inspect the current diff and recent repository history and follow the repository's local commit guidance.

## 9. Open the pull request

Push the feature branch and open a pull request with a clear description of the change.

The pull request should make it easy to understand:

- what changed
- why the change was needed
- how the behavior was validated
- any relevant design or compatibility considerations

Keep the pull request focused and avoid including unrelated cleanup.

Respond to review feedback with additional focused changes and keep the branch history understandable throughout the review.

## Final checklist

Before opening a pull request, verify:

- [ ] the change is focused and reviewable
- [ ] relevant tests were added or updated
- [ ] relevant tests pass
- [ ] formatting and linting checks pass
- [ ] affected `index.instructions.md` files were reviewed
- [ ] indexes were updated when their context became inaccurate
- [ ] no unrelated changes are included
- [ ] commits follow the repository's Conventional Commit convention
- [ ] the pull request clearly explains the change and its validation

If you are unsure where a change belongs, start with the relevant `index.instructions.md` files and project context before broadening the investigation.
