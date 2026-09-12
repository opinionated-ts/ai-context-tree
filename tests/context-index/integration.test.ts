import { describe, expect, it, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { findIndexFiles } from "@/parse";
import { renderTreeToString, renderTreeToJSON } from "@/render";
import { buildContextTree, findNodeByPath } from "@/tree";

// ── Fixtures ─────────────────────────────────────────────────────────
const FIXTURES = join(import.meta.dir, "__fixtures__/integration");

function buildFixture() {
  mkdirSync(FIXTURES, { recursive: true });

  writeFileSync(join(FIXTURES, ".gitignore"), "node_modules/\n", "utf-8");

  writeFileSync(
    join(FIXTURES, "index.instructions.md"),
    '---\ndescription: "Project root"\n---\n\nMain project entry point.',
    "utf-8",
  );

  mkdirSync(join(FIXTURES, "src"), { recursive: true });
  writeFileSync(
    join(FIXTURES, "src/index.instructions.md"),
    '---\ndescription: "Core source code"\n---\n\nMain source modules.',
    "utf-8",
  );

  mkdirSync(join(FIXTURES, "src/utils"), { recursive: true });
  writeFileSync(
    join(FIXTURES, "src/utils/index.instructions.md"),
    '---\ndescription: "Reusable utilities"\n---\n\nHelper functions.',
    "utf-8",
  );

  mkdirSync(join(FIXTURES, "skills"), { recursive: true });
  writeFileSync(
    join(FIXTURES, "skills/index.instructions.md"),
    '---\ndescription: "AI skills collection"\n---\n\nSkill definitions.',
    "utf-8",
  );

  mkdirSync(join(FIXTURES, "node_modules", "pkg"), { recursive: true });
  writeFileSync(
    join(FIXTURES, "node_modules", "pkg", "index.instructions.md"),
    '---\ndescription: "Ignored"\n---\nShould not appear.',
    "utf-8",
  );
}

function cleanup() {
  rmSync(FIXTURES, { recursive: true, force: true });
}

// ── Integration tests ────────────────────────────────────────────────
describe("ai-context-tree full pipeline", () => {
  afterAll(() => cleanup());

  it("Task 1: parses and finds all relevant files", async () => {
    buildFixture();

    const entries = await findIndexFiles(FIXTURES);
    const paths = entries.map((e) => e.filePath).toSorted();

    expect(paths).toEqual([
      "index.instructions.md",
      "skills/index.instructions.md",
      "src/index.instructions.md",
      "src/utils/index.instructions.md",
    ]);
  });

  it("Task 2: builds correct hierarchy", async () => {
    const entries = await findIndexFiles(FIXTURES);
    const tree = buildContextTree(entries);

    expect(tree.children.size).toBe(2); // src, skills

    const src = tree.children.get("src")!;
    expect(src.description).toBe("Core source code");
    expect(src.children.size).toBe(1);

    const utils = src.children.get("utils")!;
    expect(utils.description).toBe("Reusable utilities");
  });

  it("Task 3: renders tree with ASCII format", async () => {
    const entries = await findIndexFiles(FIXTURES);
    const tree = buildContextTree(entries);
    const output = renderTreeToString(tree);

    expect(output).toContain("src");
    expect(output).toContain("Core source code");
    expect(output).toContain("skills");
    expect(output).toContain("AI skills collection");
    expect(output).toContain("├──");
    expect(output).toContain("└──");
  });

  it("Task 3: respects descriptionMaxLength constraint (60 chars)", async () => {
    const entries = await findIndexFiles(FIXTURES);
    const tree = buildContextTree(entries);
    const output = renderTreeToString(tree, { descriptionMaxLength: 60 });

    const lines = output.split("\n").filter((l) => l.includes("—"));
    for (const line of lines) {
      const descMatch = line.match(/— (.+)$/);
      if (descMatch) {
        expect(descMatch[1]!.length).toBeLessThanOrEqual(60);
      }
    }
  });

  it("Task 4: exports to valid JSON", async () => {
    const entries = await findIndexFiles(FIXTURES);
    const tree = buildContextTree(entries);
    const json = renderTreeToJSON(tree);

    expect(() => JSON.parse(json)).not.toThrow();

    const parsed = JSON.parse(json);
    expect(parsed.root).toBeDefined();
    expect(parsed.root.children).toBeArrayOfSize(2);
  });

  it("Task 1: respects .gitignore (node_modules excluded)", async () => {
    const entries = await findIndexFiles(FIXTURES);

    expect(entries.every((e) => !e.filePath.includes("node_modules"))).toBe(true);
  });

  it("Task 2: findNodeByPath locates any node", async () => {
    const entries = await findIndexFiles(FIXTURES);
    const tree = buildContextTree(entries);

    const root = findNodeByPath(tree, ".");
    expect(root?.description).toBe("Project root");

    const srcUtils = findNodeByPath(tree, "src/utils");
    expect(srcUtils?.description).toBe("Reusable utilities");

    const missing = findNodeByPath(tree, "nonexistent");
    expect(missing).toBeNull();
  });
});
