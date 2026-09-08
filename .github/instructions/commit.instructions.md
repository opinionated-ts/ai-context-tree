---
applyTo: "**"
name: Commit Instructions
description: "Instructions for creating commits in this repository"
---

---

# Commit instructions for this repository

## Atomic commits

- Keep commits atomic: each commit must represent one single, coherent change.
- Do not mix unrelated fixes, refactors, documentation, tests, style changes, or maintenance work.
- If a task contains multiple independent changes, split them into separate commits.
- Use this criterion: if reverting the commit would require reverting anything unrelated to its intended change, split it.

## Commit frequently

- Do not accumulate unrelated changes during a long session.
- Commit each completed functional unit, fix, improvement, or correction when it forms a coherent change.
- Review the diff before committing and keep the staged changes limited to the intended scope.
- Use partial staging or explicit file selection when necessary.
- You may create the commit yourself only when you are certain the changes match exactly what the user requested, such as for small or obvious changes.
- If you are not certain that the changes match the user's intent exactly, do not create the commit. Instead, suggest the appropriate commit message and let the user review and commit the changes.

## Commit history

- **Never push to any remote under any circumstances.**
- You may use `--amend`, `fixup`, or interactive rebase only to keep local history clean.
- Never amend, fixup, squash, or rewrite a commit unless you are certain that the commit and code being modified were created by you during the current task/session.
- Do not rewrite commits whose authorship, changes, or intent you cannot confidently establish as yours.
- Never rewrite history merely to hide, discard, or alter work that may belong to the user or another contributor.
- Prefer creating a new commit when ownership or intent is uncertain.

## Commit messages

- Before creating or suggesting a commit, read and follow `.agents/skills/conventional-commit-message/SKILL.md`.
- Do not duplicate or override the commit-message rules defined by that skill.
- Let the skill determine the commit type, scope, subject, body, footers, and release impact.
- If the skill requires repository-specific information, inspect the repository as instructed by the skill.

## Scope discipline

- Prefer small, clear, independently verifiable commits.
- Separate cleanup or maintenance changes from the main change unless they are part of the same intention.
- Never create a global commit that combines unrelated responsibilities.
