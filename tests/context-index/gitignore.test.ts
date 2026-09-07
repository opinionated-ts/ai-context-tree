import { describe, expect, it, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { createGitignoreChecker } from "../../scripts/context-index/gitignore";

const FIXTURES = join(import.meta.dir, "__fixtures__/gitignore");

function teardown() {
  rmSync(FIXTURES, { recursive: true, force: true });
}

describe("createGitignoreChecker", () => {
  afterAll(() => teardown());

  it("returns a checker that ignores nothing when no .gitignore exists", async () => {
    const emptyDir = join(FIXTURES, "no-gitignore");
    mkdirSync(emptyDir, { recursive: true });

    const checker = await createGitignoreChecker(emptyDir);

    expect(checker(join(emptyDir, "anything.txt"))).toBe(false);
    expect(checker(join(emptyDir, "node_modules/foo"))).toBe(false);
  });

  it("ignores node_modules directory pattern", async () => {
    const dir = join(FIXTURES, "node-modules");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitignore"), "node_modules/\n", "utf-8");

    const checker = await createGitignoreChecker(dir);

    expect(checker(join(dir, "node_modules/package/index.js"))).toBe(true);
    expect(checker(join(dir, "src/index.ts"))).toBe(false);
  });

  it("ignores files by extension pattern", async () => {
    const dir = join(FIXTURES, "ext-pattern");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitignore"), "*.log\n*.sqlite\n", "utf-8");

    const checker = await createGitignoreChecker(dir);

    expect(checker(join(dir, "app.log"))).toBe(true);
    expect(checker(join(dir, "data.sqlite"))).toBe(true);
    expect(checker(join(dir, "src/main.ts"))).toBe(false);
  });

  it("ignores specific directory by name", async () => {
    const dir = join(FIXTURES, "dir-name");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitignore"), "dist\ncoverage\n", "utf-8");

    const checker = await createGitignoreChecker(dir);

    expect(checker(join(dir, "dist/index.js"))).toBe(true);
    expect(checker(join(dir, "coverage/lcov.info"))).toBe(true);
    expect(checker(join(dir, "src/app.ts"))).toBe(false);
  });

  it("skips comment lines and blank lines", async () => {
    const dir = join(FIXTURES, "comments");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, ".gitignore"),
      "# This is a comment\n\nnode_modules/\n  \n# Another comment\n",
      "utf-8",
    );

    const checker = await createGitignoreChecker(dir);

    expect(checker(join(dir, "node_modules/pkg"))).toBe(true);
    expect(checker(join(dir, "src/file.ts"))).toBe(false);
  });

  it("handles wildcard pattern for all files in root", async () => {
    const dir = join(FIXTURES, "wildcard");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, ".gitignore"), "*.env\n", "utf-8");

    const checker = await createGitignoreChecker(dir);

    expect(checker(join(dir, ".env"))).toBe(true);
    expect(checker(join(dir, ".env.test"))).toBe(false);
  });
});
