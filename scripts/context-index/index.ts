import { defineCommand, runMain } from "citty";

import type { ContextTreeJSONRoot } from "./types";

import { findIndexFiles } from "./parse";
import { renderTreeToJSON, renderTreeToString } from "./render";
import { buildContextTree, flattenTree } from "./tree";

/**
 * Main CLI entry point for the context index system.
 *
 * Scans the project for `index.instructions.md` files, builds a
 * hierarchical tree, and renders it to the terminal or exports it.
 */
const main = defineCommand({
  meta: {
    name: "context-index",
    version: "0.1.0",
    description: "AI context indexing CLI - discover and organize index.instructions.md files",
  },
  args: {
    format: {
      type: "enum",
      alias: "f",
      options: ["tree", "json", "compact-tree"],
      default: "tree",
      description: "Output format for the generated context tree",
    },
    root: {
      type: "string",
      alias: "r",
      valueHint: "path",
      default: process.cwd(),
      description: "Root directory to scan (default: current directory)",
    },
    depth: {
      type: "string",
      alias: "d",
      valueHint: "number",
      description: "Maximum directory depth to scan",
    },
  },
  async run({ args }) {
    const root = args.root ?? process.cwd();
    const maxDepth = args.depth ? Number.parseInt(args.depth, 10) : undefined;
    const format = args.format ?? "tree";

    console.error(`[context-index] Searching in: ${root}`);

    const entries = await findIndexFiles(root, { maxDepth });

    console.error(`[context-index] Found ${entries.length} index files`);

    const treeOutput = await generateContextTree({ root, format, depth: maxDepth });
    if (typeof treeOutput === "string") {
      console.log("\n" + treeOutput);
    } else {
      console.log(JSON.stringify(treeOutput, null, 2));
    }
  },
});

/**
 * Programmatic API: generateContextTree
 * - For `json` returns a structured object
 * - For `tree` and `compact-tree` returns a string
 */
export async function generateContextTree(options?: {
  root?: string;
  format?: "json" | "tree" | "compact-tree";
  depth?: number;
  // colors and other options can be added later
}): Promise<string | ContextTreeJSONRoot> {
  const root = options?.root ?? process.cwd();
  const maxDepth = options?.depth ?? undefined;

  const entries = await findIndexFiles(root, { maxDepth });
  const tree = buildContextTree(entries);

  const format = options?.format ?? "tree";

  if (format === "json") {
    return renderTreeToJSON(tree);
  }

  if (format === "compact-tree") {
    // compact-tree: one line per folder entry showing the path relative to root
    const flat = flattenTree(tree).filter((n) => n.depth > 0);
    const lines = flat.map((n) => n.path);
    return lines.join("\n");
  }

  // default: ascii tree
  return renderTreeToString(tree);
}

void runMain(main);
