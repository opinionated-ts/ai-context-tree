import { describe, expect, it, beforeAll, afterAll } from "bun:test";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { join } from "path";

import { parseIndexFile, findIndexFiles } from "../../scripts/context-index/parse";

// ── Helpers ──────────────────────────────────────────────────────────
const FIXTURES = join(import.meta.dir, "__fixtures__/parse");

function setup() {
  mkdirSync(FIXTURES, { recursive: true });
}

function teardown() {
  rmSync(FIXTURES, { recursive: true, force: true });
}

function writeFixture(relPath: string, content: string) {
  const full = join(FIXTURES, relPath);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, content, "utf-8");
}

// ── parseIndexFile ───────────────────────────────────────────────────
describe("parseIndexFile", () => {
  beforeAll(() => setup());
  afterAll(() => teardown());

  it("extracts description from YAML frontmatter", () => {
    const file = join(FIXTURES, "basic.md");
    writeFileSync(
      file,
      `---\ndescription: "A brief description"\n---\n\nBody content here.`,
      "utf-8",
    );

    const result = parseIndexFile(file);

    expect(result.description).toBe("A brief description");
    expect(result.body).toBe("Body content here.");
  });

  it("handles frontmatter with single-quoted description", () => {
    const file = join(FIXTURES, "single-quote.md");
    writeFileSync(file, `---\ndescription: 'Single quoted desc'\n---\n\nBody.`, "utf-8");

    const result = parseIndexFile(file);
    expect(result.description).toBe("Single quoted desc");
  });

  it("handles frontmatter with unquoted description", () => {
    const file = join(FIXTURES, "unquoted.md");
    writeFileSync(file, "---\ndescription: Unquoted description\n---\n\nBody.", "utf-8");

    const result = parseIndexFile(file);
    expect(result.description).toBe("Unquoted description");
  });

  it("returns empty description when no frontmatter found", () => {
    const file = join(FIXTURES, "no-frontmatter.md");
    writeFileSync(file, "Just plain content without frontmatter.", "utf-8");

    const result = parseIndexFile(file);
    expect(result.description).toBe("");
    expect(result.body).toBe("Just plain content without frontmatter.");
  });

  it("returns empty description when frontmatter has no description key", () => {
    const file = join(FIXTURES, "no-desc-key.md");
    writeFileSync(file, "---\ntitle: Something\nother: value\n---\n\nBody.", "utf-8");

    const result = parseIndexFile(file);
    expect(result.description).toBe("");
    expect(result.body).toBe("Body.");
  });

  it("preserves multi-line body content", () => {
    const file = join(FIXTURES, "multiline.md");
    const body = "## Section 1\n\nFirst paragraph.\n\n## Section 2\n\nSecond paragraph.";
    writeFileSync(file, `---\ndescription: "Multi"\n---\n\n${body}`, "utf-8");

    const result = parseIndexFile(file);
    expect(result.body).toBe(body);
  });

  it("trims whitespace from body", () => {
    const file = join(FIXTURES, "trim.md");
    writeFileSync(file, "---\ndescription: desc\n---\n\n   trimmed body   \n", "utf-8");

    const result = parseIndexFile(file);
    expect(result.body).toBe("trimmed body");
  });
});

// ── findIndexFiles ───────────────────────────────────────────────────
describe("findIndexFiles", () => {
  const TREE_ROOT = join(FIXTURES, "tree-scan");

  function buildTree() {
    mkdirSync(TREE_ROOT, { recursive: true });

    // Root level
    writeFixture(
      "tree-scan/index.instructions.md",
      '---\ndescription: "Root level"\n---\n\nRoot body.',
    );

    // Nested: src/
    writeFixture(
      "tree-scan/src/index.instructions.md",
      '---\ndescription: "Source code"\n---\n\nSource body.',
    );

    // Nested: src/utils/
    writeFixture(
      "tree-scan/src/utils/index.instructions.md",
      '---\ndescription: "Utilities"\n---\n\nUtils body.',
    );

    // Nested: skills/
    writeFixture(
      "tree-scan/skills/index.instructions.md",
      '---\ndescription: "Skills collection"\n---\n\nSkills body.',
    );

    // Ignore target
    writeFixture(
      "tree-scan/node_modules/some-pkg/index.instructions.md",
      "---\ndescription: ignored\n---\n\nShould not appear.",
    );

    // .gitignore for this tree
    writeFileSync(join(TREE_ROOT, ".gitignore"), "node_modules/\n", "utf-8");
  }

  afterAll(() => {
    rmSync(FIXTURES, { recursive: true, force: true });
  });

  it("finds all index.instructions.md files recursively", async () => {
    buildTree();

    const entries = await findIndexFiles(TREE_ROOT);
    const paths = entries.map((e) => e.filePath).toSorted();

    expect(paths).toEqual([
      "index.instructions.md",
      "skills/index.instructions.md",
      "src/index.instructions.md",
      "src/utils/index.instructions.md",
    ]);
  });

  it("extracts descriptions correctly from found files", async () => {
    const entries = await findIndexFiles(TREE_ROOT);
    const descMap = Object.fromEntries(entries.map((e) => [e.folderPath, e.description]));

    expect(descMap["."]).toBe("Root level");
    expect(descMap["src"]).toBe("Source code");
    expect(descMap["src/utils"]).toBe("Utilities");
    expect(descMap["skills"]).toBe("Skills collection");
  });

  it("respects .gitignore and excludes node_modules", async () => {
    const entries = await findIndexFiles(TREE_ROOT);
    const hasNodeModules = entries.some((e) => e.filePath.includes("node_modules"));

    expect(hasNodeModules).toBe(false);
  });

  it("returns empty array for directory with no index files", async () => {
    const emptyDir = join(FIXTURES, "empty");
    mkdirSync(emptyDir, { recursive: true });

    const entries = await findIndexFiles(emptyDir);
    expect(entries).toEqual([]);
  });

  it("respects maxDepth option", async () => {
    const entries = await findIndexFiles(TREE_ROOT, { maxDepth: 1 });
    const paths = entries.map((e) => e.filePath).toSorted();

    // Depth 0 = root, depth 1 = src, skills
    expect(paths).toContain("index.instructions.md");
    expect(paths).toContain("skills/index.instructions.md");
    expect(paths).toContain("src/index.instructions.md");
    // src/utils is depth 2, should be excluded
    expect(paths).not.toContain("src/utils/index.instructions.md");
  });

  it("populates bodyContent from file", async () => {
    const entries = await findIndexFiles(TREE_ROOT);
    const root = entries.find((e) => e.folderPath === ".");

    expect(root?.bodyContent).toBe("Root body.");
  });

  it("populates depth correctly", async () => {
    const entries = await findIndexFiles(TREE_ROOT);
    const root = entries.find((e) => e.folderPath === ".");

    expect(root?.depth).toBe(0);
  });
});
