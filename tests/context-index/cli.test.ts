import { $ } from "bun";
import { describe, expect, it } from "bun:test";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "path";

function createGitRepoWithIndexFixture(): string {
  const repo = mkdtempSync(join(tmpdir(), "ai-context-tree-"));
  const featureDir = join(repo, "src", "features");

  mkdirSync(featureDir, { recursive: true });
  writeFileSync(join(repo, "src", "index.instructions.md"), "# src\n");
  writeFileSync(join(featureDir, "index.instructions.md"), "# features\n");
  writeFileSync(join(featureDir, "example.ts"), "export const value = 1;\n");

  execFileSync("git", ["init"], { cwd: repo, stdio: "ignore" });
  execFileSync("git", ["config", "user.name", "Test User"], { cwd: repo, stdio: "ignore" });
  execFileSync("git", ["config", "user.email", "test@example.com"], {
    cwd: repo,
    stdio: "ignore",
  });
  execFileSync(
    "git",
    [
      "add",
      "src/index.instructions.md",
      "src/features/index.instructions.md",
      "src/features/example.ts",
    ],
    { cwd: repo, stdio: "ignore" },
  );
  execFileSync("git", ["commit", "-m", "initial"], { cwd: repo, stdio: "ignore" });

  return repo;
}

describe("cli output formats", () => {
  it("accepts yaml for the index-for subcommand", async () => {
    const cwd = join(import.meta.dir, "../..");

    const result =
      await $`bun run ./src/core/cli.ts index-for -r . ./src/core/render.ts ./src/core/parse.ts ./src/utils -f yaml`
        .cwd(cwd)
        .quiet();

    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("group:");
  });

  it("accepts yaml for the top-level tree command", async () => {
    const cwd = join(import.meta.dir, "../..");

    const result = await $`bun run ./src/core/cli.ts -r . -f yaml`.cwd(cwd).quiet();

    expect(result.exitCode).toBe(0);
    expect(result.stdout.toString()).toContain("root:");
  });

  it("resolves staged Git changes with --include-staged", async () => {
    const repo = createGitRepoWithIndexFixture();

    try {
      const filePath = join(repo, "src", "features", "example.ts");
      writeFileSync(filePath, "export const value = 2;\n");
      execFileSync("git", ["add", "src/features/example.ts"], { cwd: repo, stdio: "ignore" });

      const result =
        await $`bun run ./src/core/cli.ts index-for -r ${repo} --include-staged -f json`
          .cwd(join(import.meta.dir, "../.."))
          .quiet();

      expect(result.exitCode).toBe(0);

      const groups = JSON.parse(result.stdout.toString());
      const featureGroup = groups.find(
        (group: { group: string }) => group.group === "src/features",
      );

      expect(featureGroup).toBeDefined();
      expect(featureGroup.inputs).toContain("src/features/example.ts");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });

  it("resolves unstaged Git changes with --include-unstage", async () => {
    const repo = createGitRepoWithIndexFixture();

    try {
      const filePath = join(repo, "src", "features", "example.ts");
      writeFileSync(filePath, "export const value = 3;\n");

      const result =
        await $`bun run ./src/core/cli.ts index-for -r ${repo} --include-unstage -f json`
          .cwd(join(import.meta.dir, "../.."))
          .quiet();

      expect(result.exitCode).toBe(0);

      const groups = JSON.parse(result.stdout.toString());
      const featureGroup = groups.find(
        (group: { group: string }) => group.group === "src/features",
      );

      expect(featureGroup).toBeDefined();
      expect(featureGroup.inputs).toContain("src/features/example.ts");
    } finally {
      rmSync(repo, { recursive: true, force: true });
    }
  });
});
