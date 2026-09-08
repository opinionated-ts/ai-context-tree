import { defineCommand, runMain } from "citty";

import type { ContextTreeJSONRoot } from "@/context-tree/types";

import { findIndexFiles } from "@/context-tree/parse";
import {
  renderTreeToCompactString,
  renderTreeToJSON,
  renderTreeToString,
} from "@/context-tree/render";
import { buildContextTree } from "@/context-tree/tree";

/**
 * Main CLI entry point for the context index system.
 *
 * Scans the project for `index.instructions.md` files, builds a
 * hierarchical tree, and renders it to the terminal or exports it.
 */
const main = defineCommand({
  meta: {
    name: "context-tree",
    description: "Build a context tree from index.instructions.md files",
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
      default: "10",
      valueHint: "number",
      description: "Maximum directory depth to scan",
    },
  },
  async run({ args }) {
    const root = args.root;
    const maxDepth = Number.parseInt(args.depth);
    const format = args.format;

    const prefix = "\x1b[36m[context-tree]\x1b[0m";

    const path = `\x1b[33m${root}\x1b[0m`;

    const entries = await findIndexFiles(root, { maxDepth });

    const count = `\x1b[32m${entries.length}\x1b[0m`;

    if (format !== "json") {
      console.info(`${prefix} Searching in: ${path}`);
      console.info(`${prefix} Found ${count} index files`);
    }

    const treeOutput = await generateContextTree({ root, format, depth: maxDepth });
    if (typeof treeOutput === "string") {
      console.log("\n" + treeOutput);
    } else {
      console.log(JSON.stringify(treeOutput, null, 2));
    }
  },
});

/**
 * Generates a context tree from the index files found under the specified root.
 *
 * @param options - Options controlling how the context tree is generated.
 * @param options.root - Root directory to scan. Defaults to the current working directory.
 * @param options.format - Output format:
 * * `json`: returns a structured {@link ContextTreeJSONRoot} object.
 * * `tree`: returns a human-readable tree as a string.
 * * `compact-tree`: returns one relative path per line.
 * @param options.depth - Maximum directory depth to scan.
 *
 * @returns A structured context tree for `json`, or a formatted string for
 * `tree` and `compact-tree`.
 */
export async function generateContextTree<
  TFormat extends "json" | "tree" | "compact-tree",
>(options: {
  root?: string;
  format: TFormat;
  depth?: number;
}): Promise<TFormat extends "json" ? ContextTreeJSONRoot : string>;
export async function generateContextTree(options?: {
  root?: string;
  format?: "json" | "tree" | "compact-tree";
  depth?: number;
  // colors and other options can be added later
}): Promise<string | ContextTreeJSONRoot> {
  const root = options?.root ?? process.cwd();
  const maxDepth = options?.depth;

  const entries = await findIndexFiles(root, { maxDepth });
  const tree = buildContextTree(entries);

  const format = options?.format ?? "json";

  if (format === "json") {
    return renderTreeToJSON(tree);
  }

  if (format === "compact-tree") {
    return renderTreeToCompactString(tree);
  }

  return renderTreeToString(tree);
}

void runMain(main);
