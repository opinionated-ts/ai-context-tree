import { describe, expect, it } from "bun:test";
import { parse as parseYaml } from "yaml";

import type { ContextIndexEntry } from "@/types";

import {
  renderIndexToJSON,
  renderIndexToYAML,
  renderTreeToJSON,
  renderTreeToObject,
  renderTreeToString,
} from "@/render";
import { buildContextTree } from "@/tree";

// ── Helpers ──────────────────────────────────────────────────────────
function entry(
  partial: Pick<ContextIndexEntry, "folderPath" | "description"> &
    Partial<Omit<ContextIndexEntry, "folderPath" | "description">>,
): ContextIndexEntry {
  return {
    filePath: `${partial.folderPath}/index.instructions.md`,
    bodyContent: "",
    depth: 0,
    ...partial,
  };
}

function build(entries: ContextIndexEntry[]) {
  return buildContextTree(entries);
}

describe("renderIndex", () => {
  it("renders grouped results as valid JSON", () => {
    const json = renderIndexToJSON([
      {
        group: "src/core",
        inputs: ["src/core/a.ts", "src/core/b.ts"],
        index: "src/core/index.instructions.md",
        parents: ["src/index.instructions.md", "index.instructions.md"],
      },
    ]);

    expect(() => JSON.parse(json)).not.toThrow();
    expect(JSON.parse(json)).toEqual([
      {
        group: "src/core",
        inputs: ["src/core/a.ts", "src/core/b.ts"],
        index: "src/core/index.instructions.md",
        parents: ["src/index.instructions.md", "index.instructions.md"],
      },
    ]);
  });

  it("renders grouped results as valid YAML", () => {
    const yaml = renderIndexToYAML([
      {
        group: "src/core",
        inputs: ["src/core/a.ts", "src/core/b.ts"],
        index: "src/core/index.instructions.md",
        parents: ["src/index.instructions.md", "index.instructions.md"],
      },
    ]);

    expect(() => parseYaml(yaml)).not.toThrow();
    expect(parseYaml(yaml)).toEqual([
      {
        group: "src/core",
        inputs: ["src/core/a.ts", "src/core/b.ts"],
        index: "src/core/index.instructions.md",
        parents: ["src/index.instructions.md", "index.instructions.md"],
      },
    ]);
  });
});

// ── renderTreeToString ───────────────────────────────────────────────
describe("renderTreeToString", () => {
  it("returns empty string for empty tree", () => {
    const tree = build([]);
    const output = renderTreeToString(tree);

    expect(output).toBe("");
  });

  it("skips root node in output", () => {
    const tree = build([entry({ folderPath: ".", description: "Root" })]);
    const output = renderTreeToString(tree);

    expect(output).toBe("");
  });

  it("renders single node with description", () => {
    const tree = build([entry({ folderPath: "src", description: "Source code" })]);
    const output = renderTreeToString(tree);

    expect(output).toContain("src");
    expect(output).toContain("Source code");
    expect(output).toContain("── ");
  });

  it("renders nested nodes with proper ASCII connectors", () => {
    const tree = build([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "a/b", description: "B" }),
    ]);
    const output = renderTreeToString(tree);
    const lines = output.split("\n").filter(Boolean);

    // First level should use ├── or └──
    expect(lines[0]).toMatch(/[├└]── /);
    expect(lines[0]).toContain("a");
    expect(lines[0]).toContain("A");

    // Nested level should have │   or indentation
    expect(lines[1]).toMatch(/[│ ]/);
  });

  it("truncates descriptions when descriptionMaxLength is set", () => {
    const tree = build([
      entry({
        folderPath: "src",
        description: "A very long description that should be truncated at some point",
      }),
    ]);
    const output = renderTreeToString(tree, { descriptionMaxLength: 20 });

    expect(output).toContain("A very long descript");
    expect(output).not.toContain("A very long description that should be truncated");
  });

  it("does not truncate by default", () => {
    const longDesc = "A".repeat(200);
    const tree = build([entry({ folderPath: "src", description: longDesc })]);
    const output = renderTreeToString(tree);

    expect(output).toContain(longDesc);
  });

  it("omits description when node has none", () => {
    const tree = build([entry({ folderPath: "src", description: "" })]);
    const output = renderTreeToString(tree);

    expect(output).toContain("src");
    expect(output).not.toContain("—");
  });

  it("uses └── for last child and ├── for non-last", () => {
    const tree = build([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "b", description: "B" }),
      entry({ folderPath: "c", description: "C" }),
    ]);
    const output = renderTreeToString(tree);
    const lines = output.split("\n").filter(Boolean);

    expect(lines[0]).toContain("├── a");
    expect(lines[1]).toContain("├── b");
    expect(lines[2]).toContain("└── c");
  });
});

// ── renderTreeToObject / renderTreeToJSON ─────────────────────────────
describe("renderTreeToObject", () => {
  it("produces root object with children", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const object = renderTreeToObject(tree);

    expect(object).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
          },
        ],
      },
    });
  });

  it("includes path and description at each level", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "src/utils", description: "Utils" }),
    ]);
    const object = renderTreeToObject(tree);

    expect(object).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
            children: [
              {
                path: "src/utils",
                description: "Utils",
              },
            ],
          },
        ],
      },
    });
  });

  it("omits children key when node has no children", () => {
    const tree = build([entry({ folderPath: "src", description: "Source" })]);
    const object = renderTreeToObject(tree);

    expect(object).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "src",
            description: "Source",
          },
        ],
      },
    });
  });
});

describe("renderTreeToJSON", () => {
  it("produces pretty-printed JSON string", () => {
    const tree = build([
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "skills", description: "Skills" }),
    ]);
    const json = renderTreeToJSON(tree);
    const parsed = JSON.parse(json);

    expect(parsed).toEqual({
      root: {
        description: "Project root",
        children: [
          {
            path: "skills",
            description: "Skills",
          },
          {
            path: "src",
            description: "Source",
          },
        ],
      },
    });
    expect(json).toContain("\n");
  });
});
