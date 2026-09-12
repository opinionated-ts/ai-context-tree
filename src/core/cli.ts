import { defineCommand, runMain } from "citty";

import { resolveIndexForPaths } from "./file";
import { generateContextTree } from "./index";
import { findIndexFiles } from "./parse";

export const indexFor = "index-for";

const indexForCommand = defineCommand({
  meta: {
    name: indexFor,
    description: "Resolve the nearest associated index.instructions.md file for one or more paths",
  },
  args: {
    root: {
      type: "string",
      alias: "r",
      valueHint: "path",
      default: process.cwd(),
      description:
        "Upper boundary: walk upward from the input paths, resolve the nearest index, and collect parent indexes until this root unless --skip-parents is used",
    },
    ["skip-parents"]: {
      type: "boolean",
      alias: "s",
      description: "Stop at the first matching index and do not include parent indexes",
    },
    format: {
      type: "enum",
      alias: "f",
      options: ["json", "yaml"],
      default: "json",
      description: "Output format for the associated index resolution",
    },
  },
  async run({ args }) {
    const groups = await resolveIndexForPaths(args._, {
      root: args.root,
      skipParents: args["skip-parents"],
    });

    if (args.format === "yaml") {
      // TODO: implement YAML rendering later.
      console.log(JSON.stringify(groups, null, 2));
      return;
    }

    console.log(JSON.stringify(groups, null, 2));
  },
});

/**
 * Main CLI entry point for the context index system.
 *
 * Scans the project for `index.instructions.md` files, builds a
 * hierarchical tree, and renders it to the terminal or exports it.
 */
const main = defineCommand({
  meta: {
    name: "ai-context-tree",
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
  subCommands: {
    "index-for": indexForCommand,
  },
  async run({ args }) {
    if (args._.includes(indexFor)) {
      return;
    }

    const root = args.root;
    const maxDepth = Number.parseInt(args.depth);
    const format = args.format;

    const prefix = "\x1b[36m[ai-context-tree]\x1b[0m";

    const path = `\x1b[33m${root}\x1b[0m`;

    const entries = await findIndexFiles(root, { maxDepth });

    const count = `\x1b[32m${entries.length}\x1b[0m`;

    if (format !== "json") {
      console.info(`${prefix} Searching in: ${path}`);
      console.info(`${prefix} Found ${count} index files`);
    }

    const treeOutput = await generateContextTree({ root, format, depth: maxDepth, entries });
    if (typeof treeOutput === "string") {
      console.log("\n" + treeOutput);
    } else {
      console.log(JSON.stringify(treeOutput, null, 2));
    }
  },
});

void runMain(main);
