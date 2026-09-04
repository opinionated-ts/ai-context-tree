import { join } from "node:path";

import { copyFolder } from "@/utils/copy-folder";

export async function updateSkills() {
  const source = join(__dirname, "..", "..", "src", "skills");
  const destination = join(__dirname, "..", "..", "skills");

  console.log(`Updating skills from ${source} to ${destination}`);

  try {
    await copyFolder(source, destination);
    console.log("Skills updated successfully");
  } catch (error: unknown) {
    console.error("Error updating skills:", error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}
