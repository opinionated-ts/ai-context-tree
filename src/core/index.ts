import type { ContextIndexEntry, ContextTreeJSONRoot } from "@/types";

import { findIndexFiles } from "@/parse";
import { renderTreeToCompactString, renderTreeToJSON, renderTreeToString } from "@/render";
import { buildContextTree } from "@/tree";

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
async function generateContextTree<TFormat extends "json" | "tree" | "compact-tree">(options: {
  root?: string;
  format: TFormat;
  depth?: number;

  /* @internal */
  entries?: ContextIndexEntry[];
}): Promise<TFormat extends "json" ? ContextTreeJSONRoot : string>;
async function generateContextTree(options?: {
  root?: string;
  format?: "json" | "tree" | "compact-tree";
  depth?: number;

  /* @internal */
  entries?: ContextIndexEntry[];
  // colors and other options can be added later
}): Promise<string | ContextTreeJSONRoot> {
  const root = options?.root ?? process.cwd();
  const maxDepth = options?.depth;

  const entries = options?.entries ? options?.entries : await findIndexFiles(root, { maxDepth });
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

export { generateContextTree, type ContextTreeJSONRoot };
export default generateContextTree;
