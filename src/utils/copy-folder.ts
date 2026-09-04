import { promises as fs } from "fs";
import { join } from "path";

/**
 * Recursively copies a folder from source to destination.
 * If the destination folder doesn't exist, it will be created.
 * Files in the destination that don't exist in the source are left untouched.
 * @param source - Path to the source folder
 * @param destination - Path to the destination folder
 */
export async function copyFolder(source: string, destination: string): Promise<void> {
  try {
    // Ensure destination directory exists
    await fs.mkdir(destination, { recursive: true });

    // Read source directory
    const entries = await fs.readdir(source, { withFileTypes: true });

    // Collect all copy operations (files and subdirectories) to run in parallel
    const promises = entries.map(async (entry) => {
      const srcPath = join(source, entry.name);
      const destPath = join(destination, entry.name);

      if (entry.isDirectory()) {
        // Recursively copy subdirectory
        return copyFolder(srcPath, destPath);
      } else {
        // Copy file
        return fs.copyFile(srcPath, destPath);
      }
    });

    // Wait for all operations to complete
    await Promise.all(promises);
  } catch (error) {
    throw new Error(
      `Failed to copy folder from ${source} to ${destination}: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error },
    );
  }
}
