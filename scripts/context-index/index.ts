import { writeFileSync } from "fs";
import { resolve } from "path";

import type { CLIOptions } from "./types";

import { findIndexFiles } from "./parse";
import { renderTreeToString, renderTreeToMarkdown, renderTreeToJSON } from "./render";
import { buildContextTree } from "./tree";

/**
 * Main CLI entry point for context index
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options: CLIOptions = {
    root: process.cwd(),
  };

  // Parse CLI arguments
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--root" && args[i + 1]) {
      const nextArg = args[++i];
      if (nextArg) {
        options.root = resolve(nextArg);
      }
    } else if (arg === "--depth" && args[i + 1]) {
      const nextArg = args[++i];
      if (nextArg) {
        options.depth = parseInt(nextArg, 10);
      }
    } else if (arg === "--export" && args[i + 1]) {
      const nextArg = args[++i];
      if (nextArg) {
        options.export = nextArg;
      }
    } else if (arg === "--use-cache") {
      options.useCache = true;
    }
  }

  console.error(`[context-index] Searching in: ${options.root}`);

  try {
    const entries = await findIndexFiles(options.root, {
      maxDepth: options.depth,
    });

    console.error(`[context-index] Found ${entries.length} index files`);

    // Build hierarchical tree
    const tree = buildContextTree(entries);

    // Render to terminal (stdout)
    const treeOutput = renderTreeToString(tree);
    console.log("\n" + treeOutput);

    // Export if requested
    if (options.export) {
      const exportPath = resolve(options.root, `.context-index.${options.export}`);

      let content: string;
      if (options.export === "markdown" || options.export === "md") {
        content = renderTreeToMarkdown(tree, "Context Index Tree");
      } else if (options.export === "json") {
        content = JSON.stringify(renderTreeToJSON(tree), null, 2);
      } else {
        throw new Error(`Unknown export format: ${options.export}`);
      }

      writeFileSync(exportPath, content, "utf-8");
      console.error(`[context-index] Exported to: ${exportPath}`);
    }

    process.exit(0);
  } catch (error) {
    console.error("[context-index] Error:", error);
    process.exit(1);
  }
}

void main();
