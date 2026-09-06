# Commit instructions for this repository

## 1) Atomic commits

- Each commit must be atomic and correspond to a single coherent change.
- A commit must not mix fixes, refactors, documentation, and style changes unless they form the same intention.
- If you detect that a task includes several distinct objectives, split them into independent commits.
- The atomicity criterion is: "if I had to revert this commit, should I revert only that change and nothing else?" If the answer is no, the commit is poorly fragmented.

## 2) Avoid accumulated changes without a commit

- Do not leave long sessions without a control commit.
- When you complete a functional unit, a fix, an improvement, or a correction, commit it immediately.
- If several modifications already form a logical block, make them in a single commit and do not continue accumulating unrelated changes.
- Review the `git diff` before each commit to confirm that the change is clear and scoped.
- Use `git add -p` or manual file selection when necessary to keep the commit clean and focused.

## 3) Rules before any commit

- Before writing or executing a commit, read and incorporate the guidance from the `conventional-commit-message` skill located at `.agents/skills/conventional-commit-message/SKILL.md`.
- The commit message must follow Conventional Commits and be appropriate for the type of change (`feat`, `fix`, `docs`, `refactor`, `test`, `build`, `ci`, etc.).
- The description must be brief, useful for the changelog, and end without a period.
- If a task is large or includes several different changes, do not turn it into a giant commit: split it up.

## 4) Practical recommendations

- Keep commits small, clear, and verifiable.
- Keep diffs limited to the intended scope of the commit.
- If a change requires extra explanation, use the commit body only when necessary.
- If you make maintenance or cleanup changes that are not part of the main problem, separate them into distinct commits.

## 5) Good pattern example

- `fix(api): handle empty response`
- `feat(cli): add dry-run option`
- `docs(readme): clarify setup steps`

Never make a "global" commit covering multiple topics without separating each responsibility.
