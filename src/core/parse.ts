import { readdir, readFile } from "node:fs/promises";
import { relative, resolve } from "node:path";
import { parse } from "yaml";

import type { ContextIndexEntry } from "@/types";

import { createGitignoreChecker } from "@/gitignore";

/**
 * Parse index.instructions.md file and extract description and body.
 */
export async function parseIndexFile(filePath: string): Promise<{
  description: string;
  body: string;
}> {
  const content = await readFile(filePath, "utf-8");

  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);

  if (!match) {
    return {
      description: "",
      body: content,
    };
  }

  const [, frontmatter = "", body = ""] = match;
  const metadata = parse(frontmatter);

  return {
    description: typeof metadata?.description === "string" ? metadata.description.trim() : "",
    body: body.trim(),
  };
}

/**
 * Recursively find all index.instructions.md files respecting .gitignore.
 */
export async function findIndexFiles(
  root: string,
  options?: {
    maxDepth?: number;
  },
): Promise<ContextIndexEntry[]> {
  const maxDepth = options?.maxDepth ?? Infinity;
  const shouldIgnore = createGitignoreChecker(root);

  async function traverse(dir: string, currentDepth = 0): Promise<ContextIndexEntry[]> {
    if (currentDepth > maxDepth) {
      return [];
    }

    let entries;

    try {
      entries = await readdir(dir, { withFileTypes: true });
    } catch {
      return [];
    }

    const tasks = entries.map(async (entry): Promise<ContextIndexEntry[] | null> => {
      const fullPath = resolve(dir, entry.name);

      if (shouldIgnore(fullPath)) {
        return null;
      }

      if (entry.isDirectory()) {
        return traverse(fullPath, currentDepth + 1);
      }

      if (!entry.isFile() || entry.name !== "index.instructions.md") {
        return null;
      }

      try {
        const { description, body } = await parseIndexFile(fullPath);

        return [
          {
            filePath: relative(root, fullPath),
            folderPath: relative(root, dir) || ".",
            description,
            bodyContent: body,
            depth: currentDepth,
          },
        ];
      } catch {
        return null;
      }
    });

    const resolvedTasks = await Promise.all(tasks);

    return resolvedTasks.flatMap((result) => result ?? []);
  }

  const results = await traverse(root);

  return results.toSorted((a, b) => a.filePath.localeCompare(b.filePath));
}
