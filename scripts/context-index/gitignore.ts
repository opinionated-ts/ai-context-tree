import { readFileSync } from "fs";
import { relative, resolve } from "path";

/**
 * Parse .gitignore and return function to check if path should be ignored
 */
export async function createGitignoreChecker(
  rootPath: string,
): Promise<(filePath: string) => boolean> {
  const gitignorePath = resolve(rootPath, ".gitignore");

  let patterns: string[] = [];

  try {
    const content = readFileSync(gitignorePath, "utf-8");
    patterns = content
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"));
  } catch {
    // No .gitignore found, ignore nothing
    return () => false;
  }

  return (filePath: string) => {
    const relativePath = relative(rootPath, filePath);

    for (const pattern of patterns) {
      // Simple glob matching
      if (simpleGlobMatch(relativePath, pattern)) {
        return true;
      }
      // Check if any parent directory matches
      const parts = relativePath.split("/");
      for (let i = 0; i < parts.length; i++) {
        const partialPath = parts.slice(0, i + 1).join("/");
        if (simpleGlobMatch(partialPath, pattern)) {
          return true;
        }
      }
    }

    return false;
  };
}

/**
 * Simple glob matching for common patterns
 */
function simpleGlobMatch(path: string, pattern: string): boolean {
  // Remove trailing slash
  pattern = pattern.replace(/\/$/, "");

  // Exact match
  if (path === pattern) {
    return true;
  }

  // Directory match (pattern is a directory name)
  if (path.includes(`/${pattern}/`) || path.startsWith(`${pattern}/`)) {
    return true;
  }

  // Wildcard patterns
  if (pattern === "*" || pattern === "**/") {
    return true;
  }

  if (pattern.startsWith("*.")) {
    const ext = pattern.substring(1);
    if (path.endsWith(ext)) {
      return true;
    }
  }

  // ** globstar
  if (pattern.includes("**")) {
    const parts = pattern.split("**");
    if (parts.length === 2) {
      const before = parts[0];
      const after = parts[1];
      const beforePattern = before?.replace(/\/$/, "") ?? "";
      const afterPattern = after?.replace(/^\//, "") ?? "";

      if (!beforePattern || beforePattern === "") {
        // Pattern like **/something
        if (afterPattern === "") {
          return true;
        }
        return path.includes(afterPattern) || path.endsWith(afterPattern);
      }

      if (beforePattern && path.startsWith(beforePattern)) {
        if (!afterPattern || afterPattern === "") {
          return true;
        }
        const remaining = path.substring(beforePattern.length + 1);
        return remaining.includes(afterPattern) || remaining.endsWith(afterPattern);
      }
    }
  }

  return false;
}
