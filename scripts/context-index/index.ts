import { defineCommand, runMain } from "citty";
import { writeFileSync } from "fs";
import { resolve } from "path";

import type { ContextTreeJSONRoot } from "./types";

import { findIndexFiles } from "./parse";
import { renderTreeToJSON, renderTreeToMarkdown, renderTreeToString } from "./render";
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
    export: {
      type: "enum",
      alias: "e",
      options: ["markdown", "json"],
      description: "Export the tree to a `.context-index.<format>` file",
    },
    useCache: {
      type: "boolean",
      alias: "c",
      description: "Use cached results if available",
    },
  },
  async run({ args }) {
    const root = args.root ?? process.cwd();
    const maxDepth = args.depth ? Number.parseInt(args.depth, 10) : undefined;

    console.error(`[context-index] Searching in: ${root}`);

    const entries = await findIndexFiles(root, { maxDepth });

    console.error(`[context-index] Found ${entries.length} index files`);

    // Build hierarchical tree
    const tree = buildContextTree(entries);

    // Render to terminal (stdout) using programmatic API below
    const treeOutput = await generateContextTree({ root, format: "tree", depth: maxDepth });
    if (typeof treeOutput === "string") {
      console.log("\n" + treeOutput);
    } else {
      // Fallback to JSON string if unexpected
      console.log(JSON.stringify(treeOutput, null, 2));
    }

    // Export if requested
    if (args.export) {
      const exportPath = resolve(root, `.context-index.${args.export}`);

      const content =
        args.export === "json"
          ? JSON.stringify(renderTreeToJSON(tree), null, 2)
          : renderTreeToMarkdown(tree, "Context Index Tree");

      writeFileSync(exportPath, content, "utf-8");
      console.error(`[context-index] Exported to: ${exportPath}`);
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
