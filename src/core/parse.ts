import { readFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { resolve, relative } from "path";
import { parse } from "yaml";

import type { ContextIndexEntry } from "@/types";

import { createGitignoreChecker } from "@/gitignore";

/**
 * Parse index.instructions.md file and extract description and body
 */
export function parseIndexFile(filePath: string): {
  description: string;
  body: string;
} {
  const content = readFileSync(filePath, "utf-8");

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
 * Recursively find all index.instructions.md files respecting .gitignore
 */
export async function findIndexFiles(
  root: string,
  options?: {
    maxDepth?: number;
  },
): Promise<ContextIndexEntry[]> {
  const maxDepth = options?.maxDepth ?? Infinity;
  const shouldIgnore = createGitignoreChecker(root);

  const results: ContextIndexEntry[] = [];

  async function traverse(dir: string, currentDepth: number = 0) {
    if (currentDepth > maxDepth) {
      return;
    }

    let entries: string[];
    try {
      entries = readdirSync(dir);
    } catch {
      return;
    }

    const subDirectories: string[] = [];

    for (const entry of entries) {
      const fullPath = resolve(dir, entry);

      if (shouldIgnore(fullPath)) {
        continue;
      }

      try {
        const stat = statSync(fullPath);

        if (stat.isDirectory()) {
          subDirectories.push(fullPath);
        } else if (entry === "index.instructions.md") {
          const folderPath = dir;
          const relativeFolderPath = relative(root, folderPath);
          const { description, body } = parseIndexFile(fullPath);

          results.push({
            filePath: relative(root, fullPath),
            folderPath: relativeFolderPath || ".",
            description,
            bodyContent: body,
            depth: currentDepth,
          });
        }
      } catch {
        // Skip files we can't read
        continue;
      }
    }

    // Process subdirectories in parallel
    await Promise.all(subDirectories.map((subDir) => traverse(subDir, currentDepth + 1)));
  }

  await traverse(root);

  // Sort by path for consistent ordering
  return results.toSorted((a, b) => a.filePath.localeCompare(b.filePath));
}
