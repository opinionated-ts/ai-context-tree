---
name: dependency-selector
description: Help users choose appropriate dependencies by evaluating trade-offs and considerations, and answer questions like "Should I add a dependency for this task?" and "Which dependency is best for this task?"
license: MIT
compatibility:
  - Claude Code
  - Codex
  - Cursor
  - Gemini CLI
  - GitHub Copilot
  - Windsurf
  - Cline
  - Roo Code
  - Goose
  - Continue
  - OpenCode
  - Amp
  - universal
metadata:
  author: opinionated-ts
  tags:
    - dependency
    - library
    - package
    - selection
    - decision-making
---

# Dependency Selector Skill

Use this skill when you need help deciding whether to add a dependency for a specific task and which one to choose.

## Decision Framework

When considering adding a dependency, work through these questions in order:

### 1. Is the work simple enough to implement without dependencies?

- If yes → Implement it yourself
- If no → Continue to next question

### 2. Do you have your own ecosystem or preferred solutions?

- If yes → Check if your ecosystem already provides a solution
- If no → Continue to next question

### 3. Are you in a monorepo?

- If yes → Consider if shared packages could be created instead
- If no → Continue to next question

### 4. Can you afford to create your own solution?

Consider:

- Development time
- Maintenance overhead
- Opportunity cost
- If yes and it's simple → Implement it yourself
- If no or it's complex → Continue to next question

### 5. Is it worth adding a dependency?

Evaluate:

- How much time would the dependency save?
- What ongoing maintenance does it require?
- Does it solve a core problem or is it peripheral?
- If not worth it → Implement it yourself or find a lighter alternative
- If worth it → Continue to next question

### 6. Is the task large or complex?

- If simple → Look for lightweight, focused packages
- If complex → Look for comprehensive, well-maintained solutions
- Continue to next question

### 7. Is there an obviously superior package for this specific task?

Research:

- Popularity (downloads, stars, usage)
- Maintenance status (recent updates, issue responsiveness)
- Documentation quality
- Community support
- If yes → Strong candidate
- If no → Continue evaluation

### 8. Does the package solve the problem in a way that would be costly to replicate?

Consider:

- Algorithmic complexity
- Domain-specific knowledge required
- Edge case handling
- Performance optimizations
- If yes → Strong favor toward dependency
- If no → Re-evaluate necessity

### 9. Is the package safe, stable, and aligned with your stack and philosophy?

Check:

- Security vulnerability history
- License compatibility
- Maintenance commitment
- Alignment with your technical stack (e.g., frontend/backend, language version)
- Philosophy match (e.g., minimalism vs. batteries-included)
- If yes → Proceed with dependency
- If no → Look for alternatives or reconsider

## Recommendation Output Format

When providing a recommendation, use this structure:

**Recommendation:** [Use Dependency / Implement Yourself / Consider Alternatives]

**Reasoning:**

- [Key factor 1]
- [Key factor 2]
- [Key factor 3]

**Suggested Packages (if applicable):**

1. [Package Name] - [Brief justification]
2. [Alternative Package] - [Brief justification]

**Implementation Tips (if implementing yourself):**

- [Tip 1]
- [Tip 2]

## Example Usage

User: "I need a library to handle dates in JavaScript — what should I go with?"

Assistant would work through the framework:

1. Date handling is moderately complex (timezones, formatting, parsing)
2. No specific ecosystem mentioned
3. Not specified if monorepo
4. Creating a robust date library is time-consuming
5. Definitely worth it for most applications
6. Moderately complex task
7. Several good options exist (date-fns, Luxon, Moment.js)
8. Yes, handling all edge cases correctly would be costly
9. Need to check security, stability, and stack alignment

Would then provide a recommendation based on current best practices.
