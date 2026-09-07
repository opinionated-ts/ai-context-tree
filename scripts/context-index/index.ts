import { resolve } from "path";

import type { CLIOptions } from "./types";

import { findIndexFiles } from "./parse";

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

    console.error(`[context-index] Found ${entries.length} index files\n`);

    // Temporary: just output raw entries to verify parsing works
    for (const entry of entries) {
      console.log(entry.filePath);
      console.log(`  Description: ${entry.description || "(no description)"}`);
      console.log(`  Body preview: ${entry.bodyContent.substring(0, 60)}...`);
      console.log();
    }

    process.exit(0);
  } catch (error) {
    console.error("[context-index] Error:", error);
    process.exit(1);
  }
}

void main();
