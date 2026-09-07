import type { ContextIndexEntry } from "@scripts/context-index/types";

import {
  buildContextTree,
  flattenTree,
  findNodeByPath,
  getChildren,
} from "@scripts/context-index/tree";
import { describe, expect, it } from "bun:test";

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

// ── buildContextTree ─────────────────────────────────────────────────
describe("buildContextTree", () => {
  it("creates root node when given empty entries", () => {
    const tree = buildContextTree([]);

    expect(tree.name).toBe("root");
    expect(tree.path).toBe(".");
    expect(tree.depth).toBe(0);
    expect(tree.children.size).toBe(0);
  });

  it("builds single-level node from root entry", () => {
    const tree = buildContextTree([entry({ folderPath: ".", description: "Project root" })]);

    expect(tree.description).toBe("Project root");
    expect(tree.children.size).toBe(0);
  });

  it("builds nested hierarchy from flat entries", () => {
    const tree = buildContextTree([
      entry({ folderPath: ".", description: "Root" }),
      entry({ folderPath: "src", description: "Source" }),
      entry({ folderPath: "src/utils", description: "Utils" }),
      entry({ folderPath: "skills", description: "Skills" }),
    ]);

    expect(tree.children.has("src")).toBe(true);
    expect(tree.children.has("skills")).toBe(true);

    const srcNode = tree.children.get("src")!;
    expect(srcNode.description).toBe("Source");
    expect(srcNode.children.has("utils")).toBe(true);

    const utilsNode = srcNode.children.get("utils")!;
    expect(utilsNode.description).toBe("Utils");
  });

  it("sets correct depth for each level", () => {
    const tree = buildContextTree([
      entry({ folderPath: ".", description: "Root" }),
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "a/b", description: "B" }),
      entry({ folderPath: "a/b/c", description: "C" }),
    ]);

    expect(tree.depth).toBe(0);
    expect(tree.children.get("a")!.depth).toBe(1);
    expect(tree.children.get("a")!.children.get("b")!.depth).toBe(2);
    expect(tree.children.get("a")!.children.get("b")!.children.get("c")!.depth).toBe(3);
  });

  it("maintains correct path for each node", () => {
    const tree = buildContextTree([
      entry({ folderPath: ".", description: "Root" }),
      entry({ folderPath: "src/utils", description: "Utils" }),
    ]);

    const utilsNode = tree.children.get("src")!.children.get("utils")!;
    expect(utilsNode.path).toBe("src/utils");
  });

  it("handles entries with no description", () => {
    const tree = buildContextTree([entry({ folderPath: "src", description: "" })]);

    expect(tree.children.get("src")!.description).toBe("");
  });
});

// ── flattenTree ──────────────────────────────────────────────────────
describe("flattenTree", () => {
  it("returns only root for empty tree", () => {
    const tree = buildContextTree([]);
    const flat = flattenTree(tree);

    expect(flat).toHaveLength(1);
    expect(flat[0]!.path).toBe(".");
  });

  it("returns all nodes in depth-first order", () => {
    const tree = buildContextTree([
      entry({ folderPath: ".", description: "Root" }),
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "a/b", description: "B" }),
      entry({ folderPath: "c", description: "C" }),
    ]);

    const flat = flattenTree(tree);
    const paths = flat.map((n) => n.path);

    expect(paths).toEqual([".", "a", "a/b", "c"]);
  });
});

// ── findNodeByPath ───────────────────────────────────────────────────
describe("findNodeByPath", () => {
  const tree = buildContextTree([
    entry({ folderPath: ".", description: "Root" }),
    entry({ folderPath: "src", description: "Source" }),
    entry({ folderPath: "src/utils", description: "Utils" }),
    entry({ folderPath: "skills", description: "Skills" }),
  ]);

  it("finds root node", () => {
    const found = findNodeByPath(tree, ".");
    expect(found).not.toBeNull();
    expect(found!.description).toBe("Root");
  });

  it("finds nested node", () => {
    const found = findNodeByPath(tree, "src/utils");
    expect(found).not.toBeNull();
    expect(found!.description).toBe("Utils");
  });

  it("returns null for non-existent path", () => {
    const found = findNodeByPath(tree, "nonexistent");
    expect(found).toBeNull();
  });

  it("finds sibling node", () => {
    const found = findNodeByPath(tree, "skills");
    expect(found).not.toBeNull();
    expect(found!.description).toBe("Skills");
  });
});

// ── getChildren ──────────────────────────────────────────────────────
describe("getChildren", () => {
  it("returns empty array for leaf node", () => {
    const tree = buildContextTree([entry({ folderPath: "src/utils", description: "Utils" })]);

    const utilsNode = tree.children.get("src")!.children.get("utils")!;
    expect(getChildren(utilsNode)).toEqual([]);
  });

  it("returns sorted children by path", () => {
    const tree = buildContextTree([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "z", description: "Z" }),
      entry({ folderPath: "m", description: "M" }),
    ]);

    const children = getChildren(tree);
    const paths = children.map((c) => c.path);

    expect(paths).toEqual(["a", "m", "z"]);
  });

  it("returns direct children only (not grandchildren)", () => {
    const tree = buildContextTree([
      entry({ folderPath: "a", description: "A" }),
      entry({ folderPath: "a/b", description: "B" }),
      entry({ folderPath: "a/b/c", description: "C" }),
    ]);

    const children = getChildren(tree);
    expect(children).toHaveLength(1);
    expect(children[0]!.path).toBe("a");
  });
});
