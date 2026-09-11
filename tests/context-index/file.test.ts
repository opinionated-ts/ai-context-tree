import { afterAll, describe, expect, it } from "bun:test";
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { resolveIndexForPaths } from "@/file";

const FIXTURES = join(import.meta.dir, "__fixtures__/resolver");

function buildFixture() {
  mkdirSync(join(FIXTURES, "src/core/features/api"), { recursive: true });
  mkdirSync(join(FIXTURES, "src/core/features"), { recursive: true });
  mkdirSync(join(FIXTURES, "src/core"), { recursive: true });
  mkdirSync(join(FIXTURES, "ignored"), { recursive: true });

  writeFileSync(
    join(FIXTURES, "index.instructions.md"),
    '---\ndescription: "Project root"\n---\n\nRoot context.',
    "utf-8",
  );
  writeFileSync(
    join(FIXTURES, "src/index.instructions.md"),
    '---\ndescription: "Source"\n---\n\nSource context.',
    "utf-8",
  );
  writeFileSync(
    join(FIXTURES, "src/core/index.instructions.md"),
    '---\ndescription: "Core"\n---\n\nCore context.',
    "utf-8",
  );
  writeFileSync(
    join(FIXTURES, "src/core/features/index.instructions.md"),
    '---\ndescription: "Features"\n---\n\nFeature context.',
    "utf-8",
  );
  writeFileSync(
    join(FIXTURES, "src/core/features/api/index.instructions.md"),
    '---\ndescription: "API"\n---\n\nAPI context.',
    "utf-8",
  );
  writeFileSync(
    join(FIXTURES, "ignored/index.instructions.md"),
    '---\ndescription: "Ignored"\n---\n\nIgnored context.',
    "utf-8",
  );
  writeFileSync(join(FIXTURES, ".gitignore"), "ignored/\n", "utf-8");
  writeFileSync(join(FIXTURES, "src/core/file.ts"), "export const answer = 42;\n", "utf-8");
  writeFileSync(
    join(FIXTURES, "src/core/features/api/request.ts"),
    "export const ping = true;\n",
    "utf-8",
  );
  writeFileSync(join(FIXTURES, "src/core/b.ts"), "export const ok = true;\n", "utf-8");
}

describe("resolveIndexForPaths", () => {
  afterAll(() => {
    rmSync(FIXTURES, { recursive: true, force: true });
  });

  it("resolves nearest indexes for files and directories", async () => {
    buildFixture();

    const result = await resolveIndexForPaths(["src/core/file.ts", "src/core"], { root: FIXTURES });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      group: "src/core",
      index: "src/core/index.instructions.md",
      inputs: ["src/core", "src/core/file.ts"],
      parents: [],
    });
  });

  it("groups multiple inputs without duplicates", async () => {
    const result = await resolveIndexForPaths(
      ["src/core/file.ts", "src/core/b.ts", "src/core/features/api/request.ts"],
      {
        root: FIXTURES,
      },
    );

    expect(result).toHaveLength(2);
    expect(result.map((group) => group.group)).toEqual(["src/core", "src/core/features/api"]);
    expect(result[0]?.inputs).toEqual(["src/core/b.ts", "src/core/file.ts"]);
    expect(result[1]?.inputs).toEqual(["src/core/features/api/request.ts"]);
  });

  it("includes parent indexes in nearest-to-farthest order when requested", async () => {
    const result = await resolveIndexForPaths(["src/core/features/api/request.ts"], {
      root: FIXTURES,
      includeParents: true,
    });

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      group: "src/core/features/api",
      index: "src/core/features/api/index.instructions.md",
    });
    expect(result[0]?.parents).toEqual([
      "src/core/features/index.instructions.md",
      "src/core/index.instructions.md",
      "src/index.instructions.md",
      "index.instructions.md",
    ]);
  });

  it("respects project root boundaries and .gitignore", async () => {
    const result = await resolveIndexForPaths(
      ["ignored/index.instructions.md", "src/core/file.ts"],
      { root: FIXTURES },
    );

    expect(result).toHaveLength(1);
    expect(result[0]?.group).toBe("src/core");
    expect(result[0]?.index).toBe("src/core/index.instructions.md");
  });
});
