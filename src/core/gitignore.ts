import { readFileSync } from "fs";
import ignore from "ignore";
import { relative, resolve } from "path";

/**
 * Parse .gitignore and return function to check if path should be ignored
 */
export function createGitignoreChecker(rootPath: string): (filePath: string) => boolean {
  const gitignorePath = resolve(rootPath, ".gitignore");

  try {
    const content = readFileSync(gitignorePath, "utf8");

    const gitignore = ignore().add(content);

    return (filePath) => {
      const relativePath = relative(rootPath, filePath);

      return gitignore.ignores(relativePath);
    };
  } catch {
    return () => false;
  }
}
