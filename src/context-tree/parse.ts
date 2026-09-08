import { readFileSync } from "fs";
import { readdirSync, statSync } from "fs";
import { resolve, relative } from "path";

import type { ContextIndexEntry } from "@/context-tree/types";

import { createGitignoreChecker } from "@/context-tree/gitignore";

/**
 * Parse index.instructions.md file and extract description and body
 */
export function parseIndexFile(filePath: string): {
  description: string;
  body: string;
} {
  const content = readFileSync(filePath, "utf-8");

  // Extract frontmatter between --- delimiters
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    // No frontmatter found, treat entire content as body, no description
    return {
      description: "",
      body: content,
    };
  }

  const frontmatter = frontmatterMatch?.[1] ?? "";
  const body = frontmatterMatch?.[2] ?? content;

  // Parse YAML-like frontmatter (simple key: value extraction)
  const descriptionMatch = frontmatter.match(/description:\s*['""]?([^'"\n]*)['""]?/);
  const description = (descriptionMatch?.[1] ?? "").trim();

  return {
    description,
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
  const shouldIgnore = await createGitignoreChecker(root);

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
