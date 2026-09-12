# Contributing

Thanks for contributing to `ai-context-tree`.

There are several ways to help the project:

- report bugs or suggest improvements in GitHub Issues
- start or join discussions about usage, repository design, or workflows
- submit a focused pull request
- improve documentation, examples, or index guidance
- leave a star to help others discover the project

The repository is intentionally small and focused. Contributions should therefore be narrow, easy to review, and aligned with the existing project structure and conventions.

## Local setup

This project uses Bun for local development, validation, and contributor workflows.

```bash
git clone <repository-url>
cd ai-context-tree
bun install
bun run hooks:install
bunx skills experimental_install
```

The repository uses Lefthook for local Git hooks, and the project skills provide guidance used throughout the contributor workflow.

## Workflow

The complete contributor workflow covers:

- repository setup
- branch creation
- making focused changes
- reviewing affected `index.instructions.md` files
- adding and validating tests
- running repository checks
- creating Conventional Commits
- opening pull requests

See [CONTRIBUTING-WORKFLOW.md](./CONTRIBUTING-WORKFLOW.md) for the detailed workflow.

## Before opening a PR

Make sure that:

- the change is focused and easy to review
- relevant behavior is covered by tests
- repository validation passes
- affected `index.instructions.md` files have been reviewed and updated when necessary
- commits follow the repository's Conventional Commit conventions
- unrelated changes are not included in the pull request

## Questions

If you are unsure where a change belongs, start by reviewing the relevant `index.instructions.md` files and the project context before expanding the scope of the investigation.

Thanks for helping make `ai-context-tree` easier to understand, contribute to, and use.
