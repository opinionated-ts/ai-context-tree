import { $ } from "bun";
import { describe, expect, it } from "bun:test";
import { join } from "path";

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
});
